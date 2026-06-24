import { AppError } from '../../utils/AppError';
import { DEFAULT_BLUEPRINT, getBlueprintOrFallback } from '../../utils/blueprint';
import { useState, useRef, useCallback } from 'react';
import { ocrService } from '../../services/ocrService';
import { StyleSettings, WorksheetData, Student } from '../../types';
import { useStudentStore } from '../../store/useStudentStore';
import { useReadingStore } from '../../store/useReadingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { validateBase64Image } from '../../utils/imageValidator';
import { logError } from '../../utils/logger.js';
import { ToastType } from './OCRToast';

export type DifficultyLevel = 'Başlangıç' | 'Orta' | 'Zor';

export type OCRStep = 'upload' | 'analyzing' | 'studio' | 'generating' | 'result' | 'creative' | 'variations';

export const PREVIEW_SETTINGS: StyleSettings = {
  fontSize: 16,
  scale: 0.65,
  borderColor: '#d4d4d8',
  borderWidth: 1,
  margin: 5,
  columns: 1,
  gap: 10,
  orientation: 'portrait',
  themeBorder: 'simple',
  contentAlign: 'center',
  fontWeight: 'normal',
  fontStyle: 'normal',
  visualStyle: 'card',
  fontFamily: 'Lexend',
  lineHeight: 1.4,
  letterSpacing: 0,
  showPedagogicalNote: true,
  showMascot: false,
  showStudentInfo: true,
  showTitle: true,
  showInstruction: true,
  showImage: false,
  showFooter: true,
  showAnswers: false,
  showClues: false,
  smartPagination: true,
  wordSpacing: 2,
  paragraphSpacing: 24,
  rulerHeight: 80,
  focusMode: false,
  rulerColor: '#6366f1',
  maskOpacity: 0.4,
  footerText: '',
};

const FILE_SIZE_LIMITS = {
  image: 12 * 1024 * 1024,
  pdf: 15 * 1024 * 1024,
  total: 50 * 1024 * 1024,
};

const RETRY_CONFIG = {
  maxAttempts: 4,
  delays: [1500, 3000, 6000, 12000] as unknown as number[],
  retryableErrors: ['503', '502', '429', 'timeout', 'ECONNREFUSED', 'ETIMEDOUT'],
  nonRetryableErrors: ['blueprint boş', 'blueprint çok kısa'],
};

const convertPDFToImages = (file: File): Promise<string[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const uint8 = new Uint8Array(ev.target?.result as unknown as ArrayBuffer);
      try {
        const pdfjsLib = (window as unknown as Record<string, unknown>).pdfjsLib as { GlobalWorkerOptions: { workerSrc: string }; getDocument: (params: { data: Uint8Array }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<{ getViewport: (params: { scale: number }) => { width: number; height: number }; render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> } }> }> } } | undefined;
        if (!pdfjsLib) {
          const base64 = btoa(uint8.reduce((data, byte) => data + String.fromCharCode(byte), ''));
          resolve([`data:application/pdf;base64,${base64}`]);
          return;
        }
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;
        const images: string[] = [];
        const pageCount = Math.min(pdf.numPages, 10);
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const quality = viewport.width > 2000 ? 0.9 : 0.8;
          images.push(canvas.toDataURL('image/jpeg', quality));
          canvas.width = 0;
          canvas.height = 0;
          canvas.remove();
        }
        resolve(images);
      } catch {
        resolve([]);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};

export interface OCRScannerState {
  step: OCRStep;
  images: string[];
  activeImageIndex: number;
  blueprintData: any;
  editedTitle: string;
  editedBlueprint: string;
  isEditingBlueprint: boolean;
  difficulty: DifficultyLevel;
  variantCount: number;
  itemCount: number;
  concept: string;
  finalData: WorksheetData | null;
  toast: { message: string; type: ToastType } | null;
  retryCount: number;
  progressStartTime: number;
  isDragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  variationResults: any;
  variationCount: number;
  activeStudent: Student | null;
  students: Student[];
  user: any;
}

export interface OCRScannerActions {
  setStep: (step: OCRStep) => void;
  setBlueprintData: (data: any) => void;
  setEditedTitle: (title: string) => void;
  setEditedBlueprint: (bp: string) => void;
  setIsEditingBlueprint: (editing: boolean) => void;
  setDifficulty: (d: DifficultyLevel) => void;
  setVariantCount: (count: number) => void;
  setItemCount: (count: number) => void;
  setConcept: (concept: string) => void;
  setFinalData: (data: WorksheetData | null) => void;
  setVariationCount: (count: number) => void;
  setActiveStudent: (s: Student | null) => void;
  showToast: (message: string, type?: ToastType) => void;
  handleFile: (e: any) => void;
  handleDragOver: (e: any) => void;
  handleDragLeave: (e: any) => void;
  handleDrop: (e: any) => void;
  removeImage: (index: number) => void;
  analyzeImageAt: (index: number) => void;
  startAnalysis: (img: string, attemptNumber?: number) => Promise<void>;
  handleGenerateVariations: () => Promise<void>;
  onBack: () => void;
  onResult: (data: any) => void;
}

export const useOCRScanner = (
  onBack: () => void,
  onResult: (data: any) => void
): OCRScannerState & OCRScannerActions => {
  const { activeStudent, students, setActiveStudent } = useStudentStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<OCRStep>('upload');
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedBlueprint, setEditedBlueprint] = useState('');
  const [isEditingBlueprint, setIsEditingBlueprint] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Orta');
  const [variantCount, setVariantCount] = useState(1);
  const [itemCount, setItemCount] = useState(8);
  const [concept, setConcept] = useState('');
  const [finalData, setFinalData] = useState<WorksheetData | null>(null);
  const { _layout, _setLayout } = useReadingStore() as any;
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [progressStartTime, setProgressStartTime] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const [variationResults, setVariationResults] = useState<any>(null);
  const [variationCount, setVariationCount] = useState(3);

  const showToast = useCallback((message: string, type: ToastType = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 6000);
  }, []);

  const validateAndProcessFile = (
    file: File,
    _index: number,
    _total: number
  ): { valid: boolean; reason?: string } => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedMimes = [...allowedImageTypes, 'application/pdf'];

    if (!allowedMimes.includes(file.type)) {
      return {
        valid: false,
        reason: `${file.name} (${file.type || 'unknown'}) formatı desteklenmiyor. Desteklenen: JPG, PNG, WebP, GIF, PDF`,
      };
    }

    const isImage = allowedImageTypes.includes(file.type);
    const _isPDF = file.type === 'application/pdf';
    const sizeLimit = isImage ? FILE_SIZE_LIMITS.image : FILE_SIZE_LIMITS.pdf;
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);

    if (file.size > sizeLimit) {
      const limitMB = (sizeLimit / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        reason: `${file.name} çok büyük (${sizeInMB}MB, max ${limitMB}MB). Lütfen daha küçük bir dosya kullanın.`,
      };
    }

    if (file.size < 10 * 1024) {
      return {
        valid: false,
        reason: `${file.name} çok küçük veya hasar görmüş (${sizeInMB}MB). Tam bir dosya yükleyin.`,
      };
    }

    return { valid: true };
  };

  const isRetryableError = (errorMsg: string): boolean => {
    const lower = errorMsg.toLowerCase();
    if (RETRY_CONFIG.nonRetryableErrors.some((p) => lower.includes(p))) return false;
    return RETRY_CONFIG.retryableErrors.some((pattern) =>
      errorMsg.toUpperCase().includes(pattern.toUpperCase())
    );
  };

  const startAnalysis = async (img: string, attemptNumber: number = 1) => {
    if (!navigator.onLine) {
      showToast('İnternet bağlantınız kesildi. Lütfen kontrol edin.', 'error');
      return;
    }

    setStep('analyzing');
    setProgressStartTime(Date.now());

    try {
      const result = await ocrService.processImage(img);
      const rawStruct = result.structuredData as unknown as Record<string, unknown>;
      const safeBlueprint = getBlueprintOrFallback(rawStruct, DEFAULT_BLUEPRINT);
      setBlueprintData(safeBlueprint);
      setEditedTitle(rawStruct?.title ?? safeBlueprint?.title ?? '');
      setEditedBlueprint(rawStruct?.worksheetBlueprint ?? safeBlueprint?.worksheetBlueprint ?? '');

      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning: string) => {
          showToast(warning, 'warning');
        });
      }

      if (attemptNumber > 1) {
        setRetryCount(0);
        showToast(`✅ Analiz başarılı (${attemptNumber}. denemede)`, 'success');
      }
      setStep('studio');
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata.';
      const isRetryable = isRetryableError(errorMessage);
      const remainingAttempts = RETRY_CONFIG.maxAttempts - attemptNumber;

      logError(`[OCR Analysis] Attempt ${attemptNumber}/${RETRY_CONFIG.maxAttempts} failed:`, {
        error: errorMessage,
        isRetryable,
        remainingAttempts,
      });

      if (isRetryable && remainingAttempts > 0) {
        const delayMs = RETRY_CONFIG.delays[attemptNumber - 1] || 15000;
        const delaySec = (delayMs / 1000).toFixed(1);

        setRetryCount(attemptNumber);
        showToast(
          `⏳ Analiz başarısız (${attemptNumber}/${RETRY_CONFIG.maxAttempts}). ${delaySec}s içinde yeniden deneyin...`,
          'warning'
        );

        setTimeout(() => startAnalysis(img, attemptNumber + 1), delayMs);
      } else {
        setRetryCount(0);

        const friendlyErrorMap: Record<string, string> = {
          'Blueprint boş': 'Görsel analiz edilemedi. Daha net/büyük bir görsel deneyin.',
          kısa: 'İçerik çok az tespit edildi. Daha detaylı bir belgeden upload etmeyi deneyin.',
          layoutHints: 'Sayfa yapısı tanınamadı. Farklı bir belge deneyin.',
          detectedType: 'Belge tipi tanınamadı. Eğitim belgesi olup olmadığını kontrol edin.',
        };

        let friendlyMessage = 'Mimari analiz başarısız. Farklı bir görsel deneyin.';

        for (const [pattern, message] of Object.entries(friendlyErrorMap)) {
          if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
            friendlyMessage = message;
            break;
          }
        }

        if (errorMessage.includes('503') || errorMessage.includes('502')) {
          friendlyMessage = 'AI servisi şu anda meşgul. Lütfen 30 saniye bekleyip tekrar deneyiniz.';
        } else if (errorMessage.includes('429')) {
          friendlyMessage = 'Çok hızlı istekler gönderiliyor. Lütfen bir dakika bekleyin.';
        }

        showToast(`❌ ${friendlyMessage}`, 'error');
        logError(`[OCR Analysis] Failed after ${attemptNumber} attempt(s)`, {
          originalError: errorMessage,
          friendlyMessage,
        });

        setStep('upload');
      }
    }
  };

  const processFiles = useCallback(
    async (fileList: File[]) => {
      if (fileList.length === 0) return;

      if (fileList.length > 5) {
        showToast(
          `Maksimum 5 dosya seçebilirsin. ${fileList.length} dosya yükleme deneniyor, sadece ilk 5 işlenecek.`,
          'warning'
        );
        fileList = Array.from(fileList).slice(0, 5);
      }

      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const validImages: File[] = [];
      const pdfFiles: File[] = [];
      const rejectedFiles: { name: string; reason: string }[] = [];
      let totalSize = 0;

      fileList.forEach((f, index) => {
        const validation = validateAndProcessFile(f, index, fileList.length);

        if (!validation.valid) {
          rejectedFiles.push({ name: f.name, reason: validation.reason || 'Bilinmeyen hata' });
          return;
        }

        totalSize += f.size;

        if (totalSize > FILE_SIZE_LIMITS.total) {
          rejectedFiles.push({
            name: f.name,
            reason: `Batch çok büyük olur (${(totalSize / (1024 * 1024)).toFixed(1)}MB toplam). Toplamda max 50MB.`,
          });
          totalSize -= f.size;
          return;
        }

        if (f.type === 'application/pdf') {
          pdfFiles.push(f);
        } else if (allowedImageTypes.includes(f.type)) {
          validImages.push(f);
        }
      });

      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((rf) => {
          showToast(`❌ ${rf.name}: ${rf.reason}`, 'error');
        });
      }

      if (validImages.length === 0 && pdfFiles.length === 0) {
        if (rejectedFiles.length === 0) {
          showToast('Desteklenen dosya seçilmedi', 'info');
        }
        return;
      }

      let pdfImages: string[] = [];
      for (const pdf of pdfFiles) {
        try {
          showToast(`🔄 "${pdf.name}" dönüştürülüyor...`, 'info');
          const converted = await convertPDFToImages(pdf);

          if (converted.length === 0) {
            showToast(`❌ "${pdf.name}" dönüştürülemedi. Dosya hasar görmüş olabilir.`, 'error');
          } else {
            pdfImages = [...pdfImages, ...converted];
            showToast(`✅ "${pdf.name}" başarılı (${converted.length} sayfa)`, 'success');

            if (converted.length > 5) {
              showToast(
                `📄 "${pdf.name}" ${converted.length} sayfa — tüm sayfalar işlenecek (zaman alabilir)`,
                'warning'
              );
            }
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
          showToast(`❌ "${pdf.name}" işlenirken hata: ${errorMsg}`, 'error');
        }
      }

      const imagePromises = validImages.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve(ev.target?.result as unknown as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

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
    },
    [images, showToast]
  );

  const handleFile = (e: any) => {
    const files = Array.from(e.target.files || []) as unknown as File[];
    if (files.length > 0) processFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = useCallback((e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as unknown as Node)) {
        setIsDragOver(false);
      }
    },
    [dropZoneRef]
  );

  const handleDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer.files) as unknown as File[];
      if (files.length > 0) processFiles(files);
    },
    [processFiles]
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_: string, i: number) => i !== index);
    setImages(newImages);
    if (activeImageIndex >= newImages.length)
      setActiveImageIndex(Math.max(0, newImages.length - 1));
  };

  const analyzeImageAt = (index: number) => {
    setActiveImageIndex(index);
    startAnalysis(images[index]);
  };

  const handleGenerateVariations = async () => {
    setStep('generating');
    setProgressStartTime(Date.now());

    try {
      const validation = validateBase64Image(images[activeImageIndex]);
      if (!validation.valid) {
        showToast(validation.reason || 'Görsel geçersiz.', 'error');
        setStep('studio');
        return;
      }

      const blueprintToUse = isEditingBlueprint
        ? editedBlueprint
        : blueprintData.worksheetBlueprint;
      const titleToUse = editedTitle || blueprintData.title;

      const response = await fetch('/api/ocr/generate-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueprint: {
            detectedType: blueprintData?.detectedType || 'ARCH_CLONE',
            quality: 'high',
            structuredData: {
              ...blueprintData,
              worksheetBlueprint: blueprintToUse,
              title: titleToUse,
            },
          },
          count: variationCount,
          userId: (user as any)?.uid || user?.id || 'anonymous',
          config: {
            targetProfile: (activeStudent as any)?.learningDisabilities?.[0] || 'mixed',
            ageGroup: activeStudent?.age
              ? activeStudent.age <= 7
                ? '5-7'
                : activeStudent.age <= 10
                  ? '8-10'
                  : activeStudent.age <= 13
                    ? '11-13'
                    : '14+'
              : '8-10',
            difficultyLevel: difficulty as 'Kolay' | 'Orta' | 'Zor',
            preserveLayout: true,
            preserveStructure: true,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(
          errorData.error?.message || 'Varyasyon üretimi başarısız oldu.',
          'INTERNAL_ERROR',
          500
        );
      }

      const result = await response.json();

      if (result.success && result.data) {
        setVariationResults(result.data);
        setStep('variations');
        showToast(
          `✅ ${result.data.metadata.successfulCount} varyasyon başarıyla üretildi!`,
          'success'
        );
      } else {
        throw new AppError('Geçersiz yanıt formatı.', 'INTERNAL_ERROR', 500);
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata.';
      showToast(`❌ Varyasyon üretimi başarısız: ${errorMessage}`, 'error');
      logError(`[OCR Variation] Generation failed: ${errorMessage}`);
      setStep('studio');
    }
  };

  return {
    step, setStep,
    images, activeImageIndex,
    blueprintData, setBlueprintData,
    editedTitle, setEditedTitle,
    editedBlueprint, setEditedBlueprint,
    isEditingBlueprint, setIsEditingBlueprint,
    difficulty, setDifficulty,
    variantCount, setVariantCount,
    itemCount, setItemCount,
    concept, setConcept,
    finalData, setFinalData,
    toast,
    retryCount,
    progressStartTime,
    isDragOver,
    fileInputRef, dropZoneRef,
    variationResults, variationCount, setVariationCount,
    activeStudent, students, setActiveStudent,
    user,
    showToast,
    handleFile,
    handleDragOver, handleDragLeave, handleDrop,
    removeImage, analyzeImageAt,
    startAnalysis,
    handleGenerateVariations,
    onBack,
    onResult,
  };
};
