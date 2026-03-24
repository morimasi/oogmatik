export type GenerationMode = 'fast' | 'ai';
export type SuperStudioDifficulty = 'Kolay' | 'Orta' | 'Zor';

export interface TemplateDefinition {
    id: string;
    title: string;
    description: string;
    category: string;
}

export interface GeneratedContentPayload {
    id: string;
    templateId: string;
    pages: any[]; // A4 sayfa datalarını tutacak
    createdAt: number;
    fromCache?: boolean; // Cache'ten geldi mi?
}
