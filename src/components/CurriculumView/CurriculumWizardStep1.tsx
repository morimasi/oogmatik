import React, { useState } from 'react';
import { Student } from '../../types';
import { MEB_MATEMATIK_MUFREDATI } from '../../constants/mebMathCurriculum';

interface CurriculumWizardStep1Props {
    formData: Partial<Student>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Student>>>;
    diagnosisContext: string;
    setStep: (s: number) => void;
    handleGenerate: () => Promise<void>;
    planType?: 'clinical' | 'meb' | 'hybrid';
    selectedKazanimlar?: string[];
    setSelectedKazanimlar?: React.Dispatch<React.SetStateAction<string[]>>;
}

export const CurriculumWizardStep1: React.FC<CurriculumWizardStep1Props> = ({
    formData,
    setFormData,
    diagnosisContext,
    setStep,
    handleGenerate,
    planType = 'hybrid',
    selectedKazanimlar = [],
    setSelectedKazanimlar
}) => {
    const [activeTab, setActiveTab] = useState<'bep' | 'meb'>('bep');
    const [selectedMebUnitId, setSelectedMebUnitId] = useState<string>('');

    // Sınıf numarasını çıkar (Örn: '2. Sınıf' -> 2)
    const gradeNum = parseInt(formData.grade?.replace(/[^0-9]/g, '') || '2', 10) || 2;
    const mebGradeData = MEB_MATEMATIK_MUFREDATI[gradeNum] || MEB_MATEMATIK_MUFREDATI[2];

    const toggleKazanim = (kod: string, tanim: string) => {
        if (!setSelectedKazanimlar) return;
        const entry = `${kod}: ${tanim}`;
        if (selectedKazanimlar.includes(entry)) {
            setSelectedKazanimlar(selectedKazanimlar.filter(k => k !== entry));
        } else {
            setSelectedKazanimlar([...selectedKazanimlar, entry]);
        }
    };

    const isKazanimSelected = (kod: string) => {
        return selectedKazanimlar.some(k => k.startsWith(kod));
    };

    const currentUnit = mebGradeData?.uniteler.find(u => u.id === selectedMebUnitId) || mebGradeData?.uniteler[0];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                    ADIM 2 • AKADEMİK VE KLİNİK YAPILANDIRMA
                </span>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
                    {formData.name} İçin Hedef ve Kazanım Matrisi
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl mx-auto">
                    Öğrencinin güçlü/destek gerektiren bilişsel alanlarını ve MEB 2024-2025 müfredat hedeflerini seçin.
                </p>
            </div>

            {/* DIAGNOSIS CONTEXT DISPLAY */}
            {diagnosisContext && (
                <div className="bg-indigo-50/80 dark:bg-indigo-950/20 p-5 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/40">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check"></i> KLİNİK VE BİLİŞSEL TARAMA BULGULARI
                    </h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed whitespace-pre-line font-medium">
                        {diagnosisContext}
                    </p>
                </div>
            )}

            {/* TABS */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-2xl max-w-md mx-auto border border-zinc-200 dark:border-zinc-700">
                <button
                    type="button"
                    onClick={() => setActiveTab('bep')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'bep'
                            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-md'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                >
                    <i className="fa-solid fa-brain"></i>
                    Bilişsel & BEP
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('meb')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'meb'
                            ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-md'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                >
                    <i className="fa-solid fa-landmark"></i>
                    MEB Kazanımları ({selectedKazanimlar.length})
                </button>
            </div>

            <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-700/70 shadow-xl space-y-6">

                {activeTab === 'bep' ? (
                    <>
                        {/* Interests */}
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-star text-amber-500"></i> Öğrencinin İlgi Alanları (AI Motivasyon Temaları)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['Uzay & Gezegenler', 'Dinozorlar', 'Hayvanlar Alemi', 'Doğa & Macera', 'Futbol & Spor', 'Müzik & Sanat', 'Robotlar & Kodlama', 'Denizaltı'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            interests: prev.interests?.includes(tag)
                                                ? prev.interests.filter(t => t !== tag)
                                                : [...(prev.interests || []), tag]
                                        }))}
                                        className={`px-4 py-2 rounded-xl font-bold text-xs border-2 transition-all ${
                                            formData.interests?.includes(tag)
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                                : 'bg-zinc-50 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600 hover:border-indigo-300'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses / Clinical Targets */}
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-bullseye text-rose-500"></i> Öncelikli Destek Alanları (Özel Öğrenme İhtiyaçları)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {[
                                    'Harf & Ses Eşleştirme (b/d/p)',
                                    'Hece Birleştirme & Akıcılık',
                                    'Sayı Hissi & Rakam Tanıma',
                                    'Görsel Tarama & Dikkat',
                                    'Çalışma Belleği & Sıralama',
                                    'Yön & Mekansal Algı',
                                    'Toplama & Çıkarma Stratejisi',
                                    'Okuduğunu Anlama & 5N1K',
                                    'Zihinden İşlem Becerisi',
                                    ...(formData.weaknesses || []).filter(w => ![
                                        'Harf & Ses Eşleştirme (b/d/p)',
                                        'Hece Birleştirme & Akıcılık',
                                        'Sayı Hissi & Rakam Tanıma',
                                        'Görsel Tarama & Dikkat',
                                        'Çalışma Belleği & Sıralama',
                                        'Yön & Mekansal Algı',
                                        'Toplama & Çıkarma Stratejisi',
                                        'Okuduğunu Anlama & 5N1K',
                                        'Zihinden İşlem Becerisi'
                                    ].includes(w))
                                ].map(item => {
                                    const isSelected = formData.weaknesses?.includes(item);
                                    return (
                                        <label
                                            key={item}
                                            className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-200 shadow-sm'
                                                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => setFormData(prev => ({
                                                    ...prev,
                                                    weaknesses: isSelected
                                                        ? prev.weaknesses?.filter(t => t !== item)
                                                        : [...(prev.weaknesses || []), item]
                                                }))}
                                                className="hidden"
                                            />
                                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? 'bg-rose-500 border-rose-500 text-white'
                                                    : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700'
                                            }`}>
                                                <i className="fa-solid fa-check text-[10px]"></i>
                                            </div>
                                            <span className="font-bold text-xs leading-snug">{item}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    /* MEB KAZANIM TAB */
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700 pb-3">
                            <div>
                                <h4 className="font-black text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                                    <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                                    {gradeNum}. Sınıf MEB Matematik ve Dil Müfredatı
                                </h4>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                    Öğrencinin bu planda pekiştirmesini istediğiniz MEB kazanımlarını işaretleyin.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-xs font-black">
                                {selectedKazanimlar.length} Seçili
                            </span>
                        </div>

                        {/* Units selector */}
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {mebGradeData?.uniteler.map(u => (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => setSelectedMebUnitId(u.id)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                                        (selectedMebUnitId === u.id || (!selectedMebUnitId && currentUnit?.id === u.id))
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                            : 'bg-zinc-50 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600'
                                    }`}
                                >
                                    {u.baslik}
                                </button>
                            ))}
                        </div>

                        {/* Kazanimlar in unit */}
                        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                            {currentUnit?.kazanimlar.map(k => {
                                const selected = isKazanimSelected(k.kod);
                                return (
                                    <div
                                        key={k.kod}
                                        onClick={() => toggleKazanim(k.kod, k.tanim)}
                                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                            selected
                                                ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700 text-indigo-950 dark:text-indigo-100'
                                                : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                            selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-300 dark:border-zinc-600'
                                        }`}>
                                            <i className="fa-solid fa-check text-[10px]"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-[10px] font-black text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 rounded">
                                                    {k.kod}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-snug">
                                                {k.tanim}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Bottom Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-100 dark:border-zinc-700">
                    <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs font-black uppercase text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Geri Dön
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                        <span>AKILLI PLANI OLUŞTUR</span>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
