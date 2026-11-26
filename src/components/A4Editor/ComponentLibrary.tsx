import React from 'react';
import { blockPreview, blockTypeLabel, createBlock, findBlock } from '../../services/a4EditorService';
import {
  PAGE_TEMPLATES,
  applyPageTemplate,
  cloneBlockForLibrary,
} from '../../services/a4StudioService';
import {
  loadBlockLibrary,
  removeBlockFromLibrary,
  saveBlockToLibrary,
  type A4SavedBlock,
} from '../../services/a4DraftService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { useToastStore } from '../../store/useToastStore';
import { EmptyState, MiniButton, Section } from './controls';

export interface ComponentDefinition {
  type:
    | 'header'
    | 'text'
    | 'table'
    | 'grid'
    | 'question'
    | 'logic_card'
    | 'cloze_test'
    | 'visual_clue_card';
  label: string;
  description: string;
  icon: string;
  content: Record<string, unknown>;
}

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
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
  const addBlock = useA4EditorStore((state) => state.addCustomBlock);
  const applyMutation = useA4EditorStore((state) => state.applyMutation);
  const selectedBlockId = useA4EditorStore((state) => state.selectedBlockId);
  const bridge = useA4EditorStore((state) => state.bridge);
  const toast = useToastStore();
  const [library, setLibrary] = React.useState<A4SavedBlock[]>(() => loadBlockLibrary());

  const saveSelectionToLibrary = () => {
    if (!bridge || !selectedBlockId) {
      toast.info('Önce kütüphaneye kaydetmek istediğiniz bileşeni seçin.');
      return;
    }
    const entry = findBlock(bridge.get(), selectedBlockId);
    if (!entry) {
      toast.warning('Bileşen bulunamadı.');
      return;
    }
    const next = saveBlockToLibrary(
      cloneBlockForLibrary(entry.block),
      `${blockTypeLabel(entry.block.type)} — ${blockPreview(entry.block) || 'kopya'}`
    );
    setLibrary(next);
    toast.success('Bileşen kişisel kütüphaneye eklendi.');
  };

  return (
    <div className="space-y-3 p-3">
      {!canAddBlocks && (
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-[9px] leading-relaxed text-indigo-700 dark:text-indigo-300">
          <i className="fa-solid fa-wand-magic-sparkles mr-1.5 text-indigo-500"></i>
          <strong>Özel Şablon Modu:</strong> Ekleyeceğiniz bileşenler sayfa altına A4 akıllı blok katmanı olarak iliştirilir ve tüm tasarım araçlarıyla düzenlenebilir.
        </div>
      )}

      <Section
        title="Hızlı Başlangıç"
        icon="fa-bolt"
        description="Profesyonel iskeletler; seçili sayfaya bileşen olarak eklenir ve geri alınabilir."
      >
        <div className="grid grid-cols-1 gap-1.5">
          {PAGE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                applyMutation((data) => applyPageTemplate(data, template.id));
                toast.success(`${template.label} şablonu eklendi.`);
              }}
              className="group flex w-full items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2.5 py-2 text-left transition-colors hover:border-[var(--accent-color)] hover:bg-[var(--surface-elevated)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-color)]/30 bg-[var(--accent-muted)] text-[var(--accent-color)]">
                <i className={`fa-solid ${template.icon} text-[11px]`}></i>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-black text-[var(--text-primary)]">
                  {template.label}
                </span>
                <span className="block truncate text-[9px] text-[var(--text-muted)]">
                  {template.description}
                </span>
              </span>
              <i className="fa-solid fa-plus text-[9px] text-[var(--text-muted)] transition-colors group-hover:text-[var(--accent-color)]"></i>
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Bileşen Kütüphanesi"
        icon="fa-shapes"
        description="Yeni bileşen, seçili bloğun hemen altına eklenir; seçim yoksa sayfanın sonuna eklenir."
        action={
          <MiniButton
            icon="fa-bookmark"
            title="Seçili bileşeni kişisel kütüphaneye kaydet"
            onClick={saveSelectionToLibrary}
          />
        }
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

      <Section
        title="Kişisel Kütüphane"
        icon="fa-book-bookmark"
        description="Sık kullandığınız bileşenleri kaydedin; her etkinlikte yeniden kurmayın."
      >
        {library.length === 0 ? (
          <p className="text-[9px] leading-relaxed text-[var(--text-muted)]">
            Henüz kayıtlı bileşen yok. Bir bileşen seçip bu bölümdeki yer imi düğmesine basın.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {library.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5"
              >
                <button
                  type="button"
                  onClick={() => {
                    addBlock(cloneBlockForLibrary(entry.block), afterId ?? null);
                    toast.success('Kütüphaneden eklendi.');
                  }}
                  className="min-w-0 flex-1 text-left"
                  title="Bu bileşeni sayfaya ekle"
                >
                  <span className="block truncate text-[9px] font-black text-[var(--text-primary)]">
                    {entry.label}
                  </span>
                  <span className="block truncate text-[8px] text-[var(--text-muted)]">
                    {blockTypeLabel(entry.block.type)} • {new Date(entry.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </button>
                <MiniButton
                  icon="fa-trash-can"
                  title="Kütüphaneden sil"
                  danger
                  onClick={() => setLibrary(removeBlockFromLibrary(entry.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="px-1 pb-2 text-[9px] leading-relaxed text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Eklenen bileşenler A4 akışına girer; taşan içerik otomatik olarak yeni sayfaya akar.
        Lexend tipografisi ve disleksi dostu aralıklar korunur.
      </p>
    </div>
  );
};
