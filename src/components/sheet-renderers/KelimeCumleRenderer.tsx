import React from 'react';
import { KELIME_CUMLE_REGISTRY } from '../KelimeCumleStudio/registry';

interface KelimeCumleRendererProps {
  data: any;
  settings?: any;
}

export const KelimeCumleRenderer: React.FC<KelimeCumleRendererProps> = ({ data }) => {
  if (!data) return null;

  // data can be an object with items and activityType
  const activityType = data.activityType || 'bosluk_doldurma';
  const registry = KELIME_CUMLE_REGISTRY as unknown as Record<string, { title: string; renderer: React.ComponentType<{ content: unknown; showAnswers?: boolean }>; icon: string; description: string }>;
  const activityInfo = registry[activityType] || registry.bosluk_doldurma;
  const Renderer = activityInfo.renderer;

  return (
    <div 
      className="print-page a4-page kelime-cumle-rendered-page"
      style={{
        position: 'relative',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Lexend, sans-serif',
        padding: '15mm',
        minHeight: '297mm',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="page-indicator" style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
          Kelime-Cümle Stüdyosu
      </div>
      
      <Renderer 
          content={data} 
          showAnswers={false} 
      />

      <div style={{ 
          marginTop: 'auto', 
          paddingTop: '3mm', 
          borderTop: '1px solid #e5e7eb', 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '9pt',
          color: '#64748b',
          fontFamily: 'Inter, sans-serif'
      }}>
          <span>Bursa Disleksi - bdmind</span>
          <span>© 2024</span>
      </div>
    </div>
  );
};
