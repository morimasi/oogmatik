
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
    letterSpacing: 0, showPedagogicalNote: false, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: true, showFooter: true, smartPagination: true
};

export const OCRScanner: React.FC<OCRScannerProps> = ({ onBack, onResult }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'processing' | 'edit' | 'preview'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [rawOCR, setRawOcr] = useState<any>(null);
    const [editableData, setEditableData] = useState<any>(null);
    const [finalWorksheetData, setFinalWorksheetData] = useState<WorksheetData | null>(null);
    const [finalActivityType, setFinalActivityType] = useState<ActivityType | null>(null);
    
    // UI States
    const [zoomLevel, setZoomLevel] = useState(1);
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
            // Deep copy for editing
            setEditableData(JSON.parse(JSON.stringify(result)));
            setStep('edit');
        } catch (error) {
            console.error("OCR Failed:", error);
            alert("Görsel analiz edilemedi. Lütfen daha net bir fotoğraf deneyin.");
            setStep('upload');
        }
    };

    const handleConvertToWorksheet = () => {
        const { type, data } = ocrService.convertToWorksheetData(editableData);
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
                editableData.title || "Taranmış Etkinlik",
                finalActivityType,
                finalWorksheetData,
                'fa-solid fa-camera',
                { id: 'ocr', title: 'Dijitalleştirilenler' },
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
        printService.generatePdf('.worksheet-item', 'Taranmis-Etkinlik', { action: 'print' });
    };

    // --- RENDERERS ---

    const renderMathEditor = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-zinc-700 dark:text-zinc-200">İşlemler ({editableData.mathItems?.length})</h4>
                <button onClick={() => setEditableData({...editableData, mathItems: [...editableData.mathItems, {num1:'', operator:'+', num2:'', answer:''}]})} className="text-xs text-indigo-600 font-bold hover:underline">+ Ekle</button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2">
                {editableData.mathItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg border border-zinc-200 dark:border-zinc-600">
                        <input type="text" value={item.num1} onChange={e => {const n = [...editableData.mathItems]; n[idx].num1 = e.target.value; setEditableData({...editableData, mathItems: n})}} className="w-12 p-1 text-center font-mono font-bold bg-white dark:bg-zinc-800 rounded border border-zinc-300" />
                        <select value={item.operator} onChange={e => {const n = [...editableData.mathItems]; n[idx].operator = e.target.value; setEditableData({...editableData, mathItems: n})}} className="w-10 p-1 bg-zinc-200 dark:bg-zinc-600 rounded text-center font-bold">
                            <option>+</option><option>-</option><option>x</option><option>÷</option>
                        </select>
                        <input type="text" value={item.num2} onChange={e => {const n = [...editableData.mathItems]; n[idx].num2 = e.target.value; setEditableData({...editableData, mathItems: n})}} className="w-12 p-1 text-center font-mono font-bold bg-white dark:bg-zinc-800 rounded border border-zinc-300" />
                        <span className="font-bold">=</span>
                        <input type="text" value={item.answer} onChange={e => {const n = [...editableData.mathItems]; n[idx].answer = e.target.value; setEditableData({...editableData, mathItems: n})}} className="w-12 p-1 text-center font-mono font-bold bg-green-50 dark:bg-green-900/20 rounded border border-green-200 text-green-700" placeholder="?" />
                        <button onClick={() => {const n = [...editableData.mathItems]; n.splice(idx, 1); setEditableData({...editableData, mathItems: n})}} className="ml-auto text-red-400 hover:text-red-600"><i className="fa-solid fa-times"></i></button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReadingEditor = () => (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Okuma Metni</label>
                <textarea 
                    value={editableData.readingText} 
                    onChange={e => setEditableData({...editableData, readingText: e.target.value})}
                    className="w-full h-48 p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-800 dark:text-white resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase">Sorular</label>
                    <button onClick={() => setEditableData({...editableData, questions: [...(editableData.questions||[]), {question:'', options:[]}]})} className="text-xs text-indigo-600 font-bold hover:underline">+ Soru Ekle</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                    {(editableData.questions || []).map((q: any, idx: number) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-700/30 rounded-lg border border-zinc-200 dark:border-zinc-600">
                            <div className="flex gap-2 mb-2">
                                <span className="font-bold text-zinc-400">{idx+1}.</span>
                                <input 
                                    type="text" 
                                    value={q.question} 
                                    onChange={e => {const n = [...editableData.questions]; n[idx].question = e.target.value; setEditableData({...editableData, questions: n})}}
                                    className="flex-1 bg-transparent border-b border-dashed border-zinc-300 outline-none font-medium" 
                                    placeholder="Soru metni..."
                                />
                                <button onClick={() => {const n = [...editableData.questions]; n.splice(idx, 1); setEditableData({...editableData, questions: n})}} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                            </div>
                            {/* Options could be added here if needed */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 absolute inset-0 z-50">
            {/* TOP BAR */}
            <div className="h-16 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={step === 'preview' ? () => setStep('edit') : onBack} className="w-10 h-10 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors">
                        <i className="fa-solid fa-arrow-left text-zinc-500"></i>
                    </button>
                    <h2 className="text-lg font-black text-zinc-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-wand-magic-sparkles text-indigo-500"></i>
                        {step === 'upload' ? 'Akıllı Tarayıcı' : step === 'processing' ? 'Analiz Ediliyor' : step === 'edit' ? 'İçerik Düzenleyici' : 'Sonuç Önizleme'}
                    </h2>
                </div>
                
                {step === 'edit' && (
                    <button 
                        onClick={handleConvertToWorksheet}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
                    >
                        <span>Çalışma Kağıdı Oluştur</span>
                        <i className="fa-solid fa-arrow-right"></i>
                    </button>
                )}
                
                {step === 'preview' && (
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="px-4 py-2 bg-zinc-800 hover:bg-black text-white rounded-lg font-bold shadow-sm transition-all"><i className="fa-solid fa-print mr-2"></i> Yazdır</button>
                        <button onClick={handleSave} disabled={!user} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"><i className="fa-solid fa-save mr-2"></i> Kaydet</button>
                        <button onClick={() => setIsShareOpen(true)} disabled={!user} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-all disabled:opacity-50"><i className="fa-solid fa-share-nodes mr-2"></i> Paylaş</button>
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative">
                
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                        <div 
                            className="w-full max-w-2xl aspect-video border-4 border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <i className="fa-solid fa-cloud-arrow-up text-4xl text-indigo-500"></i>
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-700 dark:text-zinc-200">Fotoğraf Yükle veya Çek</h3>
                            <p className="text-zinc-500 mt-2">Kitap sayfası, test veya el yazısı notlar</p>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'processing' && (
                    <div className="h-full flex flex-col items-center justify-center">
                        <div className="relative w-32 h-32 mb-8">
                            <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                            <i className="fa-solid fa-brain absolute inset-0 flex items-center justify-center text-3xl text-indigo-500 animate-pulse"></i>
                        </div>
                        <h3 className="text-xl font-bold text-zinc-800 dark:text-white">Yapay Zeka Analiz Ediyor...</h3>
                        <p className="text-zinc-500 mt-2">Metinler ve sorular dijitalleştiriliyor.</p>
                    </div>
                )}

                {step === 'edit' && editableData && (
                    <div className="h-full flex flex-col md:flex-row">
                        {/* LEFT: IMAGE SOURCE */}
                        <div className="w-full md:w-1/2 bg-black/90 relative overflow-hidden flex items-center justify-center p-4">
                            <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.2))} className="w-8 h-8 bg-black/50 text-white rounded flex items-center justify-center hover:bg-black"><i className="fa-solid fa-minus"></i></button>
                                <button onClick={() => setZoomLevel(z => Math.min(3, z + 0.2))} className="w-8 h-8 bg-black/50 text-white rounded flex items-center justify-center hover:bg-black"><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <img 
                                src={image!} 
                                className="transition-transform duration-200 max-w-full max-h-full object-contain"
                                style={{ transform: `scale(${zoomLevel})` }}
                                draggable={false}
                            />
                        </div>

                        {/* RIGHT: EDITOR */}
                        <div className="w-full md:w-1/2 bg-white dark:bg-zinc-900 flex flex-col border-l border-zinc-200 dark:border-zinc-800">
                            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Başlık</label>
                                <input 
                                    type="text" 
                                    value={editableData.title} 
                                    onChange={e => setEditableData({...editableData, title: e.target.value})}
                                    className="w-full bg-transparent text-lg font-bold border-none outline-none text-zinc-900 dark:text-white placeholder-zinc-400"
                                    placeholder="Başlık giriniz..."
                                />
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6">
                                {editableData.detectedType === 'math' ? renderMathEditor() : renderReadingEditor()}
                            </div>
                        </div>
                    </div>
                )}

                {step === 'preview' && finalWorksheetData && finalActivityType && (
                    <div className="h-full bg-zinc-200 dark:bg-black/50 p-8 overflow-y-auto flex justify-center">
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
                onShare={() => {}} // Implemented in ShareModal itself mostly or wrapper
                worksheetTitle={editableData?.title} 
            />
        </div>
    );
};
