import React, { lazy } from 'react';

const HarfBaglamaSheet = lazy(() => import('../modules/activities/harf-baglama/ui/WorksheetUI').then(m => ({ default: m.HarfBaglamaSheet })));
const LetterConnectSheet = lazy(() => import('../modules/activities/letter-connect/ui/WorksheetUI').then(m => ({ default: m.LetterConnectSheet })));

// AUTONOM_LAZY_IMPORTS_START
// AUTONOM_LAZY_IMPORTS_END

import {
  ActivityType,
  SingleWorksheetData,
  StudentProfile,
  StyleSettings,
} from '../types';

import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { VisualInterpretationSheet } from './sheets/visual/VisualInterpretationSheet';
import { BrainTeasersSheet } from './sheets/logic/BrainTeasersSheet';
import { KavramHaritasiSheet } from './sheets/verbal/KavramHaritasiSheet';
import { EsAnlamliKelimelerSheet } from './sheets/verbal/EsAnlamliKelimelerSheet';
import { InfographicRenderer } from './sheet-renderers/InfographicRenderer';
import { ExamRenderer } from './sheet-renderers/ExamRenderer';
import { KelimeCumleRenderer } from './sheet-renderers/KelimeCumleRenderer';
import { OcrRenderer } from './sheet-renderers/OcrRenderer';
import { MathStudioRenderer } from './sheet-renderers/MathStudioRenderer';
import { SuperStudioRenderer } from './sheet-renderers/SuperStudioRenderer';
import { SariKitapRenderer } from './sheet-renderers/SariKitapRenderer';
import { ShortAnswerSheet } from './sheets/verbal/ShortAnswerSheet';

import { UnifiedContentRenderer } from './SheetRenderer/UnifiedContentRenderer';
import { renderLegacySheet } from './SheetRenderer/LegacyRenderer';

interface SheetRendererProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
  hideWrapper?: boolean;
}

export const SheetRenderer = React.memo(
  ({ activityType, data, studentProfile, settings, hideWrapper = false }: SheetRendererProps) => {
    if (!data) return null;

    const unwrappedData = Array.isArray(data) ? data[0] : data;

    if (Array.isArray(data) && !unwrappedData) return null;

    const activeData = (unwrappedData as any)?.data || unwrappedData;

    if (!activeData || typeof activeData !== 'object' || Array.isArray(activeData)) {
      if (Array.isArray(activeData) && activeData.length > 0) {
        return (
          <SheetRenderer
            activityType={activityType}
            data={activeData[0]}
            studentProfile={studentProfile}
            settings={settings}
            hideWrapper={hideWrapper}
          />
        );
      }
      return null;
    }

    const unwrapExam = (val: unknown): unknown => {
      if (!val) return val;
      if (Array.isArray(val)) {
        const first = (val as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first) && ('sorular' in first || 'baslik' in first)) return first;
        return val;
      }
      return val;
    };

    const resolvedData = unwrapExam(activeData);

    const isLandscape = settings?.orientation === 'landscape';
    const pageClass = `worksheet-page print-page shadow-2xl mb-8 ${isLandscape ? 'landscape' : ''}`;

    const withWrapper = (content: React.ReactNode) => {
      if (hideWrapper) return content;
      return <div className={pageClass}>{content}</div>;
    };

    // --- Special module renders ---

    if (activityType === ActivityType.STORY_COMPREHENSION && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.PREMIUM_STUDIO && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.MATH_STUDIO && resolvedData) {
      return withWrapper(<MathStudioRenderer data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.SUPER_STUDIO && resolvedData) {
      return withWrapper(<SuperStudioRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SARI_KITAP_STUDIO && resolvedData) {
      return withWrapper(<SariKitapRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SINAV || activityType === ActivityType.MAT_SINAV) {
      const sinav = resolvedData as unknown as any;
      if (sinav && (sinav.sorular || sinav.baslik)) {
        return withWrapper(
          <ExamRenderer
            examType={activityType === ActivityType.MAT_SINAV ? "matematik" : "turkce"}
            data={sinav}
            settings={settings}
          />
        );
      }
    }

    if (activityType === ActivityType.KELIME_CUMLE && resolvedData) {
      return withWrapper(<KelimeCumleRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_INTERPRETATION) {
      return withWrapper(
        <VisualInterpretationSheet data={resolvedData as unknown as any} settings={settings || {} as unknown as any} />
      );
    }

    if (activityType === ActivityType.BRAIN_TEASERS) {
      return withWrapper(
        <BrainTeasersSheet data={resolvedData as unknown as any} settings={settings || {} as unknown as any} />
      );
    }

    if (activityType === ActivityType.KAVRAM_HARITASI) {
      return withWrapper(<KavramHaritasiSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ES_ANLAMLI_KELIMELER) {
      return withWrapper(<EsAnlamliKelimelerSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.INFOGRAPHIC_SHORT_ANSWER) {
      return withWrapper(<ShortAnswerSheet data={((resolvedData as Record<string, unknown>).content || resolvedData) as unknown as any} />);
    }

    if (activityType === ActivityType.INFOGRAPHIC_STUDIO && resolvedData) {
      return withWrapper(<InfographicRenderer data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.OCR_CONTENT) {
      return withWrapper(
        <OcrRenderer
          data={
            {
              content: (data as Record<string, unknown>)?.content as string | undefined,
              grafikVeri: (data as Record<string, unknown>)?.grafikVeri as Record<string, unknown> | undefined,
              title: (data as Record<string, unknown>)?.title as string | undefined,
              pedagogicalNote: (data as Record<string, unknown>)?.pedagogicalNote as string | undefined,
              targetSkills: (data as Record<string, unknown>)?.targetSkills as string[] | undefined,
              columns: (data as Record<string, unknown>)?.columns as number | undefined,
              estimatedFontSize: (data as Record<string, unknown>)?.estimatedFontSize as number | undefined,
            } as {
              content?: string;
              grafikVeri?: Record<string, unknown>;
              title?: string;
              pedagogicalNote?: string;
              targetSkills?: string[];
              columns?: number;
              estimatedFontSize?: number;
            }
          }
        />
      );
    }

    // --- Empty data check ---
    const isDataEmpty = !data || typeof data !== 'object' || Object.keys(data).length === 0;

    if (isDataEmpty) {
      return withWrapper(
        <div className="p-10 text-center text-gray-500 bg-white rounded-3xl shadow-sm min-h-[600px] flex flex-col items-center justify-center font-['Lexend']">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-300"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">İçerik Bulunamadı</h3>
          <p className="max-w-xs text-sm text-gray-400 leading-relaxed italic">
            Yapay zeka içeriği hazırlarken bir sorun oluşmuş olabilir veya henüz içerik üretilmedi.
          </p>
          <div className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
            Farklı Bir Seçenek Deneyin
          </div>
        </div>
      );
    }

    // --- Direct return legacy cases (bypass wrapper) ---
    if (activityType === ActivityType.LETTER_CONNECT) {
      return <LetterConnectSheet data={activeData} />;
    }

    if (activityType === ActivityType.HARF_BAGLAMA) {
      return <HarfBaglamaSheet data={activeData} />;
    }

    // --- Legacy switch via LegacyRenderer ---
    const renderNonStandardBlock = (block: any) => (
      <SheetRenderer
        activityType={activityType}
        data={{
          ...activeData,
          blocks: undefined,
          puzzles: [block],
          items: [block],
          problems: [block],
          steps: [block],
          operations: [block],
        }}
        hideWrapper={true}
      />
    );

    // Modern layout: blocks with layoutArchitecture
    const isModernLayout = activeData?.layoutArchitecture || (Array.isArray(activeData?.blocks) && activeData.blocks.some((b: any) => b?.type));

    if (!hideWrapper && isModernLayout) {
      return (
        <UnifiedContentRenderer
          data={activeData}
          activityType={activityType}
          studentProfile={studentProfile}
          settings={settings}
          renderNonStandardBlock={renderNonStandardBlock}
        />
      );
    }

    if (!data || typeof data !== 'object') return null;

    // Legacy activity type switch
    const legacySheet = renderLegacySheet(activityType, activeData, settings);
    if (legacySheet !== null) {
      return withWrapper(legacySheet);
    }

    // Default fallback
    return withWrapper(
      <UnifiedContentRenderer
        data={activeData}
        activityType={activityType}
        studentProfile={studentProfile}
        settings={settings}
        renderNonStandardBlock={renderNonStandardBlock}
      />
    );
  }
);
