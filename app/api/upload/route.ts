import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { checkRateLimit } from '@/lib/utils/rate-limiter';
import { createErrorResponse, logError } from '@/lib/utils/error-handler';
import path from 'path';

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Dangerous extensions to block
const DANGEROUS_EXTENSIONS = ['.exe', '.php', '.jsp', '.asp', '.aspx', '.sh', '.bat', '.cmd', '.js', '.vbs', '.ps1'];

function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = path.basename(filename);
  
  // Remove dangerous characters but keep safe ones
  const sanitized = basename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Get extension
  const ext = path.extname(sanitized).toLowerCase();
  const nameWithoutExt = path.basename(sanitized, ext);
  
  // Limit filename length
  const maxNameLength = 100;
  const truncatedName = nameWithoutExt.substring(0, maxNameLength);
  
  return `${truncatedName}${ext}`;
}

function validateFileType(mimeType: string, filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  
  // Check if extension is dangerous
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return false;
  }
  
  // Check if MIME type is allowed and extension matches
  const allowedExts = ALLOWED_FILE_TYPES[mimeType as keyof typeof ALLOWED_FILE_TYPES];
  if (!allowedExts) {
    return false;
  }
  
  return allowedExts.includes(ext);
}

// Allowed roles for file upload
const ALLOWED_ROLES = ['CLIENT', 'VENDOR', 'ADMIN', 'DELIVERY'];

// Rate limit: 10 uploads per minute per user
const UPLOAD_RATE_LIMIT = 10;
const UPLOAD_WINDOW_MS = 60000; // 1 minute

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request.headers);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check per user (not just IP)
    const rateLimitKey = `upload:${user.id}`;
    const rateLimitResult = await checkRateLimit(rateLimitKey, UPLOAD_RATE_LIMIT, UPLOAD_WINDOW_MS);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
          }
        },
      );
    }

    // Check if user role is allowed to upload
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!validateFileType(file.type, file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPG, PNG, GIF, WebP, PDF' },
        { status: 400 }
      );
    }

    // Create unique filename with sanitization
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedName = sanitizeFilename(file.name);
    const filename = `${uniqueSuffix}-${sanitizedName}`;
    
    // Setup upload directory
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch(e) {
        // directory exists
    }

    const filepath = path.join(uploadDir, filename);

    // Save to local filesystem
    await writeFile(filepath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ 
        success: true, 
        fileUrl,
        fileName: file.name,
        fileSize: buffer.length,
        mimeType: file.type
    });

  } catch (error: unknown) {
    logError('UPLOAD', error);
    const { response, status } = createErrorResponse(error, 500);
    return NextResponse.json(response, { status });
  }
}
