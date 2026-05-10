import { ActivityBlueprint, AgentApproval } from './types';
import { ActivityValidator, ValidationResult } from './ActivityValidator';

/**
 * AgentOrchestrator: 4 Lider Ajan Denetim Pipeline
 * 
 * Blueprint'i sırayla 4 uzman ajana denetletir:
 * 1. Elif Yıldız → Pedagoji / ZPD
 * 2. Dr. Ahmet Kaya → Klinik / MEB / KVKK
 * 3. Bora Demir → Mühendislik / TypeScript
 * 4. Selin Arslan → AI Mimarisi / Prompt Kalitesi
 * 
 * Her ajan onay veya ret kararı verir.
 * Tüm onaylar geçmeden Engine.process() çalıştırılmaz.
 */
export class AgentOrchestrator {
    private validator: ActivityValidator;

    constructor() {
        this.validator = new ActivityValidator();
    }

    /**
     * Blueprint'i 4 ajan pipeline'ından geçirir.
     * Tüm onaylar geçerse { allApproved: true } döner.
     */
    async evaluate(blueprint: ActivityBlueprint): Promise<OrchestrationResult> {
        const approvals: NonNullable<ActivityBlueprint['approvals']> = {};
        const agentNotes: AgentNote[] = [];

        // ─── Faz 0: Temel Yapısal Doğrulama ───
        const structuralResult = this.validator.validateBlueprint(blueprint);
        if (!structuralResult.valid) {
            return {
                allApproved: false,
                approvals,
                agentNotes: [{
                    agent: 'system',
                    category: 'structural',
                    severity: 'error',
                    message: `Yapısal doğrulama başarısız: ${structuralResult.errors.map(e => e.message).join('; ')}`,
                }],
                structuralValidation: structuralResult,
            };
        }

        // ─── [1] Elif Yıldız — Pedagoji / ZPD ───
        const pedagogical = this.evaluatePedagogy(blueprint);
        approvals.pedagogical = pedagogical;
        if (!pedagogical.approved) {
            agentNotes.push({ agent: 'elif', category: 'pedagogical', severity: 'error', message: pedagogical.notes });
        }

        // ─── [2] Dr. Ahmet Kaya — Klinik / MEB / KVKK ───
        const clinical = this.evaluateClinical(blueprint);
        approvals.clinical = clinical;
        if (!clinical.approved) {
            agentNotes.push({ agent: 'ahmet', category: 'clinical', severity: 'error', message: clinical.notes });
        }

        // ─── [3] Bora Demir — Mühendislik ───
        const engineering = this.evaluateEngineering(blueprint);
        approvals.engineering = engineering;
        if (!engineering.approved) {
            agentNotes.push({ agent: 'bora', category: 'engineering', severity: 'error', message: engineering.notes });
        }

        // ─── [4] Selin Arslan — AI Mimarisi ───
        const aiQuality = this.evaluateAIQuality(blueprint);
        approvals.aiQuality = aiQuality;
        if (!aiQuality.approved) {
            agentNotes.push({ agent: 'selin', category: 'ai', severity: 'error', message: aiQuality.notes });
        }

        const allApproved = Object.values(approvals).every(a => a?.approved);

        return {
            allApproved,
            approvals,
            agentNotes,
            structuralValidation: structuralResult,
        };
    }

    // ────────────────────── AJAN DEĞERLENDİRMELERİ ──────────────────────

    private evaluatePedagogy(bp: ActivityBlueprint): AgentApproval {
        const issues: string[] = [];

        // ZPD uyumluluğu: yaş grupları var mı?
        if (!bp.pedagogical?.ageGroups?.length) {
            issues.push('Yaş grubu belirtilmemiş — ZPD uyumluluğu doğrulanamaz');
        }

        // Hedef beceriler
        if (!bp.pedagogical?.targetSkills?.length) {
            issues.push('Hedef beceri tanımlanmamış — pedagojik değer taşımıyor');
        }

        // Zorluk kademesi
        if (!bp.ui?.columnsPerDifficulty || Object.keys(bp.ui.columnsPerDifficulty).length < 3) {
            issues.push('3 zorluk seviyesi (Kolay/Orta/Zor) tanımlanmalı');
        }

        // Başarı anı tasarımı
        if (!bp.logic?.aiPrompt?.rules?.some(r =>
            r.toLowerCase().includes('başarı') ||
            r.toLowerCase().includes('motivasyon') ||
            r.toLowerCase().includes('teşvik')
        )) {
            issues.push('AI kurallarında başarı/motivasyon anı tasarımı eksik');
        }

        return {
            approved: issues.length === 0,
            notes: issues.length ? issues.join('; ') : 'Pedagojik onay verildi ✅',
            agent: 'elif',
            timestamp: new Date().toISOString(),
        };
    }

    private evaluateClinical(bp: ActivityBlueprint): AgentApproval {
        const issues: string[] = [];

        // Tanı koyucu dil kontrolü
        const forbiddenPatterns = [
            /disleksisi var/gi, /dislektik/gi, /DEHB'li/gi,
            /engelli/gi, /geri zekalı/gi, /başarısız/gi,
        ];

        const allText = [
            bp.identity.title, bp.identity.description,
            bp.logic?.aiPrompt?.task,
            ...(bp.logic?.aiPrompt?.rules || []),
        ].filter(Boolean).join(' ');

        for (const pattern of forbiddenPatterns) {
            if (pattern.test(allText)) {
                issues.push(`Tanı koyucu dil tespit edildi: ${pattern.source}`);
            }
        }

        // KVKK: veri modeli hassas alan kontrolü
        const sensitiveFields = ['tcNo', 'diagnosis', 'fullName', 'parentPhone', 'address'];
        bp.dataModel?.fields?.forEach(f => {
            if (sensitiveFields.includes(f.name)) {
                issues.push(`KVKK riski: '${f.name}' alanı hassas veri içerebilir`);
            }
        });

        return {
            approved: issues.length === 0,
            notes: issues.length ? issues.join('; ') : 'Klinik onay verildi ✅',
            agent: 'ahmet',
            timestamp: new Date().toISOString(),
        };
    }

    private evaluateEngineering(bp: ActivityBlueprint): AgentApproval {
        const issues: string[] = [];

        // Interface adı PascalCase mi?
        if (bp.dataModel?.interfaceName && !/^[A-Z][a-zA-Z0-9]+$/.test(bp.dataModel.interfaceName)) {
            issues.push('Interface adı PascalCase formatında olmalı');
        }

        // Enum key UPPER_SNAKE_CASE mi?
        if (bp.identity?.key && !/^[A-Z][A-Z0-9_]+$/.test(bp.identity.key)) {
            issues.push('Enum key UPPER_SNAKE_CASE formatında olmalı');
        }

        // Config alanlarında defaultValue var mı?
        bp.ui?.configFields?.forEach((cf, i) => {
            if (cf.defaultValue === undefined || cf.defaultValue === null) {
                issues.push(`configFields[${i}].defaultValue eksik`);
            }
        });

        // Data model alanlarında tip geçerli mi?
        const validTypes = ['string', 'number', 'boolean', 'string[]', 'number[]', 'object', 'any'];
        bp.dataModel?.fields?.forEach(f => {
            if (!validTypes.some(t => f.type.includes(t))) {
                issues.push(`'${f.name}' alanının tipi geçersiz: ${f.type}`);
            }
        });

        return {
            approved: issues.length === 0,
            notes: issues.length ? issues.join('; ') : 'Mühendislik onayı verildi ✅',
            agent: 'bora',
            timestamp: new Date().toISOString(),
        };
    }

    private evaluateAIQuality(bp: ActivityBlueprint): AgentApproval {
        const issues: string[] = [];

        // Prompt görev tanımı yeterli mi? (min 20 karakter)
        if ((bp.logic?.aiPrompt?.task?.length ?? 0) < 20) {
            issues.push('AI görev tanımı çok kısa — kaliteli çıktı üretilemez (min 20 karakter)');
        }

        // Kural sayısı
        if ((bp.logic?.aiPrompt?.rules?.length ?? 0) < 2) {
            issues.push('En az 2 AI kuralı olmalı — halüsinasyon riski yüksek');
        }

        // JSON schema tanımlı mı?
        if (!bp.logic?.aiPrompt?.schema || Object.keys(bp.logic.aiPrompt.schema).length === 0) {
            issues.push('JSON çıktı şeması eksik — yapılandırılmış çıktı garanti edilemez');
        }

        // Hallucination risk: prompt'ta "doğru" ve "gerçek" kelimeleri var mı?
        const task = bp.logic?.aiPrompt?.task ?? '';
        if (!task.includes('doğru') && !task.includes('gerçek') && !task.includes('somut')) {
            issues.push('Prompt doğruluk/somutluk vurgusu eksik — halüsinasyon riski');
        }

        // Token maliyet tahmini
        const estimatedTokens = (task.length + (bp.logic?.aiPrompt?.rules?.join('').length ?? 0)) * 2;
        if (estimatedTokens > 2000) {
            issues.push(`Yüksek token maliyeti tahmini: ~${estimatedTokens} token`);
        }

        return {
            approved: issues.length === 0,
            notes: issues.length ? issues.join('; ') : 'AI kalite onayı verildi ✅',
            agent: 'selin',
            timestamp: new Date().toISOString(),
        };
    }
}

// ────────────────────── TİP TANIMLARI ──────────────────────

export interface OrchestrationResult {
    allApproved: boolean;
    approvals: NonNullable<ActivityBlueprint['approvals']>;
    agentNotes: AgentNote[];
    structuralValidation: ValidationResult;
}

export interface AgentNote {
    agent: 'elif' | 'ahmet' | 'bora' | 'selin' | 'system';
    category: 'pedagogical' | 'clinical' | 'engineering' | 'ai' | 'structural';
    severity: 'info' | 'warn' | 'error';
    message: string;
}
