import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

/**
 * Enhanced Upload Route with VPS Persistence Support
 */

const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DANGEROUS_EXTENSIONS = ['.exe', '.php', '.jsp', '.asp', '.aspx', '.sh', '.bat', '.cmd', '.js', '.vbs', '.ps1'];

function sanitizeFilename(filename: string): string {
  const basename = path.basename(filename);
  const sanitized = basename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const ext = path.extname(sanitized).toLowerCase();
  const nameWithoutExt = path.basename(sanitized, ext);
  return `${nameWithoutExt.substring(0, 100)}${ext}`;
}

function validateFileType(mimeType: string, filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) return false;
  const allowedExts = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  return !!(allowedExts && allowedExts.includes(ext));
}

const ALLOWED_ROLES = ['CLIENT', 'VENDOR', 'ADMIN', 'DELIVERY'];
const UPLOAD_RATE_LIMIT = 20;
const UPLOAD_WINDOW_MS = 60000;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request.headers);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rateLimitKey = `upload:${user.id}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, UPLOAD_RATE_LIMIT, UPLOAD_WINDOW_MS);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Too many uploads' }, { status: 429 });
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    if (!validateFileType(file.type, file.name)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniqueSuffix}-${sanitizeFilename(file.name)}`;
    
    // CLOUDFLARE R2 LOGIC
    if (
      process.env.R2_ACCOUNT_ID && 
      process.env.R2_ACCESS_KEY_ID && 
      process.env.R2_SECRET_ACCESS_KEY && 
      process.env.R2_BUCKET_NAME
    ) {
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        })
      );

      // If a public URL mapping is provided, use it
      const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL 
        || `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev`; // Fallback to generic R2 dev URL format
      
      const fileUrl = `${baseUrl.replace(/\/$/, '')}/${filename}`;

      return NextResponse.json({ 
          success: true, 
          fileUrl,
          fileName: file.name
      });
    }

    // PERSISTENCE LOGIC (Fallback to local VPS)
    const externalUploadDir = process.env.UPLOAD_PATH;
    const uploadDir = externalUploadDir
      ? path.isAbsolute(externalUploadDir)
        ? externalUploadDir
        : path.join(/* turbopackIgnore: true */ process.cwd(), externalUploadDir)
      : path.join(/* turbopackIgnore: true */ process.cwd(), 'public/uploads');
    
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Dynamic file URL pointing to our Media Proxy for VPS persistence
    const fileUrl = `/api/media/${filename}`;

    return NextResponse.json({ 
        success: true, 
        fileUrl,
        fileName: file.name,
        mimeType: file.type,
        fileSize: buffer.length
    });

  } catch (error: unknown) {
    logError('UPLOAD', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
