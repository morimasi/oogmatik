/**
 * Sınav Önizleme — format config ile uyumlu
 */

import React from 'react';
import { Sinav } from '../../src/types/sinav';
import { SoruCard } from './components/SoruCard';
import { PrintConfig } from '../../src/utils/sinavPdfGenerator';

interface SinavOnizlemeProps {
  sinav: Sinav;
  showAnswers?: boolean;
  config?: PrintConfig;
}

export const SinavOnizleme: React.FC<SinavOnizlemeProps> = ({
  sinav,
  showAnswers = false,
  config,
}) => {
  const fontSizePx = config ? `${config.fontSize + 2}px` : '14px';
  const fontFamily = config?.fontFamily === 'times' ? 'Times New Roman, serif' : 'Lexend, Inter, sans-serif';
  const questionGap = config ? `${config.questionSpacingMm * 2}px` : '16px';
  const lineHeight = config ? config.lineHeight : 1.6;
  const textAlign = config ? config.textAlign : 'left';
  const marginMm = config ? config.marginMm : 18;
  const columns = config ? config.columns : 1;

  return (
    <div
      className="sinav-onizleme"
      style={{
        fontFamily,
        color: '#111',
        backgroundColor: '#fff',
        textAlign,
        fontSize: fontSizePx,
        lineHeight,
        padding: `${marginMm}px`,
        columnCount: columns,
        columnGap: '12mm'
      }}
    >
      {/* Başlık Bandı */}
      <div
        className="rounded-xl p-5 mb-5 text-white"
        style={{ 
          background: 'linear-gradient(135deg, hsl(var(--accent-h) var(--accent-s) calc(var(--accent-l) - 8%)) 0%, hsl(var(--accent-h) var(--accent-s) var(--accent-l)) 100%)',
          columnSpan: 'all'
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

      {/* Kazanımlar */}
      <div className="border border-gray-200 bg-gray-50 rounded-xl p-4 mb-5" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
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

      {/* Öğrenci Bilgi Satırı */}
      <div className="border border-gray-200 rounded-xl px-4 py-3 mb-5 flex flex-wrap gap-6 text-sm text-gray-600" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
        <span>Ad Soyad: <span className="border-b border-gray-400 inline-block w-40">&nbsp;</span></span>
        <span>Sınıf/Şube: <span className="border-b border-gray-400 inline-block w-20">&nbsp;</span></span>
        <span>Tarih: <span className="border-b border-gray-400 inline-block w-24">&nbsp;</span></span>
      </div>

      {/* Sorular */}
      <div className="sorular-container" style={{ display: 'block' }}>
        {sinav.sorular.map((soru, index) => (
          <div key={soru.id} style={{ marginBottom: questionGap, breakInside: 'avoid' }}>
            <SoruCard
              soru={soru}
              soruNo={index + 1}
              showAnswer={showAnswers}
              fontSizePx={fontSizePx}
              fontFamily={fontFamily}
              lineHeight={lineHeight}
            />
          </div>
        ))}
      </div>

      {/* Pedagojik Not */}
      {sinav.pedagogicalNote && (
        <div className="mt-6 border-2 border-emerald-200 bg-emerald-50 rounded-xl p-4" style={{ columnSpan: 'all', breakInside: 'avoid' }}>
          <h3 className="text-sm font-bold text-emerald-800 mb-2 flex items-center gap-1">
            <span>👨‍🏫</span> Öğretmenin Dikkatine
          </h3>
          <p className="text-sm text-emerald-900 leading-relaxed" style={{ fontFamily }}>
            {sinav.pedagogicalNote}
          </p>
        </div>
      )}
    </div>
  );
};
