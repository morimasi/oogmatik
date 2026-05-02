
import React, { useState } from 'react';
import { ScreeningProfile } from '../../types/screening';

interface Props {
    onStart: (profile: ScreeningProfile) => void;
}

export const ScreeningIntro: React.FC<Props> = ({ onStart }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState<number>(7);
    const [grade, setGrade] = useState('1. Sınıf');
    const [role, setRole] = useState<'parent' | 'teacher'>('parent');
    const [accepted, setAccepted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accepted) {
            alert("Lütfen yasal uyarıyı okuyup onaylayınız.");
            return;
        }
        onStart({ studentName: name, age, grade, respondent: role });
    };

    return (
        <div className="flex flex-col md:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex-1 space-y-8">
                <div className="bg-[var(--bg-paper)] rounded-[2.5rem] p-8 border border-[var(--border-color)] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-[var(--accent-color)] rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg mb-6 rotate-3">
                            <i className="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tight leading-tight">
                            Erken Farkındalık, <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">Geleceği Değiştirir.</span>
                        </h1>
                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
                            Bu modül, çocuğunuzun öğrenme süreçlerindeki güçlü ve desteklenmesi gereken yönlerini keşfetmenize yardımcı olan bilimsel temelli bir tarama aracıdır.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                                <i className="fa-solid fa-brain text-purple-500 mb-2 text-xl"></i>
                                <h4 className="font-bold text-sm mb-1 text-[var(--text-primary)]">6 Bilişsel Alan</h4>
                                <p className="text-xs text-[var(--text-muted)]">Dikkat, Okuma, Yazma, Matematik ve daha fazlası.</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)] p-4 rounded-xl border border-[var(--border-color)]">
                                <i className="fa-solid fa-wand-magic-sparkles text-amber-500 mb-2 text-xl"></i>
                                <h4 className="font-bold text-sm mb-1 text-[var(--text-primary)]">AI Destekli Analiz</h4>
                                <p className="text-xs text-[var(--text-muted)]">Yapay zeka tabanlı öneriler ve yol haritası.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-xl">
                    <h4 className="font-bold text-amber-800 dark:text-amber-500 mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-triangle-exclamation"></i> ÖNEMLİ YASAL UYARI
                    </h4>
                    <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                        Bu test <strong>tıbbi bir tanı aracı değildir</strong>. Sonuçlar sadece eğitimsel yönlendirme, farkındalık ve öğretim planlaması amaçlıdır. Kesin tanı için lütfen çocuk psikiyatristine başvurunuz.
                    </p>
                    <label className="flex items-center gap-3 mt-4 cursor-pointer">
                        <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 border-gray-300" />
                        <span className="text-sm font-bold text-[var(--text-secondary)] select-none">Okudum, onaylıyorum.</span>
                    </label>
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full md:w-96 bg-[var(--bg-paper)] p-8 rounded-3xl border border-[var(--border-color)] shadow-lg">
                <h3 className="font-bold text-xl text-[var(--text-primary)] mb-6">Öğrenci Profili</h3>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Kim Dolduruyor?</label>
                        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-xl">
                            <button type="button" onClick={() => setRole('parent')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'parent' ? 'bg-[var(--bg-paper)] shadow text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Ebeveyn</button>
                            <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${role === 'teacher' ? 'bg-[var(--bg-paper)] shadow text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>Öğretmen</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Çocuğun Adı</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-bold placeholder-[var(--text-muted)]" placeholder="Ad Soyad" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Yaş</label>
                            <input required type="number" min={5} max={15} value={age} onChange={e => setAge(Number(e.target.value))} className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-bold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Sınıf</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl outline-none font-bold">
                                {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!accepted || !name}
                        className="w-full py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white font-black rounded-xl shadow-lg shadow-[var(--accent-muted)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                    >
                        TARAMAYI BAŞLAT <i className="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};
