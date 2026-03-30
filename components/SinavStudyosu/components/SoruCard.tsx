/**
 * Soru Card — siyah metin, format parametreleri destekli
 */

import React from 'react';
import { Soru } from '../../../src/types/sinav';
import { ZorlukGostergesi } from './ZorlukGostergesi';

interface SoruCardProps {
  soru: Soru;
  soruNo: number;
  showAnswer?: boolean;
  fontSizePx?: string;
  fontFamily?: string;
  lineHeight?: number;
}

export const SoruCard: React.FC<SoruCardProps> = ({
  soru,
  soruNo,
  showAnswer = false,
  fontSizePx = '14px',
  fontFamily = 'Lexend, sans-serif',
  lineHeight = 1.6,
}) => {
  const textStyle: React.CSSProperties = { fontSize: fontSizePx, fontFamily, color: '#111', lineHeight };

  const getSoruTipiLabel = (): string => {
    const labels: Record<string, string> = {
      'coktan-secmeli': 'Çoktan Seçmeli',
      'dogru-yanlis-duzeltme': 'Doğru-Yanlış',
      'bosluk-doldurma': 'Boşluk Doldurma',
      'acik-uclu': 'Açık Uçlu',
    };
    return labels[soru.tip] ?? soru.tip;
  };

  const renderContent = (): React.ReactNode => {
    switch (soru.tip) {
      case 'coktan-secmeli':
        return (
          <div className="space-y-1.5 mt-3">
            {soru.secenekler?.map((sec, idx) => {
              const isCorrect = showAnswer && String(idx) === String(soru.dogruCevap);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-3 py-2 rounded-lg border transition-colors ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  style={textStyle}
                >
                  <span className={`font-bold flex-shrink-0 ${isCorrect ? 'text-emerald-700' : 'text-gray-500'}`}>
                    {['A', 'B', 'C', 'D'][idx]})
                  </span>
                  <span style={{ color: '#111' }}>{sec}</span>
                </div>
              );
            })}
          </div>
        );

      case 'dogru-yanlis-duzeltme':
        return (
          <div className="mt-3 space-y-2">
            <div className="flex gap-6 px-3">
              {['Doğru', 'Yanlış'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-default">
                  <input type="radio" name={`soru-${soru.id}`} disabled className="accent-indigo-600" />
                  <span style={{ ...textStyle, color: '#333' }}>{opt}</span>
                </label>
              ))}
            </div>
            <div className="px-3">
              <span style={{ ...textStyle, color: '#555' }}>Düzeltme: </span>
              <span className="inline-block w-48 border-b border-gray-400">&nbsp;</span>
            </div>
            {showAnswer && (
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'bosluk-doldurma':
        return (
          <div className="mt-3 px-3">
            <span style={{ ...textStyle, color: '#555' }}>Cevap: </span>
            <span className="inline-block w-48 border-b-2 border-gray-400 mx-1">&nbsp;</span>
            {showAnswer && (
              <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'acik-uclu':
        return (
          <div className="mt-3 px-3">
            <div className="space-y-3 mt-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-300 h-6" />
              ))}
            </div>
            {showAnswer && (
              <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <strong>Örnek Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
      style={{ color: '#111', backgroundColor: '#ffffff' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="font-extrabold text-indigo-700"
            style={{ fontSize: `calc(${fontSizePx} + 1px)` }}
          >
            {soruNo}.
          </span>
          <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {getSoruTipiLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ZorlukGostergesi zorluk={soru.zorluk} className="zorluk-badge" />
          <span className="text-xs text-gray-500 font-medium">{soru.puan} puan</span>
        </div>
      </div>

      {/* Soru Metni */}
      <p
        className="leading-relaxed font-medium"
        style={{ ...textStyle, color: '#111', lineHeight: 1.65 }}
      >
        {soru.soruMetni}
      </p>

      {/* İçerik */}
      {renderContent()}

      {/* Kazanım kodu */}
      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-mono text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
          {soru.kazanimKodu}
        </span>
        <span className="text-[10px] text-gray-400">~{Math.ceil(soru.tahminiSure / 60)} dk</span>
      </div>
    </div>
  );
};
