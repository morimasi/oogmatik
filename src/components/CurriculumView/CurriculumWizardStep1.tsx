import React from 'react';
import { Student } from '../../types';

interface CurriculumWizardStep1Props {
    formData: Partial<Student>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Student>>>;
    diagnosisContext: string;
    setStep: (s: number) => void;
    handleGenerate: () => Promise<void>;
}

export const CurriculumWizardStep1: React.FC<CurriculumWizardStep1Props> = ({ formData, setFormData, diagnosisContext, setStep, handleGenerate }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white">Akademik Profil Özeti</h2>
                <p className="text-zinc-500">Bu veriler AI'nın her güne özel zorluk seviyesi belirlemesi için kullanılacaktır.</p>
            </div>

            {/* DIAGNOSIS CONTEXT DISPLAY */}
            {diagnosisContext && (
                <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                    <h4 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <i className="fa-solid fa-clipboard-check"></i> KLİNİK TARAMA BULGULARI
                    </h4>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed whitespace-pre-line">
                        {diagnosisContext}
                    </p>
                </div>
            )}

            <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-700 shadow-xl space-y-6">
                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Öğrencinin İlgi Alanları (AI Teması)</label>
                    <div className="flex flex-wrap gap-2">
                        {['Uzay', 'Dinozorlar', 'Hayvanlar', 'Doğa', 'Spor', 'Müzik', 'Robotlar', 'Denizler'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFormData(prev => ({ ...prev, interests: prev.interests?.includes(tag) ? prev.interests.filter(t => t !== tag) : [...(prev.interests || []), tag] }))}
                                className={`px-4 py-2 rounded-xl font-bold text-xs border-2 transition-all ${formData.interests?.includes(tag) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-zinc-700 text-zinc-500 border-zinc-100 dark:border-zinc-600'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-zinc-400 uppercase tracking-widest mb-3">Klinik Hedefler (Zayıf Yönler)</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            'Harf Karıştırma', 'Yavaş Okuma', 'Sayı Hissi', 'Dikkat Dağınıklığı', 'Sıralama Sorunları', 'Ters Yazma',
                            ...(formData.weaknesses || []).filter(w => !['Harf Karıştırma', 'Yavaş Okuma', 'Sayı Hissi', 'Dikkat Dağınıklığı', 'Sıralama Sorunları', 'Ters Yazma'].includes(w))
                        ].map(item => (
                            <label key={item} className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.weaknesses?.includes(item) ? 'bg-rose-50 border-rose-400 dark:bg-rose-900/20' : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700'}`}>
                                <input type="checkbox" checked={formData.weaknesses?.includes(item)} onChange={() => setFormData(prev => ({ ...prev, weaknesses: prev.weaknesses?.includes(item) ? prev.weaknesses.filter(t => t !== item) : [...(prev.weaknesses || []), item] }))} className="hidden" />
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.weaknesses?.includes(item) ? 'bg-rose-500 border-rose-500 text-white' : 'border-zinc-300'}`}><i className="fa-solid fa-check text-[10px]"></i></div>
                                <span className="font-bold text-sm">{item}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                    <button onClick={() => setStep(0)} className="text-sm font-bold text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-arrow-left mr-2"></i> Geri Dön</button>
                    <button onClick={handleGenerate} className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all">PROGRAMI İNŞA ET <i className="fa-solid fa-wand-magic-sparkles ml-2"></i></button>
                </div>
            </div>
        </div>
    );
};
