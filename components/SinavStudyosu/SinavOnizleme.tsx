/**
 * Sınav Önizleme - Exam preview component
 */

import React from 'react';
import { Sinav } from '../../src/types/sinav';
import { SoruCard } from './components/SoruCard';

interface SinavOnizlemeProps {
  sinav: Sinav;
  showAnswers?: boolean;
}

export const SinavOnizleme: React.FC<SinavOnizlemeProps> = ({ sinav, showAnswers = false }) => {
  return (
    <div className="sinav-onizleme space-y-6">
      {/* Başlık ve Bilgiler */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-3">{sinav.baslik}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-100">Sınıf</div>
            <div className="text-xl font-semibold">{sinav.sinif}. Sınıf</div>
          </div>
          <div>
            <div className="text-blue-100">Toplam Soru</div>
            <div className="text-xl font-semibold">{sinav.sorular.length} soru</div>
          </div>
          <div>
            <div className="text-blue-100">Toplam Puan</div>
            <div className="text-xl font-semibold">{sinav.toplamPuan} puan</div>
          </div>
          <div>
            <div className="text-blue-100">Tahmini Süre</div>
            <div className="text-xl font-semibold">{Math.ceil(sinav.tahminiSure / 60)} dk</div>
          </div>
        </div>
      </div>

      {/* Kazanımlar */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-blue-600">📚</span>
          Ölçülen MEB Kazanımları
        </h3>
        <div className="flex flex-wrap gap-2">
          {sinav.secilenKazanimlar.map(kod => (
            <span
              key={kod}
              className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-mono rounded-full"
            >
              {kod}
            </span>
          ))}
        </div>
      </div>

      {/* Sorular */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📝</span>
          Sorular
        </h3>
        {sinav.sorular.map((soru, index) => (
          <SoruCard
            key={soru.id}
            soru={soru}
            soruNo={index + 1}
            showAnswer={showAnswers}
          />
        ))}
      </div>

      {/* Pedagojik Not */}
      {sinav.pedagogicalNote && (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <span>👨‍🏫</span>
            Öğretmenin Dikkatine
          </h3>
          <p className="text-sm text-green-800 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
            {sinav.pedagogicalNote}
          </p>
        </div>
      )}
    </div>
  );
};
