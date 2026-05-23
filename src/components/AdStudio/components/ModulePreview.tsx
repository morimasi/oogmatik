import React from 'react';
import type { AdStudioTarget } from '../../../types/adStudio';
import { AD_TARGET_LABELS } from '../../../types/adStudio';
import { getModuleColor } from '../../../services/screenshotCaptureService';

interface ModulePreviewProps {
  target: AdStudioTarget;
  className?: string;
}

const MOCK_COLORS: Record<string, { bg: string; bars: number[]; pills: string[] }> = {
  dashboard: { bg: '#0f172a', bars: [35, 60, 45, 80, 55], pills: ['1,284', '3,219', '847'] },
  math_studio: { bg: '#1a0a2e', bars: [50, 70, 40, 90, 60], pills: ['3×7', '12÷4', '5+8'] },
  reading_studio: { bg: '#0f1a2e', bars: [60, 40, 80, 55, 70], pills: ['Hece', 'Kelime', 'Anlama'] },
  writing_studio: { bg: '#1a0f2e', bars: [45, 65, 50, 75, 60], pills: ['✎', 'Harfler', 'Cümle'] },
  screening_assessment: { bg: '#0e172a', bars: [70, 50, 85, 60, 75], pills: ['Dil', 'Dikkat', 'Bellek'] },
  sari_kitap: { bg: '#1a140e', bars: [55, 70, 45, 80, 65], pills: ['📖', 'Kelime', 'Anlama'] },
  infographic_studio: { bg: '#0f0f2e', bars: [80, 55, 90, 40, 70], pills: ['Grafik', 'Harita', 'Akış'] },
  content_engine: { bg: '#0a1a1e', bars: [90, 65, 75, 50, 85], pills: ['AI', 'Pipeline', 'Queue'] },
  activities: { bg: '#12102e', bars: [50, 75, 60, 85, 45], pills: ['AI', 'Klasik', 'Hibrit'] },
  super_studio: { bg: '#0f0520', bars: [70, 80, 65, 90, 75], pills: ['Tümü', 'AI', 'Hızlı'] },
};

function getMock(target: AdStudioTarget): { bg: string; bars: number[]; pills: string[] } {
  return MOCK_COLORS[target] || MOCK_COLORS.dashboard!;
}

export const ModulePreview: React.FC<ModulePreviewProps> = ({ target, className }) => {
  const color = getModuleColor(target);
  const label = AD_TARGET_LABELS[target] || target;
  const mock = getMock(target);

  const isListModule = ['users', 'teachers', 'students', 'feedbacks', 'drafts', 'approvals', 'permissions', 'prompts', 'static_content'].includes(target);

  return (
    <div
      className={className}
      style={{
        width: 400,
        height: 300,
        background: `linear-gradient(135deg, ${mock.bg} 0%, ${color}20 100%)`,
        border: `1px solid ${color}30`,
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '8px 14px',
          background: `${color}18`,
          borderBottom: `1px solid ${color}15`,
          display: 'flex', alignItems: 'center', gap: 8, zIndex: 2,
        }}
      >
        <div
          style={{
            width: 22, height: 22, borderRadius: 6,
            background: `linear-gradient(135deg, ${color}, ${color}77)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 900, color: '#fff',
          }}
        >
          O
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>Oogmatik</span>
        <span style={{ fontSize: 8, color: '#64748b', marginLeft: 'auto', fontWeight: 600 }}>{label}</span>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '38px 14px 14px', height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {isListModule ? (
          /* List-style modules (users, prompts, etc.) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 8px', borderRadius: 6,
                background: `${color}0d`, border: `1px solid ${color}12`,
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}88, ${color}44)`,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, width: '50%', borderRadius: 3, background: `${color}20`, marginBottom: 3 }} />
                  <div style={{ height: 4, width: '30%', borderRadius: 2, background: `${color}10` }} />
                </div>
                <div style={{
                  padding: '2px 6px', borderRadius: 4, fontSize: 7,
                  background: `${color}15`, color: `${color}aa`, fontWeight: 600,
                }}>
                  {target === 'permissions' ? 'Admin' : target === 'feedbacks' ? 'Yeni' : target === 'drafts' ? 'Taslak' : 'Aktif'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Bar chart + Pills for most modules */
          <>
            {/* Mini chart */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 72, padding: '8px 6px', marginBottom: 10 }}>
              {mock.bars.map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}%`,
                  background: `linear-gradient(180deg, ${color}, ${color}55)`,
                  borderRadius: '3px 3px 0 0',
                  opacity: 0.4 + i * 0.1,
                  transform: `scaleY(${0.3 + h * 0.007})`,
                  transformOrigin: 'bottom',
                }} />
              ))}
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {mock.pills.map(p => (
                <div key={p} style={{
                  padding: '4px 10px', borderRadius: 12,
                  background: `${color}15`, border: `1px solid ${color}25`,
                  fontSize: 9, color: '#cbd5e1', fontWeight: 600,
                }}>
                  {p}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{
              marginTop: 10, width: '100%', height: 4, borderRadius: 2,
              background: `${color}15`, overflow: 'hidden',
            }}>
              <div style={{
                width: `${40 + Math.floor(Math.random() * 40)}%`, height: '100%',
                borderRadius: 2,
                background: `linear-gradient(90deg, ${color}, ${color}77)`,
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
