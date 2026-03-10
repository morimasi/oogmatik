
import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';

interface VisualInterpretationSheetProps {
    data: WorksheetData;
    settings: StyleSettings;
}

export const VisualInterpretationSheet: React.FC<VisualInterpretationSheetProps> = ({ data, settings }) => {
    // Veri yapısını kontrol et
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const activity = data[0]; // Tek sayfa varsayımı
    const blocks = activity.layoutArchitecture?.blocks || [];

    const imageBlock = blocks.find(b => b.type === 'image');
    const questionsBlock = blocks.find(b => b.type === 'questions');

    const imagePrompt = imageBlock?.content?.prompt;
    // Gerçek uygulamada burada imagePrompt'tan görsel üretilmiş olmalı veya base64 gelmeli
    // Şimdilik placeholder kullanacağız
    const imageUrl = imageBlock?.content?.url || `https://placehold.co/800x400/png?text=${encodeURIComponent(imagePrompt || 'Görsel Yükleniyor...')}`;

    const questions = questionsBlock?.content?.items || [];

    return (
        <div className="w-full h-full flex flex-col gap-8 p-8" style={{ fontFamily: settings.fontFamily }}>
            {/* Header / Title */}
            {settings.showTitle && (
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-black text-zinc-800 uppercase tracking-tight" style={{ color: settings.borderColor }}>
                        {activity.title}
                    </h1>
                    {settings.showInstruction && (
                        <p className="text-lg text-zinc-500 font-medium mt-2 italic">
                            {activity.instruction}
                        </p>
                    )}
                </div>
            )}

            {/* Visual Scene Area */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden border-4 border-zinc-100 shadow-2xl relative group">
                <img 
                    src={imageUrl} 
                    alt="Scene Analysis" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl pointer-events-none"></div>
            </div>

            {/* Questions Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                {questions.map((q: any, idx: number) => (
                    <div key={idx} className="bg-white/50 border border-zinc-200 rounded-2xl p-6 relative break-inside-avoid">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-indigo-500/30">
                            {idx + 1}
                        </div>
                        
                        <h3 className="text-lg font-bold text-zinc-800 mb-4 pl-4" style={{ lineHeight: settings.lineHeight }}>
                            {q.q}
                        </h3>

                        {q.type === 'multiple' && (
                            <div className="space-y-3 pl-4">
                                {q.options?.map((opt: string, i: number) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                        <span className="text-base font-medium text-zinc-600 group-hover:text-zinc-900">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {q.type === 'open' && (
                            <div className="pl-4">
                                <div className="w-full h-24 border-b-2 border-zinc-200 border-dashed bg-zinc-50/50 rounded-lg"></div>
                            </div>
                        )}

                        {q.type === 'true_false' && (
                            <div className="flex gap-4 pl-4">
                                <button className="flex-1 py-3 rounded-xl border-2 border-emerald-100 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors">
                                    DOĞRU
                                </button>
                                <button className="flex-1 py-3 rounded-xl border-2 border-rose-100 bg-rose-50 text-rose-700 font-bold hover:bg-rose-100 transition-colors">
                                    YANLIŞ
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Clinical Notes (Optional) */}
            {/* Bu kısım eğer ayarlarda seçildiyse gösterilir, ama burada settings.showClinicalNotes yok, generator options'ta vardı. 
                Data içinde bir flag olarak gelmeliydi. Basitlik adına şimdilik statik bir kontrol ekliyorum veya her zaman gösteriyorum ama CSS ile gizliyorum printte vs. */}
             <div className="mt-auto pt-8 border-t-2 border-dashed border-zinc-200">
                <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Dikkat Süresi: _______ dk</span>
                    <span>Doğru: ____ / {questions.length}</span>
                    <span>Destek İhtiyacı:  Az / Orta / Çok</span>
                </div>
            </div>
        </div>
    );
};
