/**
 * Soru Card - Individual question display component
 */

import React from 'react';
import { Soru } from '../../../src/types/sinav';
import { ZorlukGostergesi } from './ZorlukGostergesi';

interface SoruCardProps {
  soru: Soru;
  soruNo: number;
  showAnswer?: boolean;
}

export const SoruCard: React.FC<SoruCardProps> = ({ soru, soruNo, showAnswer = false }) => {
  const renderSoruContent = (): React.ReactNode => {
    switch (soru.tip) {
      case 'coktan-secmeli':
        return (
          <div className="space-y-2 mt-3">
            {soru.secenekler?.map((secenek, idx) => (
              <div
                key={idx}
                className={`p-2 rounded border ${
                  showAnswer && String(idx) === String(soru.dogruCevap)
                    ? 'bg-green-50 border-green-300 font-medium'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {secenek}
              </div>
            ))}
          </div>
        );

      case 'dogru-yanlis-duzeltme':
        return (
          <div className="mt-3 space-y-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="radio" name={`soru-${soru.id}`} disabled />
                <span>Doğru</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name={`soru-${soru.id}`} disabled />
                <span>Yanlış</span>
              </label>
            </div>
            {showAnswer && (
              <div className="p-2 bg-green-50 border border-green-300 rounded text-sm">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'bosluk-doldurma':
        return (
          <div className="mt-3">
            <div className="p-2 bg-gray-50 border border-gray-200 rounded">
              Cevap: <span className="inline-block w-48 border-b-2 border-gray-400 mx-2">______</span>
            </div>
            {showAnswer && (
              <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded text-sm">
                <strong>Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      case 'acik-uclu':
        return (
          <div className="mt-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded min-h-[100px]">
              <span className="text-gray-400 text-sm">Öğrenci cevabı buraya yazılacak...</span>
            </div>
            {showAnswer && (
              <div className="mt-2 p-2 bg-green-50 border border-green-300 rounded text-sm">
                <strong>Örnek Cevap:</strong> {soru.dogruCevap}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getSoruTipiLabel = (): string => {
    switch (soru.tip) {
      case 'coktan-secmeli':
        return 'Çoktan Seçmeli';
      case 'dogru-yanlis-duzeltme':
        return 'Doğru-Yanlış';
      case 'bosluk-doldurma':
        return 'Boşluk Doldurma';
      case 'acik-uclu':
        return 'Açık Uçlu';
      default:
        return soru.tip;
    }
  };

  return (
    <div className="soru-card bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-700">Soru {soruNo}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getSoruTipiLabel()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ZorlukGostergesi zorluk={soru.zorluk} className="zorluk-badge" />
          <span className="text-sm text-gray-600">{soru.puan} puan</span>
        </div>
      </div>

      {/* Soru Metni */}
      <div className="mb-3">
        <p className="text-base leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
          {soru.soruMetni}
        </p>
      </div>

      {/* Soru İçeriği */}
      {renderSoruContent()}

      {/* Meta bilgiler */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="font-mono bg-blue-50 px-2 py-1 rounded">{soru.kazanimKodu}</span>
        <span>~{Math.ceil(soru.tahminiSure / 60)} dakika</span>
      </div>
    </div>
  );
};
