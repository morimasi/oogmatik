import React from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import DyslexiaLogo from './DyslexiaLogo';
import { WorkbookActivityRenderer } from './workbook/WorkbookActivityRenderer';
import '../styles/workbookPremium.css';

interface WorkbookProps {
  items: CollectionItem[];
  settings: WorkbookSettings;
}

// --- HELPER FUNCTIONS (OUTSIDE OF COMPONENT) ---

const getPageStyle = (isLandscape: boolean, font: string, settings: WorkbookSettings, extra = {}) => ({
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
        <div className="relative bg-white shadow-2xl worksheet-page" style={style}>
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
    const logo = settings.logoUrl ? <img src={settings.logoUrl} className="h-20 w-auto object-contain" alt="Logo" /> : <DyslexiaLogo className="h-16 w-auto text-current" />;
    return (
      <div className="worksheet-page premium-glow" style={getPageStyle(isLandscape, font, settings)}>
        <div className="w-full h-full flex flex-col bg-white overflow-hidden relative" style={{ borderLeft: `25mm solid ${accent}` }}>
          <div className="p-20 flex flex-col h-full justify-between relative z-10 text-left">
            <div>{logo}</div>
            <div>
              <h1 className="text-7xl font-black text-zinc-900 mb-8 uppercase leading-none">{settings.title}</h1>
              <h2 className="text-4xl font-black text-zinc-800 tracking-tight">{settings.studentName}</h2>
            </div>
            <p className="font-black text-xl text-zinc-900 uppercase">{settings.schoolName}</p>
          </div>
        </div>
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

      {items.map((item, index) => {
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

        const pages = (item.data as unknown as any)?.pages || (item.data as unknown as any)?.sheets;
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
