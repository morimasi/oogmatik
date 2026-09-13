import React, { Suspense } from 'react';
import { FascicleItem, FascicleMetadata, WatermarkSettings } from '../../types/fascicle';
import { SheetRenderer } from '../SheetRenderer';
import { ActivityType, StyleSettings } from '../../types';
import { normalizeFascicleContent } from '../../utils/fascicleContentNormalizer';

interface FascicleMultiPageRendererProps {
  item: FascicleItem;
  itemIndex: number;
  metadata: FascicleMetadata;
  startPageNumber: number;
  grandTotalPages: number;
  renderWatermark: (ws: WatermarkSettings) => React.ReactNode;
}

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

  const normalized = normalizeFascicleContent(item, defaultColumns);

  // Kâğıt Teması & Rengi
  const paperColor = metadata.pageSettings?.paperColor || 'white';
  const marginSetting = metadata.pageSettings?.margin || 'normal';
  const fontScale = metadata.pageSettings?.fontScale || 100;

  const bgMap: Record<string, string> = {
    white: '#ffffff',
    sepia: '#fbf0d9',
    yellow: '#fffde7',
    cream: '#fdfbf7',
  };

  const marginMap: Record<string, string> = {
    narrow: '4mm',
    normal: '8mm',
    wide: '15mm',
  };

  const paddingVal = marginMap[marginMarginKey(marginSetting)] || '8mm';

  const dynamicSettings = {
    columns: defaultColumns,
    ...((item.content as any)?.printConfig || {}),
    ...(isExam ? {} : ((item.content as any)?.settings || {})),
    ...(isExam ? {} : ((item.content as any)?.config || {})),
    ...(isExam ? {} : ((item.content as any)?.styleSettings || {})),
  };

  // Eğer Boş A4 Sayfası ise
  if (isBlankPage) {
    return (
      <div className="relative group/page">
        <div className="w-[210mm] min-h-[297mm] mx-auto shrink-0 shadow-2xl mb-12 relative print-exact worksheet-page border border-zinc-200 flex flex-col justify-between" style={{ backgroundColor: bgMap[paperColor] || '#ffffff' }}>
          {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}

          <div className="p-[12mm] flex-1 flex flex-col items-center justify-between border-2 border-dashed border-zinc-200 m-4 rounded-3xl">
            <div className="w-full text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                SERBEST ÇALIŞMA & NOT SAYFASI
              </span>
              <h3 className="text-xl font-black text-zinc-800 mt-1">
                {(item.content as any)?.title || 'Boş Çizim & Not Alanı'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {(item.content as any)?.instruction || 'Öğrencinin serbest not alması, soru çözmesi veya çizim yapması için ayrılmıştır.'}
              </p>
            </div>

            {/* Izgaralı / Kılavuz Çizgili Not Alanı */}
            <div className="w-full flex-1 my-6 border-b border-zinc-200 opacity-30" style={{
              backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
              backgroundSize: '100% 28px'
            }} />

            <div className="w-full flex justify-between text-[10px] font-bold text-zinc-400 uppercase">
              <span>Tarih: ____/____/20__</span>
              <span>Değerlendirme: ________________</span>
            </div>
          </div>

          <div className="px-6 py-2 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-white z-20">
            <span>{metadata.title || 'bdmind Special Education'}</span>
            <span>Sayfa {startPageNumber} / {grandTotalPages}</span>
          </div>
        </div>
      </div>
    );
  }

  // Standart Etkinlik Render (Çok Sayfaya Taşabilen Yapı)
  return (
    <div className="relative group/page">
      {/* Sol Kenar Bilgi Rozeti */}
      <div className="absolute -left-48 top-0 w-40 h-full no-print hidden xl:flex flex-col gap-4 py-4 pointer-events-none">
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
        </div>
      </div>

      {/* A4 Kâğıt Render (Çok sayfada kaymadan uzayabilen min-h-[297mm]) */}
      <div
        className="w-[210mm] min-h-[297mm] mx-auto shrink-0 shadow-2xl mb-12 relative print-exact worksheet-page border border-zinc-200 flex flex-col justify-between overflow-visible"
        style={{
          backgroundColor: bgMap[paperColor] || '#ffffff',
          fontSize: `${fontScale}%`,
        }}
      >
        {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}
        <div className="flex-1 flex flex-col" style={{ padding: paddingVal }}>
          <Suspense fallback={
            <div className="w-full h-96 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottomColor: 'var(--accent-color)', borderWidth: '3px' }}></div>
            </div>
          }>
            <SheetRenderer
              data={normalized.data}
              activityType={normalized.activityType}
              hideWrapper={true}
              settings={{
                fontSize: `${1 * (fontScale / 100)}rem`,
                lineHeight: 1.6,
                scale: fontScale / 100,
                borderColor: '#e2e8f0',
                borderWidth: 1,
                margin: 10,
                columns: defaultColumns,
                gap: 20,
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
                showFooter: true,
                showAnswers: false,
                showClues: false,
                footerText: `${metadata.title || 'Fasikül'} • Sayfa ${startPageNumber} / ${grandTotalPages}`,
                smartPagination: true,
                fontFamily: 'Lexend',
                letterSpacing: 0,
                wordSpacing: 0,
                paragraphSpacing: 0,
                ...dynamicSettings
              } as StyleSettings}
            />
          </Suspense>
        </div>

        {/* Universal Footer Band */}
        <div className="px-6 py-2 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-white z-20">
          <span>{metadata.title || 'bdmind Special Education'}</span>
          <span>Sayfa {startPageNumber} / {grandTotalPages}</span>
        </div>
      </div>
    </div>
  );
};

function marginMarginKey(margin: string): string {
  if (margin === 'narrow' || margin === 'wide') return margin;
  return 'normal';
}
