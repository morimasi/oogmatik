'use client';
import React, { useState } from 'react';
import { InlineTextEditor } from '../../../../modules/turkce-super-studyo/components/organisms/spelling/InlineTextEditor';
import { SpellCheck, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { generateCreativeMultimodal } from '../../../../../services/geminiClient';
import { motion, AnimatePresence } from 'framer-motion';

interface SpellingExercise {
    initialText: string;
    correctedText: string;
}

const FALLBACK_EXERCISES: SpellingExercise[] = [
    {
        initialText: 'Bugun hava cok guzel degilmi? Annem ile bırlıkte pazara gıttık. Oradan Elma, armut ve kıraz aldık.',
        correctedText: 'Bugün hava çok güzel değil mi? Annem ile birlikte pazara gittik. Oradan elma, armut ve kiraz aldık.',
    },
    {
        initialText: 'cocuklar okula gıttıler. ogretmen tahtaya yazı yazdı. hepsı dıkkatli dınledı.',
        correctedText: 'Çocuklar okula gittiler. Öğretmen tahtaya yazı yazdı. Hepsi dikkatli dinledi.',
    },
];

async function generateSpellingExercise(gradeLevel: number): Promise<SpellingExercise> {
    const prompt = `
Sen, Türkçe yazım ve noktalama öğreten bir öğretmensin.
${gradeLevel}. sınıf seviyesinde bir disleksili öğrencinin çalışması için:
1. Kasıtlı yazım, büyük harf ve noktalama hataları içeren 2-3 kısa cümle üret
2. Aynı cümlelerin doğru versiyonunu üret

JSON formatında dön:
{
  "initialText": "hatalı metin buraya...",
  "correctedText": "doğru metin buraya..."
}

Kurallar:
- Türkçe karakterleri (ğ, ü, ş, ı, ö, ç) bazı yerlerde atlat
- Büyük harf kullanılması gereken yerlere küçük harf koy
- Gereksiz büyük harf kullan
- Noktalama işaretlerini yanlış kullan veya eksik bırak
- Cümleler kısa ve çocuk seviyesinde olsun
`;
    const result = await generateCreativeMultimodal({ prompt, temperature: 0.7 });
    if (result?.initialText && result?.correctedText) return result as SpellingExercise;
    throw new Error('Invalid AI response');
}

export default function YazimNoktalamaPage() {
    const [exercise, setExercise] = useState<SpellingExercise>(FALLBACK_EXERCISES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [gradeLevel, setGradeLevel] = useState<1 | 2 | 3 | 4>(2);
    const [completedCount, setCompletedCount] = useState(0);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newExercise = await generateSpellingExercise(gradeLevel);
            setExercise(newExercise);
        } catch {
            // Rotate through fallbacks
            setExercise(FALLBACK_EXERCISES[completedCount % FALLBACK_EXERCISES.length]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = () => {
        setCompletedCount((c) => c + 1);
    };

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
                        Hatalı metni düzelt, doğru yazımı öğren.
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

                    {/* Tamamlanan */}
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
                    key={`${exercise.initialText.slice(0, 20)}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-amber-50 min-h-[300px]"
                >
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center h-48 text-amber-500 gap-4">
                            <Loader2 size={40} className="animate-spin" />
                            <p className="text-lg font-bold">Gemini AI yeni alıştırma oluşturuyor...</p>
                        </div>
                    ) : (
                        <InlineTextEditor
                            initialText={exercise.initialText}
                            correctedText={exercise.correctedText}
                            onComplete={handleComplete}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
