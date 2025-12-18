
import { ActivityType } from './core';
import { UserRole, UserStatus } from './core';

export interface DynamicActivity {
    id: string; // matches ActivityType
    title: string;
    description: string;
    icon: string;
    category: string;
    isActive: boolean;
    isPremium: boolean;
    promptId?: string; // Linked prompt template ID
    defaultParams?: Record<string, any>; // Default values for prompt variables
    order?: number; // Sorting order
}

export interface ActivityDraft {
    id: string;
    title: string;
    description: string;
    baseType: string; // The underlying ActivityType (e.g. BASIC_OPERATIONS)
    customInstructions: string; // The OCR derived instructions
    defaultParams: {
        topic: string;
        difficulty: string;
        itemCount: number;
    };
    createdAt: string;
    createdBy: string;
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
    id: string; // e.g. 'math_base', 'story_structure'
    name: string;
    description: string;
    category: string; // 'math', 'verbal', 'logic', 'system'
    systemInstruction: string; // The "Persona" of the AI
    template: string; // The user prompt template
    variables: string[]; // e.g. ['difficulty', 'topic']
    tags: string[]; // e.g. ['math', 'logic']
    updatedAt: string;
    version: number;
    history?: PromptVersion[]; // Version history
    modelConfig?: {
        temperature?: number;
        topP?: number;
        modelName?: string;
    };
}

export interface PromptSnippet {
    id: string;
    label: string;
    value: string;
    category?: string;
    updatedAt?: string;
}

export interface StaticContentItem {
    id: string; // e.g., 'proverbs_tr', 'word_list_animals'
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
    chartData?: number[]; // Mini sparkline data
}

export interface AnalyticsDataPoint {
    date: string;
    value: number;
    category?: string;
}

export interface UserFilter {
    search: string;
    role: UserRole | 'all';
    status: UserStatus | 'all';
    sortBy: 'newest' | 'oldest' | 'name' | 'activity';
}
