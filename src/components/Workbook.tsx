import React from 'react';
import { CollectionItem, WorkbookSettings, ActivityType } from '../types';
import { ACTIVITIES } from '../constants';
import DyslexiaLogo from './DyslexiaLogo';
import { WorkbookActivityRenderer } from './workbook/WorkbookActivityRenderer';
import '../styles/workbookPremium.css';

interface WorkbookProps {
  items: CollectionItem[];
  settings: WorkbookSettings;
}

const Workbook: React.FC<WorkbookProps> = ({ items, settings }: WorkbookProps) => {
  const accent = settings.accentColor || '#4f46e5';
  const font = settings.fontFamily || 'OpenDyslexic';
  const isLandscape = settings.orientation === 'landscape';

  const getPageStyle = (extra = {}) => ({
    width: isLandscape ? '297mm' : '210mm',
    height: isLandscape ? '210mm' : '297mm',
    padding: settings.margin ? `${settings.margin}mm` : '15mm',
    margin: '0 auto',
    backgroundColor: 'white',
    color: 'black',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    boxShadow: '0 0 40px rgba(0,0,0,0.1)',
    fontFamily: font,
    boxSizing: 'border-box' as const,
    display: 'flex' as const,
    flexDirection: 'column' as const,
    ...extra,
  });

  // --- SUB-COMPONENTS ---
  const Watermark = () => {
    if (!settings.showWatermark) return null;
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <div
          className="transform -rotate-45 w-[70%] grayscale opacity-[0.03]"
          style={{ opacity: settings.watermarkOpacity }}
        >
          {settings.logoUrl ? (
            <img src={settings.logoUrl} className="w-full h-auto" alt="watermark" />
          ) : (
            <DyslexiaLogo className="w-full h-auto text-black" />
          )}
        </div>
      </div>
    );
  };

  const PageFooter = ({ pageNum }: { pageNum: number }) => {
    if (!settings.showPageNumbers) return null;
    return (
      <div className="absolute bottom-6 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono z-20">
        <div className="flex flex-col">
          <span className="font-bold opacity-50">{settings.schoolName || 'Bursa Disleksi EduMind'}</span>
          <span className="opacity-30 uppercase tracking-tighter">Premium Workbook Edition</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-zinc-200"></div>
          <span className="font-black text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {pageNum}
          </span>
        </div>
      </div>
    );
  };

  const renderCover = () => {
    const logo = settings.logoUrl ? (
      <img src={settings.logoUrl} className="h-20 w-auto object-contain" alt="Logo" />
    ) : (
      <DyslexiaLogo className="h-16 w-auto text-current" />
    );

    const renderCoverContent = () => {
      switch (settings.theme) {
        case 'cyber':
          return (
            <div className="w-full h-full bg-[#0a0a0f] text-white flex flex-col relative cyber-grid">
              <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 70%)` }}></div>
              <div className="p-20 z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start border-b border-white/10 pb-10">{logo}</div>
                <div className="space-y-4">
                  <h1 className="text-7xl font-black italic uppercase">{settings.title}</h1>
                  <h2 className="text-3xl font-bold text-cyan-300">{settings.studentName}</h2>
                </div>
              </div>
            </div>
          );
        case 'luxury':
          return (
            <div className="w-full h-full bg-zinc-950 text-white flex flex-col relative overflow-hidden">
                <div className="p-24 h-full flex flex-col justify-center items-center text-center">
                    <div className="mb-20 scale-150 grayscale invert brightness-200">{logo}</div>
                    <h1 className="text-6xl font-light tracking-[0.2em] uppercase mb-8">{settings.title}</h1>
                    <h2 className="text-4xl font-bold italic text-zinc-200">{settings.studentName}</h2>
                </div>
            </div>
          );
        default:
          return (
            <div className="w-full h-full flex flex-col bg-white overflow-hidden relative" style={{ borderLeft: `25mm solid ${accent}` }}>
              <div className="p-20 flex flex-col h-full justify-between relative z-10">
                <div>{logo}</div>
                <div>
                  <h1 className="text-7xl font-black text-zinc-900 mb-8 uppercase leading-none">{settings.title}</h1>
                  <h2 className="text-4xl font-black text-zinc-800 tracking-tight">{settings.studentName}</h2>
                </div>
                <p className="font-black text-xl text-zinc-900 uppercase">{settings.schoolName}</p>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="worksheet-page premium-glow" style={getPageStyle()}>
        {renderCoverContent()}
      </div>
    );
  };

  const renderTableOfContents = () => {
    if (!settings.showTOC || items.length === 0) return null;
    return (
      <div className="worksheet-page p-20 bg-white" style={getPageStyle()}>
        <div className="flex flex-col h-full">
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
        <PageFooter pageNum={2} />
      </div>
    );
  };

  const renderDividerPage = (item: CollectionItem, pageNum: number) => {
    return (
      <div className="worksheet-page flex flex-col justify-center items-center p-20 relative" style={getPageStyle({ backgroundColor: '#09090b', color: 'white', borderLeft: `15mm solid ${accent}` })}>
        <div className="relative z-10 text-center">
            <h2 className="text-7xl font-black uppercase mb-6">{item.dividerConfig?.title}</h2>
            <p className="text-2xl font-light opacity-60 italic">{item.dividerConfig?.subtitle}</p>
        </div>
        <PageFooter pageNum={pageNum} />
      </div>
    );
  };

  const renderBackCover = () => {
    if (!settings.showBackCover) return null;
    return (
      <div className="worksheet-page p-20 bg-zinc-50" style={getPageStyle()}>
        <div className="h-full border-8 border-white rounded-[40px] flex flex-col items-center justify-center text-center bg-white shadow-sm">
          <h2 className="text-5xl font-black text-zinc-900 mb-4">TEBRİKLER!</h2>
          <p className="text-xl font-medium text-zinc-500">{settings.customBackCoverNote || 'Başarılarının devamını dileriz!'}</p>
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

  // --- MAIN RENDER LOGIC ---
  let runningPageNum = 1;

  return (
    <div className={`workbook-container w-full flex flex-col items-center gap-12 bg-zinc-100 dark:bg-zinc-900 py-12 print:p-0 print:gap-0 print:bg-white ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}`}>
      {/* 1. KAPAK SAYFASI */}
      {renderCover()}
      <PageBreakIndicator fromPage={runningPageNum} toPage={runningPageNum + 1} />
      {(() => { runningPageNum++; return null; })()}

      {/* 2. İÇİNDEKİLER SAYFASI */}
      {settings.showTOC && (
        <React.Fragment>
          {renderTableOfContents()}
          <PageBreakIndicator fromPage={runningPageNum} toPage={runningPageNum + 1} />
          {(() => { runningPageNum++; return null; })()}
        </React.Fragment>
      )}

      {/* 3. ETKİNLİKLER */}
      {items.map((item, index) => {
        if (item.itemType === 'divider') {
          const dividerEl = (
            <React.Fragment key={item.id}>
              {renderDividerPage(item, runningPageNum)}
              {index < items.length - 1 && (
                <PageBreakIndicator fromPage={runningPageNum} toPage={runningPageNum + 1} />
              )}
            </React.Fragment>
          );
          runningPageNum++;
          return dividerEl;
        }

        const renderSinglePage = (pageItem: any, pageIdx: number, totalPages: number) => {
          const pageNum = runningPageNum;
          const content = (
            <React.Fragment key={`${item.id}-p${pageIdx}`}>
              <div className="relative w-full flex justify-center print:m-0">
                <div className="relative bg-white shadow-2xl worksheet-page" style={getPageStyle()}>
                  <Watermark />
                  <div className="relative z-10 flex flex-col h-full" style={{ overflow: 'hidden', paddingBottom: '40px' }}>
                    {item.activityType === 'ASSESSMENT_REPORT' ? (
                      <div className="p-20 text-center flex flex-col items-center justify-center h-full">
                        <i className="fa-solid fa-chart-line text-6xl text-zinc-100 mb-8"></i>
                        <h3 className="text-2xl font-black opacity-20 uppercase tracking-widest">Analiz Raporu</h3>
                      </div>
                    ) : (
                      <WorkbookActivityRenderer
                        item={{ ...item, data: pageItem }}
                        settings={settings}
                        pageNum={pageNum}
                        font={font}
                        accent={accent}
                      />
                    )}
                  </div>
                  <PageFooter pageNum={pageNum} />
                </div>
              </div>
              {(index < items.length - 1 || pageIdx < totalPages - 1) && (
                <PageBreakIndicator fromPage={pageNum} toPage={pageNum + 1} />
              )}
            </React.Fragment>
          );
          runningPageNum++;
          return content;
        };

        const pages = (item.data as any)?.pages || (item.data as any)?.sheets;
        if (Array.isArray(pages) && pages.length > 0) {
          return pages.map((p, pIdx) => renderSinglePage(p, pIdx, pages.length));
        }

        return renderSinglePage(item.data, 0, 1);
      })}

      {/* 4. ARKA KAPAK */}
      {settings.showBackCover && renderBackCover()}
    </div>
  );
};

export default Workbook;
