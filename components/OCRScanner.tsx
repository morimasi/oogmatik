
import React, { useState, useRef, useEffect } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';
import { generateFromRichPrompt } from '../services/generators/newActivities';

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.6, borderColor: '#d4d4d8', borderWidth: 1, margin: 5, columns: 1, gap: 10,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'Lexend', lineHeight: 1.4,
    letterSpacing: 0, showPedagogicalNote: false, showMascot: false, showStudentInfo: false,
    showTitle: true, showInstruction: true, showImage: false, showFooter: false, smartPagination: true
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
                const MAX_WIDTH = 1024; 
                const MAX_HEIGHT = 1024;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
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
        topic: '',
        difficulty: 'Orta',
        itemCount: 10,
        instructions: ''
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
                title: result.title || 'Görselden Üretilen Etkinlik',
                topic: 'Görsel Analiz',
                difficulty: 'Orta',
                itemCount: 10,
                instructions: result.generatedTemplate || ''
            });
            setStep('studio');
        } catch (error) {
            alert("Analiz başarısız oldu. Lütfen daha net bir görsel yükleyin.");
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
            alert("İçerik üretilirken hata oluştu.");
            setStep('studio');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#121212] absolute inset-0 z-50 overflow-hidden text-zinc-200">
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 className="text-lg font-black flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i> AI Tasarım Klonlayıcı
                    </h2>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
                        <div className="mb-8 flex gap-3 p-1.5 bg-zinc-900 rounded-2xl border border-zinc-800">
                            <button onClick={() => setScanMode('CONVERTER')} className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${scanMode==='CONVERTER'?'bg-indigo-600 text-white shadow-lg':'text-zinc-500'}`}>Materyal Dönüştürücü</button>
                            <button onClick={() => setScanMode('ALGORITHM')} className={`px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${scanMode==='ALGORITHM'?'bg-indigo-600 text-white shadow-lg':'text-zinc-500'}`}>Algoritma Analizörü</button>
                        </div>
                        <div className="w-full max-w-xl aspect-video border-4 border-dashed border-zinc-800 hover:border-indigo-500 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all group bg-zinc-900/40" onClick={() => fileInputRef.current?.click()}>
                            <i className="fa-solid fa-cloud-arrow-up text-5xl text-zinc-700 group-hover:text-indigo-500 mb-6 transition-colors"></i>
                            <h3 className="text-xl font-black"> JPG / PNG Yükleyin</h3>
                            <p className="text-zinc-500 mt-2 text-sm text-center px-10">Gemini 3.0 Flash görsel mimariyi saniyeler içinde çözecektir.</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-20 h-20 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold">Görsel Analiz Ediliyor...</h3>
                    </div>
                )}

                {step === 'studio' && (
                    <div className="h-full flex flex-col lg:flex-row p-6 gap-6 overflow-hidden">
                        <div className="flex-1 bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-800 overflow-y-auto custom-scrollbar">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-6">Stüdyo Kontrolü</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">Aktivite Başlığı</label>
                                    <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-2xl font-bold text-white outline-none focus:ring-2 ring-indigo-500/50" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase mb-2">AI Talimatları (Mimarisi)</label>
                                    <textarea value={config.instructions} onChange={e => setConfig({...config, instructions: e.target.value})} className="w-full h-64 p-4 bg-black border border-zinc-800 rounded-2xl font-mono text-sm text-emerald-400 outline-none resize-none leading-relaxed" />
                                </div>
                                <button onClick={handleGenerate} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI İLE YENİDEN İNŞA ET
                                </button>
                            </div>
                        </div>
                        <div className="w-96 hidden lg:flex bg-black rounded-[2.5rem] border border-zinc-800 items-center justify-center p-4 relative">
                            <span className="absolute top-6 left-6 text-[9px] font-black bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full uppercase">Kaynak Görsel</span>
                            <img src={image!} className="max-w-full max-h-full object-contain rounded-xl opacity-70" />
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-6"><div className="h-full bg-indigo-500 animate-progress"></div></div>
                        <h3 className="text-xl font-bold">Yeni Materyal Oluşturuluyor...</h3>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="h-full overflow-y-auto p-12 flex justify-center bg-zinc-950 custom-scrollbar">
                         <div className="scale-[0.85] origin-top shadow-2xl">
                            <Worksheet activityType={config.activityType} data={finalWorksheetData} settings={PREVIEW_SETTINGS} />
                         </div>
                    </div>
                )}
            </div>
        </div>
    );
};
