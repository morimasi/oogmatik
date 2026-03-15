'use client';
import React, { useState, useCallback } from 'react';
import { InlineTextEditor } from '../../../../modules/turkce-super-studyo/components/organisms/spelling/InlineTextEditor';
import { SpellCheck, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { generateCreativeMultimodal } from '../../../../../services/geminiClient';
import { motion, AnimatePresence } from 'framer-motion';

interface ErrorToken {
    id: string;
    originalText: string;
    correctText: string;
    isPunctuationError: boolean;
    type: 'spelling' | 'punctuation';
    indexInText: number;
}

interface SpellingExercise {
    instruction: string;
    textParts: string[];
    errors: ErrorToken[];
}

// Fallback exercises using the real InlineTextEditor API
const FALLBACK_EXERCISES: SpellingExercise[] = [
    {
        instruction: 'Aşağıdaki cümlelerdeki yazım ve büyük harf hatalarını düzeltin.',
        textParts: [
            'Bugun ',     // 0 — normal
            'hava',       // 1 — error (Bugün)
            ' cok ',      // 2 — normal
            'guzel',      // 3 — error (güzel)
            ' degilmi? Annem ile birlıkte pazara gittik.',  // 4 — normal
        ],
        errors: [
            { id: 'e1', originalText: 'Bugun', correctText: 'Bugün', isPunctuationError: false, type: 'spelling', indexInText: 0 },
            { id: 'e2', originalText: 'guzel', correctText: 'güzel', isPunctuationError: false, type: 'spelling', indexInText: 3 },
        ],
    },
    {
        instruction: 'Büyük harf ve noktalama hatalarını bulup düzeltin.',
        textParts: [
            'cocuklar ',  // 0 — error (Çocuklar)
            'okula gittiler. Öğretmen tahtaya yazı yazdı. hepsı ',  // 1 — normal
            'dıkkatli',  // 2 — error (dikkatli)
            ' dinledi.',  // 3 — normal
        ],
        errors: [
            { id: 'f1', originalText: 'cocuklar', correctText: 'Çocuklar', isPunctuationError: false, type: 'spelling', indexInText: 0 },
            { id: 'f2', originalText: 'dıkkatli', correctText: 'dikkatli', isPunctuationError: false, type: 'spelling', indexInText: 2 },
        ],
    },
];

/**
 * Parse AI output into InlineTextEditor's format.
 * AI returns a sentence with errors; we split it into textParts + errors.
 */
function parseAIExercise(raw: any): SpellingExercise {
    if (
        raw?.instruction &&
        Array.isArray(raw.textParts) &&
        Array.isArray(raw.errors)
    ) {
        return raw as SpellingExercise;
    }
    throw new Error('Invalid AI format');
}

async function generateExercise(gradeLevel: number): Promise<SpellingExercise> {
    const prompt = `Sen bir Türkçe öğretmenisin. ${gradeLevel}. sınıf seviyesi için yazım/noktalama egzersizi oluştur.

JSON formatında döndür:
{
  "instruction": "Aşağıdaki cümlelerdeki yazım ve noktalama hatalarını düzeltin.",
  "textParts": ["Normal metin ", "HATALI_KELİME", " devam ediyor ", "HATALI_KELİME2", " son kısım."],
  "errors": [
    { "id": "e1", "originalText": "HATALI_KELİME", "correctText": "doğru_kelime", "isPunctuationError": false, "type": "spelling", "indexInText": 1 },
    { "id": "e2", "originalText": "HATALI_KELİME2", "correctText": "doğru_kelime2", "isPunctuationError": false, "type": "spelling", "indexInText": 3 }
  ]
}

Kurallar:
- textParts dizisinde hatalı kelimeler tek eleman olarak ayrılmış olmalı
- errors.indexInText → textParts dizisindeki o hatanın index numarası
- Türkçe karakterler (ğ, ü, ş, ı, ö, ç) ile ilgili hatalar olsun
- Kısa cümleler, ${gradeLevel}. sınıf seviyesinde`;

    const result = await generateCreativeMultimodal({ prompt, temperature: 0.7 });
    return parseAIExercise(result);
}

export default function YazimNoktalamaPage() {
    const [exercise, setExercise] = useState<SpellingExercise>(FALLBACK_EXERCISES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
    const [completedCount, setCompletedCount] = useState(0);
    const [fallbackIdx, setFallbackIdx] = useState(0);

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        try {
            const newExercise = await generateExercise(gradeLevel);
            setExercise(newExercise);
        } catch {
            // Rotate through fallbacks
            const nextIdx = (fallbackIdx + 1) % FALLBACK_EXERCISES.length;
            setFallbackIdx(nextIdx);
            setExercise(FALLBACK_EXERCISES[nextIdx]);
        } finally {
            setIsGenerating(false);
        }
    }, [gradeLevel, fallbackIdx]);

    const handleComplete = useCallback((correctCount: number) => {
        setCompletedCount((c) => c + 1);
    }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <SpellCheck className="text-amber-500" />
                        Yazım & Noktalama Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Hatalı kelimelere tıkla, doğrusunu yaz, Kontrol Et butonuna bas.
                    </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* Sınıf seviyesi */}
                    <select
                        value={gradeLevel}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            setGradeLevel(Number(e.target.value) as 1 | 2 | 3 | 4)
                        }
                        className="bg-white border-2 border-amber-100 text-gray-800 text-sm rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-amber-400"
                    >
                        {[1, 2, 3, 4].map((g) => (
                            <option key={g} value={g}>
                                {g}. Sınıf
                            </option>
                        ))}
                    </select>

                    {/* Tamamlanan sayacı */}
                    {completedCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="px-3 py-2 bg-green-50 border-2 border-green-200 rounded-xl font-bold text-sm text-green-700 flex items-center gap-1.5"
                        >
                            ✅ {completedCount} alıştırma tamamlandı
                        </motion.div>
                    )}

                    <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-5 py-2 bg-amber-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-md disabled:opacity-50 text-sm"
                    >
                        {isGenerating ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        {isGenerating ? 'Üretiliyor...' : 'Yeni Alıştırma'}
                    </motion.button>
                </div>
            </div>

            {/* Alıştırma */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={exercise.instruction.slice(0, 30)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                >
                    {isGenerating ? (
                        <div className="bg-white rounded-[2.5rem] p-10 flex flex-col items-center justify-center min-h-[200px] border-2 border-amber-50 shadow-sm text-amber-500 gap-4">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="text-lg font-bold">Gemini AI yeni alıştırma oluşturuyor...</p>
                        </div>
                    ) : (
                        <InlineTextEditor
                            instruction={exercise.instruction}
                            textParts={exercise.textParts}
                            errors={exercise.errors}
                            onComplete={handleComplete}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
