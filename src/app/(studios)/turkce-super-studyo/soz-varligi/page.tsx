'use client';
import React, { useState } from 'react';
import { FlipCardGame } from '../../../../modules/turkce-super-studyo/components/organisms/vocabulary/FlipCardGame';
import { Library, Sparkles, RefreshCw } from 'lucide-react';

export default function SozVarligiPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock veri
    const mockCards = [
        { id: 'v1', front: 'Eş Anlamlısı: Yanıt', back: 'Cevap' },
        { id: 'v2', front: 'Zıt Anlamlısı: Siyah', back: 'Beyaz' },
        { id: 'v3', front: 'Eş Anlamlısı: Mektep', back: 'Okul' },
        { id: 'v4', front: 'Zıt Anlamlısı: Çalışkan', back: 'Tembel' },
        { id: 'v5', front: 'Eş Anlamlısı: Hediye', back: 'Armağan' },
        { id: 'v6', front: 'Zıt Anlamlısı: Küçük', back: 'Büyük' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Library className="text-emerald-500" />
                        Söz Varlığı & Kelime Fabrikası
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Eş/Zıt anlam, deyimler ve kelime oyunları ile kelime hazinesini geliştirme.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => setIsGenerating(false), 1500);
                    }}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    Yeni Kelime Kartları Üret
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-emerald-50 min-h-[500px]">
                <FlipCardGame
                    cards={mockCards}
                    onComplete={(score) => console.log('Vocabulary game completed! Score:', score)}
                />
            </div>
        </div>
    );
}
