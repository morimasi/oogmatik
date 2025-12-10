
import React, { useState, useRef, useEffect } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, SingleWorksheetData, WorksheetData, StyleSettings } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { ShareModal } from './ShareModal';

interface OCRScannerProps {
    onBack: () => void;
    onResult: (data: any) => void;
}

// Default Styles for Preview
const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.6, borderColor: '#d4d4d8', borderWidth: 1, margin: 20, columns: 1, gap: 16,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'OpenDyslexic', lineHeight: 1.5,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: true, showFooter: true, smartPagination: true
};

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack, onResult }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'analysis_review' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    
    const [rawOCR, setRawOcr] = useState<any>(null); // AI Response
    
    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const [finalActivityType, setFinalActivityType] = useState<ActivityType | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setImage(ev.target?.result as string);
                startAnalysis(ev.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async (imgData: string) => {
        setStep('processing');
        try {
            const result = await ocrService.processImage(imgData);
            setRawOcr(result);
            setStep('analysis_review');
        } catch (error) {
            console.error("OCR Failed:", error);
            alert("Görsel analiz edilemedi. Lütfen daha net bir fotoğraf deneyin.");
            setStep('upload');
        }
    };

    const handleGenerateActivity = () => {
        // Convert the "AI Concept" into "Real Activity Data"
        const { type, data } = ocrService.convertToWorksheetData(rawOCR);
        setFinalActivityType(type);
        setFinalWorksheetData(data);
        setStep('preview');
    };

    const handleSave = async () => {
        if (!user || !finalWorksheetData || !finalActivityType) return;
        setIsSaving(true);
        try {
            await worksheetService.saveWorksheet(
                user.id,
                rawOCR.title || "Akıllı Tarama",
                finalActivityType,
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
        printService.generatePdf('.worksheet-item', rawOCR.title || 'Etkinlik', { action: 'print' });
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 absolute inset-0 z-50">
            {/* TOP BAR */}
            <div className="h-16 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={step === 'preview' ? () => setStep('analysis_review') : onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-camera-retro text-indigo-500"></i>
                        {step === 'upload' ? 'Akıllı Tarayıcı' : step === 'processing' ? 'Analiz Ediliyor' : 'Sonuç'}
                    </h2>
                </div>
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-zinc-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSave} disabled={!user} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"><i className="fa-solid fa-save mr-2"></i> Kaydet</button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black">
                        <div 
                            className="w-full max-w-lg aspect-video border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group bg-white dark:bg-zinc-900"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-500"></i>
                            </div>
                            <h3 className="text-2xl font-black text-zinc-700 dark:text-zinc-200">Etkinlik Yükle</h3>
                            <p className="text-zinc-500 mt-2 text-center px-8">Kitap sayfası, test veya el yazısı bir etkinlik fotoğrafı yükleyin. Yapay zeka onu analiz edip <strong>yeni varyasyonlarını</strong> üretsin.</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <i className="fa-solid fa-brain absolute inset-0 flex items-center justify-center text-3xl text-indigo-500 animate-pulse"></i>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-white">Pedagojik Analiz Yapılıyor...</h3>
                        <p className="text-zinc-500 mt-2">Etkinlik mantığı çözümleniyor ve yeni sorular üretiliyor.</p>
                    </div>
                )}

                {step === 'analysis_review' && rawOCR && (
                    <div className="h-full flex flex-col md:flex-row bg-zinc-100 dark:bg-black">
                        {/* LEFT: Source Image */}
                        <div className="w-full md:w-1/3 bg-black relative flex items-center justify-center p-4 border-r border-zinc-800">
                            <img src={image!} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                            <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                                Orijinal Kaynak
                            </div>
                        </div>

                        {/* RIGHT: Analysis Result */}
                        <div className="w-full md:w-2/3 p-8 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                            <div className="mb-6">
                                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-2">
                                    TESPİT EDİLEN TÜR: {rawOCR.detectedType}
                                </div>
                                <h2 className="text-3xl font-black text-zinc-800 dark:text-white mb-2">{rawOCR.title}</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">{rawOCR.description}</p>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 mb-8 flex-1">
                                <h4 className="font-bold text-zinc-400 uppercase text-xs mb-4">ÜRETİLEN İÇERİK ÖNİZLEME</h4>
                                <div className="space-y-2">
                                    {/* Preview Content Snippets based on type */}
                                    {rawOCR.detectedType === 'MATH' && rawOCR.mathItems?.slice(0,5).map((m: any, i: number) => (
                                        <div key={i} className="font-mono text-lg font-bold">{m.num1} {m.operator} {m.num2} = ?</div>
                                    ))}
                                    {rawOCR.detectedType === 'MATCHING' && rawOCR.pairs?.slice(0,5).map((p: any, i: number) => (
                                        <div key={i} className="flex gap-4 font-bold text-zinc-600 dark:text-zinc-300">
                                            <span>{p.left}</span> <i className="fa-solid fa-arrow-right text-zinc-400"></i> <span>{p.right}</span>
                                        </div>
                                    ))}
                                    {/* Generic Fallback */}
                                    {(!['MATH', 'MATCHING'].includes(rawOCR.detectedType)) && (
                                        <div className="italic text-zinc-500">
                                            İçerik sistem şablonuna uyarlandı. Görüntülemek için devam edin.
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 text-xs text-indigo-500 font-bold">
                                    + Ve daha fazlası (Tam sayfa doldurulacak)
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateActivity}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                BU MANTIKLA ETKİNLİK OLUŞTUR
                            </button>
                        </div>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && finalActivityType && (
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-950 p-8 overflow-y-auto flex justify-center">
                        <div className="scale-[0.8] origin-top shadow-2xl">
                             <Worksheet 
                                activityType={finalActivityType}
                                data={finalWorksheetData}
                                settings={PREVIEW_SETTINGS}
                                studentProfile={{ name: '', school: '', grade: '', date: '' }}
                             />
                        </div>
                    </div>
                )}
            </div>
            
            <ShareModal 
                isOpen={isShareOpen} 
                onClose={() => setIsShareOpen(false)} 
                onShare={() => {}} 
                worksheetTitle={rawOCR?.title} 
            />
        </div>
    );
};
