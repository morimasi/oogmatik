// ============================================================
// VisionStudio — Dosya Yükleme Adımı
// ============================================================
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useVisionStudioStore } from '../../../store/useVisionStudioStore';
import { uploadActivityFile } from '../../../services/visionStudio/activityRepository';
import { analyzeUploadedFile } from '../../../services/visionStudio/visionAnalysisService';
import { saveGeneratedActivity } from '../../../services/visionStudio/activityRepository';
import { useAuthStore } from '../../../store/useAuthStore';

const MAX_MB = 20;

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

  const [uploadProgress, setUploadProgress] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing'>('idle');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !user?.id) return;

      setError(null);
      setLoading(true);

      try {
        // 1. Firebase Storage'a yükle
        setPhase('uploading');
        const uploadedFile = await uploadActivityFile(file, user.id, setUploadProgress);
        setUploadedFile(uploadedFile);

        // 2. AI analizine gönder
        setPhase('analyzing');
        setStep('analyzing');

        const response = await analyzeUploadedFile(
          {
            fileUrl: uploadedFile.downloadUrl,
            fileType: uploadedFile.fileType,
            fileId: uploadedFile.id,
            userId: user.id,
            generateVariations: 1,
          },
          user.id,
          user.role
        );

        setAnalysisResult(response.analysis);
        setGeneratedActivities(response.activities);

        // 3. Üretilen etkinlikleri Firestore'a kaydet
        for (const activity of response.activities) {
          await saveGeneratedActivity(activity);
        }

        setStep('preview');
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Beklenmeyen bir hata olustu. Lutfen tekrar deneyin.';
        setError(msg);
        setStep('upload');
      } finally {
        setLoading(false);
        setPhase('idle');
        setUploadProgress(0);
      }
    },
    [user, setUploadedFile, setAnalysisResult, setGeneratedActivities, setStep, setLoading, setError]
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
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
        Etkinlik Yukle &amp; Analiz Et
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
        Mevcut bir etkinligi (PDF veya gorsel) yukleyin. Yapay zeka etkinligi analiz edecek
        ve benzer kazanimlara sahip yeni varyasyonlar uretecektir.
      </p>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          w-full max-w-xl border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}
          ${isLoading ? 'opacity-60 pointer-events-none' : ''}
        `}
        aria-label="Dosya yukleme alani — tıkla veya surukle birak"
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-14 w-14 text-slate-400 dark:text-slate-500 mb-4" />
        {isDragActive ? (
          <p className="text-indigo-600 font-semibold">Dosyayi buraya birakin…</p>
        ) : (
          <>
            <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
              Dosyayi surukleyip birakin ya da{' '}
              <span className="text-indigo-600 underline underline-offset-2">secin</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              PDF, JPEG, PNG, WebP — Maks. {MAX_MB} MB
            </p>
          </>
        )}

        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <FileText className="h-5 w-5" /> PDF
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <ImageIcon className="h-5 w-5" /> Gorsel
          </div>
        </div>
      </div>

      {/* Ilerleme */}
      {isLoading && (
        <div className="mt-8 w-full max-w-xl" aria-live="polite" aria-atomic="true">
          {phase === 'uploading' && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Dosya yukleniyor… {uploadProgress}%
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
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
            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium">
                Yapay zeka etkinligi analiz ediyor ve varyasyon uretiyor…
              </span>
            </div>
          )}
        </div>
      )}

      {/* Hata */}
      {error && (
        <div
          role="alert"
          className="mt-6 w-full max-w-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4 text-sm text-red-700 dark:text-red-300"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-semibold">Hata:</strong> {error}
              <div className="mt-2">
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 dark:text-red-400 underline underline-offset-2 text-xs"
                >
                  Tekrar dene
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dosya ret uyarisi */}
      {fileRejections.length > 0 && (
        <div
          role="alert"
          className="mt-4 w-full max-w-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300"
        >
          {fileRejections[0].errors.map((e) => e.message).join(' • ')}
        </div>
      )}
    </div>
  );
}
