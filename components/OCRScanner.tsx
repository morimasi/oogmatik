
import React, { useState, useRef, useEffect } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { ACTIVITIES } from '../constants';
import { generateFromRichPrompt } from '../services/generators/newActivities';

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.65, borderColor: '#d4d4d8', borderWidth: 1, margin: 5, columns: 1, gap: 10,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'Lexend', lineHeight: 1.4,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: false, showFooter: true, smartPagination: true
};

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1200; 
                const MAX_HEIGHT = 1200;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const OCRScanner: React.FC<{ onBack: () => void; onResult: (data: any) => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'studio' | 'generating' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [scanMode, setScanMode] = useState<'CONVERTER' | 'ALGORITHM'>('CONVERTER');
    
    const [config, setConfig] = useState({
        activityType: '' as ActivityType,
        title: '',
        topic: 'Klonlanmış İçerik',
        difficulty: 'Orta',
        itemCount: 8,
        instructions: '',
        layoutHint: null as any
    });

    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processedImage = await resizeImage(file);
            setImage(processedImage);
            startAnalysis(processedImage);
        }
    };

    const startAnalysis = async (imgData: string) => {
        setStep('processing');
        try {
            const result = await ocrService.processImage(imgData, scanMode);
            setConfig({
                activityType: result.baseType as ActivityType,
                title: result.title || 'Yeni Klon Etkinlik',
                topic: 'Görsel Analiz',
                difficulty: 'Orta',
                itemCount: 8,
                instructions: result.generatedTemplate || '',
                layoutHint: result.structuredData?.layoutHint
            });
            setStep('studio');
        } catch (error) {
            alert("Analiz başarısız oldu. Lütfen daha net bir görsel kullanın.");
            setStep('upload');
        }
    };

    const handleGenerate = async () => {
        setStep('generating');
        try {
            const options: GeneratorOptions = {
                topic: config.topic,
                difficulty: config.difficulty as any,
                itemCount: config.itemCount,
                worksheetCount: 1,
                mode: 'ai',
                customInput: image || undefined 
            };

            const result = await generateFromRichPrompt(config.activityType, config.instructions, options);
            if (result) {
                setFinalWorksheetData(Array.isArray(result) ? result : [result]);
                setStep('preview');
            }
        } catch (e) {
            alert("İçerik üretilirken hata oluştu. Mimaride çelişki olabilir.");
            setStep('studio');
        }
    };

    const handleSave = async () => {
        if (!user || !finalWorksheetData) return;
        try {
            await worksheetService.saveWorksheet(
                user.id, config.title, config.activityType, finalWorksheetData, 
                'fa-solid fa-clone', { id: 'cloned', title: 'Klonlanmış' }
            );
            alert("Etkinlik arşive kaydedildi.");
            onBack();
        } catch(e) { alert("Kaydetme hatası."); }
    };

    return (
        <div className="h-full flex flex-col bg-[#09090b] absolute inset-0 z-50 overflow-hidden text-zinc-100 font-lexend">
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 shadow-2xl relative z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-all active:scale-90">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black flex items-center gap-2 tracking-tight">
                            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> AI TASARIM KLONLAYICI v2.0
                        </h2>
                        {step === 'studio' && <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Mimari Blueprint Hazır</span>}
                    </div>
                </div>

                {step === 'preview' && (
                    <div className="flex gap-3">
                         <button onClick={() => setStep('studio')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all">Düzenle</button>
                         <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 transition-all active:scale-95">ARŞİVE KAYDET</button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden relative">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                             <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-2xl shadow-indigo-500/40 border-4 border-white/10">
                                 <i className="fa-solid fa-camera-retro text-white"></i>
                             </div>
                             <h1 className="text-4xl font-black tracking-tight mb-3">Fizikseli Dijitale Dönüştür</h1>
                             <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">Elinizdeki herhangi bir çalışma sayfasının fotoğrafını çekin. AI, tasarımı ve mantığı analiz edip size yepyeni bir varyasyon üretsin.</p>
                        </div>

                        <div className="w-full max-w-2xl aspect-[4/3] md:aspect-video border-4 border-dashed border-zinc-800 hover:border-indigo-500 rounded-[3.5rem] flex flex-col items-center justify-center cursor-pointer transition-all group bg-zinc-900/30 backdrop-blur-sm relative overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <i className="fa-solid fa-cloud-arrow-up text-6xl text-zinc-700 group-hover:text-indigo-500 mb-6 transition-all group-hover:-translate-y-2"></i>
                            <h3 className="text-2xl font-black">Görsel Yükle</h3>
                            <p className="text-zinc-500 mt-2 text-sm">PNG, JPG veya WebP (Max 10MB)</p>
                            
                            <div className="mt-8 flex gap-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle text-indigo-500"></i> Mimari Analiz</div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle text-indigo-500"></i> Soru Klonlama</div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest"><i className="fa-solid fa-check-circle text-indigo-500"></i> Dinamik Varyasyon</div>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center bg-[#09090b]">
                        <div className="relative w-32 h-32 mb-8">
                             <div className="absolute inset-0 border-8 border-indigo-900/20 rounded-full"></div>
                             <div className="absolute inset-0 border-8 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <i className="fa-solid fa-microscope text-3xl text-indigo-500 animate-pulse"></i>
                             </div>
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Mimari Analiz Ediliyor</h3>
                        <p className="text-zinc-500 animate-pulse uppercase text-[10px] font-bold tracking-[0.3em]">Gemini 3.0 Multimodal Vision</p>
                    </div>
                )}

                {step === 'studio' && (
                    <div className="h-full flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
                        <div className="flex-1 bg-zinc-900 rounded-[3rem] p-8 border border-zinc-800 overflow-y-auto custom-scrollbar shadow-2xl relative">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">MİMARİ STÜDYO</h3>
                                {config.layoutHint && (
                                    <div className="flex gap-2">
                                        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-zinc-700">{config.layoutHint.structure}</span>
                                        <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-zinc-700">{config.layoutHint.columns} Kolon</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Aktivite Adı</label>
                                    <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl font-black text-xl text-white outline-none focus:ring-2 ring-indigo-500/30 transition-all" />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3 tracking-widest">Üretim Algoritması (Blueprint)</label>
                                    <div className="relative group">
                                        <div className="absolute -top-3 -right-3 bg-indigo-600 text-white p-2 rounded-xl text-xs font-black shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity">AI MANTIK TASLAĞI</div>
                                        <textarea 
                                            value={config.instructions} 
                                            onChange={e => setConfig({...config, instructions: e.target.value})} 
                                            className="w-full h-80 p-5 bg-black border border-zinc-800 rounded-3xl font-mono text-sm text-emerald-400 outline-none resize-none leading-relaxed focus:border-indigo-500 transition-all custom-scrollbar" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-3 italic">* Yukarıdaki teknik talimat, görseldeki pedagojik mantığı temsil eder. Düzenleyerek varyasyonu şekillendirebilirsiniz.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                                        <label className="block text-[9px] font-black text-zinc-500 uppercase mb-2">Zorluk Seviyesi</label>
                                        <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})} className="w-full bg-transparent font-bold text-sm outline-none cursor-pointer">
                                            <option value="Başlangıç">Başlangıç</option>
                                            <option value="Orta">Orta Seviye</option>
                                            <option value="Zor">Zor (İleri)</option>
                                            <option value="Uzman">Uzman (Analitik)</option>
                                        </select>
                                    </div>
                                    <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                                        <label className="block text-[9px] font-black text-zinc-500 uppercase mb-2">Soru/Öğe Adedi</label>
                                        <input type="number" value={config.itemCount} onChange={e => setConfig({...config, itemCount: Number(e.target.value)})} className="w-full bg-transparent font-bold text-sm outline-none" />
                                    </div>
                                </div>

                                <button onClick={handleGenerate} className="w-full py-6 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black rounded-3xl shadow-2xl shadow-indigo-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-4 text-lg">
                                    <i className="fa-solid fa-wand-magic-sparkles text-xl"></i> YENİ VARYASYONU ÜRET
                                </button>
                            </div>
                        </div>

                        <div className="w-[450px] hidden xl:flex flex-col gap-6 shrink-0">
                            <div className="flex-1 bg-black rounded-[3rem] border border-zinc-800 items-center justify-center p-6 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-6 left-6 z-10 flex gap-2">
                                    <span className="text-[9px] font-black bg-zinc-900/80 backdrop-blur-md text-zinc-400 px-3 py-1.5 rounded-full uppercase border border-white/5">Orijinal Kaynak</span>
                                    {config.layoutHint?.hasVisuals && <span className="text-[9px] font-black bg-emerald-500 text-white px-3 py-1.5 rounded-full uppercase shadow-lg shadow-emerald-500/20"><i className="fa-solid fa-image"></i> Görsel Algılandı</span>}
                                </div>
                                <img src={image!} className="max-w-full max-h-full object-contain rounded-2xl opacity-60 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.02]" />
                                <div className="absolute bottom-6 left-6 right-6 p-4 bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                                     <p className="text-[10px] font-medium text-zinc-400 leading-relaxed">Görselin mimarisi korundu, veriler (kelime, sayı, mantık) yapay zeka tarafından tamamen değiştirilecek.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center bg-[#09090b]">
                         <div className="w-80 h-1.5 bg-zinc-900 rounded-full overflow-hidden mb-8">
                             <div className="h-full bg-indigo-500 animate-progress"></div>
                         </div>
                        <h3 className="text-2xl font-black tracking-tight mb-2">Varyasyon İnşa Ediliyor</h3>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Klonlama süreci devam ediyor...</p>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="h-full overflow-y-auto p-12 flex justify-center bg-[#0d0d0f] custom-scrollbar bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-black">
                         <div className="scale-[0.9] origin-top shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] rounded-xl">
                            <Worksheet activityType={config.activityType} data={finalWorksheetData} settings={PREVIEW_SETTINGS} />
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};
