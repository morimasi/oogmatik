// ============================================================
// VisionStudio — Dosya Yükleme Adımı
// 1, 2 veya 3 varyasyon seçimi ile çok modlu yükleme
// ============================================================
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useVisionStudioStore } from '../../../store/useVisionStudioStore';
import { uploadActivityFile } from '../../../services/visionStudio/activityRepository';
import { analyzeUploadedFile } from '../../../services/visionStudio/visionAnalysisService';
import { useAuthStore } from '../../../store/useAuthStore';
import { AppError } from '../../../utils/AppError';

const MAX_MB = 20;
// Vercel gövde sınırı (~4.5 MB) nedeniyle base64 yalnızca küçük dosyalarda gönderilir.
const INLINE_BASE64_MAX_BYTES = 2.5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Dosya okunamadi.'));
    reader.readAsDataURL(file);
  });
}

export default function UploadStep() {
  const { user } = useAuthStore();
  const {
    setStep,
    setUploadedFile,
    setAnalysisResult,
    setGeneratedActivities,
    setLoading,
    setError,
    isLoading,
    error,
  } = useVisionStudioStore();

  const [variationCount, setVariationCount] = useState<number>(2);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (!user?.id) {
        setError('Oturum bilgisi bulunamadi. Lutfen tekrar giris yapin.');
        return;
      }

      setError(null);
      setLoading(true);

      try {
        // 1. Dosyayı önce Storage'a yüklemeyi dene (izin yoksa base64 ile devam edilir)
        setPhase('uploading');
        setUploadProgress(10);

        let downloadUrl = '';
        let fileId = uuid();
        try {
          const uploaded = await uploadActivityFile(file, user.id, (p) =>
            setUploadProgress(10 + Math.round(p * 0.55))
          );
          downloadUrl = uploaded.downloadUrl;
          fileId = uploaded.id;
          setUploadedFile(uploaded);
        } catch (storageErr) {
          console.warn('[VisionStudio] Storage doğrudan yükleme atlandı (base64 ile devam ediliyor):', storageErr);
          setUploadedFile({
            id: fileId,
            storagePath: `visionStudio/${user.id}/${fileId}`,
            downloadUrl: URL.createObjectURL(file),
            fileName: file.name,
            fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
            fileSizeBytes: file.size,
            uploadedAt: new Date().toISOString(),
            uploadedBy: user.id,
          });
        }

        const canUseRemoteUrl = Boolean(downloadUrl);
        // Remote URL (Firebase Storage) basariliysa Vercel'e base64 gondermeye gerek yoktur.
        const shouldInline = !canUseRemoteUrl && file.size <= INLINE_BASE64_MAX_BYTES;

        if (!canUseRemoteUrl && !shouldInline) {
          throw new AppError(
            `Dosya depolamaya yuklenemedi ve ${Math.round(INLINE_BASE64_MAX_BYTES / (1024 * 1024))} MB uzerindeki dosyalar dogrudan analiz edilemiyor. Lutfen Firebase Storage kurallarini guncelleyin veya daha kucuk bir dosya deneyin.`,
            'FILE_TOO_LARGE',
            413
          );
        }

        const fileBase64 = shouldInline ? await readAsDataUrl(file) : undefined;
        setUploadProgress(80);

        setPhase('analyzing');
        setStep('analyzing');

        const response = await analyzeUploadedFile(
          {
            fileUrl: canUseRemoteUrl ? downloadUrl : undefined,
            ...(fileBase64 ? { fileBase64 } : {}),
            fileName: file.name,
            fileType: file.type === 'application/pdf' ? 'pdf' : 'image',
            fileId,
            userId: user.id,
            generateVariations: variationCount,
          },
          user.id,
          user.role
        );

        // Etkinlikleri sunucu (Admin SDK) zaten kaydetti; istemci tekrar yazmaz.
        setAnalysisResult(response.analysis);
        setGeneratedActivities(response.activities);
        setStep('preview');
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.';
        setError(msg);
        setStep('upload');
      } finally {
        setLoading(false);
        setPhase('idle');
        setUploadProgress(0);
      }
    },
    [user, variationCount, setUploadedFile, setAnalysisResult, setGeneratedActivities, setStep, setLoading, setError]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg':      ['.jpg', '.jpeg'],
      'image/png':       ['.png'],
      'image/webp':      ['.webp'],
    },
    maxFiles: 1,
    maxSize: MAX_MB * 1024 * 1024,
    disabled: isLoading,
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3">
        <Sparkles className="h-3.5 w-3.5" /> Gemini 2.5 Flash Multimodal Vision
      </div>

      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 text-center">
        Etkinlik Yükle &amp; Akıllı Varyasyon Üret
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-lg text-sm">
        Mevcut bir çalışma kâğıdını veya sınavı yükleyin. Yapay zeka etkinliğin yapısını,
        MEB kazanımlarını ve pedagojik hedeflerini analiz ederek disleksi dostu yeni varyasyonlar üretsin.
      </p>

      {/* Varyasyon Seçimi */}
      <div className="w-full max-w-xl mb-5">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 text-center">
          Üretilecek Varyasyon Sayısı
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { count: 1, label: '1 Varyasyon', desc: 'Hızlı (~7 sn)', tag: '' },
            { count: 2, label: '2 Varyasyon', desc: 'Dengeli (~12 sn)', tag: 'Önerilen' },
            { count: 3, label: '3 Varyasyon', desc: 'Geniş Havuz (~20 sn)', tag: '' },
          ].map((v) => (
            <button
              key={v.count}
              type="button"
              disabled={isLoading}
              onClick={() => setVariationCount(v.count)}
              className={`relative flex flex-col items-center justify-center py-2.5 px-3 rounded-2xl border text-center transition-all ${
                variationCount === v.count
                  ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {v.tag && (
                <span className="absolute -top-2.5 bg-indigo-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {v.tag}
                </span>
              )}
              <span className="font-bold text-xs">{v.label}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          w-full max-w-xl border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer
          transition-all duration-200 shadow-sm
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-slate-800'}
          ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        `}
        aria-label="Dosya yükleme alanı — tıkla veya sürükle bırak"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" />
        {isDragActive ? (
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">Dosyayı buraya bırakın…</p>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-200 font-semibold text-sm mb-1">
              Dosyayı buraya sürükleyip bırakın ya da{' '}
              <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2">bilgisayardan seçin</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              PDF, JPEG, PNG, WebP — Maksimum {MAX_MB} MB
            </p>
          </>
        )}

        <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <FileText className="h-4 w-4 text-rose-500" /> PDF Dosyası
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium">
            <ImageIcon className="h-4 w-4 text-emerald-500" /> Fotoğraf / Ekran Görüntüsü
          </div>
        </div>
      </div>

      {/* İlerleme Durumu */}
      {isLoading && (
        <div className="mt-8 w-full max-w-xl" aria-live="polite" aria-atomic="true">
          {phase === 'uploading' && (
            <>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Firebase Storage'a yükleniyor…</span>
                <span className="font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
            </>
          )}
          {phase === 'analyzing' && (
            <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400 py-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold">
                Yapay zeka analiz ediyor ve {variationCount} varyasyon hazırlıyor…
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hata Bildirimi */}
      {error && (
        <div
          role="alert"
          className="mt-6 w-full max-w-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
            <div>
              <strong className="font-semibold">Hata:</strong> {error}
              <div className="mt-2">
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 underline underline-offset-2 text-xs font-semibold"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reddedilen Dosya Bilgisi */}
      {fileRejections.length > 0 && (
        <div
          role="alert"
          className="mt-4 w-full max-w-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300"
        >
          {fileRejections[0].errors
            .map((e) => {
              if (e.code === 'file-too-large') return `Dosya ${MAX_MB} MB'dan büyük olamaz.`;
              if (e.code === 'file-invalid-type')
                return 'Desteklenmeyen dosya türü. PDF, JPEG, PNG veya WebP yükleyin.';
              if (e.code === 'too-many-files') return 'Aynı anda yalnızca bir dosya yükleyebilirsiniz.';
              return e.message;
            })
            .join(' • ')}
        </div>
      )}
    </div>
  );
}
