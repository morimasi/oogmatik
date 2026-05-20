/**
 * Soru Card — siyah metin, format parametreleri destekli
 * Yazdırma modu optimizasyonlu
 */

import React from 'react';
import { Soru } from '../../../types/sinav';
import { ZorlukGostergesi } from './ZorlukGostergesi';

interface SoruCardProps {
  soru: Soru;
  soruNo: number;
  showAnswer?: boolean;
  fontSizePt?: string;
  fontFamily?: string;
  lineHeight?: number;
  isPrinting?: boolean;
}

export const SoruCard: React.FC<SoruCardProps> = ({
  soru,
  soruNo,
  showAnswer = false,
  fontSizePt = '12pt',
  fontFamily = 'Lexend, sans-serif',
  lineHeight = 1.6,
  isPrinting = false,
}) => {
  const textStyle: React.CSSProperties = { fontSize: fontSizePt, fontFamily, color: '#111', lineHeight };

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
          <div className="space-y-1 mt-3">
            {soru.secenekler?.map((sec, idx) => {
              const isCorrect = showAnswer && String(idx) === String(soru.dogruCevap);
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                    isCorrect && !isPrinting 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : (isPrinting ? 'bg-transparent border-transparent p-0' : 'bg-gray-50 border-gray-200')
                  }`}
                  style={textStyle}
                >
                  <span className={`font-bold flex-shrink-0 ${isCorrect && !isPrinting ? 'text-emerald-700' : 'text-black'}`}>
                    {['A', 'B', 'C', 'D'][idx]})
                  </span>
                  <span style={{ color: '#111' }}>{sec}</span>
                  {isCorrect && isPrinting && <span className="ml-auto text-black">✓</span>}
                </div>
              );
            })}
          </div>
        );

      case 'dogru-yanlis-duzeltme':
        const isCorrectDY = showAnswer && soru.dogruCevap;
        return (
          <div className="mt-3 space-y-2">
            <div className="flex gap-8 px-3">
              <div className="flex items-center gap-1">
                 <span style={{ ...textStyle, color: '#000' }}>( ) Doğru</span>
                 {isCorrectDY === 'Doğru' && isPrinting && <span className="text-black font-black">✓</span>}
              </div>
              <div className="flex items-center gap-1">
                 <span style={{ ...textStyle, color: '#000' }}>( ) Yanlış</span>
                 {isCorrectDY === 'Yanlış' && isPrinting && <span className="text-black font-black">✓</span>}
              </div>
            </div>
            {!isPrinting && (
              <div className="px-3">
                <span style={{ ...textStyle, color: '#555' }}>Düzeltme: </span>
                <span className="inline-block w-48 border-b border-gray-400">&nbsp;</span>
              </div>
            )}
            {showAnswer && !isPrinting && (
              <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'bosluk-doldurma':
        return (
          <div className="mt-3 px-3">
            {isPrinting ? (
                <div className="mt-1 border-b border-dashed border-gray-400 w-full h-5 relative">
                   {showAnswer && (
                     <span className="absolute bottom-0 left-2 text-[10pt] font-bold text-black">{soru.dogruCevap}</span>
                   )}
                </div>
            ) : (
              <>
                <span style={{ ...textStyle, color: '#555' }}>Cevap: </span>
                <span className="inline-block w-48 border-b-2 border-gray-400 mx-1">&nbsp;</span>
              </>
            )}
            {showAnswer && !isPrinting && (
              <div className="mt-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'acik-uclu':
        return (
          <div className="mt-3 px-3">
            <div className={`space-y-${isPrinting ? '4' : '3'} mt-1`}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="border-b border-gray-300 h-6" />
              ))}
            </div>
            {showAnswer && !isPrinting && (
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
      className={`bg-white transition-all ${
        isPrinting 
          ? 'border-none p-0' 
          : 'border border-gray-200 rounded-xl p-5 shadow-sm'
      }`}
      style={{ color: '#111', backgroundColor: '#ffffff', breakInside: 'avoid' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span
            className="font-black text-black"
            style={{ fontSize: `calc(${fontSizePt} + 2pt)` }}
          >
            {soruNo})
          </span>
          {!isPrinting && (
            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {getSoruTipiLabel()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isPrinting && <ZorlukGostergesi zorluk={soru.zorluk} className="zorluk-badge" />}
          <span className={`text-[13px] font-bold border-b-2 border-dashed pb-0.5 ${isPrinting ? 'text-black border-black/10' : 'text-zinc-600 border-zinc-100'}`}>
            ({soru.puan} Puan)
          </span>
        </div>
      </div>

      {/* Soru Metni */}
      <div
        className="leading-relaxed font-medium mb-4"
        style={{ ...textStyle, color: '#000', lineHeight: 1.7 }}
      >
        {soru.soruMetni}
      </div>

      {/* İçerik */}
      {renderContent()}

      {/* Kazanım kodu - Yazdırmada Gizle */}
      {!isPrinting && (
        <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded">
            {soru.kazanimKodu}
          </span>
          <span className="text-[10px] text-gray-400 font-medium">Tahmini Süre: {Math.ceil(soru.tahminiSure / 60)} dk</span>
        </div>
      )}
    </div>
  );
};
