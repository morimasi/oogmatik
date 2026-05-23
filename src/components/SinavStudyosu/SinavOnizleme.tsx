import React from 'react';
import { Sinav, PrintConfig } from '../../types/sinav';
import { SoruCard } from './components/SoruCard';
import { ZorlukGostergesi } from './components/ZorlukGostergesi';

interface SinavOnizlemeProps {
  sinav: Sinav;
  showAnswers?: boolean;
  config?: PrintConfig;
  isPrinting?: boolean;
}

export const SinavOnizleme: React.FC<SinavOnizlemeProps> = ({
  sinav,
  showAnswers = false,
  config,
  isPrinting = false,
}) => {
  const fontSizePt = config ? `${config.fontSize}pt` : '12pt';
  const fontFamily = config?.fontFamily === 'times' ? 'Times New Roman, Times, serif' : (config?.fontFamily === 'helvetica' ? 'Inter, Helvetica, Arial, sans-serif' : 'Lexend, Inter, sans-serif');
  const questionGap = config ? `${config.questionSpacingMm * 2}px` : '16px';
  const lineHeight = config ? config.lineHeight : 1.6;
  const textAlign = config ? config.textAlign : 'left';
  const marginMm = config ? config.marginMm : 18;
  const columnsCount = config ? config.columns : 1;

  return (
    <div
      className={`sinav-onizleme ${isPrinting ? 'is-printing' : ''}`}
      style={{
        fontFamily,
        color: '#111',
        backgroundColor: '#fff',
        textAlign,
        fontSize: fontSizePt,
        lineHeight,
        padding: isPrinting ? `${marginMm}mm` : `${marginMm * 3.7795275591}px`,
        width: isPrinting ? '210mm' : 'auto',
        boxSizing: 'border-box'
      }}
    >
      {/* Başlık Bandı */}
      {!isPrinting ? (
        <div
          className="rounded-xl p-5 mb-5 text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 8%)) 0%, hsl(var(--accent-h) var(--accent-s) var(--accent-l)) 100%)',
          }}
        >
          <h2 className="text-xl font-extrabold mb-3 text-white" style={{ fontFamily }}>
            {sinav.baslik}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { label: 'Sınıf', val: `${sinav.sinif}. Sınıf` },
              { label: 'Toplam Soru', val: `${sinav.sorular.length} soru` },
              { label: 'Toplam Puan', val: `${sinav.toplamPuan} puan` },
              { label: 'Süre', val: `~${Math.ceil(sinav.tahminiSure / 60)} dk` },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-white/70 text-xs uppercase tracking-wide">{label}</div>
                <div className="text-white font-bold text-base">{val}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="sinav-print-header" style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '1px solid #000', paddingBottom: '6px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>{sinav.baslik}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', fontWeight: 'bold' }}>
            <span>SINIF: {sinav.sinif}</span>
            <span>TOPLAM SORU: {sinav.sorular.length}</span>
            <span>SÜRE: {Math.ceil(sinav.tahminiSure / 60)} DK</span>
          </div>
        </div>
      )}

      {/* Kazanımlar — Yazdırmada gizle */}
      {!isPrinting && (
        <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 mb-5" style={{ breakInside: 'avoid' }}>
          <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            <span>📚</span> MEB Kazanımları
          </h3>
          <div className="flex flex-wrap gap-2">
            {sinav.secilenKazanimlar.map((kod) => (
              <span
                key={kod}
                className="px-2 py-1 bg-accent/20 text-accent text-xs font-mono rounded-full"
              >
                {kod}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Öğrenci Bilgi Satırı */}
      <div className={`border border-gray-200 rounded-xl px-4 py-2 mb-3 flex flex-wrap gap-4 text-sm text-gray-600 ${isPrinting ? 'border-black text-black font-bold text-xs py-1 mb-2' : ''}`} style={{ breakInside: 'avoid' }}>
        <span>Ad Soyad: <span className="border-b border-gray-400 inline-block w-32">&nbsp;</span></span>
        <span>Sınıf/Şube: <span className="border-b border-gray-400 inline-block w-16">&nbsp;</span></span>
        <span>Tarih: <span className="border-b border-gray-400 inline-block w-20">&nbsp;</span></span>
        {isPrinting && <span className="ml-auto">Puan: ________ / {sinav.toplamPuan}</span>}
      </div>

      {/* Sorular - Grid Yapısı */}
      <div 
        className="sorular-container" 
        style={{ 
          display: 'grid',
          gridTemplateColumns: columnsCount > 1 ? `repeat(${columnsCount}, 1fr)` : '1fr',
          gap: isPrinting ? '4mm' : questionGap
        }}
      >
        {sinav.sorular.map((soru, index) => (
          <div key={soru.id} className="sinav-soru-wrapper">
            <SoruCard
              soru={soru}
              soruNo={index + 1}
              showAnswer={showAnswers}
              fontSizePt={fontSizePt}
              fontFamily={fontFamily}
              lineHeight={lineHeight}
              isPrinting={isPrinting}
            />
          </div>
        ))}
      </div>

      {/* Pedagojik Not — Yazdırmada gizle */}
      {sinav.pedagogicalNote && !isPrinting && (
        <div className="mt-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4" style={{ breakInside: 'avoid' }}>
          <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
            <span>👨‍🏫</span> Öğretmenin Dikkatine
          </h3>
          <p className="text-sm text-emerald-900 leading-relaxed" style={{ fontFamily }}>
            {sinav.pedagogicalNote}
          </p>
        </div>
      )}
      {/* Yazdırma için özel CSS — compact layout + sayfa bölünmez soru kartları */}
      {isPrinting && (
        <style>{`
          .sinav-onizleme.is-printing {
            padding: 6mm 8mm !important;
            font-size: 9pt !important;
          }
          .sinav-onizleme.is-printing .sinav-soru-wrapper {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .sinav-onizleme.is-printing .sorular-container {
            gap: 3mm !important;
          }
          .sinav-onizleme.is-printing .sinav-print-header {
            margin-bottom: 6px !important;
            padding-bottom: 4px !important;
          }
          .sinav-onizleme.is-printing .sinav-print-header h1 {
            font-size: 16pt !important;
            margin-bottom: 2px !important;
          }
          .sinav-onizleme.is-printing .sinav-print-header div {
            font-size: 9pt !important;
            gap: 10px !important;
          }
          .sinav-onizleme.is-printing .sinav-soru-wrapper > div {
            padding: 2mm 3mm !important;
            margin: 0 !important;
            border: none !important;
            border-bottom: 1px dashed #ccc !important;
            border-radius: 0 !important;
          }
        `}</style>
      )}
    </div>
  );
};
