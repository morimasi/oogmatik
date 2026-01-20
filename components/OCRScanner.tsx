
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
    showTitle: true, showInstruction: true, showImage: false, showFooter: true, smartPagination: true,
    // Added missing properties for StyleSettings
    wordSpacing: 2,
    paragraphSpacing: 24,
    rulerHeight: 80,
    // Clinical Accessibility
    focusMode: false,
    rulerColor: '#6366f1',
    maskOpacity: 0.4
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
                const MAX_WIDTH = 1500; 
                const MAX_HEIGHT = 1500;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
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
        topic: 'Görsel Analiz ve Klonlama',
        difficulty: 'Orta',
        itemCount: 10,
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
                itemCount: 10,
                instructions: result.generatedTemplate || '',
                layoutHint: result.structuredData?.layoutHint
            });
            setStep('studio');
        } catch (error) {
            alert("Mimari analiz başarısız oldu. Lütfen daha net bir görsel yükleyin.");
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
            alert("İçerik üretilirken hata oluştu. Blueprint geçersiz olabilir.");
            setStep('studio');
        }
    };

    const handleSave = async () => {
        if (!user || !finalWorksheetData) return;
        setIsSaving(true);
        try {
            await worksheetService.saveWorksheet(
                user.id, config.title, config.activityType, finalWorksheetData, 
                'fa-solid fa-wand-sparkles', { id: 'cloned', title: 'AI Klonlanmış' }
            );
            alert("Dijital ikiz başarıyla arşivlendi.");
            onBack();
        } catch(e) { alert("Kaydetme hatası."); }
        finally { setIsSaving(false); }
    };

    const [isSaving, setIsSaving] = useState(false);

    return (
        <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden text-zinc-100 font-lexend">
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 shadow-2xl relative z-50">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-all active:scale-90">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-sm font-black flex items-center gap-2 tracking-widest uppercase">
                            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> AI TASARIM KLONLAYICI
                        </h2>
                        {step === 'studio' && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">MİMARİ DNA ÇÖZÜLDÜ</span>}
                    </div>
                </div>

                {step === 'preview' && (
                    <div className="flex gap-3">
                         <button onClick={() => setStep('studio')} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all border border-zinc-700">Düzenle</button>
                         <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50">
                             {isSaving ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : <i className="fa-solid fa-floppy-disk mr-2"></i>}
                             DİJİTAL İKİZİ KAYDET
                         </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-hidden relative">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
                        <div className="text-center mb-12 animate-in fade-in slide-in-from-top-6 duration-1000">
                             <div className="w-28 h-28 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-indigo-500/40 border-4 border-white/10 transform -rotate-6">
                                 <i className="fa-solid fa-camera-retro text-white"></i>
                             </div>
                             <h1 className="text-5xl font-black tracking-tighter mb-4">Maddi Materyali Dijitalleştir</h1>
                             <p className="text-zinc-400 max-w-xl mx-auto text-lg leading-relaxed font-medium">Elinizdeki herhangi bir çalışma sayfasının fotoğrafını yükleyin. AI, sayfa düzenini (Layout) analiz eder ve tamamen yeni sorularla dijital bir varyasyonunu üretir.</p>
                        </div>

                        <div className="w-full max-w-3xl aspect-video border-4 border-dashed border-zinc-800 hover:border-indigo-50 rounded-[4rem] flex flex-col items-center justify-center cursor-pointer transition-all group bg-zinc-900/40 backdrop-blur-xl relative overflow-hidden shadow-2xl" onClick={() => fileInputRef.current?.click()}>
                            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                    <i className="fa-solid fa-cloud-arrow-up text-4xl text-zinc-600 group-hover:text-indigo-400"></i>
                                </div>
                                <h3 className="text-3xl font-black text-zinc-300 group-hover:text-white transition-colors">Görsel (JPG/PNG) Seçin</h3>
                                <p className="text-zinc-500 mt-3 text-sm font-bold uppercase tracking-widest">Yapay Zeka Mimarisi Sizi Bekliyor</p>
                            </div>
                            
                            <div className="absolute bottom-8 flex gap-8">
                                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]"><i className="fa-solid fa-microscope text-indigo-500"></i> Düzen Analizi</div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]"><i className="fa-solid fa-shuffle text-indigo-500"></i> Soru Klonlama</div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]"><i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> Sınırsız Varyasyon</div>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 mb-10">
                             <div className="absolute inset-0 border-8 border-indigo-900/20 rounded-full"></div>
                             <div className="absolute inset-0 border-8 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <i className="fa-solid fa-fingerprint text-5xl text-indigo-500 animate-pulse"></i>
                             </div>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight mb-3">Mimari DNA Çözümleniyor</h3>
                        <p className="text-zinc-500 animate-pulse uppercase text-xs font-black tracking-[0.4em]">Gemini 3.0 Multimodal Vision</p>
                    </div>
                )}

                {step === 'studio' && (
                    <div className="h-full flex flex-col lg:flex-row p-8 gap-8 overflow-hidden">
                        <div className="flex-1 bg-[#18181b] rounded-[3.5rem] p-10 border border-zinc-800 overflow-y-auto custom-scrollbar shadow-2xl relative">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em] flex items-center gap-3">
                                    <i className="fa-solid fa-swatchbook"></i> TASARIM blueprint
                                </h3>
                                {config.layoutHint && (
                                    <div className="flex gap-3">
                                        <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-zinc-700">{config.layoutHint.structure}</span>
                                        <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-zinc-700">{config.layoutHint.columns} Kolon</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-10">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest">Aktivite Modülü Adı</label>
                                    <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full p-5 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] font-black text-2xl text-white outline-none focus:ring-2 ring-indigo-500/40 transition-all shadow-inner" />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-4 tracking-widest flex justify-between">
                                        <span>AI ÜRETİM ALGORİTMASI</span>
                                        <span className="text-emerald-500">MİMARİ KİLİTLENDİ</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">DİJİTAL MİMARİ</div>
                                        <textarea 
                                            value={config.instructions} 
                                            onChange={e => setConfig({...config, instructions: e.target.value})} 
                                            className="w-full h-80 p-6 bg-black border border-zinc-800 rounded-[2.5rem] font-mono text-sm text-emerald-400 outline-none resize-none leading-relaxed focus:border-indigo-500 transition-all custom-scrollbar shadow-2xl" 
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-4 italic font-medium">* Yukarıdaki teknik yönerge, orijinal görselin pedagojik mantığını dijitalleştirmiştir.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 bg-zinc-900/50 rounded-[1.5rem] border border-zinc-800">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3">Zorluk Katmanı</label>
                                        <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})} className="w-full bg-transparent font-black text-base outline-none cursor-pointer text-zinc-200">
                                            <option value="Başlangıç">Başlangıç</option>
                                            <option value="Orta">Orta Seviye</option>
                                            <option value="Zor">Zor (İleri)</option>
                                            <option value="Uzman">Uzman (Analitik)</option>
                                        </select>
                                    </div>
                                    <div className="p-5 bg-zinc-900/50 rounded-[1.5rem] border border-zinc-800">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase mb-3">Öğe Adedi</label>
                                        <input type="number" value={config.itemCount} onChange={e => setConfig({...config, itemCount: Number(e.target.value)})} className="w-full bg-transparent font-black text-base outline-none text-zinc-200" />
                                    </div>
                                </div>

                                <button onClick={handleGenerate} className="w-full py-7 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-900/60 transition-all transform active:scale-[0.98] flex items-center justify-center gap-5 text-xl group">
                                    <i className="fa-solid fa-wand-magic-sparkles text-2xl group-hover:rotate-12 transition-transform"></i> YENİ VARYASYONU İNŞA ET
                                </button>
                            </div>
                        </div>

                        <div className="w-[480px] hidden xl:flex flex-col gap-8 shrink-0">
                            <div className="flex-1 bg-black rounded-[3.5rem] border-4 border-zinc-800 items-center justify-center p-8 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-8 left-8 z-10 flex gap-3">
                                    <span className="text-[10px] font-black bg-zinc-900/90 backdrop-blur-md text-zinc-400 px-4 py-2 rounded-full uppercase border border-white/5">Orijinal Kaynak</span>
                                    {config.layoutHint?.hasVisuals && <span className="text-[10px] font-black bg-emerald-600 text-white px-4 py-2 rounded-full uppercase shadow-xl shadow-emerald-500/20"><i className="fa-solid fa-image"></i> Görsel Algılandı</span>}
                                </div>
                                <img src={image!} className="max-w-full max-h-full object-contain rounded-3xl opacity-50 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-[1.03]" />
                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-zinc-900/90 backdrop-blur-xl rounded-[2rem] border border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-8 group-hover:translate-y-0">
                                     <p className="text-xs font-bold text-zinc-300 leading-relaxed uppercase tracking-widest text-center">Görselin mimarisi korundu.<br/>İçerik AI ile yeniden doğacak.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center bg-[#09090b]">
                         <div className="w-96 h-2 bg-zinc-900 rounded-full overflow-hidden mb-10 shadow-inner">
                             <div className="h-full bg-indigo-500 animate-progress"></div>
                         </div>
                        <h3 className="text-4xl font-black tracking-tight mb-4">Varyasyon İnşa Ediliyor</h3>
                        <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.5em]">Tasarım klonlama süreci %85...</p>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="h-full overflow-y-auto p-16 flex justify-center bg-[#0d0d0f] custom-scrollbar bg-[radial-gradient(circle_at_top,_#1e1e24_0%,_#0d0d0f_100%)]">
                         <div className="scale-[0.95] origin-top shadow-[0_80px_150px_-40px_rgba(0,0,0,0.9)] rounded-[3rem] overflow-hidden border-8 border-zinc-800 bg-white">
                            <Worksheet activityType={config.activityType} data={finalWorksheetData} settings={PREVIEW_SETTINGS} />
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};
