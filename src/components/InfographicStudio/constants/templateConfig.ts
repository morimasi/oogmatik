import { ActivityType } from '../../../types/activity';

export interface InfographicTemplateConfig {
    id: ActivityType;
    layout: 'A4_PORTRAIT' | 'A4_LANDSCAPE' | 'SQUARE';
    primaryColor: string;
    maxItems: number;
    interactiveProps?: Record<string, unknown>;
}

// VarsayılanFallback şablonu (Eğer özel belirtilmemişse)
export const DEFAULT_TEMPLATE_CONFIG: Omit<InfographicTemplateConfig, 'id'> = {
    layout: 'A4_PORTRAIT',
    primaryColor: '#4F46E5', // Indigo-600
    maxItems: 6
};

// İstisnai şablon düzenleri (Örn: Venn Şeması yatay daha iyi durur)
export const INFOGRAPHIC_TEMPLATE_OVERRIDES: Partial<Record<ActivityType, Partial<InfographicTemplateConfig>>> = {
    [ActivityType.INFOGRAPHIC_VENN_DIAGRAM]: {
        layout: 'A4_LANDSCAPE',
        maxItems: 4,
    },
    [ActivityType.INFOGRAPHIC_TIMELINE_EVENT]: {
        layout: 'A4_LANDSCAPE',
        maxItems: 8,
    },
    [ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD]: {
        primaryColor: '#10B981', // Emerald-500
        maxItems: 5,
    },
    [ActivityType.INFOGRAPHIC_MIND_MAP]: {
        layout: 'SQUARE',
        maxItems: 10,
    }
};

export const getTemplateConfig = (activityId: ActivityType): InfographicTemplateConfig => {
    const overrides = INFOGRAPHIC_TEMPLATE_OVERRIDES[activityId] || {};
    return {
        id: activityId,
        ...DEFAULT_TEMPLATE_CONFIG,
        ...overrides
    } as InfographicTemplateConfig;
};
