
import { ActivityType } from './core';
import { UserRole, UserStatus } from './core';

export interface DynamicActivity {
    id: string; 
    title: string;
    description: string;
    icon: string;
    category: string;
    isActive: boolean;
    isPremium: boolean;
    promptId?: string; 
    defaultParams?: Record<string, any>; 
    order: number; // Menüdeki sıralama ağırlığı
    themeColor?: string; // Aktiviteye özel marka rengi (Hex)
    targetSkills: string[]; // Hedeflenen bilişsel beceriler
    updatedAt: string;
}

export interface PromptVersion {
    version: number;
    template: string;
    systemInstruction?: string;
    updatedAt: string;
    changeLog?: string;
    author?: string;
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
    history?: PromptVersion[]; 
    modelConfig?: {
        temperature?: number;
        topP?: number;
        modelName?: string;
        thinkingBudget?: number; 
    };
}

export interface PromptSnippet {
    id: string;
    label: string;
    value: string;
    category?: string;
    updatedAt?: string;
}

export interface ActivityDraft {
    id: string;
    title: string;
    description: string;
    baseType: string;
    customInstructions: string;
    defaultParams: {
        topic: string;
        difficulty: string;
        itemCount: number;
    };
    createdAt: string;
    createdBy: string;
}

export interface StaticContentItem {
    id: string;
    title: string;
    type: 'list' | 'json';
    data: string[] | any;
    updatedAt: string;
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

export interface UserFilter {
    search: string;
    role: UserRole | 'all';
    status: UserStatus | 'all';
    sortBy: 'newest' | 'oldest' | 'name' | 'activity';
}
