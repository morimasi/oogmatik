// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { RateLimitError } from '../src/utils/AppError.js';
import { corsMiddleware } from '../src/utils/cors.js';

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!corsMiddleware(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const actualUserId = (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';

    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiExport' as any);
    } catch (error) {
      if (error instanceof RateLimitError) return res.status(429).json({ error: error.userMessage });
      throw error;
    }

    const { title, format, blocks, footerText } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title is required' });

    const ReactPDF = await import('@react-pdf/renderer');
    const React = await import('react');
    const { Document, Page, Text, View, StyleSheet, renderToBuffer, Font } = ReactPDF;
    const { createElement: h } = React;

    Font.register({
      family: 'Lexend',
      fonts: [
        { src: 'https://fonts.gstatic.com/s/lexend/v17/wlp5gwvFAV6To992-p6-nv2V.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/lexend/v17/wlp1gwvFAV6To992_qWvmuGv.ttf', fontWeight: 700 },
      ],
    });

    const pageSize = format === 'Letter' ? 'LETTER' : 'A4';

    const styles = StyleSheet.create({
      page: { padding: 50, fontFamily: 'Lexend', fontSize: 12, color: '#18181b', backgroundColor: '#ffffff' },
      header: { fontSize: 20, fontWeight: 700, marginBottom: 25, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#6366f1', paddingBottom: 15 },
      block: { marginBottom: 15, padding: 12, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#e2e8f0', backgroundColor: '#f8fafc', breakInside: 'avoid' },
      blockType: { fontSize: 9, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 1.5 },
      blockContent: { fontSize: 13, lineHeight: 1.6, color: '#1f2937' },
      footer: { position: 'absolute', bottom: 30, left: 50, right: 50, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, textTransform: 'uppercase', letterSpacing: 1 },
    });

    const processedPages: Array<Array<{ type: string; content: string }>> = [[]];
    let currentPageIndex = 0;

    if (Array.isArray(blocks)) {
      blocks.forEach((block: any) => {
        const content = String(block.content || '');
        if (content.includes('===SAYFA_SONU===')) {
          const parts = content.split('===SAYFA_SONU===');
          parts.forEach((part, idx) => {
            if (part.trim()) processedPages[currentPageIndex].push({ type: block.type, content: part.trim() });
            if (idx < parts.length - 1) {
              currentPageIndex++;
              processedPages[currentPageIndex] = [];
            }
          });
        } else {
          processedPages[currentPageIndex].push(block);
        }
      });
    }

    const safeTitleText = String(title).slice(0, 200);
    const safeFooter = footerText ? String(footerText).slice(0, 100) : 'Oogmatik Nöro-Eğitim Motoru v7.0';

    const docPages = processedPages.map((pageBlocks, i) => 
      h(Page, { key: i, size: pageSize, style: styles.page },
        i === 0 ? h(Text, { style: styles.header }, safeTitleText) : null,
        pageBlocks.map((block, idx) => 
          h(View, { key: idx, style: styles.block },
            h(Text, { style: styles.blockType }, block.type),
            h(Text, { style: styles.blockContent }, block.content)
          )
        ),
        h(View, { style: styles.footer },
          h(Text, null, safeFooter),
          h(Text, null, `SAYFA ${i + 1} / ${processedPages.length}`)
        )
      )
    );

    const doc = h(Document, { title: safeTitleText }, ...docPages);
    const pdfBuffer = await renderToBuffer(doc as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeTitleText)}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error: unknown) {
    console.error('Export PDF error:', error);
    res.status(500).json({ error: 'PDF export failed' });
  }
}

