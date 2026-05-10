import { ActivityBlueprint, DataField } from './types';

/**
 * ActivityValidator: Blueprint ve üretilen dosyaların doğrulanması.
 * 
 * 3 katmanlı doğrulama:
 * 1. Blueprint yapısı (Zod-benzeri kontroller)
 * 2. Pedagojik gereksinimler
 * 3. Üretilen dosyaların bütünlüğü
 */
export class ActivityValidator {
    private errors: ValidationError[] = [];
    private warnings: ValidationWarning[] = [];

    getErrors(): ValidationError[] { return [...this.errors]; }
    getWarnings(): ValidationWarning[] { return [...this.warnings]; }

    /**
     * Blueprint'i doğrular. false dönerse üretim başlamamalı.
     */
    validateBlueprint(bp: ActivityBlueprint): ValidationResult {
        this.errors = [];
        this.warnings = [];

        // ─── Identity ───
        if (!bp.identity?.key || bp.identity.key.trim() === '') {
            this.errors.push({ field: 'identity.key', message: 'Enum key zorunludur', code: 'REQUIRED' });
        } else {
            if (!/^[A-Z][A-Z0-9_]*$/.test(bp.identity.key)) {
                this.errors.push({ field: 'identity.key', message: 'Key UPPER_SNAKE_CASE formatında olmalı (örn: LETTER_MAZE)', code: 'FORMAT' });
            }
        }

        if (!bp.identity?.title?.trim()) {
            this.errors.push({ field: 'identity.title', message: 'Başlık zorunludur', code: 'REQUIRED' });
        }

        if (!bp.identity?.description?.trim()) {
            this.warnings.push({ field: 'identity.description', message: 'Açıklama önerilir' });
        }

        if (!bp.identity?.icon?.startsWith('fa-')) {
            this.warnings.push({ field: 'identity.icon', message: 'İkon FontAwesome formatında olmalı (fa-xxx)' });
        }

        const validCategories = ['reading-verbal', 'math-logic', 'visual-perception', 'memory-attention', 'creative-writing', 'assessment', 'story-verbal'];
        if (!validCategories.includes(bp.identity?.categoryId)) {
            this.warnings.push({ field: 'identity.categoryId', message: `Kategori geçersiz. Geçerli: ${validCategories.join(', ')}` });
        }

        // ─── Data Model ───
        if (!bp.dataModel?.interfaceName?.trim()) {
            this.errors.push({ field: 'dataModel.interfaceName', message: 'Interface adı zorunludur', code: 'REQUIRED' });
        } else if (!/^[A-Z][a-zA-Z0-9]*$/.test(bp.dataModel.interfaceName)) {
            this.errors.push({ field: 'dataModel.interfaceName', message: 'Interface PascalCase formatında olmalı', code: 'FORMAT' });
        }

        if (!bp.dataModel?.fields?.length) {
            this.warnings.push({ field: 'dataModel.fields', message: 'En az bir veri alanı önerilir' });
        }

        bp.dataModel?.fields?.forEach((f: DataField, i: number) => {
            if (!f.name?.trim()) {
                this.errors.push({ field: `dataModel.fields[${i}].name`, message: 'Alan adı zorunludur', code: 'REQUIRED' });
            }
            if (!f.type?.trim()) {
                this.errors.push({ field: `dataModel.fields[${i}].type`, message: 'Alan tipi zorunludur', code: 'REQUIRED' });
            }
        });

        // ─── Logic ───
        if (!bp.logic?.aiPrompt?.task?.trim()) {
            this.errors.push({ field: 'logic.aiPrompt.task', message: 'AI görev tanımı zorunludur', code: 'REQUIRED' });
        }

        if (!bp.logic?.aiPrompt?.role?.trim()) {
            this.warnings.push({ field: 'logic.aiPrompt.role', message: 'AI rolü önerilir (varsayılan: "Uzman Eğitimci")' });
        }

        if (!bp.logic?.aiPrompt?.rules?.length) {
            this.warnings.push({ field: 'logic.aiPrompt.rules', message: 'En az bir kural önerilir' });
        }

        // ─── Pedagogical ───
        if (!bp.pedagogical?.targetSkills?.length) {
            this.errors.push({ field: 'pedagogical.targetSkills', message: 'Hedef beceriler zorunludur (pedagogik gereksinim)', code: 'PEDAGOGICAL' });
        }

        if (!bp.pedagogical?.ageGroups?.length) {
            this.warnings.push({ field: 'pedagogical.ageGroups', message: 'Yaş grupları önerilir' });
        }

        // ─── Klinik Dil Kontrolü ───
        this.checkClinicalLanguage(bp);

        return {
            valid: this.errors.length === 0,
            errors: this.getErrors(),
            warnings: this.getWarnings(),
        };
    }

    /**
     * Tanı koyucu dil kontrolü — Dr. Ahmet denetimi
     */
    private checkClinicalLanguage(bp: ActivityBlueprint): void {
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
                    this.errors.push({
                        field: 'clinical',
                        message: `Tanı koyucu dil tespit edildi: "${text}" — "desteğe ihtiyacı var" formatı kullanılmalı`,
                        code: 'CLINICAL_LANGUAGE',
                    });
                }
            }
        }
    }

    /**
     * Üretilen dosyaların pedagojik gereksinimlerini kontrol eder — Elif denetimi
     */
    checkPedagogicalRequirements(generatedContent: string): PedagogicalCheckResult {
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

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: 'REQUIRED' | 'FORMAT' | 'PEDAGOGICAL' | 'CLINICAL_LANGUAGE';
}

export interface ValidationWarning {
    field: string;
    message: string;
}

export interface PedagogicalCheckResult {
    valid: boolean;
    checks: Record<string, boolean>;
    issues: string[];
}
