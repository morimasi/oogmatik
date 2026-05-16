import React, { memo, useEffect } from 'react';
import type { CollectionItem, WorkbookSettings, ActivityType } from '../../types';
import { SheetRenderer } from '../SheetRenderer';
import { CiftMetinRenderer } from '../SariKitapStudio/modules/ciftMetin/CiftMetinRenderer';
import { PencereRenderer } from '../SariKitapStudio/modules/pencere';
import { NoktaRenderer } from '../SariKitapStudio/modules/nokta';
import { KopruRenderer } from '../SariKitapStudio/modules/kopru';
import { BellekRenderer } from '../SariKitapStudio/modules/bellek';
import { HizliOkumaRenderer } from '../SariKitapStudio/modules/hizliOkuma';
import type { RendererProps } from '../SariKitapStudio/registry';
import type { SariKitapGeneratedContent } from '../../types/sariKitap';

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
        // Workbook bağlamında SheetRenderer'ın kendi wrapper'ını kullanmasını ENGELLE
        // çünkü Workbook.tsx zaten dış sarmalamayı sağlıyor
        showStudentInfo: false,
        showFooter: false,
    };

    // Force render all pages in workbook context — LazyPage bypass
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as unknown as Record<string, unknown>).__oogmatik_force_render_all_pages__ = true;
        }
    }, []);

    // Robust data unwrapping to resolve envelope/wrapper issues across all studios
    const rawData = item.data;
    let unwrappedData = Array.isArray(rawData) ? rawData[0] : rawData;
    let activeData = (unwrappedData as any)?.data || unwrappedData;

    // Sari Kitap activities have different data structure
    const actualType = (item.activityType === 'SARI_KITAP_STUDIO' && activeData?.type) 
        ? activeData.type 
        : item.activityType;

    if (SARI_KITAP_TYPES.has(actualType)) {
        const RendererComponent = getRendererForType(actualType);
        if (!RendererComponent) {
            return <EmptyState font={font} />;
        }

        const config = { 
            type: actualType, 
            ...item.settings, 
            ...(activeData.config || {}) 
        };
        
        // Use the actual content if nested, otherwise use the whole object
        const content = activeData.content || activeData;
        
        const rendererProps: RendererProps = { 
            config: config as any, 
            content: content as any 
        };

        return (
            <div 
                className="workbook-activity-content"
                style={{
                    width: '100%',
                    minHeight: 0,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '1rem',
                }}
            >
                {React.createElement(RendererComponent, rendererProps as never)}
            </div>
        );
    }

    // Standard workbook activities: extracting data arrays to render each sheet
    let dataArray: any[] = [];
    if (rawData) {
        if (Array.isArray(rawData)) {
            dataArray = rawData.map(d => d.data ? d.data : d);
        } else if ((rawData as any).data && Array.isArray((rawData as any).data)) {
            dataArray = (rawData as any).data;
        } else if ((rawData as any).data) {
            dataArray = [(rawData as any).data];
        } else {
            dataArray = [rawData];
        }
    }

    if (dataArray.length === 0) {
        return <EmptyState font={font} />;
    }

    return (
        <div 
            className="workbook-activity-content" 
            style={{ 
                width: '100%', 
                minHeight: 0,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
            }}
        >
            {dataArray.map((ws: Record<string, unknown>, idx: number) => (
                <SheetRenderer
                    key={(ws?.id as string) || `wb-sheet-${idx}`}
                    activityType={item.activityType as ActivityType}
                    data={ws as never}
                    studentProfile={{
                        name: settings.studentName,
                        school: settings.schoolName,
                        grade: '',
                        date: new Date().toLocaleDateString('tr-TR'),
                    }}
                    settings={mergedSettings}
                    hideWrapper={true}
                />
            ))}
        </div>
    );
});

function getRendererForType(activityType: string): React.ComponentType<RendererProps> | null {
    switch (activityType) {
        case 'cift_metin':
            return CiftMetinRenderer;
        case 'pencere':
            return PencereRenderer;
        case 'nokta':
            return NoktaRenderer;
        case 'kopru':
            return KopruRenderer;
        case 'bellek':
            return BellekRenderer;
        case 'hizli_okuma':
            return HizliOkumaRenderer;
        default:
            return null;
    }
}

function EmptyState({ font }: { font: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9ca3af', fontFamily: font }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📄</div>
            <p style={{ fontSize: '0.875rem' }}>Bu sayfa için içerik bulunamadı.</p>
        </div>
    );
}

WorkbookActivityRenderer.displayName = 'WorkbookActivityRenderer';
