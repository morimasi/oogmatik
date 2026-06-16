import React, { memo, useEffect } from 'react';
import type { CollectionItem, WorkbookSettings, ActivityType, SingleWorksheetData } from '../../types';
import { SheetRenderer } from '../SheetRenderer';
import { MathStudioRenderer } from '../sheet-renderers/MathStudioRenderer';
import { SuperStudioRenderer } from '../sheet-renderers/SuperStudioRenderer';
import { KelimeCumleRenderer } from '../sheet-renderers/KelimeCumleRenderer';
import { SariKitapRenderer } from '../sheet-renderers/SariKitapRenderer';
import { SinavRenderer } from '../sheet-renderers/SinavRenderer';
import { MatSinavRenderer } from '../sheet-renderers/MatSinavRenderer';
import { CiftMetinRenderer } from '../SariKitapStudio/modules/ciftMetin/CiftMetinRenderer';
import { PencereRenderer } from '../SariKitapStudio/modules/pencere';
import { NoktaRenderer } from '../SariKitapStudio/modules/nokta';
import { KopruRenderer } from '../SariKitapStudio/modules/kopru';
import { BellekRenderer } from '../SariKitapStudio/modules/bellek';
import { HizliOkumaRenderer } from '../SariKitapStudio/modules/hizliOkuma';
import type { RendererProps } from '../SariKitapStudio/registry';
import { AssessmentReportSheet } from '../sheets/AssessmentReportSheet';

interface WorkbookActivityRendererProps {
    item: CollectionItem;
    settings: WorkbookSettings;
    pageNum: number;
    font: string;
    accent: string;
}

const SARI_KITAP_TYPES = new Set(['cift_metin', 'pencere', 'nokta', 'kopru', 'bellek', 'hizli_okuma']);

export const WorkbookActivityRenderer = memo(({ item, settings, font }: WorkbookActivityRendererProps) => {
    const mergedSettings = {
        ...settings,
        ...item.settings,
        showPedagogicalNote: true,
        ...item.overrideStyle,
        fontFamily: font,
        showStudentInfo: false,
        showFooter: false,
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).__bdmind_force_render_all_pages__ = true;
        }
    }, []);

    const rawData = item.data;
    if (!rawData) return null;
    
    const activityType = item.activityType as string;

    // --- ÖZEL STUDIO RENDERERLARI ---
    
    // 1. MATH STUDIO
    if (activityType === 'MATH_STUDIO') {
        return <MathStudioRenderer data={rawData} settings={mergedSettings} />;
    }

    // 2. SUPER STUDIO (KAPSAMLI TÜRKÇE)
    if (activityType === 'SUPER_STUDIO') {
        return <SuperStudioRenderer data={rawData} settings={mergedSettings} />;
    }

    // 3. KELİME-CÜMLE STÜDYOSU
    if (activityType === 'WORD_SENTENCE_STUDIO' || activityType === 'kelime-cumle') {
        return <KelimeCumleRenderer data={rawData} settings={mergedSettings} />;
    }

    // 4. SARİ KİTAP (Tüm Modüller)
    if (activityType === 'SARI_KITAP_STUDIO') {
        return <SariKitapRenderer data={rawData} settings={mergedSettings} />;
    }

    // 5. SINAV STUDYOSU
    if (activityType === 'SINAV') {
        return <SinavRenderer data={rawData} settings={mergedSettings} />;
    }

    // 6. MAT SINAV STUDYOSU
    if (activityType === 'MAT_SINAV') {
        return <MatSinavRenderer data={rawData} settings={mergedSettings} />;
    }

    // 7. SARI KİTAP ALT MODÜLLERİ (Direct Render)
    if (SARI_KITAP_TYPES.has(activityType)) {
        const RendererComponent = getRendererForType(activityType);
        if (RendererComponent) {
            const activeData = Array.isArray(rawData) ? rawData[0] : rawData;
            const content = (activeData as Record<string, unknown>)?.content || activeData;
            return <RendererComponent config={mergedSettings as any} content={content as any} />;
        }
    }

    // 8. ASSESSMENT REPORT
    if (activityType === 'ASSESSMENT_REPORT') {
        const activeData = Array.isArray(rawData) ? rawData[0] : rawData;
        return <AssessmentReportSheet data={activeData as unknown as any} />;
    }

    // 9. STANDART SHEET RENDERER (V1 Aktiviteler)
    const sheetData = Array.isArray(rawData) ? rawData : ([rawData] as SingleWorksheetData[]);
    
    // Check if sheetData[0] is valid
    if (!sheetData[0]) return null;

    return (
        <div className="workbook-activity-content w-full flex-1 flex flex-col gap-2">
            <SheetRenderer
                activityType={item.activityType as ActivityType}
                data={sheetData as any}
                settings={mergedSettings}
                hideWrapper={true}
            />
        </div>
    );
});

function getRendererForType(activityType: string): React.ComponentType<RendererProps> | null {
    switch (activityType) {
        case 'cift_metin': return CiftMetinRenderer;
        case 'pencere': return PencereRenderer;
        case 'nokta': return NoktaRenderer;
        case 'kopru': return KopruRenderer;
        case 'bellek': return BellekRenderer;
        case 'hizli_okuma': return HizliOkumaRenderer;
        default: return null;
    }
}

WorkbookActivityRenderer.displayName = 'WorkbookActivityRenderer';
