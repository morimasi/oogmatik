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
                <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-color)] font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)]">
                    ADIM 2 • AKADEMİK VE KLİNİK YAPILANDIRMA
                </span>
                <h2 className="text-3xl font-black text-[var(--text-primary)] mt-2 tracking-tight">
                    {formData.name} İçin Hedef ve Kazanım Matrisi
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl mx-auto">
                    Öğrencinin güçlü/destek gerektiren bilişsel alanlarını ve MEB 2024-2025 müfredat hedeflerini seçin.
                </p>
            </div>

            {/* DIAGNOSIS CONTEXT DISPLAY */}
            {diagnosisContext && (
                <div className="bg-[var(--bg-secondary)] p-5 rounded-3xl border border-[var(--border-color)]">
                    <h4 className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check"></i> KLİNİK VE BİLİŞSEL TARAMA BULGULARI
                    </h4>
                    <p className="text-xs text-[var(--text-primary)] italic leading-relaxed whitespace-pre-line font-medium">
                        {diagnosisContext}
                    </p>
                </div>
            )}

            {/* TABS (Theme Compliant) */}
            <div className="flex bg-[var(--bg-inset)] p-1.5 rounded-2xl max-w-md mx-auto border border-[var(--border-color)]">
                <button
                    type="button"
                    onClick={() => setActiveTab('bep')}
                    className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'bep'
                            ? 'bg-[var(--accent-color)] text-white shadow-md'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                            ? 'bg-[var(--accent-color)] text-white shadow-md'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    <i className="fa-solid fa-landmark"></i>
                    MEB Kazanımları ({selectedKazanimlar.length})
                </button>
            </div>

            <div className="bg-[var(--bg-paper)]/85 backdrop-blur-xl p-8 rounded-[2.5rem] border border-[var(--border-color)] shadow-xl space-y-6">

                {activeTab === 'bep' ? (
                    <>
                        {/* Interests */}
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
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
                                        className={`px-4 py-2 rounded-xl font-bold text-xs border transition-all ${
                                            formData.interests?.includes(tag)
                                                ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md shadow-[var(--accent-color)]/25'
                                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50'
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Weaknesses / Clinical Targets */}
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 flex items-center gap-2">
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
                                                    ? 'bg-rose-500/15 border-rose-500 text-[var(--text-primary)] shadow-sm'
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-color)]/80'
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
                                                    : 'border-[var(--border-color)] bg-[var(--bg-inset)]'
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
                        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                            <div>
                                <h4 className="font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
                                    <i className="fa-solid fa-graduation-cap text-[var(--accent-color)]"></i>
                                    {gradeNum}. Sınıf MEB Matematik ve Dil Müfredatı
                                </h4>
                                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                                    Öğrencinin bu planda pekiştirmesini istediğiniz MEB kazanımlarını işaretleyin.
                                </p>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-[var(--bg-secondary)] text-[var(--accent-color)] font-mono text-xs font-black border border-[var(--border-color)]">
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
                                            ? 'bg-[var(--accent-color)] text-white border-[var(--accent-color)] shadow-md'
                                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]/50'
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
                                                ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)] text-[var(--text-primary)]'
                                                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--border-color)]/80 text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                                            selected ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'border-[var(--border-color)] bg-[var(--bg-inset)]'
                                        }`}>
                                            <i className="fa-solid fa-check text-[10px]"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-mono text-[10px] font-black text-[var(--accent-color)] px-1.5 py-0.5 bg-[var(--bg-inset)] border border-[var(--border-color)] rounded">
                                                    {k.kod}
                                                </span>
                                            </div>
                                            <p className="text-xs font-bold text-[var(--text-primary)] leading-snug">
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
                <div className="flex justify-between items-center pt-4 border-t border-[var(--border-color)]">
                    <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-xs font-black uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 px-4 py-2 rounded-xl transition-colors"
                    >
                        <i className="fa-solid fa-arrow-left"></i> Geri Dön
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="px-8 py-3.5 bg-gradient-to-r from-[var(--accent-color)] via-purple-600 to-[var(--accent-hover)] text-white font-black rounded-2xl shadow-xl shadow-[var(--accent-color)]/25 hover:shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] uppercase tracking-widest text-xs flex items-center gap-2"
                    >
                        <span>AKILLI PLANI OLUŞTUR</span>
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
