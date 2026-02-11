
import React, { useState, useRef } from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions } from '../types';
import Worksheet from './Worksheet';
import { useAuth } from '../context/AuthContext';
import { generateFromRichPrompt } from '../services/generators/newActivities';
import { generateAlgorithmGeneratorFromAI } from '../services/generators/algorithm';
import { CreativeStudio } from './CreativeStudio';

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
    const [step, setStep] = useState<'upload' | 'analyzing' | 'studio' | 'generating' | 'result' | 'creative'>('upload');
    const [image, setImage] = useState<string | null>(null);
    const [blueprintData, setBlueprintData] = useState<any>(null);
    const [finalData, setFinalData] = useState<WorksheetData | null>(null);
    const [targetType, setTargetType] = useState<'SHEET' | 'ALGORITHM' | 'CREATIVE'>('SHEET');
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
            alert(`Analiz Hatası: ${e.message}. Lütfen daha net bir görsel deneyin.`);
            setStep('upload');
        }
    };

    const handleFinalGeneration = async (type: 'SHEET' | 'ALGORITHM') => {
        setTargetType(type);
        setStep('generating');
        try {
            const options: GeneratorOptions = { 
                mode: 'ai', difficulty: 'Orta', worksheetCount: 1, itemCount: 8, 
                topic: blueprintData.title 
            };

            let result;
            if (type === 'ALGORITHM') {
                result = await generateAlgorithmGeneratorFromAI({ 
                    ...options, 
                    topic: `Görsel tabanlı mantık: ${blueprintData.algorithmBlueprint}` 
                });
            } else {
                result = await generateFromRichPrompt(ActivityType.OCR_CONTENT, blueprintData.worksheetBlueprint, options);
            }

            if (result) {
                setFinalData(Array.isArray(result) ? result : [result]);
                setStep('result');
            }
        } catch (e) {
            console.error(e);
            alert("Üretim sırasında bir hata oluşti.");
            setStep('studio');
        }
    };

    const handleCreativeResult = (data: any) => {
        setFinalData(data);
        setTargetType('CREATIVE');
        setStep('result');
    };

    return (
        <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden font-['Lexend'] text-white">
            {/* Header */}
            <div className="h-16 bg-[#16161a] border-b border-white/5 flex justify-between items-center px-6 shrink-0 z-50">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"><i className="fa-solid fa-arrow-left"></i></button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Mimari Klonlayıcı</h2>
                    <span className="text-[8px] font-bold opacity-30">AI VISION ENGINE v5.0</span>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

                {step === 'upload' && (
                    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto">
                        <div className="w-24 h-24 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl border-4 border-indigo-400/30 rotate-3">
                            <i className="fa-solid fa-camera-viewfinder"></i>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter">Zeka ile İnşa Et</h1>
                        <p className="text-slate-400 max-w-xl mb-12 text-lg leading-relaxed font-medium">Elinizdeki materyali dijitalleştirebilir veya hayalinizdeki etkinliği AI Creative Studio ile sıfırdan tasarlayabilirsiniz.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="group p-10 bg-white text-indigo-950 rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-200"
                            >
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl text-indigo-600"><i className="fa-solid fa-cloud-arrow-up"></i></div>
                                <div>
                                    <h4 className="font-black text-xl mb-1">Görselden Klonla</h4>
                                    <p className="text-xs font-medium text-slate-500">Mevcut bir sayfayı analiz et ve dönüştür.</p>
                                </div>
                            </button>

                            <button 
                                onClick={() => setStep('creative')}
                                className="group p-10 bg-indigo-600 text-white rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-400"
                            >
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                <div>
                                    <h4 className="font-black text-xl mb-1">Creative Studio</h4>
                                    <p className="text-xs font-medium text-indigo-100 opacity-70">Hayalindeki etkinliği tarif et ve üret.</p>
                                </div>
                            </button>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
                    </div>
                )}

                {step === 'creative' && (
                    <CreativeStudio onResult={handleCreativeResult} onCancel={() => setStep('upload')} />
                )}

                {step === 'analyzing' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-10 animate-in fade-in">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                                <i className="fa-solid fa-microchip text-2xl animate-pulse"></i>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black mb-2 tracking-tight">Mekanik Analiz Başladı</h3>
                            <p className="text-slate-500 font-medium animate-pulse">Görsel hiyerarşi ve mantık örüntüleri kodlanıyor...</p>
                        </div>
                    </div>
                )}

                {step === 'studio' && blueprintData && (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in slide-in-from-bottom-10 duration-700">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-4 shadow-2xl overflow-hidden group">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-2">Kaynak Materyal</p>
                                <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center border border-white/5">
                                    <img src={image!} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-opacity duration-700" alt="Kaynak" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                                        <div className="w-full">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase">{blueprintData.detectedType}</span>
                                            <h4 className="font-bold text-white truncate">{blueprintData.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setStep('upload')} className="w-full py-3 text-slate-500 font-bold hover:text-white transition-colors text-sm"><i className="fa-solid fa-rotate mr-2"></i> Başka Bir Görsel Dene</button>
                        </div>

                        <div className="lg:col-span-8 space-y-8 pt-4">
                            <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-inner">
                                <h3 className="text-2xl font-black mb-2 tracking-tight">Klonlama Hazır</h3>
                                <p className="text-slate-400 text-sm mb-10 leading-relaxed font-medium">Blueprint çıkarıldı. Bu yapıyı standart bir sayfa olarak mı yoksa bir akış şeması olarak mı üretmek istersiniz?</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button 
                                        onClick={() => handleFinalGeneration('SHEET')}
                                        className="relative p-8 bg-indigo-600 hover:bg-indigo-500 rounded-[2.5rem] text-left transition-all group shadow-[0_20px_40px_rgba(79,70,229,0.2)] hover:-translate-y-1 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><i className="fa-solid fa-file-invoice text-7xl"></i></div>
                                        <i className="fa-solid fa-wand-magic-sparkles text-2xl mb-4 bg-white/20 w-12 h-12 flex items-center justify-center rounded-2xl"></i>
                                        <h4 className="font-black text-xl mb-2">Sayfa Klonu</h4>
                                        <p className="text-indigo-100 text-xs leading-relaxed opacity-80">Düzeni birebir koru, özgün sorular üret.</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-white/50 uppercase tracking-widest">
                                            <span>KLONLAMAYI BAŞLAT</span>
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleFinalGeneration('ALGORITHM')}
                                        className="relative p-8 bg-slate-800 hover:bg-slate-700 rounded-[2.5rem] text-left transition-all group border border-white/10 shadow-2xl hover:-translate-y-1 overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform"><i className="fa-solid fa-diagram-project text-7xl text-emerald-400"></i></div>
                                        <i className="fa-solid fa-code-fork text-2xl mb-4 bg-emerald-500/20 text-emerald-400 w-12 h-12 flex items-center justify-center rounded-2xl"></i>
                                        <h4 className="font-black text-xl mb-2">Mantık Akışı</h4>
                                        <p className="text-slate-400 text-xs leading-relaxed">Materyali pedagojik bir algoritmaya dönüştür.</p>
                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-400/50 uppercase tracking-widest">
                                            <span>ALGORİTMA ÜRET</span>
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'generating' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-8">
                        <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-progress"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black tracking-tight">{targetType === 'SHEET' ? 'Mimari İnşa Ediliyor' : 'Muhakeme Süreci Aktif'}</h3>
                            <p className="text-slate-500 text-sm mt-1">Gemini 3.0 Multimodal Thinking motoru çalışıyor...</p>
                        </div>
                    </div>
                )}

                {step === 'result' && finalData && (
                    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-1000">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                             <div className="flex items-center gap-3">
                                 <div className="bg-indigo-600/20 text-indigo-400 px-4 py-2 rounded-full text-xs font-black border border-indigo-500/30 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    ÜRETİM TAMAMLANDI
                                 </div>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={() => setStep('upload')} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black border border-white/5 transition-all">
                                    YENİ TASARIM
                                </button>
                                <button onClick={() => onResult(finalData)} className="px-8 py-2.5 bg-white text-indigo-950 font-black rounded-xl text-xs shadow-xl transition-all hover:scale-105 active:scale-95">
                                    DÜZENLEMEYE GEÇ <i className="fa-solid fa-chevron-right ml-2"></i>
                                </button>
                             </div>
                        </div>
                        
                        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border-[8px] border-white/5 transform hover:rotate-1 transition-transform duration-700 origin-top">
                             <Worksheet 
                                activityType={targetType === 'ALGORITHM' ? ActivityType.ALGORITHM_GENERATOR : ActivityType.OCR_CONTENT} 
                                data={finalData} 
                                settings={PREVIEW_SETTINGS} 
                             />
                        </div>
                    </div>
                )}
            </div>
            
            <style>{`
                @keyframes progress {
                    0% { width: 0%; left: -100%; }
                    50% { width: 100%; left: 0%; }
                    100% { width: 0%; left: 100%; }
                }
                .animate-progress {
                    position: relative;
                    animation: progress 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};
