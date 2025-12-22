
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
import { adminService } from '../services/adminService';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface OCRScannerProps {
    onBack: () => void;
    onResult: (data: any) => void;
}

const toPascalCase = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
};

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.6, borderColor: '#d4d4d8', borderWidth: 1, margin: 20, columns: 1, gap: 16,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'OpenDyslexic', lineHeight: 1.5,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: true, showFooter: true, smartPagination: true
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
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8); 
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const convertPdfToImage = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        if (pdf.numPages === 0) throw new Error("PDF boş.");

        // Get the first page
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error("Canvas context oluşturulamadı.");

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        return canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
        console.error("PDF Render error:", e);
        throw new Error("PDF dosyası işlenemedi.");
    }
};

const STUDIO_TOOLS = [
    { id: 'table', label: 'Tablo', icon: 'fa-table', snippet: '\n[BİLEŞEN: TABLO]\n- Yapı: 3 Satır x 2 Sütun\n- Başlıklar: ["Soru", "Cevap"]\n- İçerik: Konuyla ilgili veriler.\n' },
    { id: 'chart', label: 'Grafik', icon: 'fa-chart-pie', snippet: '\n[BİLEŞEN: GRAFİK]\n- Tip: Sütun Grafiği\n- Veriler: "Elma: 5, Armut: 3"\n' },
    { id: 'code', label: 'Algoritma', icon: 'fa-code', snippet: '\n[BİLEŞEN: ALGORİTMA]\n- Adım 1: Başla\n- Adım 2: Girdi al\n- Adım 3: Bitir\n' },
    { id: 'image', label: 'Görsel', icon: 'fa-image', snippet: '\n[BİLEŞEN: GÖRSEL]\n- Prompt: "Eğitici, net vektörel çizim..."\n- Konum: Kartın üst kısmı\n' },
    { id: 'question', label: 'Soru', icon: 'fa-circle-question', snippet: '\n[BİLEŞEN: SORU]\n- Tip: Çoktan Seçmeli\n- Soru: "..."\n- Şıklar: ["A", "B", "C"]\n' }
];

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'studio' | 'generating' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    
    const [config, setConfig] = useState({
        activityType: '' as ActivityType,
        title: '',
        topic: '',
        difficulty: 'Orta',
        itemCount: 10,
        worksheetCount: 1,
        instructions: '', 
        useGoogleSearch: false
    });

    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const instructionsRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                let processedImageBase64 = '';
                if (file.type === 'application/pdf') {
                    processedImageBase64 = await convertPdfToImage(file);
                } else if (file.type.startsWith('image/')) {
                    processedImageBase64 = await resizeImage(file);
                } else {
                    alert("Lütfen geçerli bir resim (JPG, PNG) veya PDF dosyası seçin.");
                    return;
                }
                setImage(processedImageBase64);
                startAnalysis(processedImageBase64);
            } catch (err) {
                console.error("File processing error", err);
                alert("Dosya işlenirken bir hata oluştu.");
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
                instructions: result.generatedTemplate || '',
                useGoogleSearch: false
            });
            setStep('studio');
        } catch (error: any) {
            console.error("OCR Failed:", error);
            alert("Görsel analiz edilemedi.");
            setStep('upload');
            setImage(null);
        }
    };

    const insertSnippet = (snippet: string) => {
        if (instructionsRef.current) {
            const start = instructionsRef.current.selectionStart;
            const end = instructionsRef.current.selectionEnd;
            const text = config.instructions;
            const newText = text.substring(0, start) + snippet + text.substring(end);
            setConfig({ ...config, instructions: newText });
            setTimeout(() => {
                if (instructionsRef.current) {
                    instructionsRef.current.selectionStart = instructionsRef.current.selectionEnd = start + snippet.length;
                    instructionsRef.current.focus();
                }
            }, 0);
        } else {
            setConfig({ ...config, instructions: config.instructions + snippet });
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
                mode: 'ai',
                useSearch: config.useGoogleSearch
            };

            let result = null;

            if (config.instructions && config.instructions.length > 5) {
                 try {
                     result = await generateFromRichPrompt(
                         config.activityType, 
                         config.instructions, 
                         options, 
                         analysisResult?.structuredData?.layoutHint 
                     );
                 } catch (aiErr) {
                     if (config.activityType === 'CUSTOM_GENERATED' || !ACTIVITIES.find(a => a.id === config.activityType)) {
                        throw new Error("AI üretim hatası: " + (aiErr as Error).message);
                     }
                 }
            }
            
            if ((!result || result.length === 0) && config.activityType !== 'CUSTOM_GENERATED') {
                const pascalName = toPascalCase(config.activityType);
                if (pascalName) {
                    const generatorFnName = `generate${pascalName}FromAI`;
                    const offlineFnName = `generateOffline${pascalName}`;
                    // @ts-ignore
                    const onlineGen = generators[generatorFnName];
                    // @ts-ignore
                    const offlineGen = offlineGenerators[offlineFnName];
                    if (onlineGen) {
                        try { result = await onlineGen(options); } catch (e) {}
                    }
                    if ((!result || result.length === 0) && offlineGen) {
                        result = await offlineGen(options);
                    }
                }
            }

            if (result && result.length > 0) {
                if (!Array.isArray(result)) result = [result];
                const finalized = result.map((page: any) => ({ ...page, title: config.title }));
                setFinalWorksheetData(finalized);
                setStep('preview');
            } else {
                throw new Error("Üretici fonksiyon bulunamadı veya boş veri döndü.");
            }
        } catch (e: any) {
            alert(`İçerik üretilemedi: ${e.message}`);
            setStep('studio');
        }
    };
    
    const handleSaveToArchive = async () => {
        if (!user || !finalWorksheetData) { alert("Kaydetmek için giriş yapmalısınız."); return; }
        setIsSaving(true);
        try {
            await worksheetService.saveWorksheet(user.id, config.title, config.activityType, finalWorksheetData, 'fa-solid fa-wand-magic-sparkles', { id: 'ocr', title: 'Akıllı Dönüşüm' }, PREVIEW_SETTINGS);
            alert("Etkinlik arşivinize kaydedildi.");
        } catch (e) {
            alert("Kaydetme hatası.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSaveAsTemplate = async () => {
        if (!user) { alert("Giriş yapmalısınız."); return; }
        setIsSaving(true);
        try {
             await adminService.saveDraftActivity({
                 title: config.title,
                 description: analysisResult?.description || 'Algoritması çıkarılmış etkinlik.',
                 baseType: config.activityType,
                 customInstructions: config.instructions, 
                 defaultParams: { topic: config.topic, difficulty: config.difficulty as any, itemCount: config.itemCount },
                 createdBy: user.email
             });
             alert("Algoritma taslağı kaydedildi.");
        } catch (e) {
            alert("Şablon kaydedilemedi.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#121212] absolute inset-0 z-50 overflow-hidden text-zinc-200 font-sans">
            {/* TOP BAR */}
            <div className="h-16 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-6 shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={step === 'preview' ? () => setStep('studio') : onBack} className="w-10 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors text-zinc-400">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
                            <i className="fa-solid fa-camera-retro text-indigo-500"></i>
                            AI Tasarım Klonlayıcı
                        </h2>
                        {step === 'studio' && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Algoritma Stüdyosu</p>}
                        {step === 'preview' && <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Önizleme Modu</p>}
                    </div>
                </div>
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={() => printService.generatePdf('.worksheet-item', config.title, { action: 'print' })} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSaveToArchive} disabled={!user || isSaving} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50">
                            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-save mr-2"></i>} Arşivle
                        </button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-[#121212] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                        <div 
                            className="w-full max-w-xl aspect-video border-2 border-dashed border-zinc-700 hover:border-indigo-500 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-all group bg-zinc-900/30 relative overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg z-10 border border-zinc-700">
                                <i className="fa-solid fa-cloud-arrow-up text-3xl text-indigo-500"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-white relative z-10">Materyal Yükle</h3>
                            <p className="text-zinc-500 mt-2 text-center px-12 text-sm relative z-10">
                                JPG, PNG veya PDF formatındaki çalışma kağıdını yükleyin.<br/>
                                Yapay zeka tasarımı analiz eder ve klonlar.
                            </p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,.pdf" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center bg-[#121212]">
                         <div className="flex items-center gap-2 mb-4">
                             <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></span>
                             <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                             <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                         </div>
                        <h3 className="text-xl font-bold text-white">Görsel Mimari Analiz Ediliyor</h3>
                        <p className="text-zinc-500 mt-2 text-sm">Grid yapısı, sorular ve stiller çözümleniyor...</p>
                    </div>
                )}

                {step === 'studio' && analysisResult && (
                    <div className="h-full flex flex-col lg:flex-row bg-[#121212]">
                        {/* LEFT: Editor Area */}
                        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                            
                            {/* Top Info & Config */}
                            <div className="bg-[#18181b] p-6 rounded-2xl border border-zinc-800 flex flex-col gap-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Başlık</label>
                                        <input type="text" value={config.title} onChange={e => setConfig({...config, title: e.target.value})} className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg font-bold text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Zorluk</label>
                                        <select value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value as any})} className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300 outline-none">
                                            {['Başlangıç', 'Orta', 'Zor', 'Uzman'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Adet</label>
                                        <input type="number" value={config.itemCount} onChange={e => setConfig({...config, itemCount: Number(e.target.value)})} className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Konu / Tema</label>
                                    <input type="text" value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} className="w-full p-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white outline-none" placeholder="Örn: Uzay, Çarpım Tablosu..." />
                                </div>
                            </div>

                            {/* Prompt Studio Editor */}
                            <div className="flex-1 bg-[#1e1e1e] rounded-2xl border border-zinc-800 shadow-inner flex flex-col overflow-hidden min-h-[400px]">
                                <div className="bg-[#252526] border-b border-zinc-800 p-2 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-400 px-3 uppercase tracking-wider flex items-center gap-2">
                                        <i className="fa-solid fa-code text-indigo-500"></i>
                                        Prompt Mühendisi
                                    </span>
                                    <div className="flex gap-2">
                                        {STUDIO_TOOLS.map(tool => (
                                            <button 
                                                key={tool.id}
                                                onClick={() => insertSnippet(tool.snippet)}
                                                className="px-3 py-1.5 bg-[#333] border border-zinc-700 rounded-md text-[10px] font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all flex items-center gap-2"
                                                title={tool.label}
                                            >
                                                <i className={`fa-solid ${tool.icon}`}></i>
                                                <span className="hidden lg:inline">{tool.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="relative flex-1">
                                    <textarea 
                                        ref={instructionsRef}
                                        value={config.instructions}
                                        onChange={e => setConfig({...config, instructions: e.target.value})}
                                        className="absolute inset-0 w-full h-full p-6 bg-[#1e1e1e] text-emerald-400 font-mono text-sm leading-relaxed resize-none outline-none"
                                        placeholder="// Yapay zeka için üretim talimatları buraya..."
                                        spellCheck={false}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pb-8">
                                <button 
                                    onClick={handleSaveAsTemplate}
                                    className="px-6 py-3 bg-[#18181b] border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition-all text-sm"
                                >
                                    <i className="fa-solid fa-microchip mr-2"></i> Algoritmayı Kaydet
                                </button>
                                <button 
                                    onClick={handleGenerate}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95 text-sm"
                                >
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI İLE ÜRET
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: Source Image */}
                        <div className="hidden lg:flex w-96 bg-[#18181b] border-l border-zinc-800 items-center justify-center p-6 relative shrink-0">
                             <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur border border-white/10 uppercase tracking-widest">Kaynak Görsel</div>
                             <img src={image!} className="max-w-full max-h-[80vh] object-contain rounded border border-zinc-700 shadow-2xl" />
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center bg-[#121212]">
                         <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-6"><div className="h-full bg-indigo-500 animate-progress"></div></div>
                        <h3 className="text-xl font-bold text-white">İçerik Yeniden İnşa Ediliyor</h3>
                        <p className="text-zinc-500 mt-2 text-sm">Yapay zeka verileri işliyor...</p>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && (
                    <div className="flex-1 bg-zinc-900 p-8 overflow-y-auto flex justify-center custom-scrollbar">
                        <div className="scale-[0.85] origin-top shadow-2xl transition-transform duration-300">
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