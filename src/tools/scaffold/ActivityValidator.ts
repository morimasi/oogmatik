import { z } from 'zod';
import { ActivityBlueprint, DataField } from './types';
import { AppError } from '../../utils/AppError';

// Zod schemas for validation
const IdentitySchema = z.object({
    key: z.string().min(2).regex(/^[A-Z_]+$/, "Key sadece büyük harf ve alt çizgi içerebilir (örn: SYLLABLE_DETECTIVE)."),
    enumValue: z.string().min(1).regex(/^[a-zA-Z0-9_]+$/, "EnumValue sadece alfanumerik değer olmalıdır."),
    title: z.string().min(3, "Başlık en az 3 karakter olmalıdır"),
    description: z.string().min(10, "Açıklama en az 10 karakter olmalıdır"),
    icon: z.string().startsWith("fa-", "İkon FontAwesome formatında olmalı (fa-xxx)"),
    categoryId: z.string()
});

const DataFieldSchema = z.object({
    name: z.string().regex(/^[a-zA-Z0-9_]+$/, "Alan adı alfanumerik olmalı"),
    type: z.enum(['string', 'number', 'boolean', 'enum', 'array_string']),
    required: z.boolean().optional(),
    options: z.array(z.string()).optional()
});

const DataModelSchema = z.object({
    interfaceName: z.string().regex(/^[A-Z][a-zA-Z0-9]*$/, "Interface PascalCase formatında olmalı"),
    itemsName: z.string().optional(),
    fields: z.array(DataFieldSchema).min(1, "Data model en az bir alan içermelidir.")
});

const PedagogicalNoteSchema = z.object({
    targetSkills: z.array(z.string()).min(1, "En az bir hedef beceri belirtilmelidir."),
    ageGroups: z.array(z.string()).optional(),
    learningStyles: z.array(z.string()).optional(),
    defaultDifficulty: z.string().optional()
});

const LogicPromptSchema = z.object({
    task: z.string().min(10, "AI görev tanımı zorunludur"),
    role: z.string().optional(),
    rules: z.array(z.string()).optional()
});

const BlueprintSchema = z.object({
    identity: IdentitySchema,
    dataModel: DataModelSchema,
    logic: z.object({ aiPrompt: LogicPromptSchema }).optional(),
    pedagogical: PedagogicalNoteSchema.optional(),
    configFields: z.array(z.any()).optional(),
    approvals: z.any().optional()
});

/**
 * ActivityValidator: Gelen ActivityBlueprint'in pedagojik ve teknik doğruluğunu kontrol eder.
 * Ajan Orkestratörü ile birlikte kullanılacak çekirdek validasyon.
 * 
 * 3 katmanlı doğrulama:
 * 1. Blueprint yapısı (Zod)
 * 2. Pedagojik gereksinimler ve klinik dil (Elif & Dr. Ahmet)
 * 3. Üretilen dosyaların bütünlüğü
 */
export class ActivityValidator {

    /**
     * Zod kullanılarak Blueprint'i doğrular. Exception fırlatırsa süreç durur.
     */
    static validateBlueprint(blueprint: unknown): ActivityBlueprint {
        try {
            const parsed = BlueprintSchema.parse(blueprint);

            // Klinik dil denetimi çağrısı
            this.checkClinicalLanguage(parsed as ActivityBlueprint);

            return parsed as ActivityBlueprint;
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new AppError("Geçersiz Blueprint Formatı", "VALIDATION_ERROR", 400, error.errors);
            }
            throw error;
        }
    }

    /**
     * Tanı koyucu dil kontrolü — Dr. Ahmet denetimi
     */
    static checkClinicalLanguage(bp: ActivityBlueprint): void {
        const forbiddenPatterns = [
            /disleksisi var/gi,
            /dislektik/gi,
            /DEHB'li/gi,
            /engelli/gi,
            /geri zekalı/gi,
            /öğrenme güçlüğüne sahip/gi,
            /başarısız/gi,
        ];

        const textsToCheck = [
            bp.identity.title,
            bp.identity.description,
            bp.logic?.aiPrompt?.task,
            ...(bp.logic?.aiPrompt?.rules || []),
        ].filter(Boolean);

        for (const text of textsToCheck) {
            for (const pattern of forbiddenPatterns) {
                if (pattern.test(text as string)) {
                    throw new AppError(
                        `Tanı koyucu dil tespit edildi: "${text}" — "desteğe ihtiyacı var" formatı kullanılmalı`,
                        "CLINICAL_LANGUAGE_ERROR",
                        400
                    );
                }
            }
        }
    }

    static validateApprovals(blueprint: any): void {
        if (!blueprint.approvals) {
            throw new AppError("Ajan onayı eksik. Etkinlik güvenlik onayından geçmemiş.", "AGENT_APPROVAL_MISSING", 403);
        }
        const req = ['pedagogical', 'clinical', 'engineering', 'aiQuality'];
        for (const agent of req) {
            if (!blueprint.approvals[agent] || blueprint.approvals[agent].approved !== true) {
                throw new AppError(`Ajan onayı yetersiz veya reddedildi: ${agent}`, "AGENT_APPROVAL_MISSING", 403);
            }
        }
    }

    /**
     * Üretilen dosyaların pedagojik gereksinimlerini kontrol eder — Elif denetimi
     */
    static checkPedagogicalRequirements(generatedContent: string): PedagogicalCheckResult {
        const checks = {
            hasPedagogicalNote: generatedContent.includes('pedagogicalNote'),
            hasInstruction: generatedContent.includes('instruction'),
            hasDifficultyLevel: generatedContent.includes('difficulty') || generatedContent.includes('Difficulty'),
            usesLexendFont: !generatedContent.includes('font-family') || generatedContent.includes('Lexend'),
        };

        const issues: string[] = [];
        if (!checks.hasPedagogicalNote) issues.push('pedagogicalNote alanı eksik');
        if (!checks.hasInstruction) issues.push('instruction alanı eksik');
        if (!checks.hasDifficultyLevel) issues.push('Zorluk seviyesi referansı yok');
        if (!checks.usesLexendFont) issues.push('Lexend font yerine başka font kullanılmış');

        return { valid: issues.length === 0, checks, issues };
    }
}

// ────────────────────── TİP TANIMLARI ──────────────────────

export interface PedagogicalCheckResult {
    valid: boolean;
    checks: Record<string, boolean>;
    issues: string[];
}
