import { NextResponse } from 'next/server';
import { removeBackground } from '@imgly/background-removal';

export async function POST(request: Request) {
  try {
    // Validate request content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid request content type' },
        { status: 400 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Remove background
    let processedBlob;
    try {
      processedBlob = await removeBackground(uint8Array);
    } catch (bgRemovalError) {
      console.error('Background removal specific error:', bgRemovalError);
      return NextResponse.json(
        { 
          error: 'Failed to remove background', 
          details: bgRemovalError instanceof Error ? bgRemovalError.message : 'Unknown error' 
        },
        { status: 500 }
      );
    }

    // Convert processed image to buffer
    const buffer = Buffer.from(await processedBlob.arrayBuffer());

    // Return the processed image
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="processed-${file.name.replace(/\.[^/.]+$/, '')}.png"`,
      },
    });
  } catch (error) {
    // Comprehensive error logging
    console.error('Complete background removal error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      type: typeof error,
      stringified: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });

    return NextResponse.json(
      { 
        error: 'Failed to process image', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: typeof error
      },
      { status: 500 }
    );
  }
}

// Ensure this is a dynamic route for API handling
export const dynamic = 'force-dynamic';
