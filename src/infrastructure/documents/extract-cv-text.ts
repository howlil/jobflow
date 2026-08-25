import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

export type CvTextExtraction = {
  text: string;
  format: 'pdf' | 'docx' | 'text';
};

const supportedMimeTypes = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf('.');
  return index < 0 ? '' : fileName.slice(index + 1).toLowerCase();
}

export function isSupportedCvFile(file: Pick<File, 'name' | 'type'>): boolean {
  const extension = extensionOf(file.name);
  return (
    supportedMimeTypes.has(file.type) ||
    extension === 'pdf' ||
    extension === 'docx' ||
    extension === 'txt'
  );
}

async function extractPdf(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });
  const pdf = await task.promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ');
      pages.push(text);
    }
  } finally {
    await task.destroy();
  }

  return pages.join('\n\n').trim();
}

async function extractDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  return result.value.trim();
}

export async function extractCvText(file: File): Promise<CvTextExtraction> {
  if (!isSupportedCvFile(file)) {
    throw new Error('Use a PDF, DOCX, or TXT CV.');
  }

  const extension = extensionOf(file.name);
  if (file.type === 'application/pdf' || extension === 'pdf') {
    const text = await extractPdf(file);
    if (text.length < 20) {
      throw new Error(
        'This PDF does not contain enough selectable text. Scanned/image-only PDFs are not supported yet.',
      );
    }
    return { text, format: 'pdf' };
  }

  if (
    file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    extension === 'docx'
  ) {
    const text = await extractDocx(file);
    if (text.length < 20)
      throw new Error('This DOCX does not contain enough text to import.');
    return { text, format: 'docx' };
  }

  const text = (await file.text()).trim();
  if (text.length < 20)
    throw new Error('This text CV does not contain enough content to import.');
  return { text, format: 'text' };
}
