import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import DyslexiaLogo from './DyslexiaLogo';
import { WorkbookActivityRenderer } from './workbook/WorkbookActivityRenderer';
import '../styles/workbookPremium.css';

interface WorkbookProps {
  items: CollectionItem[];
  settings: WorkbookSettings;
}

// --- THEME PALETTES ---

const THEME_PALETTES: Record<string, { coverBg: string; coverText: string; coverAccent: string; pageAccent: string }> = {
  modern:    { coverBg: '#ffffff',        coverText: '#18181b', coverAccent: '#4f46e5', pageAccent: '#4f46e5' },
  classic:   { coverBg: '#fefce8',        coverText: '#451a03', coverAccent: '#d97706', pageAccent: '#b45309' },
  minimal:   { coverBg: '#fafafa',        coverText: '#27272a', coverAccent: '#52525b', pageAccent: '#71717a' },
  academic:  { coverBg: '#0f172a',        coverText: '#f8fafc', coverAccent: '#3b82f6', pageAccent: '#2563eb' },
  artistic:  { coverBg: '#0d9488',        coverText: '#ffffff', coverAccent: '#14b8a6', pageAccent: '#0d9488' },
  space:     { coverBg: '#020617',        coverText: '#e2e8f0', coverAccent: '#8b5cf6', pageAccent: '#7c3aed' },
  nature:    { coverBg: '#f0fdf4',        coverText: '#14532d', coverAccent: '#22c55e', pageAccent: '#16a34a' },
  cyber:     { coverBg: '#000000',        coverText: '#fdf4ff', coverAccent: '#d946ef', pageAccent: '#e879f9' },
  luxury:    { coverBg: '#1c1917',        coverText: '#fef3c7', coverAccent: '#f59e0b', pageAccent: '#d97706' },
  playful:   { coverBg: '#fdf2f8',        coverText: '#831843', coverAccent: '#ec4899', pageAccent: '#db2777' },
};

const DENSITY_PADDING: Record<string, string> = {
  compact:     '10mm',
  comfortable: '15mm',
  spacious:    '22mm',
};

const PAGE_SIZES: Record<string, { w: string; h: string }> = {
  A4: { w: '210mm', h: '297mm' },
  A5: { w: '148mm', h: '210mm' },
  Letter: { w: '216mm', h: '279mm' },
  B5: { w: '176mm', h: '250mm' },
};

const getPageStyle = (isLandscape: boolean, font: string, settings: WorkbookSettings, extra = {}) => {
  const size = PAGE_SIZES[settings.pageSize || 'A4'] || PAGE_SIZES.A4;
  
  // Real dimensions in mm for the style object
  const width = isLandscape ? size.h : size.w;
  const height = isLandscape ? size.w : size.h;
  
  const padding = settings.margin !== undefined ? `${settings.margin}mm` : (DENSITY_PADDING[settings.layoutDensity || ''] || '15mm');

  return {
    width,
    height,
    padding,
    margin: '0 auto',
    backgroundColor: 'white',
    color: 'black',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    fontFamily: font,
    boxSizing: 'border-box' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    lineHeight: settings.lineHeight || 1.6,
    letterSpacing: `${settings.letterSpacing || 0}px`,
    wordSpacing: `${settings.wordSpacing || 2}px`,
    // Important: Print properties
    pageBreakAfter: 'always' as const,
    ...extra,
  };
};

const Watermark = ({ settings }: { settings: WorkbookSettings }) => {
  if (!settings.showWatermark) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
      <div className="transform -rotate-45 w-[70%] grayscale opacity-[0.03]" style={{ opacity: settings.watermarkOpacity }}>
        {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-auto" alt="watermark" /> : <DyslexiaLogo className="w-full h-auto text-black" />}
      </div>
    </div>
  );
};

const PageFooter = ({ pageNum, settings }: { pageNum: number; settings: WorkbookSettings }) => {
  if (!settings.showPageNumbers) return null;
  return (
    <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono z-20">
      <div className="flex flex-col text-left">
        <span className="font-bold opacity-50">{settings.schoolName || 'Bursa Disleksi EduMind'}</span>
        <span className="opacity-30 uppercase tracking-tighter">Premium Workbook Edition</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-px w-8 bg-zinc-200"></div>
        <span className="font-black text-sm bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-200">
          {pageNum}
        </span>
      </div>
    </div>
  );
};

const PageBreakIndicator = ({ fromPage, toPage }: { fromPage: number; toPage: number }) => (
  <div className="no-print w-full max-w-[210mm] flex items-center gap-3 py-1 select-none print:hidden opacity-30 text-zinc-400">
    <div className="flex-1 h-px bg-zinc-400"></div>
    <span className="text-[10px] font-bold">✂ Sayfa {fromPage} → {toPage}</span>
    <div className="flex-1 h-px bg-zinc-400"></div>
  </div>
);

// --- ATOMIC PAGE COMPONENT ---

interface WorkbookPageProps {
  item: CollectionItem;
  pageData: any;
  pageNum: number;
  settings: WorkbookSettings;
  font: string;
  accent: string;
  pIdx: number;
  total: number;
  isLastItem: boolean;
  isLandscape: boolean;
}

const WorkbookPage: React.FC<WorkbookPageProps> = ({ 
  item, pageData, pageNum, settings, font, accent, pIdx, total, isLastItem, isLandscape 
}) => {
  const style = getPageStyle(isLandscape, font, settings);
  
  return (
    <React.Fragment key={`${item.id}-p${pIdx}`}>
      <div className="relative w-full flex justify-center print:m-0">
        <div 
          className={`relative bg-white shadow-2xl worksheet-page ${settings.dyslexiaMode ? 'dyslexia-ultra-mode' : ''} ${settings.highlightSyllables ? 'highlight-syllables-active' : ''}`} 
          style={style}
        >
          <Watermark settings={settings} />
          <div className="relative z-10 flex flex-col h-full" style={{ overflow: 'hidden', paddingBottom: '40px' }}>
            <WorkbookActivityRenderer
              item={{ ...item, data: pageData }}
              settings={settings}
              pageNum={pageNum}
              font={font}
              accent={accent}
            />
          </div>
          <PageFooter pageNum={pageNum} settings={settings} />
        </div>
      </div>
      {(!isLastItem || pIdx < total - 1) && (
        <PageBreakIndicator fromPage={pageNum} toPage={pageNum + 1} />
      )}
    </React.Fragment>
  );
};

// --- MAIN WORKBOOK COMPONENT ---

const Workbook: React.FC<WorkbookProps> = ({ items, settings }: WorkbookProps) => {
  const accent = settings.accentColor || '#4f46e5';
  const font = settings.fontFamily || 'OpenDyslexic';
  const isLandscape = settings.orientation === 'landscape';

  let runningPageNum = 1;

  const renderCover = () => {
    const palette = THEME_PALETTES[settings.theme || ''] || THEME_PALETTES.modern;
    const logo = settings.logoUrl ? <img src={settings.logoUrl} className="h-20 w-auto object-contain" alt="Logo" /> : <DyslexiaLogo className="h-16 w-auto" />;
    const coverStyle = settings.coverStyle || 'centered';

    const coverInner = (content: React.ReactNode, posClass: string) => (
      <div className={`w-full h-full flex flex-col overflow-hidden relative`} style={{ backgroundColor: palette.coverBg, color: palette.coverText }}>
        <div className={`p-16 flex flex-col h-full relative z-10 ${posClass}`}>
          {content}
        </div>
      </div>
    );

    const layouts: Record<string, React.ReactNode> = {
      centered: coverInner(
        <div className="flex flex-col h-full justify-center items-center text-center">
          <div className="mb-10">{logo}</div>
          <h1 className="text-7xl font-black mb-8 uppercase leading-none" style={{ color: palette.coverText }}>{settings.title}</h1>
          <h2 className="text-4xl font-black tracking-tight mb-4" style={{ color: palette.coverText }}>{settings.studentName}</h2>
          <p className="font-black text-xl uppercase" style={{ color: palette.coverAccent }}>{settings.schoolName}</p>
        </div>, 'items-center text-center'
      ),
      left: coverInner(
        <div className="flex flex-col h-full justify-between">
          <div>{logo}</div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-7xl font-black mb-8 uppercase leading-none" style={{ color: palette.coverText }}>{settings.title}</h1>
            <h2 className="text-4xl font-black tracking-tight mb-4" style={{ color: palette.coverText }}>{settings.studentName}</h2>
            <p className="font-black text-xl uppercase" style={{ color: palette.coverAccent }}>{settings.schoolName}</p>
          </div>
          <div />
        </div>, 'items-start text-left'
      ),
      split: coverInner(
        <div className="flex flex-row h-full items-center gap-12">
          <div className="flex-1">{logo}</div>
          <div className="flex-1">
            <h1 className="text-6xl font-black mb-6 uppercase leading-none" style={{ color: palette.coverText }}>{settings.title}</h1>
            <h2 className="text-3xl font-black tracking-tight mb-4" style={{ color: palette.coverText }}>{settings.studentName}</h2>
            <p className="font-black text-lg uppercase" style={{ color: palette.coverAccent }}>{settings.schoolName}</p>
          </div>
        </div>, 'items-center'
      ),
      hero: coverInner(
        <div className="flex flex-col h-full justify-end pb-20">
          <div className="mb-6">{logo}</div>
          <h1 className="text-8xl font-black mb-4 uppercase leading-[0.9]" style={{ color: palette.coverText }}>{settings.title}</h1>
          <h2 className="text-4xl font-black tracking-tight mb-2" style={{ color: palette.coverAccent }}>{settings.studentName}</h2>
          <p className="font-black text-lg uppercase opacity-60" style={{ color: palette.coverText }}>{settings.schoolName}</p>
        </div>, 'items-start text-left'
      ),
      minimalist: coverInner(
        <div className="flex flex-col h-full justify-center items-center text-center">
          <h1 className="text-6xl font-black mb-4 uppercase leading-none tracking-tighter" style={{ color: palette.coverText }}>{settings.title}</h1>
          <div className="w-16 h-0.5 mb-4" style={{ backgroundColor: palette.coverAccent }} />
          {settings.studentName && <h2 className="text-2xl font-black tracking-tight" style={{ color: palette.coverText }}>{settings.studentName}</h2>}
        </div>, 'items-center text-center'
      ),
    };

    return (
      <div className="worksheet-page premium-glow" style={getPageStyle(isLandscape, font, settings)}>
        {layouts[coverStyle] || layouts.centered}
      </div>
    );
  };

  const renderTableOfContents = () => {
    if (!settings.showTOC || items.length === 0) return null;
    return (
      <div className="worksheet-page p-20 bg-white" style={getPageStyle(isLandscape, font, settings)}>
        <div className="flex flex-col h-full text-left">
          <h2 className="text-4xl font-black text-zinc-900 uppercase mb-10">İçindekiler</h2>
          <div className="space-y-6 flex-1">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-end justify-between">
                <span className="text-lg font-bold">{item.title}</span>
                <span className="font-black text-xl text-zinc-800">{index + (settings.showTOC ? 3 : 2)}</span>
              </div>
            ))}
          </div>
        </div>
        <PageFooter pageNum={2} settings={settings} />
      </div>
    );
  };

  const renderDividerPage = (item: CollectionItem, pageNum: number) => {
    return (
      <div className="worksheet-page flex flex-col justify-center items-center p-20 relative" style={getPageStyle(isLandscape, font, settings, { backgroundColor: '#09090b', color: 'white', borderLeft: `15mm solid ${accent}` })}>
        <div className="relative z-10 text-center">
            <h2 className="text-7xl font-black uppercase mb-6">{item.dividerConfig?.title}</h2>
            <p className="text-2xl font-light opacity-60 italic">{item.dividerConfig?.subtitle}</p>
        </div>
        <PageFooter pageNum={pageNum} settings={settings} />
      </div>
    );
  };

  const renderBackCover = () => {
    if (!settings.showBackCover) return null;
    return (
      <div className="worksheet-page p-20 bg-zinc-50" style={getPageStyle(isLandscape, font, settings)}>
        <div className="h-full border-8 border-white rounded-[40px] flex flex-col items-center justify-center text-center bg-white shadow-sm px-10">
          <h2 className="text-5xl font-black text-zinc-900 mb-4">TEBRİKLER!</h2>
          <p className="text-xl font-medium text-zinc-500 italic">{settings.customBackCoverNote || 'Başarılarının devamını dileriz!'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`workbook-container w-full flex flex-col items-center gap-12 bg-zinc-100 dark:bg-zinc-900 py-12 print:p-0 print:gap-0 print:bg-white ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {renderCover()}
      <PageBreakIndicator fromPage={runningPageNum} toPage={runningPageNum + 1} />
      {(() => { runningPageNum++; return null; })()}

      {settings.showTOC && (
        <React.Fragment>
          {renderTableOfContents()}
          <PageBreakIndicator fromPage={runningPageNum} toPage={runningPageNum + 1} />
          {(() => { runningPageNum++; return null; })()}
        </React.Fragment>
      )}

      {items.filter(item => !!item).map((item, index) => {
        if (item.itemType === 'divider') {
          const divPageNum = runningPageNum;
          runningPageNum++;
          return (
            <React.Fragment key={item.id}>
              {renderDividerPage(item, divPageNum)}
              {index < items.length - 1 && (
                <PageBreakIndicator fromPage={divPageNum} toPage={divPageNum + 1} />
              )}
            </React.Fragment>
          );
        }

        // --- MULTI-PAGE DETECTION ---
        const pages = (item.data as any)?.pages;

        if (Array.isArray(pages) && pages.length > 0) {
          return pages.map((p, pIdx) => {
            const num = runningPageNum;
            runningPageNum++;
            return (
              <WorkbookPage 
                key={`${item.id}-p${pIdx}`}
                item={item} pageData={p} pageNum={num} 
                settings={settings} font={font} accent={accent} 
                pIdx={pIdx} total={pages.length} isLastItem={index === items.length - 1}
                isLandscape={isLandscape}
              />
            );
          });
        }

        const singleNum = runningPageNum;
        runningPageNum++;
        return (
          <WorkbookPage 
            key={item.id}
            item={item} pageData={item.data} pageNum={singleNum} 
            settings={settings} font={font} accent={accent} 
            pIdx={0} total={1} isLastItem={index === items.length - 1}
            isLandscape={isLandscape}
          />
        );
      })}

      {settings.showBackCover && renderBackCover()}
    </div>
  );
};

export default Workbook;
