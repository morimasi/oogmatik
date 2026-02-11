
import React, { useState, useRef } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { useAuth } from '../context/AuthContext';
import { generateFromRichPrompt } from '../services/generators/newActivities';
import { CreativeStudio } from './CreativeStudio/index';

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.65, borderColor: '#d4d4d8', borderWidth: 1, margin: 5, columns: 1, gap: 10,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'Lexend', lineHeight: 1.4,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: false, showFooter: true, smartPagination: true,
    wordSpacing: 2, paragraphSpacing: 24, rulerHeight: 80, focusMode: false, rulerColor: '#6366f1', maskOpacity: 0.4
};

export const OCRScanner: React.FC<{ onBack: () => void; onResult: (data: any) => void }> = ({ onBack, onResult }) => {
    const [step, setStep] = useState<'upload' | 'analyzing' | 'studio' | 'generating' | 'result' | 'creative'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [blueprintData, setBlueprintData] = useState<any>(null);
    const [finalData, setFinalData] = useState<WorksheetData | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target?.result as string;
            setImage(base64);
            startAnalysis(base64);
        };
        reader.readAsDataURL(file);
    };

    const startAnalysis = async (img: string) => {
        setStep('analyzing');
        try {
            const result = await ocrService.processImage(img);
            setBlueprintData(result.structuredData);
            setStep('studio');
        } catch (e: any) {
            alert(`Analiz Hatası. Lütfen daha net bir görsel deneyin.`);
            setStep('upload');
        }
    };

    const handleClone = async () => {
        setStep('generating');
        try {
            const options: GeneratorOptions = { 
                mode: 'ai', difficulty: 'Orta', worksheetCount: 1, itemCount: 8, 
                topic: blueprintData.title 
            };
            // Blueprint DNA'sını kullanarak BİREBİR klon üretimi (Farklı verilerle)
            const result = await generateFromRichPrompt(ActivityType.OCR_CONTENT, blueprintData.worksheetBlueprint, options);
            if (result) {
                setFinalData(Array.isArray(result) ? result : [result]);
                setStep('result');
            }
        } catch (e) {
            setStep('studio');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden font-['Lexend'] text-white">
            <div className="h-16 bg-[#16161a] border-b border-white/5 flex justify-between items-center px-6 shrink-0 z-50">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 transition-all"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Mimari Klonlayıcı</h2>
                    <span className="text-[8px] font-bold opacity-30 tracking-[0.2em]">DEEP ARCHITECTURE ENGINE</span>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative">
                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl border-4 border-indigo-400/30 rotate-3 animate-pulse">
                            <i className="fa-solid fa-camera-viewfinder"></i>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter">Bir Etkinliği Klonla</h1>
                        <p className="text-slate-400 max-w-xl mb-12 text-lg leading-relaxed font-medium">Elinizdeki herhangi bir çalışma sayfasının fotoğrafını yükleyin. AI, yapıyı analiz edecek ve size tamamen yeni verilerle aynısını inşa edecektir.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                            <button onClick={() => fileInputRef.current?.click()} className="group p-10 bg-white text-indigo-950 rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-200">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl text-indigo-600"><i className="fa-solid fa-file-import"></i></div>
                                <div><h4 className="font-black text-xl mb-1">Görsel Yükle</h4><p className="text-xs font-medium text-slate-500">JPG, PNG veya PDF</p></div>
                            </button>
                            <button onClick={() => setStep('creative')} className="group p-10 bg-indigo-600 text-white rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-400">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                <div><h4 className="font-black text-xl mb-1">Creative Studio</h4><p className="text-xs font-medium text-indigo-100 opacity-70">Sıfırdan Hayal Et</p></div>
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'creative' && <CreativeStudio onResult={onResult} onCancel={() => setStep('upload')} />}

                {step === 'analyzing' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-10">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-indigo-400"><i className="fa-solid fa-microchip text-2xl animate-pulse"></i></div>
                        </div>
                        <div className="text-center"><h3 className="text-2xl font-black mb-2 tracking-tight">DNA Analizi Aktif</h3><p className="text-slate-500 font-medium animate-pulse uppercase tracking-widest text-[10px]">Görsel hiyerarşi ve mantık örüntüleri kodlanıyor...</p></div>
                    </div>
                )}

                {step === 'studio' && blueprintData && (
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center animate-in slide-in-from-bottom-10 duration-700">
                        <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-6 shadow-2xl overflow-hidden group">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Kaynak Materyal (DNA Kaynağı)</p>
                            <img src={image!} className="w-full rounded-2xl opacity-80 group-hover:opacity-100 transition-opacity" alt="Source" />
                        </div>
                        <div className="space-y-8">
                            <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-inner">
                                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-[10px] font-black uppercase border border-indigo-500/30">MİMARİ BLUEPRINT ÇIKARILDI</span>
                                <h3 className="text-3xl font-black mt-4 mb-4 tracking-tight">{blueprintData.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 font-medium">Bu etkinliğin yapısı (tablolar, ipuçları ve yerleşim) korundu. AI şimdi bu yapıyı kullanarak tamamen orijinal yeni veriler üretecek.</p>
                                <button onClick={handleClone} className="w-full py-6 bg-white text-indigo-950 font-black rounded-3xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 text-lg">
                                    <i className="fa-solid fa-copy"></i> YAPISAL KLON ÜRET
                                </button>
                                <button onClick={() => setStep('upload')} className="w-full mt-4 py-3 text-slate-500 font-bold hover:text-white transition-colors text-sm">Vazgeç ve Yeni Görsel Seç</button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-8">
                        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-indigo-600 animate-progress"></div>
                        </div>
                        <div className="text-center"><h3 className="text-2xl font-black tracking-tight">Klon İnşa Ediliyor</h3><p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Mimarideki veriler randomize ediliyor...</p></div>
                    </div>
                )}

                {step === 'result' && finalData && (
                    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-1000">
                        <div className="flex justify-between items-center mb-8 bg-zinc-900/50 p-4 rounded-3xl border border-white/5">
                             <div className="flex items-center gap-4 pl-4">
                                <i className="fa-solid fa-circle-check text-emerald-500 text-xl"></i>
                                <span className="text-xs font-black uppercase tracking-widest">Klonlama Başarılı</span>
                             </div>
                             <button onClick={() => onResult(finalData)} className="px-10 py-3 bg-white text-indigo-950 font-black rounded-2xl text-sm shadow-xl hover:scale-105 transition-all">
                                DÜZENLEMEYE GEÇ <i className="fa-solid fa-chevron-right ml-2"></i>
                             </button>
                        </div>
                        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border-[10px] border-white/5">
                             <Worksheet activityType={ActivityType.OCR_CONTENT} data={finalData} settings={PREVIEW_SETTINGS} />
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes progress { 0% { left: -100%; width: 50%; } 100% { left: 100%; width: 50%; } }
                .animate-progress { position: relative; animation: progress 1.5s infinite linear; }
            `}</style>
        </div>
    );
};
