import { createBlock } from '../../services/a4EditorService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { EmptyState, MiniButton, Section } from './controls';

interface ComponentDefinition {
  type: 'header' | 'text' | 'table' | 'grid' | 'question' | 'logic_card' | 'cloze_test' | 'visual_clue_card';
  label: string;
  description: string;
  icon: string;
  content: Record<string, unknown>;
}

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'header',
    label: 'Başlık',
    icon: 'fa-heading',
    description: 'Ana veya bölüm başlığı.',
    content: { text: 'YENİ BAŞLIK' },
  },
  {
    type: 'text',
    label: 'Metin Paragrafı',
    icon: 'fa-align-left',
    description: 'Okuma veya açıklama metni.',
    content: { text: 'Buraya yeni bir metin veya hikaye ekleyebilirsiniz...' },
  },
  {
    type: 'table',
    label: 'Tablo Matrisi',
    icon: 'fa-table',
    description: 'Satır ve sütunlardan tablo.',
    content: {
      headers: ['SÜTUN 1', 'SÜTUN 2'],
      rows: [
        ['Değer 1', 'Değer 2'],
        ['Değer 3', 'Değer 4'],
      ],
    },
  },
  {
    type: 'grid',
    label: 'Kutu Izgarası',
    icon: 'fa-border-all',
    description: 'Harf veya kelime kutuları.',
    content: { cols: 4, cells: ['A', 'B', 'C', 'D'] },
  },
  {
    type: 'question',
    label: 'Çoktan Seçmeli',
    icon: 'fa-list-check',
    description: 'A, B, C, D seçenekli soru.',
    content: {
      text: 'Soru metni buraya gelecek...',
      options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
      answer: 'A',
    },
  },
  {
    type: 'cloze_test',
    label: 'Boşluk Doldurma',
    icon: 'fa-pen-nib',
    description: 'Metin içinde [cevap] boşlukları.',
    content: { text: 'Cümlede [cevap] buraya yazılır.' },
  },
  {
    type: 'logic_card',
    label: 'Mantık Kartı',
    icon: 'fa-lightbulb',
    description: 'Çerçeveli bilgi kartı.',
    content: { text: 'ÖNEMLİ BİLGİ:', detail: 'Bunu mutlaka okuyun.', options: ['A', 'B'] },
  },
  {
    type: 'visual_clue_card',
    label: 'İpucu Kartı',
    icon: 'fa-comment-dots',
    description: 'Vurgulu klinik ipucu.',
    content: { title: 'KLİNİK İPUCU', clue: 'İpucu metni...', icon: 'fa-lightbulb' },
  },
];

export const ComponentLibrary = ({
  canAddBlocks,
  afterId,
  onOpenLayers,
  onOpenPage,
}: {
  canAddBlocks: boolean;
  afterId?: string | null;
  onOpenLayers: () => void;
  onOpenPage: () => void;
}) => {
  const addBlock = useA4EditorStore((state) => state.addBlock);

  if (!canAddBlocks) {
    return (
      <EmptyState
        icon="fa-shapes"
        title="Blok Ekleme Kapalı"
        description="Bu etkinlik, kendi özel sayfa şablonuyla (Legacy renderer) çiziliyor. Blok eklendiğinde şablon değişeceği için ekleme kapatıldı; sayfa ayarları ve çıktı seçenekleri kullanılabilir."
      >
        <div className="flex justify-center gap-2">
          <MiniButton icon="fa-file-lines" label="Sayfa Ayarları" title="Sayfa ayarlarını aç" onClick={onOpenPage} />
          <MiniButton icon="fa-layer-group" label="Katmanlar" title="Katmanları aç" onClick={onOpenLayers} />
        </div>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <Section
        title="Bileşen Kütüphanesi"
        icon="fa-shapes"
        description="Yeni bileşen, seçili bloğun hemen altına eklenir; seçim yoksa sayfanın sonuna eklenir."
      >
        <div className="grid grid-cols-1 gap-1.5">
          {COMPONENT_DEFINITIONS.map((definition) => (
            <button
              key={definition.type}
              type="button"
              onClick={() => addBlock(createBlock(definition.type, definition.content), afterId ?? null)}
              className="group flex w-full items-center gap-2.5 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2.5 py-2 text-left transition-colors hover:border-[var(--accent-color)] hover:bg-[var(--surface-elevated)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent-color)]">
                <i className={`fa-solid ${definition.icon} text-[11px]`}></i>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-black text-[var(--text-primary)]">
                  {definition.label}
                </span>
                <span className="block truncate text-[9px] text-[var(--text-muted)]">
                  {definition.description}
                </span>
              </span>
              <i className="fa-solid fa-plus text-[9px] text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-color)]"></i>
            </button>
          ))}
        </div>
      </Section>

      <p className="px-1 pb-2 text-[9px] leading-relaxed text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Eklenen bileşenler A4 akışına girer; taşan içerik otomatik olarak yeni sayfaya akar.
        Lexend tipografisi ve disleksi dostu aralıklar korunur.
      </p>
    </div>
  );
};
