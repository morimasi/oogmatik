
import React, { useState, useRef } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { ACTIVITIES } from '../constants';
import * as generators from '../services/generators';
import * as offlineGenerators from '../services/offlineGenerators';

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

// Helper function to resize image client-side to avoid payload limits (Max 512px, 0.4 quality)
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 512;
                const MAX_HEIGHT = 512;
                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
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
    // Steps: upload -> processing -> studio (config) -> generating -> preview
    const [step, setStep] = useState<'upload' | 'processing' | 'studio' | 'generating' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    
    // Analyzed Data
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    
    // Studio Config State
    const [config, setConfig] = useState({
        activityType: '' as ActivityType,
        title: '',
        topic: '',
        difficulty: 'Orta',
        itemCount: 10,
        worksheetCount: 1,
        instructions: ''
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
            
            // Pre-fill config with AI suggestions
            setConfig({
                activityType: result.baseType as ActivityType,
                title: result.title || 'Yeni Etkinlik',
                topic: result.structuredData?.topic || 'Genel',
                difficulty: result.structuredData?.difficulty || 'Orta',
                itemCount: result.structuredData?.itemCount || 10,
                worksheetCount: 1,
                instructions: result.structuredData?.instructions || ''
            });
            
            setStep('studio');
        } catch (error) {
            console.error("OCR Failed:", error);
            alert("Görsel analiz edilemedi. Lütfen daha net bir fotoğraf deneyin veya görsel boyutunu kontrol edin.");
            setStep('upload');
        }
    };

    const handleGenerate = async () => {
        setStep('generating');
        
        try {
            // Dynamically call the correct generator
            const pascalName = toPascalCase(config.activityType);
            const generatorFnName = `generate${pascalName}FromAI`;
            const offlineFnName = `generateOffline${pascalName}`;
            
            // @ts-ignore
            const onlineGen = generators[generatorFnName];
            // @ts-ignore
            const offlineGen = offlineGenerators[offlineFnName];

            const options = {
                topic: config.topic,
                difficulty: config.difficulty,
                itemCount: config.itemCount,
                worksheetCount: config.worksheetCount,
                // Pass custom instructions as part of topic or specific prompt augmentation if supported
                // For now, we append it to topic to influence generation subtly
                customPrompt: config.instructions 
            };

            let result = null;
            
            // Try Online First
            if (onlineGen) {
                try {
                    result = await onlineGen(options);
                } catch (e) {
                    console.warn("Online gen failed, trying offline", e);
                }
            }
            
            // Fallback to Offline
            if (!result && offlineGen) {
                result = await offlineGen(options);
            }

            if (result) {
                // Override title with user choice
                const finalized = result.map((page: any) => ({ ...page, title: config.title }));
                setFinalWorksheetData(finalized);
                setStep('preview');
            } else {
                throw new Error("Üretici fonksiyon bulunamadı.");
            }

        } catch (e) {
            console.error("Generation error", e);
            alert("İçerik üretilemedi. Lütfen farklı bir aktivite türü seçin veya tekrar deneyin.");
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
            alert("Kaydetme sırasında hata oluştu.");
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
                            Stüdyo Modu
                        </h2>
                        {step === 'studio' && <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Analiz Tamamlandı • Yapılandırma</p>}
                    </div>
                </div>
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-zinc-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSaveToArchive} disabled={!user || isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50">
                            {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save mr-2"></i>} Kaydet
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div 
                            className="w-full max-w-lg aspect-video border-4 border-dashed border-indigo-200 dark:border-zinc-700 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-zinc-800/50 hover:border-indigo-400 transition-all group bg-white/50 dark:bg-zinc-900/50 shadow-xl backdrop-blur-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                                <i className="fa-solid fa-wand-magic-sparkles text-4xl text-white"></i>
                            </div>
                            <h3 className="text-2xl font-black text-zinc-800 dark:text-white">Sihirli Tarayıcı</h3>
                            <p className="text-zinc-500 mt-3 text-center px-12 text-sm leading-relaxed">
                                Bir çalışma kağıdının fotoğrafını yükleyin. Yapay zeka mantığını çözsün ve size <strong>sınırsız varyasyon</strong> üretebileceğiniz bir stüdyo açsın.
                            </p>
                            <span className="mt-6 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-700 flex items-center gap-2">
                                <i className="fa-solid fa-bolt text-amber-500"></i> Hızlı Mod (v2.5)
                            </span>
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
                                <span className="text-4xl">🧠</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-white animate-pulse">Analiz Ediliyor...</h3>
                        <p className="text-zinc-500 mt-2 text-center max-w-md">Görselin yapısı, pedagojik mantığı ve içerik türü çözümleniyor.</p>
                    </div>
                )}

                {step === 'studio' && analysisResult && (
                    <div className="h-full flex flex-col md:flex-row bg-zinc-100 dark:bg-black">
                        {/* LEFT: Source Image Preview */}
                        <div className="hidden md:flex w-1/3 bg-zinc-900 items-center justify-center p-8 border-r border-zinc-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] opacity-10"></div>
                            <img src={image!} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border-4 border-white/10" />
                            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-white text-xs font-bold">Kaynak Görsel</div>
                        </div>

                        {/* RIGHT: Configuration Studio */}
                        <div className="flex-1 p-8 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                            
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl shadow-sm">
                                        <i className="fa-solid fa-check"></i>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Mantık Çözüldü!</h2>
                                        <p className="text-zinc-500 text-sm">Algılanan Tür: <span className="font-bold text-indigo-600">{analysisResult.detectedType}</span></p>
                                    </div>
                                </div>
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed italic">
                                    "{analysisResult.description}"
                                </div>
                            </div>

                            {/* Config Form */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Başlık</label>
                                        <input 
                                            type="text" 
                                            value={config.title} 
                                            onChange={e => setConfig({...config, title: e.target.value})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-zinc-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Eşlenen Aktivite</label>
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
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Konu / Tema</label>
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
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Soru Sayısı</label>
                                        <input 
                                            type="number" 
                                            value={config.itemCount} 
                                            onChange={e => setConfig({...config, itemCount: Number(e.target.value)})}
                                            className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Ek Talimatlar (Opsiyonel)</label>
                                    <textarea 
                                        value={config.instructions}
                                        onChange={e => setConfig({...config, instructions: e.target.value})}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
                                        placeholder="Örn: Sadece tek basamaklı sayılar kullan..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-auto pt-8">
                                <button 
                                    onClick={handleGenerate}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-lg"
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    BU AYARLARLA ÜRET
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
                        <p className="text-zinc-500 mt-2">Yapay zeka, seçtiğiniz mantıkla yeni sorular üretiyor.</p>
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
