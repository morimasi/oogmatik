import React from 'react';
import type { AdStudioTarget } from '../../../types/adStudio';
import { AD_TARGET_LABELS, AD_TARGET_DESCRIPTIONS } from '../../../types/adStudio';
import { getModuleColor } from '../../../services/screenshotCaptureService';

interface ModulePreviewProps {
  target: AdStudioTarget;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Determinant per-module layout descriptors                         */
/* ------------------------------------------------------------------ */

interface LayoutBase { type: string }
interface LayoutAnalytics extends LayoutBase { type: 'analytics'; stats: { label: string; value: string; change: string }[]; chart: number[] }
interface LayoutAssessment extends LayoutBase { type: 'assessment'; domains: { label: string; pct: number }[]; progress: number; tags: string[] }
interface LayoutStudio extends LayoutBase { type: 'studio'; icon: string; items: string[]; tags: string[] }
interface LayoutList extends LayoutBase { type: 'list'; badge: string }
interface LayoutBook extends LayoutBase { type: 'book'; lines: string[] }
interface LayoutPipeline extends LayoutBase { type: 'pipeline'; stages: string[]; tags: string[] }
interface LayoutGrid extends LayoutBase { type: 'grid'; cells: string[] }
interface LayoutVisual extends LayoutBase { type: 'visual'; chart: number[]; tags: string[] }

type ModuleLayout =
  | LayoutAnalytics | LayoutAssessment | LayoutStudio
  | LayoutList | LayoutBook | LayoutPipeline | LayoutGrid | LayoutVisual;

const LAYOUTS: Record<string, ModuleLayout> = {
  dashboard: { type: 'analytics', stats: [{ label: 'Kullanıcı', value: '1,284', change: '+12%' }, { label: 'İçerik', value: '3,219', change: '+8%' }, { label: 'Aktif', value: '847', change: '+23%' }], chart: [35, 60, 45, 80, 55, 70, 90] },
  screening_assessment: { type: 'assessment', domains: [{ label: 'Dil', pct: 75 }, { label: 'Dikkat', pct: 55 }, { label: 'Bellek', pct: 82 }, { label: 'Görsel', pct: 68 }], progress: 65, tags: ['Sözel', 'Matematik', 'Okuma'] },
  math_studio: { type: 'studio', icon: '∑', items: ['3 × 7 = 21', '12 ÷ 4 = 3', '5/8 + 1/4'], tags: ['Sayılar', 'İşlemler', 'Kesirler'] },
  reading_studio: { type: 'studio', icon: '📖', items: ['A-ra-ba', 'Ar-ka-daş', 'O-kul'], tags: ['Heceleme', 'Ses', 'Anlama'] },
  writing_studio: { type: 'studio', icon: '✎', items: ['✎ Harfler', '✎ Kelimeler', '✎ Cümleler'], tags: ['El Yazısı', 'Dikte', 'Kompozisyon'] },
  sari_kitap: { type: 'book', lines: ['Ali topu attı.', 'Ali topu tuttu.', 'Ali koşuyor.', 'Ali yoruldu.'] },
  content_engine: { type: 'pipeline', stages: ['Prompt', 'AI', 'Onay', 'Yayın'], tags: ['Pipeline', 'Kuyruk', 'İstatistik'] },
  activities: { type: 'grid', cells: ['AI Üretim', 'Klasik', 'Hibrit', 'Test'] },
  infographic_studio: { type: 'visual', chart: [85, 55, 90, 40, 70], tags: ['Grafik', 'Harita', 'Akış'] },
  super_studio: { type: 'grid', cells: ['Matematik', 'Okuma', 'Yazma', 'İnfografik'] },
  users: { type: 'list', badge: 'Admin' },
  teachers: { type: 'list', badge: 'Aktif' },
  students: { type: 'list', badge: 'Öğrenci' },
  prompts: { type: 'list', badge: 'Taslak' },
  feedbacks: { type: 'list', badge: 'Yeni' },
  drafts: { type: 'list', badge: 'Taslak' },
  approvals: { type: 'list', badge: 'Onay' },
  permissions: { type: 'list', badge: 'Yönetici' },
  static_content: { type: 'list', badge: 'Yayın' },
};

/* ------------------------------------------------------------------ */
/*  Render helpers                                                    */
/* ------------------------------------------------------------------ */

const Row = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ display: 'flex', gap: 6, ...style }}>{children}</div>
);

function Pill({ children, color, style }: { children: React.ReactNode; color: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      padding: '3px 9px', borderRadius: 10, fontSize: 8, fontWeight: 600,
      background: `${color}15`, border: `1px solid ${color}22`, color: '#cbd5e1',
      ...style,
    }}>{children}</div>
  );
}

function MiniCard({ children, color, style }: { children: React.ReactNode; color: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      flex: 1, background: `${color}0d`, borderRadius: 7,
      border: `1px solid ${color}15`, padding: '6px 8px',
      ...style,
    }}>{children}</div>
  );
}

function ChartBars({ data, color, height = 44 }: { data: number[]; color: string; height?: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${v}%`,
          background: `linear-gradient(180deg, ${color}dd, ${color}55)`,
          borderRadius: '2px 2px 0 0',
          opacity: 0.4 + i * 0.08,
        }} />
      ))}
    </div>
  );
}

function ProgressBar({ pct, color, h = 4 }: { pct: number; color: string; h?: number }) {
  return (
    <div style={{ width: '100%', height: h, borderRadius: h / 2, background: `${color}15`, overflow: 'hidden', marginTop: 8 }}>
      <div style={{ width: `${Math.min(100, Math.max(5, pct))}%`, height: '100%', borderRadius: h / 2, background: `linear-gradient(90deg, ${color}, ${color}77)` }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout renderers                                                  */
/* ------------------------------------------------------------------ */

function renderLayout(layout: ModuleLayout, color: string): React.ReactNode {
  switch (layout.type) {
    /* ===== Analytics (Dashboard) ===== */
    case 'analytics':
      return (
        <>
          <Row>
            {layout.stats.map(s => (
              <MiniCard key={s.label} color={color}>
                <div style={{ fontSize: 7, color: '#64748b', marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: -0.5 }}>{s.value}</div>
                <div style={{ fontSize: 7, color: '#34d399', marginTop: 1 }}>{s.change}</div>
              </MiniCard>
            ))}
          </Row>
          <ChartBars data={layout.chart} color={color} height={52} />
          <Row style={{ justifyContent: 'center', marginTop: 6 }}>
            {['Haftalık', 'Aylık', 'Yıllık'].map(l => (
              <Pill key={l} color={color} style={{ background: `${color}12` }}>{l}</Pill>
            ))}
          </Row>
        </>
      );

    /* ===== Assessment (domain circles + progress + tags) ===== */
    case 'assessment':
      return (
        <>
          <Row style={{ justifyContent: 'space-around', marginBottom: 4 }}>
            {layout.domains.map(d => (
              <div key={d.label} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', margin: '0 auto 3px',
                  border: `2.5px solid ${d.pct > 70 ? '#34d399' : d.pct > 50 ? color : '#ef4444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#f1f5f9',
                }}>{d.pct}%</div>
                <div style={{ fontSize: 7, color: '#64748b' }}>{d.label}</div>
              </div>
            ))}
          </Row>
          <ProgressBar pct={layout.progress} color={color} />
          <Row style={{ justifyContent: 'center', marginTop: 6 }}>
            {layout.tags.map(t => <Pill key={t} color={color}>{t}</Pill>)}
          </Row>
        </>
      );

    /* ===== Studio (Math / Reading / Writing) ===== */
    case 'studio':
      return (
        <>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <div style={{ fontSize: 28, marginBottom: 2 }}>{layout.icon}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 6 }}>
            {layout.items.map((item, i) => (
              <div key={i} style={{
                padding: '4px 8px', borderRadius: 5,
                background: `${color}0d`, border: `1px solid ${color}12`,
                fontSize: 9, color: '#e2e8f0', fontFamily: i === 0 ? 'monospace' : 'Lexend',
                textAlign: 'center',
              }}>{item}</div>
            ))}
          </div>
          <Row style={{ justifyContent: 'center' }}>
            {layout.tags.map(t => <Pill key={t} color={color} style={{ background: `${color}10` }}>{t}</Pill>)}
          </Row>
        </>
      );

    /* ===== List (Users / Teachers / Students / Prompts / etc.) ===== */
    case 'list':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 8px', borderRadius: 6,
              background: `${color}0a`, border: `1px solid ${color}10`,
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}88, ${color}44)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, color: '#fff', fontWeight: 700,
              }}>{i}</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 5, width: `${40 + i * 15}%`, borderRadius: 2, background: `${color}18`, marginBottom: 3 }} />
                <div style={{ height: 3, width: `${20 + i * 10}%`, borderRadius: 2, background: `${color}0a` }} />
              </div>
              <div style={{
                padding: '2px 6px', borderRadius: 4, fontSize: 7,
                background: `${color}12`, color: `${color}aa`, fontWeight: 600,
              }}>{layout.badge}</div>
            </div>
          ))}
        </div>
      );

    /* ===== Book (Sarı Kitap) ===== */
    case 'book':
      return (
        <div style={{
          background: `linear-gradient(135deg, #fef3c7, #fde68a)`, borderRadius: 8,
          padding: '10px 12px', marginTop: 4, border: '1px solid #d97706',
        }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: '#92400e', marginBottom: 4, letterSpacing: 1 }}>
            📖 Sarı Kitap
          </div>
          {layout.lines.map((line, i) => (
            <div key={i} style={{
              fontSize: 9, color: '#78350f', lineHeight: '16px',
              padding: '1px 0',
              borderBottom: i < layout.lines.length - 1 ? '1px dashed #d9770640' : 'none',
            }}>{line}</div>
          ))}
        </div>
      );

    /* ===== Pipeline (Content Engine) ===== */
    case 'pipeline':
      return (
        <>
          <Row style={{ justifyContent: 'center', marginBottom: 8 }}>
            {layout.stages.map((stage, i) => (
              <React.Fragment key={stage}>
                <div style={{
                  padding: '5px 8px', borderRadius: 6, fontSize: 8, fontWeight: 600,
                  background: `${color}15`, border: `1px solid ${color}25`, color: '#e2e8f0',
                }}>{stage}</div>
                {i < layout.stages.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', color: `${color}44`, fontSize: 10 }}>→</div>
                )}
              </React.Fragment>
            ))}
          </Row>
          <ProgressBar pct={45} color={color} h={3} />
          <Row style={{ justifyContent: 'center', marginTop: 6 }}>
            {layout.tags.map(t => <Pill key={t} color={color}>{t}</Pill>)}
          </Row>
        </>
      );

    /* ===== Grid (Activities / Super Studio) ===== */
    case 'grid':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 4 }}>
          {layout.cells.map(cell => (
            <div key={cell} style={{
              padding: '12px 6px', borderRadius: 7, textAlign: 'center',
              background: `${color}0d`, border: `1px solid ${color}15`,
              fontSize: 8, fontWeight: 600, color: '#cbd5e1',
            }}>{cell}</div>
          ))}
        </div>
      );

    /* ===== Visual (Infographic Studio) ===== */
    case 'visual':
      return (
        <>
          <Row style={{ gap: 5, marginBottom: 4 }}>
            {['Bar', 'Pasta', 'Çizgi'].map(t => (
              <div key={t} style={{
                flex: 1, textAlign: 'center', padding: '4px 0',
                borderRadius: 5, fontSize: 7, fontWeight: 600,
                background: `${color}0d`, border: `1px solid ${color}12`, color: '#94a3b8',
              }}>{t}</div>
            ))}
          </Row>
          <ChartBars data={layout.chart} color={color} height={34} />
          <Row style={{ justifyContent: 'center', marginTop: 5 }}>
            {layout.tags.map(t => <Pill key={t} color={color}>{t}</Pill>)}
          </Row>
        </>
      );

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export const ModulePreview: React.FC<ModulePreviewProps> = ({ target, className }) => {
  const color = getModuleColor(target);
  const label = AD_TARGET_LABELS[target] || target;
  const description = AD_TARGET_DESCRIPTIONS[target] || '';
  const layout = LAYOUTS[target] || LAYOUTS.dashboard!;
  const bgBase = target === 'sari_kitap' ? '#1a140e' : target === 'content_engine' ? '#0a1a1e' : '#0f0a2e';

  return (
    <div
      className={className}
      style={{
        width: 400,
        height: 300,
        background: `linear-gradient(135deg, ${bgBase} 0%, ${color}18 100%)`,
        border: `1px solid ${color}25`,
        borderRadius: 16,
        overflow: 'hidden',
        fontFamily: 'Lexend, sans-serif',
        position: 'relative',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          padding: '7px 12px',
          background: `${color}15`,
          borderBottom: `1px solid ${color}12`,
          display: 'flex', alignItems: 'center', gap: 8,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: 20, height: 20, borderRadius: 5,
            background: `linear-gradient(135deg, ${color}, ${color}77)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 900, color: '#fff',
          }}
        >
          O
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, color: '#e2e8f0' }}>Oogmatik</span>
        <span style={{ fontSize: 7, color: '#64748b', marginLeft: 'auto', fontWeight: 600 }}>{label}</span>
      </div>

      {/* Content area */}
      <div
        style={{
          padding: '32px 12px 10px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {renderLayout(layout, color)}

        {/* Description */}
        <div style={{
          marginTop: 8,
          fontSize: 7,
          color: '#64748b',
          textAlign: 'center',
          lineHeight: '11px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {description}
        </div>
      </div>
    </div>
  );
};
