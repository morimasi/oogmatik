
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
        <div className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex-1 space-y-8">
                <div className="bg-[var(--bg-paper)] rounded-[3rem] p-10 border border-[var(--border-color)] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-color)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[var(--accent-color)]/20 transition-colors duration-700"></div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-color)] to-purple-600 rounded-[2rem] flex items-center justify-center text-4xl text-white shadow-2xl shadow-[var(--accent-muted)] mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <i className="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <h1 className="text-5xl font-black text-[var(--text-primary)] mb-6 tracking-tighter leading-[0.95] uppercase italic">
                            Erken <span className="text-[var(--accent-color)]">Farkındalık,</span> <br/>
                            Geleceği Değiştirir.
                        </h1>
                        <p className="text-xl font-medium text-[var(--text-secondary)] leading-relaxed mb-10 opacity-80">
                            Bu modül, çocuğunuzun öğrenme süreçlerindeki güçlü ve desteklenmesi gereken yönlerini keşfetmenize yardımcı olan bilimsel temelli bir tarama aracıdır.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] hover:bg-[var(--bg-paper)] transition-all group/card">
                                <i className="fa-solid fa-brain text-[var(--accent-color)] mb-4 text-2xl group-hover-card:scale-110 transition-transform"></i>
                                <h4 className="font-black text-sm mb-1 text-[var(--text-primary)] uppercase tracking-tight">6 Bilişsel Alan</h4>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Dikkat, Okuma, Yazma, Matematik ve Bellek.</p>
                            </div>
                            <div className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)] hover:bg-[var(--bg-paper)] transition-all group/card">
                                <i className="fa-solid fa-wand-magic-sparkles text-amber-500 mb-4 text-2xl group-hover-card:scale-110 transition-transform"></i>
                                <h4 className="font-black text-sm mb-1 text-[var(--text-primary)] uppercase tracking-tight">AI Destekli Analiz</h4>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Yapay zeka tabanlı öneriler ve yol haritası.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-amber-500/10 border-l-8 border-amber-500 rounded-r-[2.5rem] shadow-lg">
                    <h4 className="font-black text-amber-500 mb-3 flex items-center gap-3 uppercase tracking-tighter italic text-lg">
                        <i className="fa-solid fa-triangle-exclamation animate-pulse"></i> ÖNEMLİ YASAL UYARI
                    </h4>
                    <p className="text-sm font-medium text-amber-500/90 leading-relaxed mb-6">
                        Bu test <strong>tıbbi bir tanı aracı değildir</strong>. Sonuçlar sadece eğitimsel yönlendirme, farkındalık ve öğretim planlaması amaçlıdır. Kesin tanı için lütfen çocuk psikiyatristine başvurunuz.
                    </p>
                    <label className="flex items-center gap-4 cursor-pointer group/check w-fit">
                        <div className="relative">
                            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="peer sr-only" />
                            <div className="w-6 h-6 border-2 border-amber-500/50 rounded-lg peer-checked:bg-amber-500 peer-checked:border-amber-500 transition-all flex items-center justify-center">
                                <i className="fa-solid fa-check text-white text-xs opacity-0 peer-checked:opacity-100 transition-opacity"></i>
                            </div>
                        </div>
                        <span className="text-xs font-black text-amber-500 uppercase tracking-widest select-none group-hover-check:opacity-100 opacity-70 transition-opacity">Okudum, onaylıyorum.</span>
                    </label>
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full lg:w-[400px] bg-[var(--bg-paper)] p-10 rounded-[3rem] border border-[var(--border-color)] shadow-2xl sticky top-24">
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-8 italic uppercase tracking-tighter">Öğrenci Profili</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3">Kim Dolduruyor?</label>
                        <div className="flex bg-[var(--bg-secondary)] p-1.5 rounded-2xl border border-[var(--border-color)]">
                            <button type="button" onClick={() => setRole('parent')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'parent' ? 'bg-[var(--bg-paper)] shadow-xl text-[var(--accent-color)] border border-[var(--border-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>Ebeveyn</button>
                            <button type="button" onClick={() => setRole('teacher')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${role === 'teacher' ? 'bg-[var(--bg-paper)] shadow-xl text-[var(--accent-color)] border border-[var(--border-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>Öğretmen</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3">Çocuğun Adı</label>
                        <input required type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full p-4 rounded-2xl border ${themeClasses.input} text-sm font-bold shadow-inner`} placeholder="Ad Soyad" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3">Yaş</label>
                            <input required type="number" min={5} max={15} value={age} onChange={e => setAge(Number(e.target.value))} className={`w-full p-4 rounded-2xl border ${themeClasses.input} text-sm font-bold shadow-inner`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3">Sınıf</label>
                            <select value={grade} onChange={e => setGrade(e.target.value)} className={`w-full p-4 rounded-2xl border ${themeClasses.input} text-sm font-bold shadow-inner cursor-pointer`}>
                                {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!accepted || !name}
                        className={`w-full py-5 ${themeClasses.buttonPrimary} font-black rounded-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed mt-8 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs group`}
                    >
                        Taramayı Başlat 
                        <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                    </button>
                </form>
            </div>
        </div>
    );
};
