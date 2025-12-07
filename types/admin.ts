
import { ActivityType } from './core';

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
}

export interface PromptVersion {
    version: number;
    template: string;
    systemInstruction?: string;
    updatedAt: string;
    changeLog?: string;
}

export interface PromptTemplate {
    id: string; // e.g. 'math_base', 'story_structure'
    name: string;
    description: string;
    systemInstruction: string; // The "Persona" of the AI
    template: string; // The user prompt template
    variables: string[]; // e.g. ['difficulty', 'topic']
    tags: string[]; // e.g. ['math', 'logic']
    updatedAt: string;
    version: number;
    history?: PromptVersion[]; // Version history
}

export interface AdminStatCard {
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: string;
    color: string;
}
