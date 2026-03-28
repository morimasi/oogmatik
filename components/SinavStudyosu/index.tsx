/**
 * Sınav Stüdyosu - Main container component
 * MEB kazanım entegreli Türkçe sınav oluşturma modülü
 */

import React, { useState } from 'react';
import { useSinavStore } from '../../src/store/useSinavStore';
import { generateExam } from '../../src/services/generators/sinavGenerator';
import { KazanimPicker } from './KazanimPicker';
import { SoruAyarlari } from './SoruAyarlari';
import { SinavOnizleme } from './SinavOnizleme';
import { CevapAnahtariComponent } from './CevapAnahtari';
import { AppError } from '../../src/utils/AppError';

type TabType = 'ayarlar' | 'onizleme' | 'cevap-anahtari';

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

  const [activeTab, setActiveTab] = useState<TabType>('ayarlar');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateExam = async (): Promise<void> => {
    setError(null);

    try {
      setIsGenerating(true);
      const sinav = await generateExam(ayarlar);
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

  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'ayarlar':
        return (
          <div className="space-y-8">
            {/* Sınıf Seçimi */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="text-indigo-600">🎓</span>
                Sınıf Seçimi
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                {[4, 5, 6, 7, 8, 9].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setSinif(grade)}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      ayarlar.sinif === grade
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'
                    }`}
                  >
                    {grade}. Sınıf
                  </button>
                ))}
              </div>
            </div>

            {/* Kazanım Picker */}
            <KazanimPicker
              selectedGrade={ayarlar.sinif}
              selectedUnites={ayarlar.secilenUniteler}
              selectedKazanimlar={ayarlar.secilenKazanimlar}
              onUniteChange={setSecilenUniteler}
              onKazanimChange={setSecilenKazanimlar}
            />

            {/* Soru Ayarları (sadece kazanım seçildiyse göster) */}
            {ayarlar.secilenKazanimlar.length > 0 && (
              <SoruAyarlari
                ayarlar={ayarlar}
                onSoruDagilimiChange={setSoruDagilimi}
                onOzelKonuChange={(konu) => setAyarlar({ ozelKonu: konu })}
              />
            )}

            {/* Hata Mesajı */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <p className="text-red-800 font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}

            {/* Üret Butonu */}
            <div className="flex justify-center pt-6">
              <button
                onClick={handleGenerateExam}
                disabled={!canGenerate() || isGenerating}
                className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                  canGenerate() && !isGenerating
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2">
                    <span className="loading-spinner inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></span>
                    Sınav Hazırlanıyor...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    Sınav Oluştur
                  </span>
                )}
              </button>
            </div>
          </div>
        );

      case 'onizleme':
        return aktifSinav ? (
          <SinavOnizleme sinav={aktifSinav} showAnswers={false} />
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p>Henüz sınav oluşturulmadı.</p>
          </div>
        );

      case 'cevap-anahtari':
        return aktifSinav ? (
          <CevapAnahtariComponent
            cevapAnahtari={aktifSinav.cevapAnahtari}
            sinavBaslik={aktifSinav.baslik}
          />
        ) : (
          <div className="text-center text-gray-500 py-12">
            <p>Henüz sınav oluşturulmadı.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <span className="text-4xl">📝</span>
          Sınav Stüdyosu
        </h1>
        <p className="text-gray-600" style={{ fontFamily: 'Lexend, sans-serif' }}>
          MEB 2024-2025 müfredat kazanımları ile entegre Türkçe sınav oluşturun
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('ayarlar')}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'ayarlar'
              ? 'border-b-4 border-indigo-600 text-indigo-600'
              : 'text-gray-600 hover:text-indigo-500'
          }`}
        >
          ⚙️ Ayarlar
        </button>
        <button
          onClick={() => setActiveTab('onizleme')}
          disabled={!aktifSinav}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'onizleme'
              ? 'border-b-4 border-indigo-600 text-indigo-600'
              : aktifSinav
              ? 'text-gray-600 hover:text-indigo-500'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          👁️ Önizleme
        </button>
        <button
          onClick={() => setActiveTab('cevap-anahtari')}
          disabled={!aktifSinav}
          className={`px-6 py-3 font-semibold transition-all ${
            activeTab === 'cevap-anahtari'
              ? 'border-b-4 border-indigo-600 text-indigo-600'
              : aktifSinav
              ? 'text-gray-600 hover:text-indigo-500'
              : 'text-gray-400 cursor-not-allowed'
          }`}
        >
          ✓ Cevap Anahtarı
        </button>
      </div>

      {/* Content */}
      <div>{renderContent()}</div>
    </div>
  );
};
