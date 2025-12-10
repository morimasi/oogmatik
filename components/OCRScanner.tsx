
import React, { useState, useRef, useEffect } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, SingleWorksheetData, WorksheetData, StyleSettings } from '../types';
import Worksheet from './Worksheet';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { ShareModal } from './ShareModal';
import { adminService } from '../services/adminService';
import { ACTIVITY_CATEGORIES } from '../constants';

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
                // Aggressively reduce size to ensure payload stays under Vercel limits
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 string with reduced quality (0.6) to save space
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack, onResult }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'analysis_review' | 'preview' | 'admin_save'>('upload');
    const [image, setImage] = useState<string | null>(null);
    
    const [rawOCR, setRawOcr] = useState<any>(null); // AI Response
    
    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const [finalActivityType, setFinalActivityType] = useState<ActivityType | null>(null);
    
    const [isSaving, setIsSaving] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Admin Save Form
    const [newActivityTitle, setNewActivityTitle] = useState('');
    const [newActivityCategory, setNewActivityCategory] = useState('others');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Resize image before processing to prevent 413/500 errors on serverless functions
                const resizedImageBase64 = await resizeImage(file);
                setImage(resizedImageBase64);
                startAnalysis(resizedImageBase64);
            } catch (err) {
                console.error("Image resize failed", err);
                alert("Görsel işlenirken bir hata oluştu. Lütfen tekrar deneyin.");
            }
        }
    };

    const startAnalysis = async (imgData: string) => {
        setStep('processing');
        try {
            const result = await ocrService.processImage(imgData);
            setRawOcr(result);
            setNewActivityTitle(result.title || "Yeni Aktivite");
            setStep('analysis_review');
        } catch (error) {
            console.error("OCR Failed:", error);
            alert("Görsel analiz edilemedi. Lütfen daha net bir fotoğraf deneyin veya görsel boyutunu kontrol edin.");
            setStep('upload');
        }
    };

    const handleGenerateActivity = () => {
        const { type, data } = ocrService.convertToWorksheetData(rawOCR);
        setFinalActivityType(type);
        setFinalWorksheetData(data);
        setStep('preview');
    };

    const handleSaveToArchive = async () => {
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

    const handleAdminSaveSystem = async () => {
        if (!user || user.role !== 'admin' || !rawOCR) return;
        setIsSaving(true);
        try {
            // 1. Create Prompt Template
            const promptId = `prompt_custom_${Date.now()}`;
            const promptTemplate = {
                id: promptId,
                name: `${newActivityTitle} Prompt`,
                description: `Otomatik oluşturulan prompt: ${rawOCR.description}`,
                category: 'custom',
                systemInstruction: "Sen uzman bir eğitim materyali üreticisisin.",
                template: rawOCR.generatedTemplate,
                variables: ['worksheetCount', 'difficulty', 'topic'],
                tags: ['custom', 'ocr'],
                updatedAt: new Date().toISOString(),
                version: 1
            };
            
            await adminService.savePrompt(promptTemplate, "OCR Auto Generated");

            // 2. Create Activity Definition
            const activityId = `CUSTOM_${Date.now()}`;
            const newActivity = {
                id: activityId,
                title: newActivityTitle,
                description: rawOCR.description,
                icon: 'fa-solid fa-robot',
                category: newActivityCategory,
                isActive: true,
                isPremium: false,
                promptId: promptId,
                baseType: rawOCR.baseType // Important for rendering
            };
            
            await adminService.saveActivity(newActivity);
            
            alert(`"${newActivityTitle}" sisteme eklendi! Artık menüden erişilebilir.`);
            setStep('upload'); // Reset
        } catch (e) {
            console.error(e);
            alert("Sisteme ekleme başarısız.");
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
                        {step === 'upload' ? 'Akıllı Tarayıcı & Mimari' : step === 'processing' ? 'Pedagojik Analiz' : 'Sonuç'}
                    </h2>
                </div>
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-zinc-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSaveToArchive} disabled={!user} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"><i className="fa-solid fa-save mr-2"></i> Arşive Kaydet</button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-black">
                        <div 
                            className="w-full max-w-lg aspect-video border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group bg-white dark:bg-zinc-900 shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner border border-indigo-100">
                                <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-500"></i>
                            </div>
                            <h3 className="text-2xl font-black text-zinc-700 dark:text-zinc-200">Etkinlik Görseli Yükle</h3>
                            <p className="text-zinc-500 mt-2 text-center px-8 text-sm">
                                Herhangi bir çalışma kağıdını yükleyin. Yapay zeka, etkinliğin <strong>mantığını çözecek</strong> ve sisteminize <strong>yeni bir etkinlik türü</strong> olarak eklemenizi sağlayacak.
                            </p>
                            <span className="mt-4 px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase tracking-wider">Tersine Mühendislik Modu</span>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-black">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <i className="fa-solid fa-microchip absolute inset-0 flex items-center justify-center text-3xl text-indigo-500 animate-pulse"></i>
                        </div>
                        <h3 className="text-2xl font-black text-zinc-800 dark:text-white">Pedagojik Mantık Çözümleniyor...</h3>
                        <p className="text-zinc-500 mt-2">Görseldeki kurallar analiz edilip Prompt Şablonuna dönüştürülüyor.</p>
                    </div>
                )}

                {step === 'analysis_review' && rawOCR && (
                    <div className="h-full flex flex-col md:flex-row bg-zinc-100 dark:bg-black">
                        {/* LEFT: Source Image */}
                        <div className="w-full md:w-1/3 bg-black relative flex items-center justify-center p-4 border-r border-zinc-800">
                            <img src={image!} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                        </div>

                        {/* RIGHT: Analysis Result */}
                        <div className="w-full md:w-2/3 p-8 flex flex-col bg-white dark:bg-zinc-900 overflow-y-auto">
                            <div className="mb-6">
                                <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-2">
                                    TESPİT EDİLEN TÜR: {rawOCR.detectedType}
                                </div>
                                <h2 className="text-3xl font-black text-zinc-800 dark:text-white mb-2">{rawOCR.title}</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed border-b pb-4 mb-4">{rawOCR.description}</p>
                                
                                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                                    <p className="font-bold text-indigo-500 mb-2">// OLUŞTURULAN AI PROMPT ŞABLONU</p>
                                    {rawOCR.generatedTemplate}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-auto pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                <button 
                                    onClick={handleGenerateActivity}
                                    className="flex-1 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-play"></i>
                                    Test Et (Önizle)
                                </button>
                                
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={() => setStep('admin_save')}
                                        className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black rounded-xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="fa-solid fa-plus-circle"></i>
                                        SİSTEME EKLE (KALICI)
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'admin_save' && (
                    <div className="h-full flex items-center justify-center bg-zinc-100 dark:bg-black p-4">
                        <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-700">
                            <h3 className="text-xl font-black text-zinc-800 dark:text-white mb-6">Yeni Aktivite Olarak Kaydet</h3>
                            
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Aktivite Başlığı</label>
                                    <input 
                                        type="text" 
                                        value={newActivityTitle} 
                                        onChange={e => setNewActivityTitle(e.target.value)} 
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kategori</label>
                                    <select 
                                        value={newActivityCategory}
                                        onChange={e => setNewActivityCategory(e.target.value)}
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {ACTIVITY_CATEGORIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                        <option value="others">Diğerleri (Özel)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setStep('analysis_review')} className="flex-1 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors">Vazgeç</button>
                                <button onClick={handleAdminSaveSystem} disabled={isSaving} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-colors disabled:opacity-50">
                                    {isSaving ? 'Kaydediliyor...' : 'Onayla ve Yayınla'}
                                </button>
                            </div>
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
