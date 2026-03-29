// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { RateLimitError, AppError, toAppError } from '../src/utils/AppError.js';
import { corsMiddleware } from '../src/utils/cors.js';

/**
 * POST /api/export-pdf
 *
 * Sunucu tarafında PDF oluşturma endpoint'i.
 * İstemci yapılandırılmış veri gönderir, sunucu @react-pdf/renderer ile PDF üretir.
 *
 * Body:
 *   {
 *     title: string,
 *     pageCount: number,
 *     format: 'A4' | 'Letter',
 *     blocks: Array<{ type: string, content: string }>,  // optional
 *     footerText?: string
 *   }
 *
 * Response:
 *   Binary PDF (application/pdf) or JSON error
 */

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Security
  if (!corsMiddleware(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const actualUserId = (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';

    // Rate Limiting (20 istek/saat)
    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiExport' as any);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return res.status(429).json({ error: error.userMessage });
      }
      throw error;
    }

    const { title, pageCount, format, blocks, footerText } = req.body || {};

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'title is required' });
    }

    // Dynamic import for @react-pdf/renderer (Node.js server-side)
    const ReactPDF = await import('@react-pdf/renderer');
    const React = await import('react');
    const { Document, Page, Text, View, StyleSheet, renderToBuffer } = ReactPDF;
    const { createElement: h } = React;

    const isLetter = format === 'Letter';
    const pageSize = isLetter ? 'LETTER' : 'A4';

    const styles = StyleSheet.create({
      page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 11,
        color: '#1a1a1a',
      },
      header: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#18181b',
        borderBottomWidth: 2,
        borderBottomColor: '#3f3f46',
        paddingBottom: 10,
      },
      block: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#fafafa',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
      },
      blockType: {
        fontSize: 8,
        color: '#6b7280',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 1,
      },
      blockContent: {
        fontSize: 11,
        lineHeight: 1.6,
        color: '#1a1a1a',
      },
      footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 7,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: 2,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 8,
      },
    });

    const safeTitleText = String(title).slice(0, 200);
    const safeFooter = footerText
      ? String(footerText).slice(0, 100)
      : 'Bursa Disleksi AI • Nöro-Mimari Motoru v7.0';
    const pageTotal = Math.max(1, Math.min(typeof pageCount === 'number' ? pageCount : 1, 50));

    // Build page content from blocks or create a single page
    const contentBlocks: Array<{ type: string; content: string }> = Array.isArray(blocks)
      ? blocks.slice(0, 200).map((b: unknown) => {
        const block = b as Record<string, unknown>;
        return {
          type: String(block?.type || 'içerik').slice(0, 50),
          content: String(block?.content || '').slice(0, 5000),
        };
      })
      : [];

    const pages = [];
    for (let i = 0; i < pageTotal; i++) {
      pages.push(
        h(
          Page,
          { key: i, size: pageSize, style: styles.page },
          // Header on first page
          i === 0 ? h(Text, { style: styles.header }, safeTitleText) : null,
          // Blocks
          contentBlocks.length > 0
            ? contentBlocks.map((block, idx) =>
              h(
                View,
                { key: idx, style: styles.block },
                h(Text, { style: styles.blockType }, block.type),
                h(Text, { style: styles.blockContent }, block.content)
              )
            )
            : h(
              View,
              { style: styles.block },
              h(
                Text,
                { style: styles.blockContent },
                i === 0
                  ? `${safeTitleText} — Bu PDF sunucu tarafında oluşturuldu.`
                  : `Sayfa ${i + 1}`
              )
            ),
          // Footer
          h(
            View,
            { style: styles.footer },
            h(Text, null, safeFooter),
            h(Text, null, `SAYFA ${i + 1} / ${pageTotal}`)
          )
        )
      );
    }

    const doc = h(Document, { title: safeTitleText }, ...pages);
    const pdfBuffer = await renderToBuffer(doc as any);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeTitleText)}.pdf"`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.status(200).end(pdfBuffer);
  } catch (error: unknown) {
    console.error('Export PDF error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'PDF export failed',
    });
  }
}
