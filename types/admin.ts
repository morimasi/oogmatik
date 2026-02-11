
import { ActivityType, UserRole, UserStatus } from './core';

export interface DynamicActivity {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: string;
    isActive: boolean;
    isPremium: boolean;
    promptId?: string;
    updatedAt: string;
    order?: number;
    themeColor: string;
    secondaryColor?: string;
    targetSkills?: string[];
    // Üretim Motoru Ayarları
    engineConfig: {
        mode: 'ai_only' | 'hybrid' | 'logic_only';
        baseBlueprint?: string; // Creative Studio'dan gelen mimari DNA
        parameters: {
            allowDifficulty: boolean;
            allowDistraction: boolean;
            allowFontSize: boolean;
        };
    };
}

export interface AdminStatCard {
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: string;
    color: string;
    chartData?: number[];
}

export interface PromptVersion {
    version: number;
    updatedAt: string;
    template: string;
    systemInstruction: string;
    changeLog: string;
}

export interface PromptTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    systemInstruction: string;
    template: string;
    variables: string[];
    tags: string[];
    updatedAt: string;
    version: number;
    history: PromptVersion[];
    modelConfig: {
        temperature: number;
        modelName: string;
        thinkingBudget: number;
    };
}

export interface PromptSnippet {
    id: string;
    label: string;
    value: string;
}

export interface StaticContentItem {
    id: string;
    title: string;
    type: 'list' | 'json';
    data: any;
    updatedAt: string;
}

export interface UserFilter {
    search: string;
    role: 'all' | UserRole;
    status: 'all' | UserStatus;
    sortBy: 'newest' | 'oldest' | 'name' | 'activity';
}

export interface ActivityDraft {
    id: string;
    title: string;
    description: string;
    baseType: string;
    createdBy: string;
    createdAt: string;
    customInstructions: string;
}
