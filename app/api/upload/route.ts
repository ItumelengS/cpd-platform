import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

const MAX_FILE_SIZES = {
  PDF: 50 * 1024 * 1024, // 50MB
  VIDEO: 500 * 1024 * 1024, // 500MB
  IMAGE: 5 * 1024 * 1024, // 5MB
};

const ALLOWED_TYPES = {
  PDF: ['application/pdf'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
};

function getFileCategory(mimeType: string): 'PDF' | 'VIDEO' | 'IMAGE' | null {
  if (ALLOWED_TYPES.PDF.includes(mimeType)) return 'PDF';
  if (ALLOWED_TYPES.VIDEO.includes(mimeType)) return 'VIDEO';
  if (ALLOWED_TYPES.IMAGE.includes(mimeType)) return 'IMAGE';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'File upload service is not configured. Missing BLOB_READ_WRITE_TOKEN.' },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileCategory = getFileCategory(file.type);
    if (!fileCategory) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: PDF, Video (mp4, webm, ogg, mov), Images (jpeg, png, gif, webp)` },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[fileCategory];
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${maxSizeMB}MB for ${fileCategory} files` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    // Create FileUpload record in database
    const fileUpload = await prisma.fileUpload.create({
      data: {
        fileName: file.name,
        fileUrl: blob.url,
        fileType: file.type,
        fileSize: file.size,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      id: fileUpload.id,
      url: blob.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
