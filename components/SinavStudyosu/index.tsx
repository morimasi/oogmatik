/**
 * Sınav Stüdyosu - Main container component
 * Ultra-Premium: Sol blok bağımsız scroll + accordion bölümler
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

// Accordion bölüm başlık bileşeni
const SectionHeader: React.FC<{
  icon: string;
  title: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
  gradient?: string;
}> = ({ icon, title, badge, isOpen, onToggle, gradient = 'from-indigo-500 to-indigo-700' }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between gap-2 group"
  >
    <div className="flex items-center gap-2.5">
      <span className="text-lg">{icon}</span>
      <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
        {title}
      </span>
      {badge && (
        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-600">
          {badge}
        </span>
      )}
    </div>
    <span className={`text-gray-400 transition-transform duration-300 text-xs ${isOpen ? 'rotate-180' : ''}`}>
      ▼
    </span>
  </button>
);

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

  // Accordion open/close state
  const [openSections, setOpenSections] = useState({
    sinif: true,
    kazanim: true,
    ayarlar: true,
    basariMimarisi: false,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
    } catch {
      setError('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const handleSaveExam = () => showSuccess('Sınav kaydedildi! (Geliştirme aşamasında)');
  const handleShareExam = () => showSuccess('Paylaşım özelliği yakında eklenecek!');
  const handleAddToWorkbook = () => showSuccess('Çalışma kitabına ekleme özelliği yakında!');

  const kazanimCount = ayarlar.secilenKazanimlar.length;
  const toplamSoru =
    ayarlar.soruDagilimi['coktan-secmeli'] +
    ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
    ayarlar.soruDagilimi['bosluk-doldurma'] +
    ayarlar.soruDagilimi['acik-uclu'];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans overflow-hidden">

      {/* Üst Başlık — kompakt, sabit */}
      <div className="flex-none px-6 py-3 border-b border-white/60 bg-white/50 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow">📝</span>
          <div>
            <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none">
              Sınav Stüdyosu
            </h1>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5" style={{ fontFamily: 'Lexend, sans-serif' }}>
              MEB 2024-2025 · AI Destekli
            </p>
          </div>
        </div>
        {/* Hızlı durum göstergesi */}
        <div className="flex items-center gap-3 text-xs font-semibold">
          {ayarlar.sinif && (
            <span className="px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700">
              {ayarlar.sinif}. Sınıf
            </span>
          )}
          {kazanimCount > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
              {kazanimCount} Kazanım
            </span>
          )}
          <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
            {toplamSoru} Soru
          </span>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">

        {/* SOL PANEL — Bağımsız scroll, kompakt accordion */}
        <div
          className="lg:col-span-4 flex flex-col overflow-y-auto sinav-sol-panel"
          style={{ borderRight: '1px solid rgba(255,255,255,0.5)' }}
        >
          <div className="flex flex-col gap-0 p-4 min-h-full">

            {/* BÖLÜM 1 — Sınıf Seçimi */}
            <div className="accordion-card mb-3">
              <SectionHeader
                icon="🏫"
                title="Sınıf"
                badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined}
                isOpen={openSections.sinif}
                onToggle={() => toggleSection('sinif')}
                gradient="from-blue-500 to-indigo-600"
              />
              <div className={`accordion-body ${openSections.sinif ? 'open' : ''}`}>
                <div className="accordion-content">
                  <div className="grid grid-cols-3 gap-2 pt-3">
                    {[4, 5, 6, 7, 8].map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSinif(grade)}
                        className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${ayarlar.sinif === grade
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                            : 'bg-white text-gray-500 border border-gray-100 shadow-sm hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                      >
                        {grade}. Sınıf
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BÖLÜM 2 — Kazanım Seçimi */}
            <div className="accordion-card mb-3">
              <SectionHeader
                icon="🎯"
                title="Kazanımlar"
                badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined}
                isOpen={openSections.kazanim}
                onToggle={() => toggleSection('kazanim')}
                gradient="from-indigo-500 to-purple-600"
              />
              <div className={`accordion-body ${openSections.kazanim ? 'open' : ''}`}>
                <div className="accordion-content pt-3">
                  <KazanimPicker
                    selectedGrade={ayarlar.sinif}
                    selectedUnites={ayarlar.secilenUniteler}
                    selectedKazanimlar={ayarlar.secilenKazanimlar}
                    onUniteChange={setSecilenUniteler}
                    onKazanimChange={setSecilenKazanimlar}
                  />
                </div>
              </div>
            </div>

            {/* BÖLÜM 3 — Soru Ayarları */}
            <div className="accordion-card mb-3">
              <SectionHeader
                icon="⚙️"
                title="Soru Ayarları"
                badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined}
                isOpen={openSections.ayarlar}
                onToggle={() => toggleSection('ayarlar')}
                gradient="from-purple-500 to-pink-500"
              />
              <div className={`accordion-body ${openSections.ayarlar ? 'open' : ''}`}>
                <div className="accordion-content pt-3">
                  {ayarlar.secilenKazanimlar.length > 0 ? (
                    <SoruAyarlari
                      ayarlar={ayarlar}
                      onSoruDagilimiChange={setSoruDagilimi}
                      onOzelKonuChange={(konu) => setAyarlar({ ozelKonu: konu })}
                    />
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-4 border-2 border-dashed border-gray-200 rounded-xl">
                      Önce kazanım seçin
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BÖLÜM 4 — Başarı Anı Mimarisi bilgi */}
            <div className="accordion-card mb-3">
              <SectionHeader
                icon="🌟"
                title="Başarı Anı Mimarisi"
                isOpen={openSections.basariMimarisi}
                onToggle={() => toggleSection('basariMimarisi')}
                gradient="from-amber-500 to-orange-500"
              />
              <div className={`accordion-body ${openSections.basariMimarisi ? 'open' : ''}`}>
                <div className="accordion-content pt-3 space-y-2">
                  {[
                    { icon: '🟢', text: 'İlk 2 soru — Kolay (güven inşası)' },
                    { icon: '🟡', text: '3-4. soru — Orta zorluk' },
                    { icon: '🔴', text: '5+. soru — Orta-Zor (yetkinlik)' },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-100">
                    Her sınav oluşturmada bu mimari otomatik uygulanır.
                  </p>
                </div>
              </div>
            </div>

            {/* Hata mesajı */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-xs font-medium flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Oluştur Butonu — yapışkan (sticky) */}
            <div className="sticky bottom-0 pt-2 pb-1 mt-auto">
              <div className="p-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white">
                <button
                  onClick={handleGenerateExam}
                  disabled={!canGenerate() || isGenerating}
                  className={`w-full py-4 rounded-xl font-bold text-base text-white transition-all duration-300 flex items-center justify-center gap-2 ${canGenerate() && !isGenerating
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/25 active:scale-[0.98]'
                      : 'bg-gray-200 cursor-not-allowed text-gray-400'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      AI Sınavı Örüyor...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Sınav Oluştur
                    </>
                  )}
                </button>
                {!canGenerate() && !isGenerating && (
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    {ayarlar.sinif === null
                      ? '↑ Sınıf seçin'
                      : kazanimCount === 0
                        ? '↑ Kazanım seçin'
                        : toplamSoru < 4
                          ? '↑ En az 4 soru ayarlayın'
                          : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL — Toolbar + İçerik */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden">

          {/* Toolbar — sabit */}
          <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-white/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Tab Navigasyon */}
            <div className="flex bg-gray-100/70 p-1 rounded-xl">
              {(['onizleme', 'cevap-anahtari'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={!aktifSinav}
                  className={`px-5 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === tab
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : aktifSinav
                        ? 'text-gray-500 hover:text-indigo-600'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                >
                  {tab === 'onizleme' ? '👁️ Önizleme' : '✓ Cevap Anahtarı'}
                </button>
              ))}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex gap-1.5">
              {[
                { label: 'Kaydet', icon: '💾', color: 'blue', fn: handleSaveExam },
                { label: 'Paylaş', icon: '🔗', color: 'purple', fn: handleShareExam },
                { label: 'Kitapçık', icon: '📚', color: 'emerald', fn: handleAddToWorkbook },
                { label: 'Yazdır', icon: '🖨️', color: 'gray', fn: () => window.print() },
              ].map(({ label, icon, color, fn }) => (
                <button
                  key={label}
                  onClick={fn}
                  disabled={!aktifSinav}
                  className={`toolbar-btn bg-${color}-50 text-${color}-700 hover:bg-${color}-600 hover:text-white border border-${color}-100 hover:border-${color}-600`}
                >
                  <span>{icon}</span>
                  <span className="hidden md:inline">{label}</span>
                </button>
              ))}
              <button
                onClick={handleDownloadPDF}
                disabled={!aktifSinav}
                className="toolbar-btn bg-gradient-to-r from-red-500 to-red-600 text-white shadow hover:shadow-lg hover:scale-105 border-0"
              >
                <span>📄</span>
                <span>İndir</span>
              </button>
            </div>
          </div>

          {/* Toast Başarı Mesajı */}
          {successMessage && (
            <div className="absolute top-16 right-6 z-50 anim-slide-in bg-emerald-100/90 backdrop-blur-md border border-emerald-300 text-emerald-800 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-semibold text-sm">
              <span>✅</span> {successMessage}
            </div>
          )}

          {/* İçerik Alanı — scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/60 backdrop-blur-sm">
            <div className="p-6 lg:p-10 min-h-full">
              {aktifSinav ? (
                <div className="anim-fade-in">
                  {activeTab === 'onizleme' ? (
                    <SinavOnizleme sinav={aktifSinav} showAnswers={false} />
                  ) : (
                    <CevapAnahtariComponent cevapAnahtari={aktifSinav.cevapAnahtari} sinavBaslik={aktifSinav.baslik} />
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-5 py-24">
                  <div className="w-28 h-28 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-5xl opacity-40">📝</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-300">Önizleme Alanı</h3>
                  <p className="max-w-xs text-center text-sm text-gray-400">
                    Sol panelden ayarları yapın ve{' '}
                    <strong className="text-indigo-400">Sınav Oluştur</strong>'a basın.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Sol panel scroll */
        .sinav-sol-panel {
          background: rgba(255,255,255,0.35);
        }

        /* Accordion kart */
        .accordion-card {
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 1rem;
          padding: 0.875rem 1rem;
          transition: box-shadow 0.2s;
        }
        .accordion-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        /* Accordion animasyonu */
        .accordion-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accordion-body.open {
          grid-template-rows: 1fr;
        }
        .accordion-content {
          overflow: hidden;
        }

        /* Toolbar buton */
        .toolbar-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.75rem;
          border-radius: 0.625rem;
          font-weight: 600;
          font-size: 0.75rem;
          transition: all 0.2s;
          border-width: 1px;
        }
        .toolbar-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          pointer-events: none;
        }

        /* Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99,102,241,0.45);
        }
        .sinav-sol-panel::-webkit-scrollbar { width: 4px; }
        .sinav-sol-panel::-webkit-scrollbar-track { background: transparent; }
        .sinav-sol-panel::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.15);
          border-radius: 4px;
        }

        /* Animasyonlar */
        .anim-fade-in {
          animation: fadeIn 0.35s ease-out forwards;
        }
        .anim-slide-in {
          animation: slideIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
