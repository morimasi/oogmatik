
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
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string) => void;
}

// Wizard Step 1: Basic Info
const WizardStep1: React.FC<{ data: any, setData: any, onNext: () => void }> = ({ data, setData, onNext }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
                Öğrenci Profili
            </h3>
            
            <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">Ad Soyad</label>
                <input 
                    type="text" 
                    value={data.name} 
                    onChange={e => setData({...data, name: e.target.value})}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                    placeholder="Örn: Ali Yılmaz"
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">Yaş</label>
                    <input 
                        type="number" 
                        value={data.age} 
                        onChange={e => setData({...data, age: Number(e.target.value)})}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">Sınıf Seviyesi</label>
                    <select 
                        value={data.grade} 
                        onChange={e => setData({...data, grade: e.target.value})}
                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                    >
                        {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf'].map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">Tanı / Özel Durum</label>
                <select 
                    value={data.diagnosis} 
                    onChange={e => setData({...data, diagnosis: e.target.value})}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                >
                    <option value="Disleksi (Okuma Güçlüğü)">Disleksi (Okuma Güçlüğü)</option>
                    <option value="Diskalkuli (Matematik Güçlüğü)">Diskalkuli (Matematik Güçlüğü)</option>
                    <option value="DEHB (Dikkat Eksikliği)">DEHB (Dikkat Eksikliği)</option>
                    <option value="Disgrafi (Yazma Güçlüğü)">Disgrafi (Yazma Güçlüğü)</option>
                    <option value="Genel Öğrenme Güçlüğü">Genel Öğrenme Güçlüğü</option>
                </select>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    onClick={onNext}
                    disabled={!data.name}
                    className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    Devam Et <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

// Wizard Step 2: Specifics
const WizardStep2: React.FC<{ data: any, setData: any, onNext: () => void, onBack: () => void }> = ({ data, setData, onNext, onBack }) => {
    const [interestInput, setInterestInput] = useState('');
    const [weaknessInput, setWeaknessInput] = useState('');

    const addTag = (type: 'interests' | 'weaknesses', val: string) => {
        if (!val.trim()) return;
        setData({ ...data, [type]: [...data[type], val.trim()] });
    };

    const removeTag = (type: 'interests' | 'weaknesses', idx: number) => {
        const newTags = [...data[type]];
        newTags.splice(idx, 1);
        setData({ ...data, [type]: newTags });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                İlgi ve İhtiyaçlar
            </h3>

            <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">Zayıf Yönler / Destek Gerekenler</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        value={weaknessInput}
                        onChange={e => setWeaknessInput(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter') { addTag('weaknesses', weaknessInput); setWeaknessInput(''); } }}
                        className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="Örn: b/d karıştırma, çarpım tablosu..."
                    />
                    <button onClick={() => { addTag('weaknesses', weaknessInput); setWeaknessInput(''); }} className="px-4 bg-zinc-200 dark:bg-zinc-700 rounded-xl hover:bg-zinc-300 transition-colors"><i className="fa-solid fa-plus"></i></button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.weaknesses.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-full text-sm font-bold flex items-center gap-2">
                            {tag} <button onClick={() => removeTag('weaknesses', i)} className="hover:text-red-800">×</button>
                        </span>
                    ))}
                    {data.weaknesses.length === 0 && <span className="text-xs text-zinc-400 italic">Henüz eklenmedi.</span>}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase mb-2">İlgi Alanları (Motivasyon İçin)</label>
                <div className="flex gap-2 mb-3">
                    <input 
                        type="text" 
                        value={interestInput}
                        onChange={e => setInterestInput(e.target.value)}
                        onKeyDown={e => { if(e.key === 'Enter') { addTag('interests', interestInput); setInterestInput(''); } }}
                        className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="Örn: Uzay, Dinozorlar, Futbol..."
                    />
                    <button onClick={() => { addTag('interests', interestInput); setInterestInput(''); }} className="px-4 bg-zinc-200 dark:bg-zinc-700 rounded-xl hover:bg-zinc-300 transition-colors"><i className="fa-solid fa-plus"></i></button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.interests.map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-full text-sm font-bold flex items-center gap-2">
                            {tag} <button onClick={() => removeTag('interests', i)} className="hover:text-green-800">×</button>
                        </span>
                    ))}
                    {data.interests.length === 0 && <span className="text-xs text-zinc-400 italic">Henüz eklenmedi.</span>}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <button onClick={onBack} className="px-6 py-3 text-zinc-500 hover:text-zinc-800 font-bold transition-colors">Geri</button>
                <button 
                    onClick={onNext}
                    className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    Devam Et <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

// Wizard Step 3: Finalize
const WizardStep3: React.FC<{ data: any, setData: any, onGenerate: () => void, loading: boolean }> = ({ data, setData, onGenerate, loading }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 text-center">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-6 flex items-center justify-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
                Program Süresi
            </h3>

            <div className="max-w-sm mx-auto">
                <label className="block text-sm font-bold text-zinc-500 uppercase mb-4">Kaç Günlük Plan?</label>
                <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-900 p-2 rounded-2xl">
                    <button 
                        onClick={() => setData({...data, duration: Math.max(1, data.duration - 1)})}
                        className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center text-xl hover:scale-105 transition-transform"
                    >
                        -
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-3xl font-black text-indigo-600">{data.duration}</span>
                        <span className="text-xs font-bold text-zinc-400 block uppercase">GÜN</span>
                    </div>
                    <button 
                        onClick={() => setData({...data, duration: Math.min(30, data.duration + 1)})}
                        className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center text-xl hover:scale-105 transition-transform"
                    >
                        +
                    </button>
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm leading-relaxed max-w-lg mx-auto">
                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                Yapay zeka, <strong>{data.name}</strong> için <strong>{data.diagnosis}</strong> ihtiyaçlarına uygun, <strong>{data.interests.length > 0 ? data.interests.join(', ') : 'Genel'}</strong> ilgi alanlarını içeren <strong>{data.duration}</strong> günlük bir program hazırlayacak.
            </div>

            <button 
                onClick={onGenerate}
                disabled={loading}
                className="w-full max-w-sm mx-auto py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
                {loading ? (
                    <>
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                        Program Hazırlanıyor...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-bolt"></i>
                        SİHİRLİ PROGRAMI OLUŞTUR
                    </>
                )}
            </button>
        </div>
    );
};

// --- PLAN COMPONENTS ---

const DayCard: React.FC<{ day: CurriculumDay, onRegenerate: () => void, onToggleActivity: (day: number, actId: string) => void, onStartActivity: (actId: string, actType: string, title: string) => void }> = ({ day, onRegenerate, onToggleActivity, onStartActivity }) => {
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
                                onClick={() => onStartActivity(act.id, act.activityId, act.title)}
                                className="mt-3 w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-95 print:hidden"
                            >
                                <i className="fa-solid fa-play"></i> Hemen Üret
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const CurriculumView: React.FC<CurriculumViewProps> = ({ onBack, onSelectActivity, onStartCurriculumActivity }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(0); 
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
            
            // AUTO SAVE LOGIC
            if (user) {
                const savedId = await curriculumService.saveCurriculum(user.id, result);
                result.id = savedId; // Update with Firebase ID
                setIsSaved(true);
            } else {
                setIsSaved(false);
            }
            
            setCurriculum(result);
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
            
            const updatedCurriculum = { ...curriculum, schedule: newSchedule };
            setCurriculum(updatedCurriculum);
            
            // AUTO SAVE UPDATE
            if (user && curriculum.id) {
                await curriculumService.updateCurriculum(curriculum.id, { schedule: newSchedule });
            }
        } catch (e) {
            alert("Yenileme başarısız.");
        }
    };

    const handleToggleActivity = async (dayNum: number, actId: string) => {
        if (!curriculum) return;
        
        let newStatus = 'pending';
        
        const newSchedule = curriculum.schedule.map(d => {
            if (d.day === dayNum) {
                const activities = d.activities.map(a => {
                    if (a.id === actId) {
                        newStatus = a.status === 'completed' ? 'pending' : 'completed';
                        return { ...a, status: newStatus };
                    }
                    return a;
                });
                return { ...d, activities: activities as any }; // Status update
            }
            return d;
        });
        
        setCurriculum({ ...curriculum, schedule: newSchedule });

        // AUTO SAVE STATUS
        if (user && curriculum.id) {
            try {
                await curriculumService.updateActivityStatus(curriculum.id, dayNum, actId, newStatus as any);
            } catch (e) {
                console.error("Status update sync failed", e);
            }
        }
    };

    const handleSave = async () => {
        // Backup Manual Save (if automatic failed or guest login later)
        if (!user) {
            alert("Kaydetmek için lütfen giriş yapın.");
            return;
        }
        if (!curriculum) return;
        
        try {
            const savedId = await curriculumService.saveCurriculum(user.id, curriculum);
            setCurriculum({ ...curriculum, id: savedId });
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
        setIsSaved(true); // Already saved since loaded from DB
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
                                {isSaved ? <><i className="fa-solid fa-check"></i> Otomatik Kaydedildi</> : <><i className="fa-solid fa-save"></i> Kaydet</>}
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

                {/* CREATE WIZARD (WizardStep1, 2, 3...) - Same as before */}
                {viewMode === 'create' && step < 4 && (
                    <div className="max-w-2xl mx-auto mt-8">
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2, 3].map(s => (
                                <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>
                            ))}
                        </div>
                        
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
                             {/* Content from previous implementation... */}
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
                        {/* Summary Header (Same as before) */}
                        <div className="bg-indigo-600 text-white rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-b-2 print:shadow-none print:rounded-none">
                            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-start">
                                <div>
                                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold mb-2 border border-white/20 print:bg-gray-200 print:text-black">
                                        {curriculum.durationDays} Günlük Plan
                                    </div>
                                    <h1 className="text-4xl font-black mb-2">{curriculum.studentName}'in Programı</h1>
                                    <p className="opacity-80 text-lg">{curriculum.grade} • {formData.diagnosis}</p>
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
                                    onStartActivity={(actId, actType, title) => onStartCurriculumActivity(curriculum.id, day.day, actId, actType, curriculum.studentName, title)}
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
