
import { ActivityType } from './core';

export interface DynamicActivity {
    id: string; // matches ActivityType
    title: string;
    description: string;
    icon: string;
    category: string;
    isActive: boolean;
    isPremium: boolean;
    promptId?: string;
}

export interface PromptTemplate {
    id: string; // e.g. 'math_base', 'story_structure'
    name: string;
    description: string;
    template: string;
    variables: string[]; // e.g. ['difficulty', 'topic']
    tags: string[]; // e.g. ['math', 'logic']
    updatedAt: string;
    version: number;
}

export interface AdminStatCard {
    label: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: string;
    color: string;
}
