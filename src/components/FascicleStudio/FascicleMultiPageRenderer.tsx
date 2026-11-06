import React, { Suspense, useMemo } from 'react';
import { FascicleItem, FascicleMetadata, WatermarkSettings } from '../../types/fascicle';
import { SheetRenderer } from '../SheetRenderer';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../../types';
import { buildFasciclePages } from '../../utils/fascicleContentNormalizer';

interface FascicleMultiPageRendererProps {
  item: FascicleItem;
  itemIndex: number;
  metadata: FascicleMetadata;
  startPageNumber: number;
  grandTotalPages: number;
  renderWatermark: (ws: WatermarkSettings) => React.ReactNode;
}

/** Kenar boşluğu anahtarını normalize eder; tanımsız değerler 'normal'e düşer. */
function marginMarginKey(margin: string): string {
  if (margin === 'narrow' || margin === 'wide') return margin;
  return 'normal';
}

const PAPER_BG_MAP: Record<string, string> = {
  white: '#ffffff',
  sepia: '#fbf0d9',
  yellow: '#fffde7',
  cream: '#fdfbf7',
};

const MARGIN_MAP: Record<string, string> = {
  narrow: '4mm',
  normal: '8mm',
  wide: '15mm',
};

const SHEET_CLASS =
  'w-[210mm] h-[297mm] max-h-[297mm] mx-auto shrink-0 shadow-2xl mb-12 relative print-exact worksheet-page border border-zinc-200 flex flex-col justify-between overflow-hidden box-border';

export const FascicleMultiPageRenderer: React.FC<FascicleMultiPageRendererProps> = ({
  item,
  itemIndex,
  metadata,
  startPageNumber,
  grandTotalPages,
  renderWatermark,
}) => {
  const isExam = item.type === ActivityType.SINAV || item.type === ActivityType.MAT_SINAV;
  const isBlankPage = item.type === 'blank_page';
  const defaultColumns = isExam ? 2 : 1;

  // Etkinliğin ÜRETTİĞİ tüm sayfalar (çok sayfalı içerik kırpılmaz)
  const pages = useMemo<SingleWorksheetData[]>(() => {
    if (isBlankPage) return [];
    try {
      return buildFasciclePages(item, defaultColumns).pages;
    } catch {
      // Bozuk/eksik içerikte fasikül tamamen boş kalmasın: tek boş sayfa yerine hatayı bildir
      return [];
    }
  }, [item, defaultColumns, isBlankPage]);

  // Kâğıt Teması & Rengi
  const paperColor = metadata.pageSettings?.paperColor || 'white';
  const marginSetting = metadata.pageSettings?.margin || 'normal';
  const fontScale = metadata.pageSettings?.fontScale || 100;

  const paddingVal = MARGIN_MAP[marginMarginKey(marginSetting)] || '8mm';

  const dynamicSettings: Record<string, unknown> = {
    ...((item.content as Record<string, unknown>)?.printConfig as Record<string, unknown> || {}),
    ...(isExam ? {} : ((item.content as Record<string, unknown>)?.settings as Record<string, unknown> || {})),
    ...(isExam ? {} : ((item.content as Record<string, unknown>)?.config as Record<string, unknown> || {})),
    ...(isExam ? {} : ((item.content as Record<string, unknown>)?.styleSettings as Record<string, unknown> || {})),
  };

  const sheetStyle: React.CSSProperties = {
    backgroundColor: PAPER_BG_MAP[paperColor] || '#ffffff',
    fontSize: `${fontScale}%`,
    breakInside: 'avoid',
    pageBreakInside: 'avoid',
    breakAfter: 'page',
    pageBreakAfter: 'always',
  };

  const renderFooter = (pageNumber: number) => (
    <div className="px-6 py-2 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-white z-20 shrink-0">
      <span>{metadata.title && metadata.title !== 'İsimsiz Fasikül' ? metadata.title : 'bdmind Özel Eğitim'}</span>
      <span>Sayfa {pageNumber} / {grandTotalPages}</span>
    </div>
  );

  // Eğer Boş A4 Sayfası ise
  if (isBlankPage) {
    return (
      <div className="relative group/page">
        <div className={SHEET_CLASS} style={{ backgroundColor: PAPER_BG_MAP[paperColor] || '#ffffff' }}>
          {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}

          <div className="p-[10mm] flex-1 min-h-0 overflow-hidden flex flex-col items-center justify-between border-2 border-dashed border-zinc-200 m-3 rounded-2xl">
            <div className="w-full text-left shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                SERBEST ÇALIŞMA & NOT SAYFASI
              </span>
              <h3 className="text-lg font-black text-zinc-800 mt-1">
                {(item.content as Record<string, unknown>)?.title as string || 'Boş Çizim & Not Alanı'}
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {(item.content as Record<string, unknown>)?.instruction as string || 'Öğrencinin serbest not alması, soru çözmesi veya çizim yapması için ayrılmıştır.'}
              </p>
            </div>

            {/* Izgaralı / Kılavuz Çizgili Not Alanı */}
            <div className="w-full flex-1 my-4 border-b border-zinc-200 opacity-30" style={{
              backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
              backgroundSize: '100% 28px'
            }} />

            <div className="w-full flex justify-between text-[10px] font-bold text-zinc-400 uppercase shrink-0">
              <span>Tarih: ____/____/20__</span>
              <span>Değerlendirme: ________________</span>
            </div>
          </div>

          {renderFooter(startPageNumber)}
        </div>
      </div>
    );
  }

  // İçerik üretilemediyse kullanıcıyı bilgilendiren tek sayfa (sessiz boş sayfa yok)
  if (pages.length === 0) {
    return (
      <div className="relative group/page">
        <div className={SHEET_CLASS} style={sheetStyle}>
          {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center px-10">
            <span className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-2">İçerik Bulunamadı</span>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Bu etkinliğin içeriği okunamadı. Etkinliği kaldırıp yeniden ekleyebilirsiniz.
            </p>
            <span className="text-[10px] font-bold text-zinc-300 mt-3">{item.type}</span>
          </div>
          {renderFooter(startPageNumber)}
        </div>
      </div>
    );
  }

  return (
    <div className="relative group/page">
      {/* Sol Kenar Bilgi Rozeti (Sadece Ekranda, etkinliğin ilk sayfasında) */}
      <div className="absolute -left-48 top-0 w-40 no-print hidden xl:flex flex-col gap-4 py-4 pointer-events-none">
        <div className="glass-layer-3 p-4 rounded-2xl pointer-events-auto">
          <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--accent-color)' }}>
            Sayfa {startPageNumber} / {grandTotalPages}
          </span>
          <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">
            {item.type.replace(/-/g, ' ').toUpperCase()}
          </h4>
          <div className="mt-2 flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${item.difficulty === 'Zor' ? 'bg-red-500' : item.difficulty === 'Orta' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="text-[10px] text-[var(--text-muted)]">{item.difficulty} Seviye</span>
          </div>
          {pages.length > 1 && (
            <div className="mt-1.5 text-[9px] font-bold text-[var(--text-muted)]">
              {pages.length} sayfalık etkinlik
            </div>
          )}
        </div>
      </div>

      {/* Her üretilen sayfa ayrı bir A4 olarak basılır */}
      {pages.map((page, pageIdx) => {
        const pageNumber = startPageNumber + pageIdx;

        return (
          <div
            key={`${item.id || itemIndex}-page-${pageIdx}`}
            className={SHEET_CLASS}
            style={sheetStyle}
            data-fascicle-item={item.id || itemIndex}
            data-fascicle-page={pageIdx + 1}
          >
            {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col" style={{ padding: paddingVal }}>
              <Suspense fallback={
                <div className="w-full h-96 flex items-center justify-center bg-white">
                  <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottomColor: 'var(--accent-color)', borderWidth: '3px' }}></div>
                </div>
              }>
                <SheetRenderer
                  data={page}
                  activityType={item.type as ActivityType}
                  hideWrapper={true}
                  settings={{
                    fontSize: `${1 * (fontScale / 100)}rem`,
                    lineHeight: 1.6,
                    scale: fontScale / 100,
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    margin: 6,
                    columns: defaultColumns,
                    gap: 16,
                    orientation: 'portrait',
                    themeBorder: 'none',
                    contentAlign: 'left',
                    fontWeight: 'normal',
                    fontStyle: 'normal',
                    visualStyle: 'minimal',
                    showMascot: false,
                    showStudentInfo: false,
                    showTitle: true,
                    showInstruction: true,
                    showImage: true,
                    showFooter: false, // Universal Footer Band zaten var, içeride ikinci footer üretilmesin!
                    showAnswers: false,
                    showClues: false,
                    footerText: '',
                    // Sayfalar buildFasciclePages ile önceden bölündü; burada yeniden sayfalanmaz.
                    smartPagination: false,
                    fontFamily: 'Lexend',
                    letterSpacing: 0,
                    wordSpacing: 0,
                    paragraphSpacing: 0,
                    compact: true, // A4 içine kusursuz oturması için kompakt mod
                    ...dynamicSettings
                  } as StyleSettings}
                />
              </Suspense>
            </div>

            {/* Universal Footer Band (Tam sayfa tabanında sabit, asla sarkmaz) */}
            {renderFooter(pageNumber)}
          </div>
        );
      })}
    </div>
  );
};
