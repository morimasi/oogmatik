/**
 * Cevap Anahtarı - Answer key component
 */

import React from 'react';
import { CevapAnahtari } from '../../src/types/sinav';

interface CevapAnahtariProps {
  cevapAnahtari: CevapAnahtari;
  sinavBaslik: string;
}

export const CevapAnahtariComponent: React.FC<CevapAnahtariProps> = ({
  cevapAnahtari,
  sinavBaslik
}) => {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="border-b-2 border-gray-200 pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-green-600">✓</span>
          Cevap Anahtarı
        </h2>
        <p className="text-sm text-gray-600 mt-1">{sinavBaslik}</p>
      </div>

      <div className="space-y-2">
        {cevapAnahtari.sorular.map((cevap) => (
          <div
            key={cevap.soruNo}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-gray-700 w-12">
                {cevap.soruNo}.
              </span>
              <div className="flex-1">
                <div className="font-medium text-gray-900 mb-1">
                  Cevap: <span className="text-green-700">{cevap.dogruCevap}</span>
                </div>
                <div className="text-xs text-gray-500 font-mono bg-blue-50 inline-block px-2 py-0.5 rounded">
                  {cevap.kazanimKodu}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-semibold text-purple-700">
                {cevap.puan} puan
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Toplam */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Toplam Puan:</span>
          <span className="text-2xl font-bold text-purple-900">
            {cevapAnahtari.sorular.reduce((sum, c) => sum + c.puan, 0)} puan
          </span>
        </div>
      </div>
    </div>
  );
};
