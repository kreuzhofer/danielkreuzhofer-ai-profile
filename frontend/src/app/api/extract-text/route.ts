/**
 * Text Extraction API Route
 *
 * Accepts file uploads (PDF, DOCX, TXT, MD, PPTX) and returns
 * the extracted plain text content.
 *
 * POST /api/extract-text
 * Content-Type: multipart/form-data
 * Body: file (File)
 *
 * Response: { success: true, text: string } | { success: false, error: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile, MAX_FILE_SIZE } from '@/lib/file-text-extractor';
import { createLogger } from '@/lib/logger';

const log = createLogger('ExtractTextAPI');

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = Math.random().toString(36).substring(7);
  log.info('Text extraction request received', { requestId });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      log.warn('No file provided', { requestId });
      return NextResponse.json(
        { success: false, error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }

    log.info('Processing file', {
      requestId,
      filename: file.name,
      size: file.size,
      type: file.type,
    });

    // Check size before reading into memory
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await extractTextFromFile(buffer, file.type, file.name);

    if (!result.success) {
      log.warn('Text extraction failed', { requestId, error: result.error });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    log.info('Text extraction successful', {
      requestId,
      extractedLength: result.text!.length,
    });

    return NextResponse.json({ success: true, text: result.text });
  } catch (error) {
    log.error('Unexpected error during text extraction', error, { requestId });
    return NextResponse.json(
      { success: false, error: 'Failed to process the file. Please try again.' },
      { status: 500 }
    );
  }
}
