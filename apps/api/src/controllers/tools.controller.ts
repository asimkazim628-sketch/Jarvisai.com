import type { Request, Response } from 'express';
import { PDFParse } from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { askJarvis } from '../services/ai.service.js';

export async function summarizeDocument(req: Request, res: Response) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Upload a PDF or text file.' });
  let text = file.buffer.toString('utf8');
  if (file.mimetype === 'application/pdf') {
    const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
    try {
      text = (await parser.getText()).text;
    } finally {
      await parser.destroy();
    }
  }
  const summary = await askJarvis([{ role: 'user', content: `Summarize this document with key actions:\n${text.slice(0, 12000)}` }]);
  return res.json({ summary });
}

export async function ocrImage(req: Request, res: Response) {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Upload an image.' });
  const worker = await createWorker('eng');
  const { data } = await worker.recognize(file.buffer);
  await worker.terminate();
  return res.json({ text: data.text });
}
