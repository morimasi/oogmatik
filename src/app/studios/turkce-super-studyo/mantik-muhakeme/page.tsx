'use client';
import React, { useState } from 'react';
import { LogicAbsurdity } from '../../../../modules/turkce-super-studyo/components/organisms/logic/LogicAbsurdity';
import { Puzzle, Sparkles, RefreshCw } from 'lucide-react';

export default function MantikMuhakemePage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const mockItems = [
        {
            id: 'l1',
            description: 'Güneş gece yarısı parlıyor ve kuşlar uyumak yerine şarkı söylüyor.',
            isAbsurd: true,
            explanation: 'Güneş gündüz parlar, kuşlar gece uyur. Bu bir zaman çelişkisidir.',
            imageUrl: ''
        },
        {
            id: 'l2',
            description: 'Kışın kar yağdığında çocuklar kalın paltolarını giyip dışarı çıkarlar.',
            isAbsurd: false,
            explanation: 'Bu mantıklı bir durumdur; soğuktan korunmak için kalın giyilir.',
            imageUrl: ''
        },
        {
            id: 'l3',
            description: 'Balıklar denizin üzerinde kanatlarıyla uçarak bulutlara dokunuyorlar.',
            isAbsurd: true,
            explanation: 'Balıkların kanatları yoktur ve denizin içinde yüzerler, havada uçmazlar.',
            imageUrl: ''
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Puzzle className="text-rose-500" />
                        Mantık & Muhakeme Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Neden-sonuç ilişkileri ve görsel mantık bulmacaları.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => setIsGenerating(false), 1500);
                    }}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-600 transition-all shadow-md disabled:opacity-50"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    Yeni Mantık Soruları Üret
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-rose-50 overflow-hidden">
                <LogicAbsurdity
                    title="Mantıksızlık Bulma Egzersizi"
                    instruction="Aşağıdaki durumları dikkatlice incele ve sence mantıklı mı yoksa mantıksız mı olduğuna karar ver."
                    items={mockItems}
                    onComplete={(score) => console.log('Final Score:', score)}
                />
            </div>
        </div>
    );
}
