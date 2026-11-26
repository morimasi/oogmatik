import React, { useState, useRef } from 'react';
import { X, Check, BarChart3, PieChart, Shapes, Box, Compass, Sparkles } from 'lucide-react';
import { GraphicRenderer } from '../../../MatSinavStudyosu/components/GraphicRenderer';
import type { GrafikVerisi } from '../../../../types/matSinav';

interface ChartDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (svgContent: string, label: string) => void;
}

interface ChartPreset {
  id: string;
  name: string;
  category: 'veri' | 'geometri' | '3d' | 'analitik' | 'kavramsal';
  grafik: GrafikVerisi;
}

const PRESETS: ChartPreset[] = [
  // Veri Grafikleri
  {
    id: 'bar-chart',
    name: 'Sütun Grafiği',
    category: 'veri',
    grafik: {
      tip: 'sutun_grafigi',
      baslik: 'Öğrencilerin En Sevdiği Dersler',
      x_ekseni: 'Dersler',
      y_ekseni: 'Kişi Sayısı',
      veri: [
        { etiket: 'Matematik', deger: 18, renk: '#4F46E5' },
        { etiket: 'Türkçe', deger: 24, renk: '#0D9488' },
        { etiket: 'Fen', deger: 15, renk: '#F59E0B' },
        { etiket: 'Görsel', deger: 20, renk: '#E11D48' },
      ],
    },
  },
  {
    id: 'pie-chart',
    name: 'Pasta Grafiği',
    category: 'veri',
    grafik: {
      tip: 'pasta_grafigi',
      baslik: 'Günlük Zaman Dağılımı',
      veri: [
        { etiket: 'Ders Çalışma (%35)', deger: 35, renk: '#4F46E5' },
        { etiket: 'Oyun & Dinlenme (%25)', deger: 25, renk: '#0D9488' },
        { etiket: 'Kitap Okuma (%15)', deger: 15, renk: '#F59E0B' },
        { etiket: 'Uyku (%25)', deger: 25, renk: '#6366F1' },
      ],
    },
  },
  {
    id: 'cetele-table',
    name: 'Çetele Tablosu',
    category: 'veri',
    grafik: {
      tip: 'cetele_tablosu',
      baslik: 'Sınıf Kitaplığı Çetelesi',
      veri: [
        { etiket: 'Hikaye', deger: 14 },
        { etiket: 'Masal', deger: 8 },
        { etiket: 'Bilim', deger: 11 },
      ],
    },
  },
  {
    id: 'line-chart',
    name: 'Çizgi Grafiği',
    category: 'veri',
    grafik: {
      tip: 'cizgi_grafigi',
      baslik: 'Haftalık Çözülen Soru Sayısı',
      x_ekseni: 'Günler',
      y_ekseni: 'Soru',
      veri: [
        { etiket: 'Pzt', deger: 20 },
        { etiket: 'Sal', deger: 35 },
        { etiket: 'Çar', deger: 30 },
        { etiket: 'Per', deger: 45 },
        { etiket: 'Cum', deger: 50 },
      ],
    },
  },

  // Geometri
  {
    id: 'triangle',
    name: 'Dik Üçgen',
    category: 'geometri',
    grafik: {
      tip: 'dik_ucgen',
      baslik: 'ABC Dik Üçgeni',
      veri: [
        { etiket: 'A Köşesi' },
        { etiket: 'B Köşesi' },
        { etiket: 'C Köşesi' },
        { etiket: 'AB Kenarı: 6', deger: 6, birim: 'cm' },
        { etiket: 'BC Kenarı: 8', deger: 8, birim: 'cm' },
        { etiket: 'AC Kenarı: 10', deger: 10, birim: 'cm' },
      ],
    },
  },
  {
    id: 'rectangle',
    name: 'Dikdörtgen ve Çevre',
    category: 'geometri',
    grafik: {
      tip: 'dikdortgen',
      baslik: 'ABCD Dikdörtgeni',
      veri: [
        { etiket: 'Uzun Kenar: 12', deger: 12, birim: 'cm' },
        { etiket: 'Kısa Kenar: 5', deger: 5, birim: 'cm' },
      ],
    },
  },
  {
    id: 'circle-radius',
    name: 'Daire & Yarıçap',
    category: 'geometri',
    grafik: {
      tip: 'daire',
      baslik: 'O Merkezli Daire',
      veri: [{ etiket: 'r = 7', deger: 7, birim: 'cm' }],
    },
  },
  {
    id: 'angle-geometry',
    name: 'Açı Modeli',
    category: 'geometri',
    grafik: {
      tip: 'aci',
      baslik: '60° Dar Açı',
      veri: [{ etiket: 'Açı: 60', deger: 60, birim: '°' }],
    },
  },

  // 3D Geometri
  {
    id: 'cube-3d',
    name: '3D Küp',
    category: '3d',
    grafik: {
      tip: 'kup',
      baslik: 'Küp Modeli',
      veri: [{ etiket: 'Bir Ayrıt: 5', deger: 5, birim: 'cm' }],
    },
  },
  {
    id: 'cylinder-3d',
    name: '3D Silindir',
    category: '3d',
    grafik: {
      tip: 'silindir',
      baslik: 'Silindir Katı Cismi',
      veri: [
        { etiket: 'Taban Yarıçapı: 4', deger: 4, birim: 'cm' },
        { etiket: 'Yükseklik: 10', deger: 10, birim: 'cm' },
      ],
    },
  },
  {
    id: 'cone-3d',
    name: '3D Koni',
    category: '3d',
    grafik: {
      tip: 'koni',
      baslik: 'Koni Modeli',
      veri: [
        { etiket: 'Yarıçap: 3', deger: 3, birim: 'cm' },
        { etiket: 'Yükseklik: 8', deger: 8, birim: 'cm' },
      ],
    },
  },

  // Analitik
  {
    id: 'coordinate-system',
    name: 'Koordinat Düzlemi',
    category: 'analitik',
    grafik: {
      tip: 'koordinat_sistemi',
      baslik: 'Analitik Düzlem (x, y)',
      veri: [
        { etiket: 'A(2, 3)', deger: 2 },
        { etiket: 'B(-3, 1)', deger: -3 },
        { etiket: 'C(1, -2)', deger: 1 },
      ],
    },
  },
  {
    id: 'number-line-analytic',
    name: 'Tam Sayı Doğrusu',
    category: 'analitik',
    grafik: {
      tip: 'sayi_dogrusu',
      baslik: '-5 ile +5 Sayı Doğrusu',
      veri: [
        { etiket: 'A Noktası: -3', deger: -3 },
        { etiket: 'B Noktası: 2', deger: 2 },
      ],
    },
  },

  // Kavramsal & Özel Eğitim
  {
    id: 'fraction-model',
    name: 'Kesir Modeli (3/4)',
    category: 'kavramsal',
    grafik: {
      tip: 'kesir_modeli',
      baslik: 'Kesir Gösterimi',
      veri: [
        { etiket: 'Pay: 3', deger: 3 },
        { etiket: 'Payda: 4', deger: 4 },
      ],
    },
  },
  {
    id: 'venn-diagram',
    name: 'Venn Şeması (Kümeler)',
    category: 'kavramsal',
    grafik: {
      tip: 'venn_diyagrami',
      baslik: 'A ve B Kümeleri Kesişimi',
      veri: [
        { etiket: 'A Kümesi', deger: 5 },
        { etiket: 'B Kümesi', deger: 4 },
        { etiket: 'Kesişim (A ∩ B)', deger: 2 },
      ],
    },
  },
  {
    id: 'probability-wheel',
    name: 'Olasılık Çarkı',
    category: 'kavramsal',
    grafik: {
      tip: 'olaslik_cark',
      baslik: '4 Renkli Olasılık Çarkı',
      veri: [
        { etiket: 'Mavi', deger: 1, renk: '#3B82F6' },
        { etiket: 'Kırmızı', deger: 1, renk: '#EF4444' },
        { etiket: 'Yeşil', deger: 1, renk: '#10B981' },
        { etiket: 'Sarı', deger: 1, renk: '#F59E0B' },
      ],
    },
  },
];

export const ChartDiagramModal: React.FC<ChartDiagramModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ChartPreset['category']>('veri');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESETS[0].id);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const currentPreset = PRESETS.find((p) => p.id === selectedPresetId) ?? PRESETS[0];
  const filteredPresets = PRESETS.filter((p) => p.category === selectedCategory);

  const handleInsert = () => {
    const container = previewContainerRef.current;
    if (!container) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // SVG niteliklerini standardize et
    if (!svgElement.getAttribute('xmlns')) {
      svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    if (svgString && svgString.includes('<svg')) {
      onInsert(svgString, currentPreset.name);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-[var(--text-primary)] font-['Lexend']">
        <header className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <BarChart3 size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight">HD Matematik &amp; Veri Grafik Sihirbazı</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">
                33 tip matematik, geometri ve veri şemasını saf vektör olarak ekleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </header>

        {/* Kategori Sekmeleri */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/40 px-3 py-1.5 gap-1.5 overflow-x-auto">
          {[
            { id: 'veri', label: 'Veri & İstatistik', icon: <BarChart3 size={13} /> },
            { id: 'geometri', label: '2D Geometri', icon: <Shapes size={13} /> },
            { id: '3d', label: '3D Katı Cisimler', icon: <Box size={13} /> },
            { id: 'analitik', label: 'Analitik & Doğrular', icon: <Compass size={13} /> },
            { id: 'kavramsal', label: 'Kesir & Kümeler', icon: <PieChart size={13} /> },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id as ChartPreset['category']);
                const firstInCat = PRESETS.find((p) => p.category === cat.id);
                if (firstInCat) setSelectedPresetId(firstInCat.id);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-black transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sol: Preset Listesi */}
          <div className="w-56 shrink-0 border-r border-[var(--border-color)] p-2 space-y-1 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)]/20">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setSelectedPresetId(preset.id)}
                className={`w-full text-left rounded-xl px-2.5 py-2 text-xs font-bold transition-colors ${
                  selectedPresetId === preset.id
                    ? 'bg-blue-500/10 text-blue-600 border border-blue-400/40'
                    : 'text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] border border-transparent'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Sağ: Canlı Önizleme */}
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <span className="mb-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              <Sparkles size={12} className="text-amber-500" /> {currentPreset.name} — Canlı Vektör Önizleme
            </span>
            <div
              ref={previewContainerRef}
              className="flex-1 min-h-[280px] flex items-center justify-center rounded-2xl border border-dashed border-[var(--border-color)] bg-white p-4 shadow-inner overflow-hidden [&>div]:w-full [&>div]:max-w-md [&>div]:mx-auto"
            >
              <GraphicRenderer grafik={currentPreset.grafik} />
            </div>
            <p className="mt-2 text-[10px] text-center text-[var(--text-muted)] font-medium">
              Vektör olarak eklendikten sonra tuval üzerinde boyutu, konumu ve döndürme açısı serbestçe ayarlanabilir.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)]/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
          >
            <Check size={14} /> Tuvale Yerleştir
          </button>
        </footer>
      </div>
    </div>
  );
};
