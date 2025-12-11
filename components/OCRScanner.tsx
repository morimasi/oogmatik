
import React, { useState, useRef } from 'react';
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
import { adminService } from '../services/adminService';

interface OCRScannerProps {
    onBack: () => void;
    onResult: (data: any) => void;
}

// Helper: PascalCase converter for generator mapping
const toPascalCase = (str: string): string => {
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

// Default Styles for Preview
const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.6, borderColor: '#d4d4d8', borderWidth: 1, margin: 20, columns: 1, gap: 16,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'OpenDyslexic', lineHeight: 1.5,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: true, showFooter: true, smartPagination: true
};

// Helper function to resize image client-side to avoid payload limits
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 600; 
                const MAX_HEIGHT = 600;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.5); 
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'studio' | 'generating' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    
    // Studio Config State
    const [config, setConfig] = useState({
        activityType: '' as ActivityType,
        title: '',
        topic: '',
        difficulty: 'Orta',
        itemCount: 10,
        worksheetCount: 1,
        instructions: '' // This holds the extracted algorithm
    });

    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const resizedImageBase64 = await resizeImage(file);
                setImage(resizedImageBase64);
                startAnalysis(resizedImageBase64);
            } catch (err) {
                console.error("Image resize failed", err);
                alert("Görsel işlenirken bir hata oluştu.");
            }
        }
    };

    const startAnalysis = async (imgData: string) => {
        setStep('processing');
        try {
            const result = await ocrService.processImage(imgData);
            setAnalysisResult(result);
            
            setConfig({
                activityType: result.baseType as ActivityType,
                title: result.title || 'Yeni Etkinlik',
                topic: result.structuredData?.topic || 'Genel',
                difficulty: result.structuredData?.difficulty || 'Orta',
                itemCount: result.structuredData?.itemCount || 10,
                worksheetCount: 1,
                instructions: result.generatedTemplate || ''
            });
            
            setStep('studio');
        } catch (error: any) {
            console.error("OCR Failed:", error);
            let msg = "Görsel analiz edilemedi. Lütfen daha net bir fotoğraf deneyin.";
            if (error.message && error.message.includes('kotası')) {
                msg = "Sistem şu an çok yoğun. Lütfen 1-2 dakika bekleyip tekrar deneyin.";
            }
            alert(msg);
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
                worksheetCount: config.worksheetCount,
                mode: 'ai'
            };

            let result = null;

            // Priority: Rich Prompt Generation (The Algorithm)
            if (config.instructions && config.instructions.length > 10) {
                 result = await generateFromRichPrompt(config.activityType, config.instructions, options);
            } else {
                 // Fallback to Standard
                const pascalName = toPascalCase(config.activityType);
                const generatorFnName = `generate${pascalName}FromAI`;
                const offlineFnName = `generateOffline${pascalName}`;
                
                // @ts-ignore
                const onlineGen = generators[generatorFnName];
                // @ts-ignore
                const offlineGen = offlineGenerators[offlineFnName];

                if (onlineGen) {
                    try { result = await onlineGen(options); } catch (e) { console.warn("Online gen failed, trying offline", e); }
                }
                if (!result && offlineGen) {
                    result = await offlineGen(options);
                }
            }

            if (result) {
                if (!Array.isArray(result)) result = [result];
                const finalized = result.map((page: any) => ({ ...page, title: config.title }));
                setFinalWorksheetData(finalized);
                setStep('preview');
            } else {
                throw new Error("Üretici fonksiyon bulunamadı.");
            }

        } catch (e) {
            console.error("Generation error", e);
            alert("İçerik üretilemedi. Ayarları kontrol edip tekrar deneyin.");
            setStep('studio');
        }
    };

    const handleSaveToArchive = async () => {
        if (!user || !finalWorksheetData) return;
        setIsSaving(true);
        try {
            await worksheetService.saveWorksheet(
                user.id,
                config.title,
                config.activityType,
                finalWorksheetData,
                'fa-solid fa-wand-magic-sparkles',
                { id: 'ocr', title: 'Akıllı Dönüşüm' },
                PREVIEW_SETTINGS
            );
            alert("Etkinlik arşivinize kaydedildi.");
        } catch (e) {
            console.error(e);
            alert("Kaydetme hatası.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // Saves the logic as a reusable template/algorithm
    const handleSaveAsTemplate = async () => {
        if (!user) {
             alert("Algoritmayı kaydetmek için giriş yapmalısınız.");
             return;
        }
        
        setIsSaving(true);
        try {
             await adminService.saveDraftActivity({
                 title: config.title,
                 description: analysisResult?.description || 'Algoritması çıkarılmış etkinlik.',
                 baseType: config.activityType,
                 customInstructions: config.instructions, // This saves the algorithm
                 defaultParams: {
                     topic: config.topic,
                     difficulty: config.difficulty,
                     itemCount: config.itemCount
                 },
                 createdBy: user.email
             });
             alert("Algoritma başarıyla YÖNETİCİ ONAYINA gönderildi. Onaylandıktan sonra 'Diğerleri' menüsünde yayınlanacaktır.");
        } catch (e) {
            console.error("Template save error", e);
            alert("Şablon kaydedilemedi.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handlePrint = () => {
        printService.generatePdf('.worksheet-item', config.title, { action: 'print' });
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 absolute inset-0 z-50">
            {/* TOP BAR */}
            <div className="h-16 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={step === 'preview' ? () => setStep('studio') : onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-camera-retro text-indigo-500"></i>
                            Etkinlik Dönüştürücü
                        </h2>
                        {step === 'studio' && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Algoritma Düzenleme</p>}
                    </div>
                </div>
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-zinc-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSaveToArchive} disabled={!user || isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50">
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save mr-2"></i>} Arşivle
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div 
                            className="w-full max-w-xl aspect-video border-4 border-dashed border-indigo-200 dark:border-zinc-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-zinc-800/50 hover:border-indigo-400 transition-all group bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-sm relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30 relative z-10">
                                <i className="fa-solid fa-wand-magic-sparkles text-4xl text-white"></i>
                            </div>
                            <h3 className="text-3xl font-black text-zinc-800 dark:text-white relative z-10">Etkinlik Yükle</h3>
                            <p className="text-zinc-500 mt-4 text-center px-12 text-sm leading-relaxed relative z-10">
                                Beğendiğiniz bir çalışma kağıdının fotoğrafını yükleyin.<br/>
                                Yapay zeka, görselin <strong>algoritmasını çözsün</strong> ve size sonsuz varyasyon üretsin.
                            </p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl">⚙️</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-white animate-pulse">Algoritma Çözümleniyor...</h3>
                        <p className="text-zinc-500 mt-2 text-center max-w-md">Pedagojik mantık ve görsel yapı analiz ediliyor.</p>
                    </div>
                )}

                {step === 'studio' && analysisResult && (
                    <div className="h-full flex flex-col md:flex-row bg-zinc-100 dark:bg-black">
                        {/* LEFT: Source Image Preview */}
                        <div className="hidden md:flex w-1/3 bg-zinc-900 items-center justify-center p-8 border-r border-zinc-800 relative overflow-hidden">
                            <img src={image!} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-4 border-white/10" />
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-bold">Kaynak</div>
                        </div>

                        {/* RIGHT: Configuration Studio */}
                        <div className="flex-1 p-8 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                            
                            <div className="mb-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-center gap-3 mb-2">
                                    <i className="fa-solid fa-robot text-indigo-600 text-xl"></i>
                                    <h3 className="font-bold text-indigo-900 dark:text-indigo-100">Algılanan Mantık</h3>
                                </div>
                                <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed italic">
                                    "{analysisResult.description}"
                                </p>
                            </div>

                            {/* Config Form */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Etkinlik Başlığı</label>
                                        <input 
                                            type="text" 
                                            value={config.title} 
                                            onChange={e => setConfig({...config, title: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Taban Kategori</label>
                                        <select 
                                            value={config.activityType}
                                            onChange={e => setConfig({...config, activityType: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {ACTIVITIES.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Konu</label>
                                        <input 
                                            type="text" 
                                            value={config.topic} 
                                            onChange={e => setConfig({...config, topic: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
                                        <select 
                                            value={config.difficulty}
                                            onChange={e => setConfig({...config, difficulty: e.target.value as any})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Adet</label>
                                        <input 
                                            type="number" 
                                            value={config.itemCount} 
                                            onChange={e => setConfig({...config, itemCount: Number(e.target.value)})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 flex justify-between">
                                        <span>Algoritma Mantığı (Prompt)</span>
                                        <span className="text-indigo-500 cursor-pointer hover:underline" onClick={() => alert("Buradaki metni değiştirerek yapay zekanın üretim mantığını özelleştirebilirsiniz.")}>Nasıl Çalışır?</span>
                                    </label>
                                    <textarea 
                                        value={config.instructions}
                                        onChange={e => setConfig({...config, instructions: e.target.value})}
                                        className="w-full p-4 bg-zinc-900 text-green-400 border border-zinc-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none h-48 resize-none shadow-inner"
                                        placeholder="AI üretim algoritması..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 flex flex-col md:flex-row gap-4">
                                <button 
                                    onClick={handleGenerate}
                                    className="flex-[2] py-4 bg-zinc-900 hover:bg-black text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <i className="fa-solid fa-file-invoice"></i>
                                    📄 Test Et & Üret
                                </button>
                                
                                <button 
                                    onClick={handleSaveAsTemplate}
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                                    title="Yönetici onayı için taslaklara gönder"
                                >
                                    <i className="fa-solid fa-paper-plane"></i>
                                    Yönetici Onayına Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black">
                        <div className="w-64 h-2 bg-zinc-200 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-indigo-500 animate-progress"></div>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white">İçerik Oluşturuluyor...</h3>
                        <p className="text-zinc-500 mt-2">Çözümlenen algoritma ile yeni varyasyonlar üretiliyor.</p>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-950 p-8 overflow-y-auto flex justify-center custom-scrollbar">
                        <div className="scale-[0.85] origin-top shadow-2xl">
                             <Worksheet 
                                activityType={config.activityType}
                                data={finalWorksheetData}
                                settings={PREVIEW_SETTINGS}
                                studentProfile={{ name: '', school: '', grade: '', date: '' }}
                             />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
