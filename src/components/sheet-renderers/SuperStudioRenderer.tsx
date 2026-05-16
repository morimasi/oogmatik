import React from 'react';
import { MarkdownRenderer } from '../Common/MarkdownRenderer';

interface SuperStudioRendererProps {
  data: any;
  settings?: any;
}

export const SuperStudioRenderer: React.FC<SuperStudioRendererProps> = ({ data }) => {
  // Robust unwrapping: if data is a worksheet block wrapper, get its items/content
  const rawData = Array.isArray(data) ? data[0] : (data.items ? data.items[0] : data);
  if (!rawData) return null;

  // data can be a single page, an array of pages, or a wrapper object
  const pages = Array.isArray(rawData.content) ? rawData.content : 
                (Array.isArray(rawData) ? rawData : [rawData]);

  return (
    <>
      {pages.map((page: any, idx: number) => (
        <div 
          key={idx}
          className="print-page a4-page super-turkce-rendered-page"
          style={{
            position: 'relative',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'Lexend, sans-serif',
            padding: '1.5rem',
            minHeight: '297mm',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: '2px solid black', paddingBottom: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
             <div>
                <span style={{ fontSize: '10px', color: '#666', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Süper Türkçe Stüdyosu</span>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, textTransform: 'uppercase' }}>{page.title || 'Türkçe Etkinliği'}</h1>
             </div>
             <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>
                {idx + 1} / {pages.length}
             </div>
          </div>

          <div style={{ flex: 1 }}>
            <MarkdownRenderer 
              content={page.content || ''} 
              className="text-lg leading-relaxed"
            />
          </div>

          {/* Footer */}
          <div style={{ marginTop: '2rem', paddingTop: '0.5rem', borderTop: '1px solid #eee', fontSize: '10px', color: '#999', display: 'flex', justifyContent: 'space-between' }}>
            <span>© Bursa Disleksi & Oogmatik</span>
            <span>www.bursadisleksi.com</span>
          </div>
        </div>
      ))}
    </>
  );
};
