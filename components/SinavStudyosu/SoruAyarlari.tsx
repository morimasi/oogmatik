/**
 * Soru Ayarları - Question distribution and difficulty settings
 */

import React from 'react';
import { SinavAyarlari } from '../../src/types/sinav';

interface SoruAyarlariProps {
  ayarlar: SinavAyarlari;
  onSoruDagilimiChange: (tip: keyof SinavAyarlari['soruDagilimi'], sayi: number) => void;
  onOzelKonuChange: (konu: string) => void;
}

export const SoruAyarlari: React.FC<SoruAyarlariProps> = ({
  ayarlar,
  onSoruDagilimiChange,
  onOzelKonuChange
}) => {
  const toplamSoru =
    ayarlar.soruDagilimi['coktan-secmeli'] +
    ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
    ayarlar.soruDagilimi['bosluk-doldurma'] +
    ayarlar.soruDagilimi['acik-uclu'];

  const soruTipleri: Array<{
    key: keyof SinavAyarlari['soruDagilimi'];
    label: string;
    icon: string;
    description: string;
  }> = [
    {
      key: 'coktan-secmeli',
      label: 'Çoktan Seçmeli',
      icon: '📝',
      description: '4 seçenekli sorular'
    },
    {
      key: 'dogru-yanlis-duzeltme',
      label: 'Doğru-Yanlış',
      icon: '✓✗',
      description: 'Doğru/Yanlış ve düzeltme'
    },
    {
      key: 'bosluk-doldurma',
      label: 'Boşluk Doldurma',
      icon: '📄',
      description: 'Eksik kelimeleri tamamlama'
    },
    {
      key: 'acik-uclu',
      label: 'Açık Uçlu',
      icon: '✍️',
      description: 'Serbest yanıt soruları'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Soru Dağılımı */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-purple-600">🎯</span>
          Soru Dağılımı
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {soruTipleri.map(({ key, label, icon, description }) => (
            <div
              key={key}
              className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => {
                    const newValue = Math.max(0, ayarlar.soruDagilimi[key] - 1);
                    onSoruDagilimiChange(key, newValue);
                  }}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold transition"
                  disabled={ayarlar.soruDagilimi[key] === 0}
                >
                  −
                </button>

                <input
                  type="number"
                  min="0"
                  max="20"
                  value={ayarlar.soruDagilimi[key]}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    onSoruDagilimiChange(key, Math.max(0, Math.min(20, value)));
                  }}
                  className="flex-1 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg py-1 focus:outline-none focus:border-purple-400"
                />

                <button
                  onClick={() => {
                    const newValue = Math.min(20, ayarlar.soruDagilimi[key] + 1);
                    onSoruDagilimiChange(key, newValue);
                  }}
                  className="w-8 h-8 bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold transition"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Toplam Soru Bilgisi */}
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-purple-800">Toplam Soru Sayısı:</span>
            <span className="text-2xl font-bold text-purple-900">{toplamSoru}</span>
          </div>
          {toplamSoru < 4 && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ En az 4 soru gereklidir (Başarı Anı Mimarisi için ilk 2 soru kolay olmalı)
            </p>
          )}
        </div>
      </div>

      {/* Özel Konu/Tema */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-orange-600">💡</span>
          Özel Konu/Tema
          <span className="text-sm font-normal text-gray-500">(Opsiyonel)</span>
        </h3>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
          <input
            type="text"
            value={ayarlar.ozelKonu || ''}
            onChange={(e) => onOzelKonuChange(e.target.value)}
            placeholder="Örn: Uzay keşfi, hayvanlar, mevsimler..."
            maxLength={500}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          />
          <p className="text-xs text-gray-500 mt-2">
            Belirtirseniz, tüm sorular bu tema etrafında oluşturulacak.
          </p>
        </div>
      </div>

      {/* Başarı Anı Mimarisi Bilgilendirmesi */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span>🎓</span>
          Başarı Anı Mimarisi
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
          <li>İlk 2 soru otomatik olarak <strong>KOLAY</strong> zorlukta olacak</li>
          <li>Öğrenciye güven inşa etmek için tasarlandı</li>
          <li>Sonraki sorular zorluk dengesine göre ORTA/ZOR olabilir</li>
        </ul>
      </div>
    </div>
  );
};
