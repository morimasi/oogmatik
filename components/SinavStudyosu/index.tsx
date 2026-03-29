/**
 * Sınav Stüdyosu - Main container component
 * MEB kazanım entegreli Türkçe sınav oluşturma modülü
 * Ultra-Premium 3 Bloklu Tasarım
 */

import React, { useState } from 'react';
import { useSinavStore } from '../../src/store/useSinavStore';
import { generateExamViaAPI } from '../../src/services/sinavService';
import { generateExamPDF } from '../../src/utils/sinavPdfGenerator';
import { KazanimPicker } from './KazanimPicker';
import { SoruAyarlari } from './SoruAyarlari';
import { SinavOnizleme } from './SinavOnizleme';
import { CevapAnahtariComponent } from './CevapAnahtari';
import { AppError } from '../../src/utils/AppError';

type TabType = 'onizleme' | 'cevap-anahtari';

export const SinavStudyosu: React.FC = () => {
  const {
    ayarlar,
    setSinif,
    setSecilenUniteler,
    setSecilenKazanimlar,
    setSoruDagilimi,
    setAyarlar,
    aktifSinav,
    setAktifSinav,
    isGenerating,
    setIsGenerating,
    addKaydedilmisSinav
  } = useSinavStore();

  const [activeTab, setActiveTab] = useState<TabType>('onizleme');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateExam = async (): Promise<void> => {
    setError(null);
    setSuccessMessage(null);

    try {
      setIsGenerating(true);
      const sinav = await generateExamViaAPI(ayarlar);
      setAktifSinav(sinav);
      addKaydedilmisSinav(sinav);
      setActiveTab('onizleme');
    } catch (err: unknown) {
      console.error('Sınav oluşturma hatası:', err);

      if (err instanceof AppError) {
        setError(err.userMessage);
      } else {
        setError('Sınav oluşturulurken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = (): boolean => {
    return (
      ayarlar.sinif !== null &&
      ayarlar.secilenKazanimlar.length > 0 &&
      (ayarlar.soruDagilimi['coktan-secmeli'] +
        ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
        ayarlar.soruDagilimi['bosluk-doldurma'] +
        ayarlar.soruDagilimi['acik-uclu']) >= 4
    );
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDownloadPDF = (): void => {
    if (!aktifSinav) return;
    try {
      generateExamPDF(aktifSinav);
      showSuccess('PDF başarıyla indirildi!');
    } catch (error) {
      console.error('PDF generation error:', error);
      setError('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const handleSaveExam = (): void => showSuccess('Sınav kaydedildi! (Geliştirme aşamasında)');
  const handleShareExam = (): void => showSuccess('Paylaşım özelliği yakında eklenecek!');
  const handleAddToWorkbook = (): void => showSuccess('Çalışma kitabına ekleme özelliği yakında!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 flex items-center gap-3">
            <span className="text-4xl drop-shadow-md">📝</span>
            Sınav Stüdyosu
          </h1>
          <p className="text-gray-600 text-lg font-medium" style={{ fontFamily: 'Lexend, sans-serif' }}>
            MEB 2024-2025 müfredat kazanımları ile entegre, AI destekli premium Türkçe sınav oluşturucu
          </p>
        </div>

        {/* Çoklu Blok Yapısı (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* SOL PANEL: Seçim ve Ayarlar (4/12 alan) */}
          <div className="lg:col-span-4 flex flex-col gap-6">

            {/* Sol Üst Blok: Öğrenci, Sınıf, Ünite ve Kazanım Seçimi */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
              <div className="mb-6">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-indigo-700 mb-4 flex items-center gap-2">
                  <span className="text-2xl drop-shadow-sm">🎓</span>
                  Hedef Seçimi
                </h3>

                {/* Sınıf Secimi */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[4, 5, 6, 7, 8, 9].map((grade) => (
                    <button
                      key={grade}
                      onClick={() => setSinif(grade)}
                      className={`py-2 rounded-xl text-sm font-bold transition-all duration-300 ${ayarlar.sinif === grade
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                        : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                    >
                      {grade}. Sınıf
                    </button>
                  ))}
                </div>
              </div>

              {/* Kazanim Picker */}
              <KazanimPicker
                selectedGrade={ayarlar.sinif}
                selectedUnites={ayarlar.secilenUniteler}
                selectedKazanimlar={ayarlar.secilenKazanimlar}
                onUniteChange={setSecilenUniteler}
                onKazanimChange={setSecilenKazanimlar}
              />
            </div>

            {/* Sol Alt Blok: Ayarlar ve Oluştur Butonu */}
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col flex-1">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 mb-4 flex items-center gap-2">
                <span className="text-2xl drop-shadow-sm">⚙️</span>
                Sınav Ayarları
              </h3>

              <div className="flex-1">
                {ayarlar.secilenKazanimlar.length > 0 ? (
                  <SoruAyarlari
                    ayarlar={ayarlar}
                    onSoruDagilimiChange={setSoruDagilimi}
                    onOzelKonuChange={(konu) => setAyarlar({ ozelKonu: konu })}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-center text-sm p-4 border-2 border-dashed border-gray-200 rounded-2xl">
                    <p>Ayarları görmek için lütfen önce sınıf ve kazanım seçin.</p>
                  </div>
                )}
              </div>

              {/* Hata Mesaji */}
              {error && (
                <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl shadow-sm">
                  <p className="text-red-600 text-sm font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Oluştur Butonu */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleGenerateExam}
                  disabled={!canGenerate() || isGenerating}
                  className={`w-full py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${canGenerate() && !isGenerating
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 active:scale-[0.98]'
                      : 'bg-gray-300 cursor-not-allowed opacity-70'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Yapay Zeka Sınavı Örüyor...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl drop-shadow-md">✨</span>
                      Ultra Premium Sınav Oluştur
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* SAĞ PANEL: Toolbar ve Önizleme (8/12 alan) */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[800px]">

            {/* Sağ Üst Blok: Toolbar */}
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-4 transition-all">
              {/* Tab Navigasyon */}
              <div className="flex bg-gray-100/80 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('onizleme')}
                  disabled={!aktifSinav}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'onizleme'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : aktifSinav
                        ? 'text-gray-500 hover:text-indigo-600'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                  👁️ Önizleme
                </button>
                <button
                  onClick={() => setActiveTab('cevap-anahtari')}
                  disabled={!aktifSinav}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'cevap-anahtari'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : aktifSinav
                        ? 'text-gray-500 hover:text-indigo-600'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                >
                  ✓ Cevap Anahtarı
                </button>
              </div>

              {/* Araçlar (Action Buttons) */}
              <div className="flex gap-2">
                <button onClick={handleSaveExam} disabled={!aktifSinav} className="ui-action-btn bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600">
                  <span className="text-lg">💾</span> <span className="hidden sm:inline">Kaydet</span>
                </button>
                <button onClick={handleShareExam} disabled={!aktifSinav} className="ui-action-btn bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-100 hover:border-purple-600">
                  <span className="text-lg">🔗</span> <span className="hidden sm:inline">Paylaş</span>
                </button>
                <button onClick={handleAddToWorkbook} disabled={!aktifSinav} className="ui-action-btn bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-100 hover:border-emerald-600">
                  <span className="text-lg">📚</span> <span className="hidden lg:inline">Kitapçığa Ekle</span>
                </button>
                <button onClick={() => window.print()} disabled={!aktifSinav} className="ui-action-btn bg-gray-50 text-gray-700 hover:bg-gray-800 hover:text-white border border-gray-200 hover:border-gray-800">
                  <span className="text-lg">🖨️</span> <span className="hidden sm:inline">Yazdır</span>
                </button>
                <button onClick={handleDownloadPDF} disabled={!aktifSinav} className="ui-action-btn bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105 border-0">
                  <span className="text-lg drop-shadow-sm">📄</span> İndir
                </button>
              </div>
            </div>

            {/* Başarı Mesajı Toast (Inline) */}
            {successMessage && (
              <div className="absolute top-8 right-8 z-50 animate-fade-in-down bg-emerald-100/90 backdrop-blur-md border border-emerald-400 text-emerald-800 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold">
                <span className="text-xl">✨</span> {successMessage}
              </div>
            )}

            {/* Sağ Orta Blok: Sınav Önizleme İçeriği */}
            <div className="flex-1 bg-white/90 backdrop-blur-md rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white overflow-hidden relative">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 lg:p-10">
                {aktifSinav ? (
                  activeTab === 'onizleme' ? (
                    <div className="animate-fade-in">
                      <SinavOnizleme sinav={aktifSinav} showAnswers={false} />
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <CevapAnahtariComponent cevapAnahtari={aktifSinav.cevapAnahtari} sinavBaslik={aktifSinav.baslik} />
                    </div>
                  )
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6">
                    <div className="w-40 h-40 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                      <span className="text-6xl opacity-50">📝</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-400">Önizleme Alanı</h3>
                    <p className="max-w-md text-center text-sm">
                      Sol panelden ayarlarınızı yapıp <strong className="text-indigo-400">Sınav Oluştur</strong> butonuna bastığınızda yapay zekanın ürettiği premium sınav burada belirecektir.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div >

      </div >

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        .ui-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ui-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div >
  );
};
