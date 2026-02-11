
import React, { useState, useRef } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { useAuth } from '../context/AuthContext';
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

export const OCRScanner: React.FC<{ onBack: () => void; onResult: (data: any) => void }> = ({ onBack, onResult }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'upload' | 'analyzing' | 'studio' | 'generating' | 'result'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [blueprint, setBlueprint] = useState<any>(null);
    const [finalData, setFinalData] = useState<WorksheetData | null>(null);
    const [targetType, setTargetType] = useState<'SHEET' | 'ALGORITHM'>('SHEET');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setImage(ev.target?.result as string);
            startAnalysis(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const startAnalysis = async (img: string) => {
        setStep('analyzing');
        try {
            const result = await ocrService.processImage(img);
            setBlueprint(result);
            setStep('studio');
        } catch (e: any) {
            alert(`Analiz Hatası: ${e.message}. Lütfen daha net bir görsel yükleyin.`);
            setStep('upload');
        }
    };

    const handleFinalGeneration = async (type: 'SHEET' | 'ALGORITHM') => {
        setTargetType(type);
        setStep('generating');
        try {
            const options: GeneratorOptions = { 
                mode: 'ai', difficulty: 'Orta', worksheetCount: 1, itemCount: 8, 
                topic: blueprint.title 
            };

            let result;
            if (type === 'ALGORITHM') {
                // Görseldeki mantığı algoritmaya çevir
                result = await generateAlgorithmGeneratorFromAI({ 
                    ...options, 
                    topic: `Görseldeki mantığı temel alan: ${blueprint.description}` 
                });
            } else {
                // Görseldeki düzeni kullanarak yeni çalışma sayfası üret
                result = await generateFromRichPrompt('AI_WORKSHEET_CONVERTER' as any, blueprint.generatedTemplate, options);
            }

            if (result) {
                setFinalData(Array.isArray(result) ? result : [result]);
                setStep('result');
            }
        } catch (e) {
            alert("Üretim sırasında bir hata oluştu.");
            setStep('studio');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] absolute inset-0 z-50 overflow-hidden font-['Lexend'] text-white">
            {/* Header */}
            <div className="h-16 bg-[#1e293b] border-b border-white/10 flex justify-between items-center px-6 shrink-0">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"><i className="fa-solid fa-arrow-left"></i></button>
                <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400">AI Mimari Tarayıcı</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl rotate-3"><i className="fa-solid fa-camera"></i></div>
                        <h1 className="text-4xl font-black mb-4">Materyalini Klonla</h1>
                        <p className="text-slate-400 max-w-md mb-10 text-lg">Bir çalışma kağıdının fotoğrafını çekin, AI mantığını çözsün ve sizin için yepyeni bir varyasyon veya algoritma üretsin.</p>
                        <button onClick={() => fileInputRef.current?.click()} className="px-10 py-5 bg-white text-indigo-900 font-black rounded-2xl hover:scale-105 transition-all shadow-xl text-lg">GÖRSEL YÜKLE</button>
                        <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-8 animate-pulse">
                        <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black mb-2">Mimari Analiz Yapılıyor</h3>
                            <p className="text-slate-500">Görseldeki pedagojik DNA çözümleniyor...</p>
                        </div>
                    </div>
                )}

                {step === 'studio' && blueprint && (
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="space-y-6">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                                <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Tespit Edilen Mimari</h3>
                                <div className="space-y-4">
                                    <div><label className="text-[10px] text-slate-500 font-bold uppercase">Başlık</label><p className="font-black text-xl">{blueprint.title}</p></div>
                                    <div><label className="text-[10px] text-slate-500 font-bold uppercase">Tür</label><p className="text-sm font-medium">{blueprint.detectedType}</p></div>
                                    <div><label className="text-[10px] text-slate-500 font-bold uppercase">Açıklama</label><p className="text-xs text-slate-400 leading-relaxed">{blueprint.description}</p></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <button onClick={() => handleFinalGeneration('SHEET')} className="p-6 bg-indigo-600 hover:bg-indigo-500 rounded-3xl text-left transition-all group shadow-xl">
                                    <i className="fa-solid fa-file-invoice text-3xl mb-4 group-hover:rotate-6 transition-transform"></i>
                                    <h4 className="font-black text-xl mb-1">Çalışma Sayfası Üret</h4>
                                    <p className="text-indigo-200 text-xs">Görseldeki düzeni korur, benzer pedagojik mantıkla yeni sorular hazırlar.</p>
                                </button>
                                <button onClick={() => handleFinalGeneration('ALGORITHM')} className="p-6 bg-slate-800 hover:bg-slate-700 rounded-3xl text-left transition-all group border border-white/5 shadow-xl">
                                    <i className="fa-solid fa-code-fork text-3xl mb-4 text-emerald-400 group-hover:rotate-6 transition-transform"></i>
                                    <h4 className="font-black text-xl mb-1">Mantık Algoritması Üret</h4>
                                    <p className="text-slate-400 text-xs">Materyali bir akış şemasına ve sıralı problem çözme algoritmasına dönüştürür.</p>
                                </button>
                            </div>
                        </div>

                        <div className="bg-black/40 rounded-[3rem] border border-white/10 p-6 flex items-center justify-center overflow-hidden min-h-[400px]">
                            <img src={image!} className="max-w-full max-h-full object-contain rounded-2xl opacity-60 hover:opacity-100 transition-opacity duration-500" alt="Kaynak" />
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-progress"></div>
                        </div>
                        <h3 className="text-xl font-black">AI Varyasyon İnşa Ediliyor...</h3>
                    </div>
                )}

                {step === 'result' && finalData && (
                    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-1000">
                        <div className="flex justify-between items-center mb-8">
                             <div className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-full text-xs font-black border border-indigo-500/30">
                                {targetType === 'SHEET' ? 'YENİ VARYASYON' : 'ALGORİTMA DÖNÜŞÜMÜ'}
                             </div>
                             <button onClick={() => setStep('studio')} className="text-sm font-bold text-slate-400 hover:text-white underline">Başka Bir Tür Dene</button>
                        </div>
                        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl scale-95 origin-top transition-transform hover:scale-100 duration-500">
                             <Worksheet activityType={ActivityType.OCR_CONTENT} data={finalData} settings={PREVIEW_SETTINGS} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
