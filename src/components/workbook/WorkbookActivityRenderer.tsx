import React, { memo } from 'react';
import type { CollectionItem, WorkbookSettings, ActivityType } from '../../types';
import Worksheet from '../Worksheet';
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
    };

    // Sari Kitap activities have different data structure: { config, content } or raw data with sourceTexts, heceRows, etc.
    if (SARI_KITAP_TYPES.has(item.activityType)) {
        const RendererComponent = getRendererForType(item.activityType);
        if (!RendererComponent) {
            return <EmptyState font={font} />;
        }

        // Data structure varies: some have { config, content }, others store everything directly in item.data
        const itemData = item.data as Record<string, unknown>;
        let config: Record<string, unknown> = {};
        const content: Partial<SariKitapGeneratedContent> = {};

        // Extract config if it exists
        if ('config' in itemData) {
            config = (itemData.config as Record<string, unknown>) || {};
        }

        // Everything else is content
        for (const [key, value] of Object.entries(itemData)) {
            if (key !== 'config') {
                content[key as keyof SariKitapGeneratedContent] = value as any;
            }
        }

        config = { type: item.activityType, ...item.settings, ...config };
        
        const rendererProps: RendererProps = { 
            config: config as any, 
            content: content as SariKitapGeneratedContent 
        };

        return (
            <div 
                className="workbook-activity-content"
                style={{
                    width: '100%',
                    height: 'calc(100% - 60px)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '1rem',
                }}
            >
                <RendererComponent {...rendererProps as any} />
            </div>
        );
    }

    // Standard workbook activities use Worksheet → SheetRenderer path
    const dataArray = Array.isArray(item.data) ? item.data : (item.data ? [item.data] : []);

    if (dataArray.length === 0) {
        return <EmptyState font={font} />;
    }

    return (
        <div className="workbook-activity-content" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Worksheet
                activityType={item.activityType as ActivityType}
                data={dataArray as any}
                settings={mergedSettings}
                studentProfile={{
                    name: settings.studentName,
                    school: settings.schoolName,
                    grade: '',
                    date: new Date().toLocaleDateString('tr-TR'),
                }}
            />
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
