
import React, { useState, useEffect } from 'react';
import { curriculumService } from '../services/curriculumService';
import { Curriculum, CurriculumDay, CurriculumActivity } from '../types';
import { ACTIVITIES } from '../constants';
import { printService } from '../utils/printService';
import { useAuth } from '../context/AuthContext';
import { ShareModal } from './ShareModal';

interface CurriculumViewProps {
    onBack: () => void;
    onSelectActivity: (id: string) => void;
}

// --- WIZARD STEPS COMPONENTS ---

const WizardStep1 = ({ data, setData, onNext }: any) => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
        <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Öğrenci Profili</h3>
        <p className="text-zinc-500 mb-6">Müfredatı kime hazırlıyoruz?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Öğrenci Adı</label>
                <input required type="text" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold" placeholder="Ali" />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Yaş</label>
                <input required type="number" value={data.age} onChange={e => setData({...data, age: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold" />
            </div>
        </div>
        
        <div>
            <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Sınıf Seviyesi</label>
            <div className="grid grid-cols-3 gap-3">
                {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf'].map(g => (
                    <button 
                        key={g}
                        type="button"
                        onClick={() => setData({...data, grade: g})}
                        className={`py-3 rounded-xl font-bold border-2 transition-all ${data.grade === g ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300'}`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>

        <button onClick={onNext} disabled={!data.name} className="w-full py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
            İlerle <i className="fa-solid fa-arrow-right"></i>
        </button>
    </div>
);

const WizardStep2 = ({ data, setData, onNext, onBack }: any) => {
    const diagnoses = ['Disleksi (Okuma)', 'Diskalkuli (Matematik)', 'DEHB (Dikkat)', 'Disgrafi (Yazma)', 'Genel Destek'];
    const weaknessesList = ['Okuma Hızı', 'Okuduğunu Anlama', 'Hafıza', 'İşlem Hızı', 'Dikkat Süresi', 'Yazı Yazma'];
    
    const toggleWeakness = (w: string) => {
        const current = data.weaknesses || [];
        if (current.includes(w)) setData({...data, weaknesses: current.filter((i: string) => i !== w)});
        else setData({...data, weaknesses: [...current, w]});
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">İhtiyaç Analizi</h3>
            <p className="text-zinc-500 mb-6">Neye odaklanmalıyız?</p>

            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Temel Tanı / Odak</label>
                <select value={data.diagnosis} onChange={e => setData({...data, diagnosis: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg">
                    {diagnoses.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Zayıf Yönler (Çoklu Seçim)</label>
                <div className="flex flex-wrap gap-2">
                    {weaknessesList.map(w => (
                        <button 
                            key={w}
                            type="button"
                            onClick={() => toggleWeakness(w)}
                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${data.weaknesses.includes(w) ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'}`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 mt-8">
                <button onClick={onBack} className="w-1/3 py-4 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors">Geri</button>
                <button onClick={onNext} className="w-2/3 py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-3">
                    İlerle <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

const WizardStep3 = ({ data, setData, onGenerate, loading }: any) => {
    const interestsList = ['Uzay', 'Hayvanlar', 'Spor', 'Arabalar', 'Süper Kahramanlar', 'Prensesler', 'Dinozorlar', 'Robotlar', 'Sanat', 'Müzik'];
    
    const toggleInterest = (i: string) => {
        const current = data.interests || [];
        if (current.includes(i)) setData({...data, interests: current.filter((item: string) => item !== i)});
        else setData({...data, interests: [...current, i]});
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h3 className="text-2xl font-black text-zinc-800 dark:text-white mb-2">Kişiselleştirme</h3>
            <p className="text-zinc-500 mb-6">Motivasyonu artırmak için ilgi alanlarını kullanacağız.</p>

            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">İlgi Alanları</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {interestsList.map(i => (
                        <button 
                            key={i}
                            type="button"
                            onClick={() => toggleInterest(i)}
                            className={`p-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-2 ${data.interests.includes(i) ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm' : 'bg-white border-zinc-200 text-zinc-400 hover:border-zinc-300'}`}
                        >
                            {data.interests.includes(i) && <i className="fa-solid fa-heart text-xs"></i>}
                            {i}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Program Süresi</label>
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                    {[3, 5, 7].map(d => (
                        <button 
                            key={d}
                            type="button"
                            onClick={() => setData({...data, duration: d})}
                            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${data.duration === d ? 'bg-white dark:bg-zinc-600 shadow text-black dark:text-white' : 'text-zinc-500'}`}
                        >
                            {d} Gün
                        </button>
                    ))}
                </div>
            </div>

            <button onClick={onGenerate} disabled={loading} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:scale-100 mt-6">
                {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                {loading ? 'Yapay Zeka Planlıyor...' : 'SİHİRLİ MÜFREDATI OLUŞTUR'}
            </button>
        </div>
    );
};

// --- PLAN COMPONENTS ---

const DayCard = ({ day, onRegenerate, onToggleActivity, onSelectActivity }: { day: CurriculumDay, onRegenerate: () => void, onToggleActivity: (day: number, actId: string) => void, onSelectActivity: (id: string) => void }) => {
    const isAllCompleted = day.activities.every(a => a.status === 'completed');
    
    return (
        <div className={`group relative bg-white dark:bg-zinc-800 rounded-3xl border-2 transition-all duration-300 hover:shadow-xl ${isAllCompleted ? 'border-emerald-400 dark:border-emerald-600' : 'border-zinc-100 dark:border-zinc-700'} break-inside-avoid page-break-inside-avoid print:border-zinc-300 print:shadow-none`}>
            {/* Header */}
            <div className={`p-5 rounded-t-3xl flex justify-between items-center ${isAllCompleted ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-zinc-50 dark:bg-zinc-800'} print:bg-gray-100`}>
                <div>
                    <h4 className="font-black text-xl text-zinc-800 dark:text-white flex items-center gap-2 print:text-black">
                        {day.day}. Gün
                        {isAllCompleted && <i className="fa-solid fa-check-circle text-emerald-500 print:hidden"></i>}
                    </h4>
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1 print:text-black">{day.focus}</p>
                </div>
                <button onClick={onRegenerate} className="w-8 h-8 rounded-full bg-white dark:bg-zinc-700 text-zinc-400 hover:text-indigo-500 hover:rotate-180 transition-all shadow-sm flex items-center justify-center print:hidden" title="Bu günü yeniden oluştur">
                    <i className="fa-solid fa-arrows-rotate"></i>
                </button>
            </div>

            {/* Activities */}
            <div className="p-5 space-y-4">
                {day.activities.map((act, i) => (
                    <div key={act.id} className={`relative pl-4 border-l-2 transition-all ${act.status === 'completed' ? 'border-emerald-400 opacity-60' : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'} print:border-l-4 print:border-gray-300 print:opacity-100`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className={`font-bold text-sm ${act.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'} print:text-black print:no-underline`}>{act.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded text-zinc-500 font-mono print:border print:border-gray-300">{act.duration} dk</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${act.difficultyLevel === 'Hard' ? 'bg-red-50 text-red-600' : act.difficultyLevel === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'} print:border print:border-gray-300 print:bg-white print:text-black`}>
                                        {act.difficultyLevel === 'Hard' ? 'Zor' : act.difficultyLevel === 'Medium' ? 'Orta' : 'Kolay'}
                                    </span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-1 italic print:text-gray-600">{act.goal}</p>
                            </div>
                            <button 
                                onClick={() => onToggleActivity(day.day, act.id)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all print:hidden ${act.status === 'completed' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 hover:border-indigo-500 text-transparent hover:text-indigo-200'}`}
                            >
                                <i className="fa-solid fa-check text-xs"></i>
                            </button>
                        </div>
                        
                        {act.status !== 'completed' && (
                            <button 
                                onClick={() => onSelectActivity(act.activityId)}
                                className="mt-3 w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 print:hidden"
                            >
                                <i className="fa-solid fa-play"></i> Başlat
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onSelectActivity }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(0); // 0: Start, 1: Profile, 2: Needs, 3: Interests, 4: Plan
    const [loading, setLoading] = useState(false);
    const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // List view state for saved curriculums
    const [viewMode, setViewMode] = useState<'create' | 'list'>('create');
    const [savedCurriculums, setSavedCurriculums] = useState<Curriculum[]>([]);

    const [formData, setFormData] = useState({
        name: '', age: 8, grade: '2. Sınıf', diagnosis: 'Disleksi (Okuma Güçlüğü)',
        weaknesses: [] as string[], interests: [] as string[], duration: 7
    });

    useEffect(() => {
        if (user && viewMode === 'list') {
            loadSavedCurriculums();
        }
    }, [user, viewMode]);

    const loadSavedCurriculums = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const list = await curriculumService.getUserCurriculums(user.id);
            setSavedCurriculums(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await curriculumService.generatePlan(
                formData.name, formData.age, formData.grade, formData.diagnosis, formData.duration, formData.interests, formData.weaknesses
            );
            setCurriculum(result);
            setIsSaved(false);
            setStep(4);
        } catch (error) {
            console.error(error);
            alert("Müfredat oluşturulamadı.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateDay = async (dayIndex: number) => {
        if (!curriculum) return;
        const currentDay = curriculum.schedule[dayIndex];
        try {
            const newDay = await curriculumService.regenerateDay(currentDay, formData);
            const newSchedule = [...curriculum.schedule];
            newSchedule[dayIndex] = newDay;
            setCurriculum({ ...curriculum, schedule: newSchedule });
            setIsSaved(false); // Modified
        } catch (e) {
            alert("Yenileme başarısız.");
        }
    };

    const handleToggleActivity = (dayNum: number, actId: string) => {
        if (!curriculum) return;
        const newSchedule = curriculum.schedule.map(d => {
            if (d.day === dayNum) {
                return {
                    ...d,
                    activities: d.activities.map(a => a.id === actId ? { ...a, status: a.status === 'completed' ? 'pending' : 'completed' } as any : a)
                };
            }
            return d;
        });
        
        setCurriculum({ ...curriculum, schedule: newSchedule });
    };

    const handleSave = async () => {
        if (!user) {
            alert("Kaydetmek için lütfen giriş yapın.");
            return;
        }
        if (!curriculum) return;
        
        try {
            await curriculumService.saveCurriculum(user.id, curriculum);
            setIsSaved(true);
            alert("Müfredat başarıyla kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme hatası.");
        }
    };

    const handleShare = async (receiverId: string) => {
        if (!user || !curriculum) return;
        try {
            await curriculumService.shareCurriculum(curriculum, user.id, user.name, receiverId);
            setIsShareModalOpen(false);
            alert("Müfredat paylaşıldı.");
        } catch (e) {
            alert("Paylaşım hatası.");
        }
    };

    const handlePrint = async (action: 'print' | 'download') => {
        if (!curriculum) return;
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                // We target a specific container ID for printing
                await printService.generatePdf('#curriculum-plan-area', `Mufredat-${curriculum.studentName}`, { action });
            } catch (error) {
                console.error("Print Error", error);
            } finally {
                setIsPrinting(false);
            }
        }, 500);
    };

    const handleLoadCurriculum = (c: Curriculum) => {
        setCurriculum(c);
        setStep(4);
        setViewMode('create');
        setIsSaved(true);
    };

    const handleDeleteCurriculum = async (id: string) => {
        if(confirm("Bu planı silmek istiyor musunuz?")) {
            await curriculumService.deleteCurriculum(id);
            loadSavedCurriculums();
        }
    };

    return (
        <div className="h-full bg-zinc-50 dark:bg-zinc-900 flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 flex justify-between items-center shadow-sm shrink-0 z-20 print:hidden">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-graduation-cap text-indigo-500"></i>
                        AI Eğitim Koçu
                    </h2>
                </div>

                <div className="flex gap-2">
                    {step === 4 && (
                        <>
                            <button onClick={() => setIsShareModalOpen(true)} className="p-2 text-zinc-500 hover:text-indigo-600 transition-colors" title="Paylaş">
                                <i className="fa-solid fa-share-nodes"></i>
                            </button>
                            <button onClick={() => handlePrint('download')} disabled={isPrinting} className="p-2 text-zinc-500 hover:text-red-600 transition-colors" title="PDF İndir">
                                {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                            </button>
                            <button onClick={() => handlePrint('print')} disabled={isPrinting} className="p-2 text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Yazdır">
                                <i className="fa-solid fa-print"></i>
                            </button>
                            <button onClick={handleSave} disabled={isSaved} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${isSaved ? 'bg-green-100 text-green-700 cursor-default' : 'bg-zinc-900 text-white hover:bg-black'}`}>
                                {isSaved ? <><i className="fa-solid fa-check"></i> Kaydedildi</> : <><i className="fa-solid fa-save"></i> Kaydet</>}
                            </button>
                        </>
                    )}
                    {step < 4 && user && (
                         <div className="bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg flex text-xs font-bold">
                             <button onClick={() => setViewMode('create')} className={`px-3 py-1.5 rounded-md ${viewMode === 'create' ? 'bg-white text-black shadow' : 'text-zinc-500'}`}>Yeni</button>
                             <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md ${viewMode === 'list' ? 'bg-white text-black shadow' : 'text-zinc-500'}`}>Kayıtlı</button>
                         </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:overflow-visible print:h-auto print:bg-white">
                
                {/* LIST VIEW */}
                {viewMode === 'list' && (
                    <div className="max-w-4xl mx-auto space-y-4">
                        <h3 className="font-bold text-lg text-zinc-700 dark:text-zinc-300">Kayıtlı Programlarım</h3>
                        {loading ? <div className="text-center p-8"><i className="fa-solid fa-circle-notch fa-spin"></i></div> : (
                            savedCurriculums.length === 0 ? <div className="text-center p-12 text-zinc-400">Henüz kayıtlı program yok.</div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {savedCurriculums.map(c => (
                                        <div key={c.id} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{c.studentName}</h4>
                                                    <p className="text-xs text-zinc-500">{c.grade} • {c.durationDays} Gün</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleDeleteCurriculum(c.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100"><i className="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                            <button onClick={() => handleLoadCurriculum(c)} className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-sm hover:bg-indigo-100 transition-colors">
                                                Planı Aç
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* CREATE WIZARD */}
                {viewMode === 'create' && step < 4 && (
                    <div className="max-w-2xl mx-auto mt-8">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>
                            ))}
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
                            {/* Decorative Blob */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

                            {step === 0 && (
                                <div className="text-center py-10">
                                    <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-6xl shadow-inner">
                                        👩‍🏫
                                    </div>
                                    <h1 className="text-3xl font-black text-zinc-800 dark:text-white mb-4">Öğrenme Yolculuğunu Planlayalım!</h1>
                                    <p className="text-zinc-500 text-lg mb-8 max-w-md mx-auto">
                                        Yapay zeka ile çocuğunuza özel, bilimsel temelli ve eğlenceli bir çalışma programı oluşturun.
                                    </p>
                                    <button onClick={() => setStep(1)} className="px-10 py-4 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-black rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg flex items-center gap-3 mx-auto">
                                        Başlayalım <i className="fa-solid fa-rocket"></i>
                                    </button>
                                </div>
                            )}

                            {step === 1 && <WizardStep1 data={formData} setData={setFormData} onNext={() => setStep(2)} />}
                            {step === 2 && <WizardStep2 data={formData} setData={setFormData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                            {step === 3 && <WizardStep3 data={formData} setData={setFormData} onGenerate={handleGenerate} loading={loading} />}
                        </div>
                    </div>
                )}

                {/* PLAN VIEW */}
                {viewMode === 'create' && step === 4 && curriculum && (
                    <div id="curriculum-plan-area" className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 print:max-w-full">
                        {/* Summary Header */}
                        <div className="bg-indigo-600 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:shadow-none print:rounded-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 print:hidden"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold mb-2 border border-white/20 print:bg-gray-200 print:text-black">
                                        {curriculum.durationDays} Günlük Plan
                                    </div>
                                    <h1 className="text-4xl font-black mb-2">{curriculum.studentName}'in Programı</h1>
                                    <p className="opacity-80 text-lg">{curriculum.grade} • {formData.diagnosis}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mt-6">
                                        {curriculum.goals.map((goal, i) => (
                                            <span key={i} className="px-3 py-1 bg-indigo-800/50 rounded-lg text-xs font-bold border border-indigo-400/30 flex items-center gap-2 print:bg-gray-100 print:text-black print:border-gray-300">
                                                <i className="fa-solid fa-bullseye print:hidden"></i> {goal}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 max-w-sm print:bg-gray-50 print:border-gray-200">
                                    <p className="text-sm italic opacity-90"><i className="fa-solid fa-quote-left mr-2"></i>{curriculum.note}</p>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Calendar Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 print:grid-cols-2 print:gap-4">
                            {curriculum.schedule.map((day, idx) => (
                                <DayCard 
                                    key={day.day} 
                                    day={day} 
                                    onRegenerate={() => handleRegenerateDay(idx)} 
                                    onToggleActivity={handleToggleActivity}
                                    onSelectActivity={onSelectActivity}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
            
            <ShareModal 
                isOpen={isShareModalOpen} 
                onClose={() => setIsShareModalOpen(false)} 
                onShare={handleShare} 
                worksheetTitle={`${curriculum?.studentName} Eğitim Planı`} 
            />
        </div>
    );
};
