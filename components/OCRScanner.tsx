import React from 'react';
import { ocrService } from '../services/ocrService';
import { ActivityType, WorksheetData, StyleSettings, GeneratorOptions, Student } from '../types';
import Worksheet from './Worksheet';
import { generateFromRichPrompt } from '../services/generators/newActivities';
import { CreativeStudio } from './CreativeStudio/index';
import { useStudent } from '../context/StudentContext';

const PREVIEW_SETTINGS: StyleSettings = {
    fontSize: 16, scale: 0.65, borderColor: '#d4d4d8', borderWidth: 1, margin: 5, columns: 1, gap: 10,
    orientation: 'portrait', themeBorder: 'simple', contentAlign: 'center', fontWeight: 'normal',
    fontStyle: 'normal', visualStyle: 'card', fontFamily: 'Lexend', lineHeight: 1.4,
    letterSpacing: 0, showPedagogicalNote: true, showMascot: false, showStudentInfo: true,
    showTitle: true, showInstruction: true, showImage: false, showFooter: true, smartPagination: true,
    wordSpacing: 2, paragraphSpacing: 24, rulerHeight: 80, focusMode: false, rulerColor: '#6366f1', maskOpacity: 0.4
};

type DifficultyLevel = 'Başlangıç' | 'Orta' | 'Zor';
type ToastType = 'error' | 'warning' | 'info' | 'success';

// ─── Toast Bildirimi ──────────────────────────────────────────────
interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}
const Toast = ({ message, type, onClose }: ToastProps) => {
    const colors: Record<ToastType, string> = {
        error: 'bg-red-900/90 border-red-500/50 text-red-200',
        warning: 'bg-amber-900/90 border-amber-500/50 text-amber-200',
        info: 'bg-indigo-900/90 border-indigo-500/50 text-indigo-200',
        success: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-200',
    };
    const icons: Record<ToastType, string> = { error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info', success: 'fa-circle-check' };
    return (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl max-w-sm w-full ${colors[type]} animate-in slide-in-from-bottom-4 duration-300`}>
            <i className={`fa-solid ${icons[type]} text-lg mt-0.5 shrink-0`}></i>
            <p className="text-sm font-semibold leading-snug flex-1">{message}</p>
            <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
};

// ─── Gerçek Progress Bar ──────────────────────────────────────────
interface ProgressTrackerProps {
    phase: 'analyzing' | 'generating';
    startTime: number;
    retryCount: number;
    variantCount?: number;
    activeStudent?: Student | null;
}
const ProgressTracker = ({ phase, startTime, retryCount, variantCount = 1, activeStudent }: ProgressTrackerProps) => {
    const [elapsed, setElapsed] = (React as any).useState(0);

    (React as any).useEffect(() => {
        const timer = setInterval(() => setElapsed(Date.now() - startTime), 200);
        return () => clearInterval(timer);
    }, [startTime]);

    // Tahmini süreler (ms)
    const estimatedTime = phase === 'analyzing' ? 8000 : (12000 * variantCount);
    const progress = Math.min(95, (elapsed / estimatedTime) * 100);
    const elapsedSec = Math.floor(elapsed / 1000);

    const phases = phase === 'analyzing'
        ? [
            { label: 'Görsel İşleniyor', threshold: 10 },
            { label: 'Yapısal Analiz', threshold: 35 },
            { label: 'Blueprint Çıkarılıyor', threshold: 65 },
            { label: 'Kalite Doğrulama', threshold: 90 },
        ]
        : [
            { label: 'Blueprint Okunuyor', threshold: 10 },
            { label: 'İçerik Üretiliyor', threshold: 40 },
            { label: 'Kalite Kontrolü', threshold: 75 },
            { label: 'Sayfa İnşa Ediliyor', threshold: 90 },
        ];

    const currentPhase = phases.reduce((acc, p) => progress >= p.threshold ? p : acc, phases[0]);

    return (
        <div className="h-full flex flex-col items-center justify-center space-y-10">
            <div className="relative">
                <div className="w-32 h-32 border-8 border-indigo-500/10 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-indigo-400">{Math.floor(progress)}%</span>
                </div>
            </div>

            <div className="w-80 space-y-3">
                {/* Ana progress bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Faz göstergeleri */}
                <div className="flex justify-between">
                    {phases.map((p: { label: string, threshold: number }, i: number) => (
                        <div key={i} className={`flex items-center gap-1 text-[9px] font-bold transition-all ${progress >= p.threshold ? 'text-indigo-400' : 'text-slate-700'
                            }`}>
                            <i className={`fa-solid ${progress >= p.threshold ? 'fa-circle-check' : 'fa-circle'} text-[6px]`}></i>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-2xl font-black mb-2 tracking-tight">
                    {phase === 'analyzing' ? 'DERİN DNA ANALİZİ' : 'İnşa Başladı'}
                </h3>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">
                    {currentPhase.label}
                </p>
                <p className="text-slate-600 text-[10px] font-medium mt-2">
                    {elapsedSec}s geçti
                    {variantCount > 1 && phase === 'generating' && ` • ${variantCount} varyant`}
                </p>
                {retryCount > 0 && (
                    <p className="text-amber-400 text-xs mt-3 font-bold">
                        <i className="fa-solid fa-rotate mr-2"></i>Yeniden deneniyor ({retryCount}/2)...
                    </p>
                )}
                {activeStudent && phase === 'generating' && (
                    <p className="text-indigo-400/50 text-[10px] font-bold mt-3">
                        <i className="fa-solid fa-user-graduate mr-1.5"></i>
                        {activeStudent.name} için kişiselleştiriliyor
                    </p>
                )}
            </div>
        </div>
    );
};

// ─── Öğrenci Seçici ──────────────────────────────────────────────
interface StudentSelectorProps {
    students: Student[];
    activeStudent: Student | null;
    onSelect: (s: Student | null) => void;
}
const StudentSelector = ({ students, activeStudent, onSelect }: StudentSelectorProps) => {
    const [isOpen, setIsOpen] = (React as any).useState(false);
    if (students.length === 0) return null;
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all text-xs font-bold ${activeStudent
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
            >
                <i className={`fa-solid ${activeStudent ? 'fa-user-graduate' : 'fa-user-plus'}`}></i>
                {activeStudent ? activeStudent.name : 'Öğrenci Seç'}
                <i className={`fa-solid fa-chevron-down text-[8px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 right-0 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[220px] z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {activeStudent && (
                        <button onClick={() => { onSelect(null); setIsOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-xs font-medium text-red-400">
                            <i className="fa-solid fa-user-slash w-4 text-center"></i>Seçimi Kaldır
                        </button>
                    )}
                    {students.map((s: Student) => (
                        <button key={s.id} onClick={() => { onSelect(s); setIsOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-xs font-medium ${activeStudent?.id === s.id ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-300'}`}>
                            <span className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-black shrink-0">{s.avatar || s.name.charAt(0).toUpperCase()}</span>
                            <div className="text-left"><div className="font-bold">{s.name}</div><div className="text-[10px] text-slate-500">{s.grade} • {s.learningStyle}</div></div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Zorluk Seçici ──────────────────────────────────────────────
interface DifficultyPickerProps {
    selected: DifficultyLevel;
    onChange: (d: DifficultyLevel) => void;
}
const DifficultyPicker = ({ selected, onChange }: DifficultyPickerProps) => {
    const levels: { value: DifficultyLevel; icon: string; color: string; bg: string; border: string }[] = [
        { value: 'Başlangıç', icon: 'fa-seedling', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40' },
        { value: 'Orta', icon: 'fa-bolt', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
        { value: 'Zor', icon: 'fa-fire', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
    ];
    return (
        <div className="flex gap-2">
            {levels.map((l: { value: DifficultyLevel; icon: string; color: string; bg: string; border: string }) => (
                <button key={l.value} onClick={() => onChange(l.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${selected === l.value ? `${l.bg} ${l.border} ${l.color}` : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                        }`}>
                    <i className={`fa-solid ${l.icon}`}></i>{l.value}
                </button>
            ))}
        </div>
    );
};

// ─── PDF → Görsel Dönüştürücü ──────────────────────────────────
const convertPDFToImages = (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
        // PDF.js yüklü değilse fallback: ilk sayfayı canvas ile render et
        // PDF desteği için basit yaklaşım: her sayfayı ayrı base64 görsel yapar
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const uint8 = new Uint8Array(ev.target?.result as ArrayBuffer);
            try {
                // @ts-ignore — pdf.js global olarak yüklenmişse
                const pdfjsLib = (window as any).pdfjsLib;
                if (!pdfjsLib) {
                    // PDF.js yok — dosyayı data URL olarak döndür, API kendi çözer
                    const base64 = btoa(uint8.reduce((data, byte) => data + String.fromCharCode(byte), ''));
                    resolve([`data:application/pdf;base64,${base64}`]);
                    return;
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
                const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
                const images: string[] = [];
                const pageCount = Math.min(pdf.numPages, 5); // Maks 5 sayfa
                for (let i = 1; i <= pageCount; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 2 });
                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d')!;
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    images.push(canvas.toDataURL('image/jpeg', 0.85));
                }
                resolve(images);
            } catch {
                // Hata durumunda boş döndür
                resolve([]);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

// ─── Ana Bileşen ──────────────────────────────────────────────────
interface OCRScannerProps {
    onBack: () => void;
    onResult: (data: any) => void;
}
export const OCRScanner = ({ onBack, onResult }: OCRScannerProps) => {
    const { activeStudent, students, setActiveStudent } = useStudent();

    const [step, setStep] = (React as any).useState('upload' as 'upload' | 'analyzing' | 'studio' | 'generating' | 'result' | 'creative');
    const [images, setImages] = (React as any).useState([] as string[]);
    const [activeImageIndex, setActiveImageIndex] = (React as any).useState(0);
    const [blueprintData, setBlueprintData] = (React as any).useState(null as any);
    const [editedTitle, setEditedTitle] = (React as any).useState('');
    const [editedBlueprint, setEditedBlueprint] = (React as any).useState('');
    const [isEditingBlueprint, setIsEditingBlueprint] = (React as any).useState(false);
    const [difficulty, setDifficulty] = (React as any).useState('Orta' as DifficultyLevel);
    const [variantCount, setVariantCount] = (React as any).useState(1);
    const [finalData, setFinalData] = (React as any).useState(null as WorksheetData | null);
    const [toast, setToast] = (React as any).useState(null as { message: string; type: ToastType } | null);
    const [retryCount, setRetryCount] = (React as any).useState(0);
    const [progressStartTime, setProgressStartTime] = (React as any).useState(0);
    const [isDragOver, setIsDragOver] = (React as any).useState(false);
    const fileInputRef = (React as any).useRef(null as HTMLInputElement | null);
    const dropZoneRef = (React as any).useRef(null as HTMLDivElement | null);

    const showToast = (React as any).useCallback((message: string, type: ToastType = 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 6000);
    }, []);

    // ─── Dosya İşleme (hem file input hem drag&drop) ──────
    const processFiles = (React as any).useCallback(async (fileList: File[]) => {
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        const validImages: File[] = [];
        const pdfFiles: File[] = [];

        fileList.forEach(f => {
            if (f.type === 'application/pdf') {
                pdfFiles.push(f);
            } else if (allowedImageTypes.includes(f.type)) {
                if (f.size > 10 * 1024 * 1024) {
                    showToast(`"${f.name}" 10MB sınırını aşıyor.`, 'warning');
                } else {
                    validImages.push(f);
                }
            } else {
                showToast(`"${f.name}" formatı desteklenmiyor.`, 'warning');
            }
        });

        // PDF'leri görsele dönüştür
        let pdfImages: string[] = [];
        for (const pdf of pdfFiles) {
            if (pdf.size > 25 * 1024 * 1024) {
                showToast(`"${pdf.name}" 25MB PDF sınırını aşıyor.`, 'warning');
                continue;
            }
            const converted = await convertPDFToImages(pdf);
            if (converted.length === 0) {
                showToast(`"${pdf.name}" dönüştürülemedi.`, 'error');
            } else {
                pdfImages = [...pdfImages, ...converted];
                showToast(`"${pdf.name}" — ${converted.length} sayfa dönüştürüldü.`, 'success');
            }
        }

        // Görselleri oku
        const imagePromises = validImages.map(file => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }));

        const loadedImages = await Promise.all(imagePromises);
        const allNewImages = [...loadedImages, ...pdfImages];

        if (allNewImages.length === 0) return;

        const maxAllowed = 5 - images.length;
        const toAdd = allNewImages.slice(0, maxAllowed);
        if (allNewImages.length > maxAllowed) {
            showToast(`Maks. 5 görsel. ${allNewImages.length - maxAllowed} dosya atlandı.`, 'warning');
        }

        const updatedImages = [...images, ...toAdd];
        setImages(updatedImages);

        if (images.length === 0) {
            setActiveImageIndex(0);
            startAnalysis(updatedImages[0]);
        } else {
            showToast(`${toAdd.length} dosya eklendi. Toplam: ${updatedImages.length}`, 'success');
        }
    }, [images, showToast]);

    const handleFile = (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        if (files.length > 0) processFiles(files);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // ─── Drag & Drop ──────────────────────────────
    const handleDragOver = (React as any).useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = (React as any).useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
            setIsDragOver(false);
        }
    }, [dropZoneRef]);

    const handleDrop = (React as any).useCallback((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files) as File[];
        if (files.length > 0) processFiles(files);
    }, [processFiles]);

    const removeImage = (index: number) => {
        const newImages = images.filter((_: string, i: number) => i !== index);
        setImages(newImages);
        if (activeImageIndex >= newImages.length) setActiveImageIndex(Math.max(0, newImages.length - 1));
    };

    const analyzeImageAt = (index: number) => {
        setActiveImageIndex(index);
        startAnalysis(images[index]);
    };

    // ─── Analiz ──────────────────────────────────
    const startAnalysis = async (img: string, isRetry = false) => {
        setStep('analyzing');
        setProgressStartTime(Date.now());
        try {
            const result = await ocrService.processImage(img);
            setBlueprintData(result.structuredData);
            setEditedTitle(result.structuredData?.title || '');
            setEditedBlueprint(result.structuredData?.worksheetBlueprint || '');
            if (result.warnings && result.warnings.length > 0) showToast(result.warnings[0], 'warning');
            if (isRetry) setRetryCount(0);
            setStep('studio');
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata.';
            const currentRetry = retryCount + 1;
            if (currentRetry < 2) {
                setRetryCount(currentRetry);
                showToast(`Analiz başarısız (${currentRetry}/2). Yeniden deneniyor...`, 'info');
                setTimeout(() => startAnalysis(img, true), 1500);
            } else {
                setRetryCount(0);
                const friendlyMessage = (() => {
                    if (errorMessage.includes('Blueprint boş')) return 'Görsel analiz edilemedi. Daha net bir görsel deneyin.';
                    if (errorMessage.includes('kısa')) return 'İçerik çok az tespit edildi. Daha büyük bir görsel yükleyin.';
                    if (errorMessage.includes('API') || errorMessage.includes('503') || errorMessage.includes('502')) return 'AI servisi meşgul. Birkaç saniye sonra tekrar deneyin.';
                    return 'Mimari analiz başarısız. Farklı bir görsel deneyin.';
                })();
                showToast(friendlyMessage, 'error');
                setStep('upload');
            }
        }
    };

    // ─── Klonlama ──────────────────────────────────
    const handleClone = async () => {
        setStep('generating');
        setProgressStartTime(Date.now());
        try {
            const blueprintToUse = isEditingBlueprint ? editedBlueprint : blueprintData.worksheetBlueprint;
            const titleToUse = editedTitle || blueprintData.title;
            const options: GeneratorOptions = {
                mode: 'ai', difficulty, worksheetCount: variantCount, itemCount: 8, topic: titleToUse,
                ...(activeStudent ? { studentContext: activeStudent } : {})
            };
            const result = await generateFromRichPrompt(ActivityType.OCR_CONTENT, blueprintToUse, options);
            if (result) {
                setFinalData(Array.isArray(result) ? result : [result]);
                setStep('result');
            }
        } catch (e) {
            showToast('Mimari inşa edilemedi. Tekrar deneyin.', 'error');
            setStep('studio');
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden font-['Lexend'] text-white">
            {/* Header */}
            <div className="h-16 bg-[#16161a] border-b border-white/5 flex justify-between items-center px-6 shrink-0 z-50">
                <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 transition-all">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">Mimari Klonlayıcı</h2>
                    <span className="text-[8px] font-bold opacity-30 tracking-[0.2em]">NEURO-ARCH ENGINE v3.0</span>
                </div>
                <StudentSelector students={students} activeStudent={activeStudent} onSelect={setActiveStudent} />
            </div>

            {/* İçerik */}
            <div className="flex-1 overflow-y-auto p-6 relative">

                {/* ═══════ UPLOAD + DRAG & DROP ═══════ */}
                {step === 'upload' && (
                    <div
                        ref={dropZoneRef}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto relative transition-all ${isDragOver ? 'scale-[1.02]' : ''
                            }`}
                    >
                        {/* Drag overlay */}
                        {isDragOver && (
                            <div className="absolute inset-0 bg-indigo-600/20 border-4 border-dashed border-indigo-400 rounded-[4rem] z-40 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="w-24 h-24 bg-indigo-500/30 rounded-[2rem] flex items-center justify-center text-5xl text-indigo-300 mb-6 animate-bounce">
                                    <i className="fa-solid fa-cloud-arrow-up"></i>
                                </div>
                                <h3 className="text-2xl font-black text-indigo-300">Görselleri Buraya Bırakın</h3>
                                <p className="text-indigo-400/60 text-xs font-bold mt-2">JPG, PNG, WEBP veya PDF</p>
                            </div>
                        )}

                        <div className="w-24 h-24 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl border-4 border-indigo-400/30 rotate-3 animate-pulse">
                            <i className="fa-solid fa-dna"></i>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter text-white">Materyal Klonla</h1>
                        <p className="text-slate-400 max-w-xl mb-6 text-lg leading-relaxed font-medium">
                            Görselleri sürükle-bırak veya dosya seçerek yükleyin. PDF desteği de var!
                        </p>
                        <div className="text-xs text-slate-600 mb-8 font-medium flex items-center gap-4 flex-wrap justify-center">
                            <span><i className="fa-solid fa-circle-info mr-1.5 text-indigo-500"></i>JPG, PNG, WEBP, PDF</span>
                            <span><i className="fa-solid fa-images mr-1.5 text-indigo-500"></i>Maks. 5 Görsel</span>
                            <span><i className="fa-solid fa-hand-pointer mr-1.5 text-indigo-500"></i>Sürükle & Bırak</span>
                        </div>

                        {/* Yüklenen görseller galeri strip */}
                        {images.length > 0 && (
                            <div className="w-full mb-8">
                                <div className="flex items-center gap-3 overflow-x-auto pb-3 px-4 custom-scrollbar justify-center">
                                    {images.map((img: string, i: number) => (
                                        <div key={i} className="relative group shrink-0">
                                            <img src={img} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-indigo-400/50 transition-all" alt={`Görsel ${i + 1}`} />
                                            <button onClick={() => removeImage(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                <i className="fa-solid fa-xmark"></i>
                                            </button>
                                            <button onClick={() => analyzeImageAt(i)} className="absolute inset-0 bg-indigo-600/0 hover:bg-indigo-600/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <i className="fa-solid fa-magnifying-glass text-white text-sm"></i>
                                            </button>
                                            <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] font-black px-1.5 py-0.5 rounded-md">{i + 1}</span>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 hover:border-indigo-400/50 flex flex-col items-center justify-center shrink-0 text-slate-500 hover:text-indigo-400 transition-all">
                                            <i className="fa-solid fa-plus text-lg"></i>
                                            <span className="text-[9px] mt-1 font-bold">Ekle</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
                            <button onClick={() => fileInputRef.current?.click()} className="group p-10 bg-white text-indigo-950 rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-200">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl text-indigo-600"><i className="fa-solid fa-file-import"></i></div>
                                <div><h4 className="font-black text-xl mb-1">Mimari Analiz</h4><p className="text-xs font-medium text-slate-500">Görselden veya PDF'den Blueprint Çıkar</p></div>
                            </button>
                            <button onClick={() => setStep('creative')} className="group p-10 bg-indigo-600 text-white rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-4 text-center border-4 border-transparent hover:border-indigo-400">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                                <div><h4 className="font-black text-xl mb-1">Creative Studio</h4><p className="text-xs font-medium text-indigo-100 opacity-70">Fikirleri Gerçeğe Dönüştür</p></div>
                            </button>
                        </div>

                        <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf" capture="environment" multiple className="hidden" />
                    </div>
                )}

                {/* ═══════ CREATIVE STUDIO ═══════ */}
                {step === 'creative' && <CreativeStudio onResult={onResult} onCancel={() => setStep('upload')} />}

                {/* ═══════ ANALYZING — Gerçek Progress ═══════ */}
                {step === 'analyzing' && (
                    <ProgressTracker phase="analyzing" startTime={progressStartTime} retryCount={retryCount} />
                )}

                {/* ═══════ STUDIO — BLUEPRINT EDITOR ═══════ */}
                {step === 'studio' && blueprintData && (
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-in slide-in-from-bottom-10 duration-700">
                        {/* Sol — Referans Görselleri */}
                        <div className="space-y-4">
                            <div className="bg-black/40 rounded-[3rem] border border-white/10 p-8 shadow-2xl overflow-hidden group relative">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Referans Görsel</p>
                                <img src={images[activeImageIndex]} className="w-full rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" alt="Source" />
                                <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20 rounded-[3rem]"></div>
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 px-4 overflow-x-auto custom-scrollbar pb-2">
                                    {images.map((img: string, i: number) => (
                                        <button key={i} onClick={() => analyzeImageAt(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === i ? 'border-indigo-500 scale-110 shadow-lg shadow-indigo-500/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                                            <img src={img} className="w-full h-full object-cover" alt={`Sayfa ${i + 1}`} />
                                        </button>
                                    ))}
                                    {images.length < 5 && (
                                        <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl border-2 border-dashed border-white/20 hover:border-indigo-400/50 flex items-center justify-center shrink-0 text-slate-500 hover:text-indigo-400 transition-all">
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sağ — Blueprint Studio */}
                        <div className="space-y-6">
                            <div className="p-8 bg-zinc-900/50 rounded-[3rem] border border-white/10 shadow-inner relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5"><i className="fa-solid fa-code text-9xl"></i></div>
                                <div className="flex items-center gap-3 mb-5 flex-wrap">
                                    <span className="px-4 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-full text-[10px] font-black uppercase border border-emerald-500/30">MİMARİ DNA ANALİZ EDİLDİ</span>
                                    {blueprintData.detectedType && blueprintData.detectedType !== 'ARCH_CLONE' && (
                                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-[9px] font-black uppercase border border-indigo-500/20">
                                            {blueprintData.detectedType.replace(/_/g, ' ')}
                                        </span>
                                    )}
                                </div>

                                {/* Düzenlenebilir Başlık */}
                                <div className="group mb-4">
                                    <input type="text" value={editedTitle} onChange={(e: any) => setEditedTitle(e.target.value)}
                                        className="w-full text-3xl font-black tracking-tighter bg-transparent border-b-2 border-transparent hover:border-white/10 focus:border-indigo-500 outline-none transition-all py-1 text-white placeholder-slate-600"
                                        placeholder="Başlık ekleyin..." />
                                    <p className="text-[9px] text-slate-600 mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        <i className="fa-solid fa-pen-to-square mr-1"></i>Tıklayarak başlığı düzenleyin
                                    </p>
                                </div>

                                {/* Layout Hints */}
                                {blueprintData.layoutHints && (
                                    <div className="flex gap-2 mb-5 flex-wrap">
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                                            <i className="fa-solid fa-table-columns text-indigo-400"></i>{blueprintData.layoutHints.columns} Sütun
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                                            <i className="fa-solid fa-circle-question text-indigo-400"></i>~{blueprintData.layoutHints.questionCount} Soru
                                        </div>
                                        {blueprintData.layoutHints.hasImages && (
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                                                <i className="fa-solid fa-image text-indigo-400"></i>Görsel İçeriyor
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Düzenlenebilir Blueprint */}
                                <div className="bg-black/40 rounded-3xl border border-white/5 mb-6 overflow-hidden">
                                    <div className="flex justify-between items-center px-5 py-3 border-b border-white/5">
                                        <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Teknik Blueprint</h4>
                                        <button onClick={() => setIsEditingBlueprint(!isEditingBlueprint)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isEditingBlueprint ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'}`}>
                                            <i className={`fa-solid ${isEditingBlueprint ? 'fa-lock-open' : 'fa-pen'}`}></i>
                                            {isEditingBlueprint ? 'Düzenleniyor' : 'Düzenle'}
                                        </button>
                                    </div>
                                    {isEditingBlueprint ? (
                                        <textarea value={editedBlueprint} onChange={(e: any) => setEditedBlueprint(e.target.value)}
                                            className="w-full p-5 text-[11px] font-mono text-indigo-300 leading-relaxed bg-transparent resize-none outline-none custom-scrollbar min-h-[200px]"
                                            spellCheck={false} />
                                    ) : (
                                        <pre className="p-5 text-[11px] font-mono text-indigo-300 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                            {editedBlueprint || blueprintData.worksheetBlueprint}
                                        </pre>
                                    )}
                                </div>

                                {/* Zorluk & Varyant */}
                                <div className="space-y-4 mb-6">
                                    <div><label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Zorluk Seviyesi</label><DifficultyPicker selected={difficulty} onChange={setDifficulty} /></div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Varyant Sayısı</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3].map((n: number) => (
                                                <button key={n} onClick={() => setVariantCount(n)} className={`w-12 h-12 rounded-xl border font-black text-sm transition-all ${variantCount === n ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'}`}>
                                                    {n}×
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {activeStudent && (
                                        <div className="flex items-center gap-3 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-black">{activeStudent.avatar || activeStudent.name.charAt(0).toUpperCase()}</span>
                                            <div className="text-left flex-1"><p className="text-xs font-bold text-indigo-300">{activeStudent.name}</p><p className="text-[10px] text-indigo-400/60">{activeStudent.grade} • {activeStudent.learningStyle} • {activeStudent.diagnosis.join(', ')}</p></div>
                                            <i className="fa-solid fa-user-check text-indigo-400/50 text-xs"></i>
                                        </div>
                                    )}
                                </div>

                                <button onClick={handleClone} className="w-full py-6 bg-white text-indigo-950 font-black rounded-[2rem] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 text-xl overflow-hidden group">
                                    <i className="fa-solid fa-rocket group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
                                    {variantCount > 1 ? `${variantCount} VARYANT İNŞA ET` : 'MİMARİYİ YENİDEN İNŞA ET'}
                                </button>
                                <button onClick={() => setStep('upload')} className="w-full mt-4 py-3 text-slate-500 font-bold hover:text-white transition-colors text-sm uppercase tracking-widest">Farklı Görsel Seç</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════ GENERATING — Gerçek Progress ═══════ */}
                {step === 'generating' && (
                    <ProgressTracker phase="generating" startTime={progressStartTime} retryCount={0} variantCount={variantCount} activeStudent={activeStudent} />
                )}

                {/* ═══════ RESULT ═══════ */}
                {step === 'result' && finalData && (
                    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in duration-1000">
                        <div className="flex justify-between items-center mb-8 bg-zinc-900/80 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 pl-4">
                                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20"><i className="fa-solid fa-check-double"></i></div>
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Başarılı</span>
                                    <h4 className="text-lg font-black text-white leading-none">
                                        {(finalData as any[]).length > 1 ? `${(finalData as any[]).length} Varyant Hazır` : 'Mimari Klon Hazır'}
                                    </h4>
                                </div>
                            </div>
                            <button onClick={() => onResult(finalData)} className="px-12 py-4 bg-white text-indigo-950 font-black rounded-2xl text-sm shadow-xl hover:scale-105 transition-all uppercase tracking-widest">
                                DÜZENLE VE YAZDIR <i className="fa-solid fa-chevron-right ml-2"></i>
                            </button>
                        </div>
                        <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border-[15px] border-white/5 transform scale-[0.98]">
                            <Worksheet activityType={ActivityType.OCR_CONTENT} data={finalData} settings={PREVIEW_SETTINGS} />
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Studio adımında ekstra görsel yükleme desteği */}
            {step === 'studio' && (
                <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf" multiple className="hidden" />
            )}

            <style>{`
                @keyframes progress { 0% { left: -100%; width: 60%; } 100% { left: 100%; width: 60%; } }
                .animate-progress { position: relative; animation: progress 2s infinite cubic-bezier(0.65, 0, 0.35, 1); }
            `}</style>
        </div>
    );
};
