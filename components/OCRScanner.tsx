
import React, { useState, useRef } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { ACTIVITIES } from '../constants';
import { generateFromRichPrompt } from '../services/generators/newActivities';
import { generateAlgorithmGeneratorFromAI } from '../services/generators/algorithm';

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.65, borderColor: '#d4d4d8', borderWidth: 1, margin: 5, columns: 1, gap: 10,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'Lexend', lineHeight: 1.4,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: false, showFooter: true, smartPagination: true,
    wordSpacing: 2, paragraphSpacing: 24, rulerHeight: 80, focusMode: false, rulerColor: '#6366f1', maskOpacity: 0.4
};

const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > h) { if (w > 1200) { h *= 1200 / w; w = 1200; } }
                else { if (h > 1200) { w *= 1200 / h; h = 1200; } }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    });
};

export const OCRScanner: React.FC<{ onBack: () => void; onResult: (data: any) => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'selection' | 'processing' | 'studio' | 'generating' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [scanMode, setScanMode] = useState<'CONVERTER' | 'ALGORITHM'>('CONVERTER');
    
    const [config, setConfig] = useState({
        activityType: '' as ActivityType, title: '', topic: '', difficulty: 'Orta', itemCount: 6, instructions: ''
    });

    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const processedImage = await resizeImage(file);
            setImage(processedImage);
            setStep('selection');
        }
    };

    const startAnalysis = async (mode: 'CONVERTER' | 'ALGORITHM') => {
        setScanMode(mode);
        setStep('processing');
        try {
            const result = await ocrService.processImage(image!, mode);
            setConfig({
                activityType: result.baseType as ActivityType,
                title: result.title || (mode === 'ALGORITHM' ? 'Yeni Algoritma' : 'Yeni Klon Etkinlik'),
                topic: result.description || 'Görsel Analiz',
                difficulty: 'Orta',
                itemCount: mode === 'ALGORITHM' ? 6 : 10,
                instructions: result.generatedTemplate || ''
            });
            setStep('studio');
        } catch (error) {
            alert("Analiz hatası: " + (error instanceof Error ? error.message : "Bilinmeyen hata"));
            setStep('upload');
        }
    };

    const handleGenerate = async () => {
        setStep('generating');
        try {
            const options: GeneratorOptions = {
                topic: config.topic, difficulty: config.difficulty as any,
                itemCount: config.itemCount, worksheetCount: 1, mode: 'ai'
            };

            let result;
            if (scanMode === 'ALGORITHM') {
                result = await generateAlgorithmGeneratorFromAI(options);
            } else {
                result = await generateFromRichPrompt(config.activityType, config.instructions, options);
            }

            if (result) {
                setFinalWorksheetData(Array.isArray(result) ? result : [result]);
                setStep('preview');
            }
        } catch (e) {
            alert("İçerik üretilemedi. Blueprint karmaşık gelmiş olabilir.");
            setStep('studio');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden text-zinc-100 font-lexend">
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-50">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-zinc-700 transition-all"><i className="fa-solid fa-arrow-left"></i></button>
                <h2 className="text-sm font-black tracking-widest uppercase flex items-center gap-2"><i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> AI TASARIM KLONLAYICI</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-hidden">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_#1e1b4b_0%,_transparent_70%)]">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl rotate-3"><i className="fa-solid fa-camera"></i></div>
                        <h1 className="text-4xl font-black mb-4">Materyalini Dijitalleştir</h1>
                        <p className="text-zinc-500 mb-10 text-center max-w-md">Bir fotoğraf yükleyin, AI onu analiz edip yepyeni bir eğitim materyali veya algoritma olarak yeniden inşa etsin.</p>
                        <button onClick={() => fileInputRef.current?.click()} className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl">GÖRSEL SEÇİN</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'selection' && (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <img src={image!} className="h-48 rounded-2xl border-4 border-zinc-800 mb-10 shadow-2xl" />
                        <h3 className="text-2xl font-black mb-8">Bu görseli neye dönüştürelim?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                            <button onClick={() => startAnalysis('CONVERTER')} className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-3xl hover:border-indigo-500 transition-all group text-left">
                                <i className="fa-solid fa-file-invoice text-4xl text-indigo-500 mb-4"></i>
                                <h4 className="text-xl font-black mb-2">Çalışma Sayfası</h4>
                                <p className="text-zinc-500 text-sm">Görseldeki düzeni korur, benzer pedagojik mantıkla yeni sorular üretir.</p>
                            </button>
                            <button onClick={() => startAnalysis('ALGORITHM')} className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-3xl hover:border-emerald-500 transition-all group text-left">
                                <i className="fa-solid fa-code-fork text-4xl text-emerald-500 mb-4"></i>
                                <h4 className="text-xl font-black mb-2">Mantık Algoritması</h4>
                                <p className="text-zinc-500 text-sm">Görseldeki adımları bir karar akış şemasına ve sıralı probleme dönüştürür.</p>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-2xl font-black animate-pulse">MİMARİ ÇÖZÜMLENİYOR...</h3>
                    </div>
                )}

                {step === 'studio' && (
                    <div className="h-full p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
                        <div className="flex-1 bg-zinc-900 rounded-[2.5rem] p-8 overflow-y-auto custom-scrollbar border border-zinc-800 shadow-2xl">
                            <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-6">KLONLAMA PARAMETRELERİ</h3>
                            <div className="space-y-6">
                                <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Başlık</label><input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full bg-black border border-zinc-800 p-4 rounded-xl font-bold text-white outline-none focus:border-indigo-500" /></div>
                                <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">AI Blueprint (Teknik Veri)</label><textarea value={config.instructions} onChange={e => setConfig({...config, instructions: e.target.value})} className="w-full h-48 bg-black border border-zinc-800 p-4 rounded-xl font-mono text-xs text-emerald-500 outline-none focus:border-indigo-500 resize-none" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-black/40 rounded-xl">
                                        <label className="text-[9px] font-bold text-zinc-500 mb-2 block">ZORLUK</label>
                                        <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value})} className="bg-transparent font-bold w-full outline-none"><option>Başlangıç</option><option>Orta</option><option>Zor</option></select>
                                    </div>
                                    <div className="p-4 bg-black/40 rounded-xl">
                                        <label className="text-[9px] font-bold text-zinc-500 mb-2 block">ÖĞE ADEDİ</label>
                                        <input type="number" value={config.itemCount} onChange={e => setConfig({...config, itemCount: Number(e.target.value)})} className="bg-transparent font-bold w-full outline-none" />
                                    </div>
                                </div>
                                <button onClick={handleGenerate} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95">DİJİTAL VARYASYONU ÜRET</button>
                            </div>
                        </div>
                        <div className="hidden md:flex w-1/3 bg-black rounded-[2.5rem] border border-zinc-800 items-center justify-center p-6 relative overflow-hidden group">
                            <div className="absolute top-4 left-4 bg-zinc-900 text-[8px] font-black px-2 py-1 rounded border border-zinc-700">ORİJİNAL KAYNAK</div>
                            <img src={image!} className="max-w-full max-h-full object-contain rounded-xl opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-6"><div className="h-full bg-indigo-500 animate-progress"></div></div>
                        <h3 className="text-2xl font-black">AI VARYASYON İNŞA EDİLİYOR...</h3>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="h-full overflow-y-auto p-12 flex justify-center bg-[#050505] custom-scrollbar">
                        <div className="scale-[0.9] origin-top shadow-2xl rounded-3xl overflow-hidden bg-white">
                             <Worksheet activityType={config.activityType} data={finalWorksheetData} settings={PREVIEW_SETTINGS} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
