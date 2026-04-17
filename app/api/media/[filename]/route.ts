import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

/**
 * Media Proxy Route
 * Serves files from external UPLOAD_PATH or local public/uploads
 * Essential for persistence on VPS/DigitalOcean
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }

    const externalUploadDir = process.env.UPLOAD_PATH;
    const uploadDir = externalUploadDir
      ? path.isAbsolute(externalUploadDir)
        ? externalUploadDir
        : path.join(process.cwd(), externalUploadDir)
      : path.join(process.cwd(), 'public/uploads');

    const filePath = path.join(uploadDir, filename);

    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);

    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };

    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // High cache for performance
      },
    });
  } catch (error) {
    console.error('MEDIA_PROXY_ERROR', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
