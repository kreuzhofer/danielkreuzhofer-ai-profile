/**
 * File Text Extractor
 *
 * Extracts plain text from common document formats used for sharing
 * job descriptions and CVs: PDF, DOCX, TXT, MD, PPTX.
 */

import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import JSZip from 'jszip';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const SUPPORTED_MIME_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'text/plain': 'txt',
  'text/markdown': 'md',
  // Some systems report .md as text/plain or application/octet-stream
  'application/octet-stream': 'unknown',
};

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.pptx'];

export interface ExtractionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Determine the file format from MIME type and filename
 */
function detectFormat(mimeType: string, filename: string): string | null {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));

  // Check extension first (more reliable than MIME type)
  if (SUPPORTED_EXTENSIONS.includes(ext)) {
    return ext.replace('.', '');
  }

  // Fall back to MIME type
  const format = SUPPORTED_MIME_TYPES[mimeType];
  if (format && format !== 'unknown') {
    return format;
  }

  return null;
}

/**
 * Extract text from a PDF buffer
 */
async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

/**
 * Extract text from a DOCX buffer
 */
async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * Extract text from a PPTX buffer by parsing the XML slides inside the zip
 */
async function extractFromPptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const textParts: string[] = [];

  // Get slide files sorted by slide number
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0', 10);
      return numA - numB;
    });

  for (const slidePath of slideFiles) {
    const xml = await zip.files[slidePath].async('text');
    // Extract text from <a:t> tags (DrawingML text runs)
    const matches = xml.match(/<a:t>([^<]*)<\/a:t>/g);
    if (matches) {
      const slideText = matches
        .map((m) => m.replace(/<\/?a:t>/g, ''))
        .join(' ');
      if (slideText.trim()) {
        textParts.push(slideText.trim());
      }
    }
  }

  return textParts.join('\n\n');
}

/**
 * Extract text from a plain text or markdown buffer
 */
function extractFromText(buffer: Buffer): string {
  return buffer.toString('utf-8').trim();
}

/**
 * Extract text content from a file.
 *
 * @param buffer - File contents as a Buffer
 * @param mimeType - MIME type of the file
 * @param filename - Original filename (used for extension-based detection)
 */
export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<ExtractionResult> {
  // Validate file size
  if (buffer.length > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  if (buffer.length === 0) {
    return { success: false, error: 'File is empty.' };
  }

  // Detect format
  const format = detectFormat(mimeType, filename);
  if (!format) {
    return {
      success: false,
      error: `Unsupported file format. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
    };
  }

  try {
    let text: string;

    switch (format) {
      case 'pdf':
        text = await extractFromPdf(buffer);
        break;
      case 'docx':
        text = await extractFromDocx(buffer);
        break;
      case 'pptx':
        text = await extractFromPptx(buffer);
        break;
      case 'txt':
      case 'md':
        text = extractFromText(buffer);
        break;
      default:
        return { success: false, error: `Unsupported format: ${format}` };
    }

    if (!text) {
      return { success: false, error: 'No text content could be extracted from the file.' };
    }

    return { success: true, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to extract text: ${message}` };
  }
}

export { SUPPORTED_EXTENSIONS, MAX_FILE_SIZE };
