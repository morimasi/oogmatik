'use client';
import React, { useState } from 'react';
import { InlineTextEditor } from '../../../../modules/turkce-super-studyo/components/organisms/spelling/InlineTextEditor';
import { SpellCheck, Sparkles, RefreshCw } from 'lucide-react';

export default function YazimNoktalamaPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock veri
    const mockInitialText = "Bugun hava cok guzel degilmi? Annem ile bırlıkte pazara gıttık. Oradan Elma, armut ve kıraz aldık.";
    const mockCorrectedText = "Bugün hava çok güzel değil mi? Annem ile birlikte pazara gittik. Oradan elma, armut ve kiraz aldık.";

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <SpellCheck className="text-amber-500" />
                        Yazım & Noktalama Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Hatalı metni düzeltme ve noktalama yerleştirme çalışmaları.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => setIsGenerating(false), 1500);
                    }}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-amber-600 transition-all shadow-md disabled:opacity-50"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    Yeni Hatalı Metin Üret
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-amber-50 min-h-[400px]">
                <InlineTextEditor
                    initialText={mockInitialText}
                    correctedText={mockCorrectedText}
                    onComplete={() => console.log('Spelling exercise completed!')}
                />
            </div>
        </div>
    );
}
