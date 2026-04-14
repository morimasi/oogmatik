import React, { useRef } from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { ActivityType } from '../../../types';
import { ocrService } from '../../../services/ocrService';
import { useToastStore } from '../../../store/useToastStore';
import * as pdfjs from 'pdfjs-dist';

// pdf.js worker ayarı
if (typeof window !== 'undefined' && !pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface LeftPanelProps {
  onGenerate: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({ onGenerate }) => {
  const { 
    selectedActivity, 
    setSelectedActivity, 
    mode, 
    setMode, 
    params, 
    setParams, 
    isGenerating,
    setIsGenerating,
    setError,
    setResult
  } = useSariKitapStore();

  const showToast = useToastStore((state) => state.showToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activityOptions = [
    { type: ActivityType.SARI_KITAP_PENCERE, label: 'Pencere', icon: 'fa-window-maximize', color: 'text-blue-400' },
    { type: ActivityType.SARI_KITAP_NOKTA, label: 'Nokta', icon: 'fa-circle-dot', color: 'text-rose-400' },
    { type: ActivityType.SARI_KITAP_KOPRU, label: 'Köprü', icon: 'fa-bridge', color: 'text-emerald-400' },
    { type: ActivityType.SARI_KITAP_CIFT_METIN, label: 'Çift Metin', icon: 'fa-file-lines', color: 'text-amber-400' },
    { type: ActivityType.SARI_KITAP_BELLEK_DERNEK, label: 'Bellek Dernek', icon: 'fa-brain', color: 'text-purple-400' },
    { type: ActivityType.SARI_KITAP_HIZLI_OKUMA, label: 'Hızlı Okuma', icon: 'fa-bolt', color: 'text-cyan-400' },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') {
      showToast('Lütfen geçerli bir PDF dosyası seçin.', 'error');
      return;
    }

    setIsGenerating(true);
    setError(null);
    showToast('PDF Analiz ediliyor...', 'info');

    try {
      // 1. PDF'i oku
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      
      // 2. Sayfayı canvas'a çiz ve image'a dönüştür
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      if (!context) throw new Error('Canvas context oluşturulamadı.');

      await page.render({ canvasContext: context, viewport }).promise;
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);

      // 3. OCR Servisini çağır
      const ocrResult = await ocrService.processImage(base64Image);

      // 4. Sonuçları state'e aktar
      setParams({ 
        topic: `Analiz edilen dosya: ${file.name}\n\nTespit edilen başlık: ${ocrResult.title}\n\nMimari Özet: ${ocrResult.description}` 
      });

      // Aktivite türü eşleştirme (OCR sonucuna göre akıllı tahmin)
      if (ocrResult.detectedType?.includes('MATH')) setSelectedActivity(ActivityType.SARI_KITAP_PENCERE);
      else if (ocrResult.detectedType?.includes('READING')) setSelectedActivity(ActivityType.SARI_KITAP_CIFT_METIN);
      else setSelectedActivity(ActivityType.SARI_KITAP_PENCERE);

      setMode('AI');
      showToast('PDF Analizi Tamamlandı', 'success');
    } catch (err: any) {
      console.error('PDF Analiz Hatası:', err);
      setError('PDF dosyası analiz edilirken bir hata oluştu.');
      showToast('Analiz başarısız oldu.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 h-full bg-[var(--bg-default)] border-r border-[var(--border-color)] flex flex-col overflow-y-auto custom-scrollbar p-6">
      {/* 1. PDF Analiz Alanı */}
      <div className="mb-8">
        <label id="pdf-analiz-label" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 block px-1">
          PDF Analiz (AI Destekli)
        </label>
        <div 
          role="button"
          aria-labelledby="pdf-analiz-label"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          className="group relative cursor-pointer overflow-hidden p-6 rounded-[2rem] bg-[var(--bg-paper)]/50 border-2 border-dashed border-[var(--border-color)] hover:border-yellow-500/30 focus:border-yellow-500/50 outline-none transition-all active:scale-[0.98]"
        >
          <div className="flex flex-col items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-file-pdf text-xl"></i>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[var(--text-primary)]">Dosya Seçin</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Sarı Kitap PDF'lerini analiz et</p>
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 2. Mod Seçimi */}
      <div className="mb-8">
        <label id="mode-label" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 block px-1">
          Üretim Modu
        </label>
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[var(--bg-paper)] rounded-2xl border border-[var(--border-color)]" role="radiogroup" aria-labelledby="mode-label">
          <button
            role="radio"
            aria-checked={mode === 'AI'}
            onClick={() => setMode('AI')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none ${
              mode === 'AI' ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            AI ANALİZ
          </button>
          <button
            role="radio"
            aria-checked={mode === 'QUICK'}
            onClick={() => setMode('QUICK')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none ${
              mode === 'QUICK' ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            HIZLI MOD
          </button>
        </div>
      </div>

      {/* 3. Etkinlik Seçimi */}
      <div className="mb-8">
        <label id="activity-label" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-4 block px-1">
          Etkinlik Türü
        </label>
        <div className="grid grid-cols-2 gap-2" role="group" aria-labelledby="activity-label">
          {activityOptions.map((opt) => (
            <button
              key={opt.type}
              aria-pressed={selectedActivity === opt.type}
              onClick={() => setSelectedActivity(opt.type)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none ${
                selectedActivity === opt.type 
                  ? 'bg-[var(--bg-paper)] border-yellow-500/50 shadow-lg shadow-yellow-500/5 scale-[1.02]' 
                  : 'bg-[var(--bg-paper)]/50 border-[var(--border-color)] hover:border-white/10'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center ${opt.color}`}>
                <i className={`fa-solid ${opt.icon}`}></i>
              </div>
              <span className="text-[10px] font-bold text-[var(--text-primary)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Özelleştirme Parametreleri */}
      <div className="mb-8 space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block px-1">
          Parametreler
        </label>
        
        {/* Yaş Grubu */}
        <div>
          <label htmlFor="age-select" className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter ml-1 mb-1 block">Yaş Grubu</label>
          <select 
            id="age-select"
            value={params.ageGroup}
            onChange={(e) => setParams({ ageGroup: e.target.value })}
            className="w-full bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] outline-none focus:border-yellow-500/30 transition-colors"
          >
            <option value="5-7">5-7 Yaş</option>
            <option value="8-10">8-10 Yaş</option>
            <option value="11-13">11-13 Yaş</option>
            <option value="14+">14+ Yaş</option>
          </select>
        </div>

        {/* Zorluk Seviyesi */}
        <div>
          <label className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter ml-1 mb-1 block">Zorluk Seviyesi</label>
          <div className="grid grid-cols-2 gap-2">
            {['Başlangıç', 'Orta', 'İleri', 'Uzman'].map((lvl) => (
              <button
                key={lvl}
                aria-pressed={params.difficulty === lvl}
                onClick={() => setParams({ difficulty: lvl as any })}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all focus:ring-2 focus:ring-yellow-500/50 outline-none ${
                  params.difficulty === lvl 
                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500' 
                    : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Konu Başlığı */}
        <div>
          <label htmlFor="topic-input" className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter ml-1 mb-1 block">Konu Başlığı</label>
          <textarea 
            id="topic-input"
            value={params.topic}
            onChange={(e) => setParams({ topic: e.target.value })}
            placeholder="Etkinlik konusu veya detayları..."
            className="w-full h-20 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-xs font-medium text-[var(--text-primary)] outline-none focus:border-yellow-500/30 transition-colors resize-none"
          />
        </div>
      </div>

      {/* 5. Üret Butonu */}
      <button
        onClick={onGenerate}
        disabled={isGenerating || !selectedActivity}
        aria-busy={isGenerating}
        className={`w-full py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] focus:ring-4 focus:ring-yellow-500/20 outline-none ${
          isGenerating || !selectedActivity
            ? 'bg-[var(--bg-paper)] text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-950 shadow-xl shadow-yellow-500/20 hover:scale-[1.02]'
        }`}
      >
        {isGenerating ? (
          <i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
        ) : (
          <i className="fa-solid fa-wand-sparkles" aria-hidden="true"></i>
        )}
        ETKİNLİK ÜRET
      </button>
    </div>
  );
};
