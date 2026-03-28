/**
 * Kazanım Picker - MEB kazanım seçici component
 * Cascading multi-select: Sınıf → Üniteler → Kazanımlar
 */

import React, { useState, useEffect } from 'react';
import { getUnitesByGrade, getKazanimByUniteId } from '../../src/data/meb-turkce-kazanim';
import { MEBUnite, MEBKazanim } from '../../src/types/sinav';

interface KazanimPickerProps {
  selectedGrade: number | null;
  selectedUnites: string[];
  selectedKazanimlar: string[];
  onUniteChange: (uniteIds: string[]) => void;
  onKazanimChange: (kazanimCodes: string[]) => void;
}

export const KazanimPicker: React.FC<KazanimPickerProps> = ({
  selectedGrade,
  selectedUnites,
  selectedKazanimlar,
  onUniteChange,
  onKazanimChange
}) => {
  const [uniteler, setUniteler] = useState<MEBUnite[]>([]);
  const [kazanimlar, setKazanimlar] = useState<MEBKazanim[]>([]);

  // Sınıf değiştiğinde üniteleri yükle
  useEffect(() => {
    if (selectedGrade) {
      const unites = getUnitesByGrade(selectedGrade);
      setUniteler(unites);
      // Sınıf değişince seçimleri sıfırla
      onUniteChange([]);
      onKazanimChange([]);
      setKazanimlar([]);
    }
  }, [selectedGrade, onUniteChange, onKazanimChange]);

  // Ünite seçimi değiştiğinde kazanımları yükle
  useEffect(() => {
    if (selectedUnites.length > 0) {
      const allKazanim: MEBKazanim[] = [];
      selectedUnites.forEach(uniteId => {
        const uniteKazanim = getKazanimByUniteId(uniteId);
        allKazanim.push(...uniteKazanim);
      });
      setKazanimlar(allKazanim);
    } else {
      setKazanimlar([]);
      onKazanimChange([]);
    }
  }, [selectedUnites, onKazanimChange]);

  const handleUniteToggle = (uniteId: string): void => {
    const newSelection = selectedUnites.includes(uniteId)
      ? selectedUnites.filter(id => id !== uniteId)
      : [...selectedUnites, uniteId];
    onUniteChange(newSelection);
  };

  const handleKazanimToggle = (kazanimCode: string): void => {
    const newSelection = selectedKazanimlar.includes(kazanimCode)
      ? selectedKazanimlar.filter(code => code !== kazanimCode)
      : [...selectedKazanimlar, kazanimCode];
    onKazanimChange(newSelection);
  };

  const handleSelectAllKazanim = (): void => {
    const allCodes = kazanimlar.map(k => k.kod);
    onKazanimChange(allCodes);
  };

  const handleClearAllKazanim = (): void => {
    onKazanimChange([]);
  };

  if (!selectedGrade) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">📚 Önce bir sınıf seçin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ünite Seçimi */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <span className="text-blue-600">📖</span>
          {selectedGrade}. Sınıf Üniteleri
          <span className="text-sm font-normal text-gray-500">(Çoklu seçim yapabilirsiniz)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {uniteler.map(unite => (
            <label
              key={unite.id}
              className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                selectedUnites.includes(unite.id)
                  ? 'bg-blue-50 border-blue-400 shadow-sm'
                  : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedUnites.includes(unite.id)}
                onChange={() => handleUniteToggle(unite.id)}
                className="mt-1 w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Ünite {unite.uniteNo}: {unite.baslik}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {unite.kazanimlar.length} kazanım
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Kazanım Seçimi (Ünite seçiliyse göster) */}
      {selectedUnites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-green-600">✓</span>
              MEB Kazanımları
              <span className="text-sm font-normal text-gray-500">
                ({kazanimlar.length} kazanım)
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAllKazanim}
                className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
              >
                Tümünü Seç
              </button>
              <button
                onClick={handleClearAllKazanim}
                className="text-sm px-3 py-1 bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition"
              >
                Temizle
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-lg p-3 bg-gray-50">
            {kazanimlar.map(kazanim => (
              <label
                key={kazanim.kod}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedKazanimlar.includes(kazanim.kod)
                    ? 'bg-green-50 border-green-400 shadow-sm'
                    : 'bg-white border-gray-200 hover:bg-green-50 hover:border-green-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedKazanimlar.includes(kazanim.kod)}
                  onChange={() => handleKazanimToggle(kazanim.kod)}
                  className="mt-1 w-4 h-4 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-mono rounded font-medium">
                      {kazanim.kod}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {kazanim.ogrenmeAlani}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {kazanim.tanim}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Seçim Özeti */}
      {selectedKazanimlar.length > 0 && (
        <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <p className="font-semibold text-green-800 text-lg">
              {selectedKazanimlar.length} kazanım seçildi
            </p>
          </div>
          <p className="text-sm text-green-700">
            Bu kazanımlar sınav sorularına dahil edilecek.
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedKazanimlar.map(kod => (
              <span
                key={kod}
                className="inline-block px-2 py-0.5 bg-green-200 text-green-800 text-xs font-mono rounded"
              >
                {kod}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
