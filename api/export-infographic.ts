import { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, format, quality } = req.body;

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
    console.error('Export error:', error);
    return res.status(500).json({ error: error.message });
  }
}
