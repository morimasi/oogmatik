import { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { z } from 'zod';
import { corsMiddleware } from '../src/utils/cors.js';
import { logError } from '../src/utils/errorHandler.js';

// Schema Validation
const ExportSchema = z.object({
  html: z.string().max(500000, "HTML içeriği çok büyük (max 500KB)"),
  format: z.enum(['pdf', 'png', 'jpeg']),
  quality: z.number().min(1).max(100).optional()
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Validation
  if (!corsMiddleware(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Zod Validation
  const parseResult = ExportSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: "Validation failed", details: parseResult.error.issues });
  }

  const { html, format, quality } = parseResult.data;

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    if (format === 'pdf') {
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=worksheet.pdf');
      return res.send(pdf);
    }

    if (format === 'png') {
      const screenshot = await page.screenshot({
        type: 'png',
        fullPage: true,
        omitBackground: false,
      });

      await browser.close();

      res.setHeader('Content-Type', 'image/png');
      return res.send(screenshot);
    }

    await browser.close();
    return res.status(400).json({ error: 'Invalid format' });
  } catch (error: any) {
    logError(error, { context: 'export-infographic', customMessage: 'Export error' });
    return res.status(500).json({ error: error.message || "Bilinmeyen sunucu hatası" });
  }
}
