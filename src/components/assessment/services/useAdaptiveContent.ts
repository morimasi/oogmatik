import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    calculateDomainAdaptiveParameters,
    type CognitiveProfileMetrics,
    type DomainAdaptiveParameters,
} from './cognitiveAdaptiveService';
import { createRng, type Rng } from './adaptiveTestContent';
import { generateAIAssessmentContent, type AIGeneratedTestItems } from '../../../services/aiAssessmentGenerator';

export interface AdaptiveContentMeta {
    source: 'ai' | 'local';
    difficultyLabel: string;
    guidance: string;
    supportNote: string;
}

export interface UseAdaptiveContentOptions<T> {
    domain: string;
    profile: CognitiveProfileMetrics;
    /** AI üretimi başarısız/uygunsuz olduğunda kullanılacak, seed'e bağlı yerel üretici. */
    buildLocal: (params: DomainAdaptiveParameters, rng: Rng) => T;
    /** AI çıktısını testin beklediği içerik tipine dönüştürür. null dönerse yerel içerik korunur. */
    mapAi?: (ai: AIGeneratedTestItems, params: DomainAdaptiveParameters, current: T) => T | null;
    /** true ise bileşen mount olduğunda AI üretimi otomatik başlar. */
    autoLoad?: boolean;
}

export interface AdaptiveContentResult<T> {
    items: T;
    params: DomainAdaptiveParameters;
    meta: AdaptiveContentMeta;
    loading: boolean;
    regenerate: () => Promise<void>;
}

/**
 * Her bilişsel test için tek merkezi, "ultra modüler" içerik katmanı.
 *
 * 1. Derhal, profile göre ölçeklenmiş ve seed'e bağlı BENZERSİZ yerel içerik üretir.
 * 2. Arka planda AI içeriği dener; başarılıysa yerel içeriği onunla değiştirir.
 * 3. AI çökse/boş dönse bile test asla "hep aynı sorularla" çalışmaz.
 */
export function useAdaptiveContent<T>(options: UseAdaptiveContentOptions<T>): AdaptiveContentResult<T> {
    const { domain, profile, buildLocal, mapAi, autoLoad = false } = options;

    const mountNonce = useRef<string>(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
    const [attempt, setAttempt] = useState(0);

    const params = useMemo(
        () => calculateDomainAdaptiveParameters(domain, profile),
        [domain, profile.studentName, profile.age, profile.grade, (profile.diagnosis || []).join('|'), (profile.weaknesses || []).join('|')]
    );

    const buildLocalRef = useRef(buildLocal);
    buildLocalRef.current = buildLocal;
    const mapAiRef = useRef(mapAi);
    mapAiRef.current = mapAi;

    const buildItems = useCallback(
        (currentAttempt: number): T => {
            const seed = `${mountNonce.current}|${domain}|${profile.studentName}|${profile.age}|${currentAttempt}`;
            return buildLocalRef.current(params, createRng(seed));
        },
        [domain, params, profile.studentName, profile.age]
    );

    const [items, setItems] = useState<T>(() => buildItems(0));
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState<AdaptiveContentMeta>(() => ({
        source: 'local',
        difficultyLabel: params.guidanceText,
        guidance: params.supportNote,
        supportNote: params.supportNote,
    }));

    // Profil/domain değiştiğinde içeriği yeniden üret.
    useEffect(() => {
        setItems(buildItems(attempt));
        setMeta({
            source: 'local',
            difficultyLabel: params.guidanceText,
            guidance: params.supportNote,
            supportNote: params.supportNote,
        });
    }, [buildItems, params.guidanceText, params.supportNote]);

    const regenerate = useCallback(async () => {
        const nextAttempt = attempt + 1;
        setAttempt(nextAttempt);

        // Önce anında benzersiz yerel içerik ile devam edilebilir olsun
        const localItems = buildItems(nextAttempt);
        setItems(localItems);
        setMeta({
            source: 'local',
            difficultyLabel: params.guidanceText,
            guidance: params.supportNote,
            supportNote: params.supportNote,
        });

        if (!mapAiRef.current) return;

        setLoading(true);
        try {
            const ai = await generateAIAssessmentContent(domain, profile, params);
            if (ai && Array.isArray(ai.items) && ai.items.length > 0) {
                const mapped = mapAiRef.current(ai, params, localItems);
                if (mapped) {
                    setItems(mapped);
                    setMeta({
                        source: 'ai',
                        difficultyLabel: ai.adaptiveDifficultyLabel || params.guidanceText,
                        guidance: ai.pedagogicalGuidance || params.supportNote,
                        supportNote: params.supportNote,
                    });
                }
            }
        } catch {
            // Sessizce yerel içerikte kal — bu katmanın tüm amacı bu.
        } finally {
            setLoading(false);
        }
    }, [attempt, buildItems, domain, params, profile]);

    const autoLoadedRef = useRef(false);
    useEffect(() => {
        if (!autoLoad || autoLoadedRef.current) return;
        autoLoadedRef.current = true;
        void regenerate();
    }, [autoLoad]);

    return { items, params, meta, loading, regenerate };
}
