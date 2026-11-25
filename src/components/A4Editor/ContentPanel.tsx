import React from 'react';
import type { WorksheetBlock } from '../../types';
import { blockTypeIcon, blockTypeLabel } from '../../services/a4EditorService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { EmptyState, Field, MiniButton, Section, TextField } from './controls';

const asRecord = (content: unknown): Record<string, unknown> =>
  content && typeof content === 'object' && !Array.isArray(content)
    ? (content as Record<string, unknown>)
    : { text: content ?? '' };

const asText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
};

const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((item) => asText(item)) : [];

const asPairList = (value: unknown): Array<{ text: string }> =>
  Array.isArray(value)
    ? value.map((item) =>
        item && typeof item === 'object'
          ? { text: asText((item as Record<string, unknown>).text) }
          : { text: asText(item) }
      )
    : [];

/**
 * İçerik paneli — seçili bileşenin içeriğini türüne uygun formla düzenler.
 * Her değişiklik store üzerinden anında uygulanır (kaydet düğmesi gerekmez).
 */
export const ContentPanel = ({
  selectedBlock,
  selectedCount,
}: {
  selectedBlock?: WorksheetBlock;
  selectedCount: number;
}) => {
  const updateBlockContent = useA4EditorStore((state) => state.updateBlockContent);
  const applyBlockAction = useA4EditorStore((state) => state.applyBlockAction);
  const updateBlockMeta = useA4EditorStore((state) => state.updateBlockMeta);

  if (!selectedBlock) {
    return (
      <EmptyState
        icon="fa-pen-to-square"
        title="Bileşen Seçilmedi"
        description="Düzenlemek için sayfadaki bir bileşene tıklayın veya Katmanlar sekmesinden seçin."
      />
    );
  }

  const content = asRecord(selectedBlock.content);
  const id = selectedBlock.id ?? '';
  const patch = (values: Record<string, unknown>) => updateBlockContent(id, values);

  const renderEditor = () => {
    switch (selectedBlock.type) {
      case 'header':
        return (
          <Field label="Başlık Metni">
            <TextField value={asText(content.text)} onChange={(text) => patch({ text })} />
          </Field>
        );

      case 'text':
        return (
          <Field label="Paragraf Metni" hint={`${asText(content.text).length} karakter`}>
            <TextField
              multiline
              rows={9}
              value={asText(content.text)}
              onChange={(text) => patch({ text })}
            />
          </Field>
        );

      case 'question': {
        const options = asStringList(content.options);
        return (
          <>
            <Field label="Soru Metni">
              <TextField multiline rows={3} value={asText(content.text)} onChange={(text) => patch({ text })} />
            </Field>
            <Field label="Seçenekler">
              <div className="space-y-1.5">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="w-4 text-center text-[10px] font-black text-[var(--text-muted)]">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(event) => {
                        const next = [...options];
                        next[index] = event.target.value;
                        patch({ options: next });
                      }}
                      className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                    />
                    <button
                      type="button"
                      title="Seçeneği sil"
                      onClick={() => patch({ options: options.filter((_, i) => i !== index) })}
                      className="h-6 w-6 rounded-md border border-[var(--border-color)] text-[9px] text-[var(--text-muted)] hover:text-red-500"
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                  </div>
                ))}
                <MiniButton
                  icon="fa-plus"
                  label="Seçenek Ekle"
                  title="Yeni seçenek ekle"
                  onClick={() => patch({ options: [...options, `Seçenek ${options.length + 1}`] })}
                />
              </div>
            </Field>
            <Field label="Doğru Cevap">
              <TextField value={asText(content.answer)} onChange={(answer) => patch({ answer })} />
            </Field>
          </>
        );
      }

      case 'grid': {
        const cells = asStringList(content.cells).length
          ? asStringList(content.cells)
          : asStringList(content.items).length
            ? asStringList(content.items)
            : asStringList(content.data);
        return (
          <>
            <Field label="Sütun Sayısı" hint="1-8">
              <input
                type="number"
                min={1}
                max={8}
                value={Number(content.cols ?? content.columns ?? 4)}
                onChange={(event) =>
                  patch({ cols: Math.min(8, Math.max(1, Number(event.target.value) || 1)) })
                }
                className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[11px] font-semibold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
            </Field>
            <Field label="Hücreler" hint="virgülle ayır">
              <TextField
                multiline
                rows={4}
                value={cells.join(', ')}
                onChange={(value) =>
                  patch({
                    cells: value
                      .split(',')
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0),
                    items: undefined,
                    data: undefined,
                  })
                }
              />
            </Field>
          </>
        );
      }

      case 'table': {
        const headers = asStringList(content.headers).length
          ? asStringList(content.headers)
          : asStringList(content.columns);
        const rows = Array.isArray(content.rows) ? content.rows : [];
        const rowsAsText = rows
          .map((row) => (Array.isArray(row) ? row.map((cell) => asText(cell)).join(' | ') : asText(row)))
          .join('\n');
        return (
          <>
            <Field label="Başlıklar" hint="virgülle ayır">
              <TextField
                value={headers.join(', ')}
                onChange={(value) =>
                  patch({
                    headers: value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                    columns: undefined,
                  })
                }
              />
            </Field>
            <Field label="Satırlar" hint="her satır bir satır, hücreler | ile">
              <TextField
                multiline
                rows={6}
                value={rowsAsText}
                onChange={(value) =>
                  patch({
                    rows: value
                      .split('\n')
                      .map((line) => line.split('|').map((cell) => cell.trim()))
                      .filter((row) => row.some((cell) => cell.length > 0)),
                  })
                }
              />
            </Field>
          </>
        );
      }

      case 'cloze_test':
        return (
          <Field label="Metin" hint="boşluklar [cevap] biçiminde">
            <TextField multiline rows={8} value={asText(content.text)} onChange={(text) => patch({ text })} />
          </Field>
        );

      case 'logic_card':
        return (
          <>
            <Field label="Kart Metni">
              <TextField value={asText(content.text)} onChange={(text) => patch({ text })} />
            </Field>
            <Field label="Detay">
              <TextField
                multiline
                rows={3}
                value={asText(content.detail)}
                onChange={(detail) => patch({ detail })}
              />
            </Field>
            <Field label="Seçenekler" hint="virgülle ayır">
              <TextField
                value={asStringList(content.options).join(', ')}
                onChange={(value) =>
                  patch({
                    options: value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
          </>
        );

      case 'visual_clue_card':
        return (
          <>
            <Field label="Başlık">
              <TextField value={asText(content.title)} onChange={(title) => patch({ title })} />
            </Field>
            <Field label="İpucu Metni">
              <TextField
                multiline
                rows={3}
                value={asText(content.clue) || asText(content.description)}
                onChange={(clue) => patch({ clue })}
              />
            </Field>
            <Field label="İkon" hint="fa-* sınıfı">
              <TextField value={asText(content.icon)} onChange={(icon) => patch({ icon })} />
            </Field>
          </>
        );

      case 'footer_validation':
        return (
          <>
            <Field label="Metin">
              <TextField multiline rows={3} value={asText(content.text)} onChange={(text) => patch({ text })} />
            </Field>
            <Field label="Hedef Değer">
              <TextField
                value={asText(content.targetValue)}
                onChange={(targetValue) => patch({ targetValue })}
              />
            </Field>
          </>
        );

      case 'match_columns': {
        const left = asPairList(content.leftColumn ?? content.left);
        const right = asPairList(content.rightColumn ?? content.right);
        const toCsv = (items: Array<{ text: string }>) => items.map((item) => item.text).join(', ');
        const fromCsv = (value: string) =>
          value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean)
            .map((text) => ({ text }));
        return (
          <>
            <Field label="Sol Kolon" hint="virgülle ayır">
              <TextField
                value={toCsv(left)}
                onChange={(value) => patch({ leftColumn: fromCsv(value), left: undefined })}
              />
            </Field>
            <Field label="Sağ Kolon" hint="virgülle ayır">
              <TextField
                value={toCsv(right)}
                onChange={(value) => patch({ rightColumn: fromCsv(value), right: undefined })}
              />
            </Field>
          </>
        );
      }

      case 'categorical_sorting': {
        const categories = asStringList(content.categories);
        const items = Array.isArray(content.items) ? content.items : [];
        return (
          <>
            <Field label="Kategoriler" hint="virgülle ayır">
              <TextField
                value={categories.join(', ')}
                onChange={(value) =>
                  patch({
                    categories: value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="Öğeler" hint="virgülle ayır">
              <TextField
                multiline
                rows={4}
                value={items.map((item) => asText(item && typeof item === 'object' ? (item as Record<string, unknown>).label : item)).join(', ')}
                onChange={(value) =>
                  patch({
                    items: value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean)
                      .map((label) => ({ label })),
                  })
                }
              />
            </Field>
          </>
        );
      }

      case 'image':
        return (
          <Field label="Görsel İpucu Metni">
            <TextField
              multiline
              rows={3}
              value={asText(content.prompt)}
              onChange={(prompt) => patch({ prompt })}
            />
          </Field>
        );

      case 'svg_shape':
        return (
          <Field label="SVG Yolu (d)" hint="gelişmiş">
            <TextField
              multiline
              rows={4}
              mono
              value={asStringList(content.paths).join('\n')}
              onChange={(value) =>
                patch({ paths: value.split('\n').map((line) => line.trim()).filter(Boolean) })
              }
            />
          </Field>
        );

      default:
        return <JsonEditor blockId={id} content={content} onApply={(next) => patch(next)} />;
    }
  };

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)]/50 p-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[10px] text-[var(--accent-color)]">
            <i className={`fa-solid ${blockTypeIcon(selectedBlock.type)}`}></i>
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black text-[var(--text-primary)]">
              {blockTypeLabel(selectedBlock.type)}
            </p>
            <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
              {selectedCount > 1 ? `${selectedCount} bileşen seçili • birincil` : 'içerik düzenleme'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <MiniButton icon="fa-clone" title="Bu bileşeni çoğalt" onClick={() => id && applyBlockAction('duplicate', [id])} />
          <MiniButton
            icon={selectedBlock.hidden ? 'fa-eye' : 'fa-eye-slash'}
            title={selectedBlock.hidden ? 'Göster' : 'Gizle'}
            onClick={() => id && applyBlockAction(selectedBlock.hidden ? 'show' : 'hide', [id])}
          />
          <MiniButton
            icon={selectedBlock.locked ? 'fa-lock-open' : 'fa-lock'}
            title={selectedBlock.locked ? 'Kilidi aç' : 'Kilitle'}
            onClick={() => id && applyBlockAction(selectedBlock.locked ? 'unlock' : 'lock', [id])}
          />
          <MiniButton
            icon="fa-trash-can"
            title="Bileşeni sil"
            danger
            onClick={() => id && applyBlockAction('delete', [id])}
          />
        </div>
      </div>

      {selectedCount > 1 && (
        <p className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-glass)]/40 px-2 py-1.5 text-[9px] leading-relaxed text-[var(--text-muted)]">
          <i className="fa-solid fa-object-group mr-1"></i>
          İçerik formu birincil bileşeni düzenler. Stil sekmesindeki değişiklikler seçili tüm
          bileşenlere uygulanır.
        </p>
      )}

      <Section title="İçerik" icon="fa-pen-to-square">
        {renderEditor()}
      </Section>

      <Section
        title="Öğretmen Katmanı"
        icon="fa-user-shield"
        description="Cevap anahtarı ve inceleme notu yalnızca öğretmen nüshasında görünür."
      >
        <Field label="Cevap Anahtarı Metni" hint="öğrenciye gösterilmez">
          <TextField
            multiline
            rows={2}
            value={selectedBlock.answerText ?? ''}
            onChange={(answerText) => id && updateBlockMeta(id, { answerText })}
            placeholder="Örn. Doğru cevap: B — çünkü…"
          />
        </Field>
        <Field label="İnceleme Yorumu" hint="zümre / uzman notu">
          <TextField
            multiline
            rows={2}
            value={selectedBlock.reviewComment ?? ''}
            onChange={(reviewComment) =>
              id && updateBlockMeta(id, { reviewComment, reviewResolved: false })
            }
            placeholder="Örn. Bu yönerge 2. sınıf için sadeleştirilmeli."
          />
        </Field>
        {selectedBlock.reviewComment && (
          <MiniButton
            icon={selectedBlock.reviewResolved ? 'fa-rotate-left' : 'fa-check'}
            label={selectedBlock.reviewResolved ? 'Yeniden Aç' : 'Çözüldü İşaretle'}
            title="İnceleme yorumunun durumunu değiştir"
            onClick={() =>
              id && updateBlockMeta(id, { reviewResolved: !selectedBlock.reviewResolved })
            }
          />
        )}
      </Section>

      {selectedBlock.pedagogicalNote && (
        <Section title="Pedagojik Not" icon="fa-graduation-cap">
          <p className="text-[10px] leading-relaxed text-[var(--text-secondary)]">
            {selectedBlock.pedagogicalNote}
          </p>
        </Section>
      )}
    </div>
  );
};

/** Bilinmeyen/özel blok türleri için güvenli JSON düzenleyici. */
const JsonEditor = ({
  blockId,
  content,
  onApply,
}: {
  blockId: string;
  content: Record<string, unknown>;
  onApply: (content: Record<string, unknown>) => void;
}) => {
  const [draft, setDraft] = React.useState(() => JSON.stringify(content, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDraft(JSON.stringify(content, null, 2));
    setError(null);
  }, [blockId]);

  return (
    <div className="space-y-2">
      <p className="text-[9px] leading-relaxed text-[var(--text-muted)]">
        Bu bileşen türü için özel form yok. İçerik JSON olarak düzenlenebilir; geçersiz JSON
        uygulanmaz.
      </p>
      <TextField multiline rows={10} mono value={draft} onChange={setDraft} />
      {error && <p className="text-[9px] font-bold text-red-500">{error}</p>}
      <MiniButton
        icon="fa-check"
        label="JSON Uygula"
        title="JSON içeriğini bileşene uygula"
        onClick={() => {
          try {
            const parsed: unknown = JSON.parse(draft);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
              setError('Kök nesne olmalı (dizi veya ilkel değer olamaz).');
              return;
            }
            setError(null);
            onApply(parsed as Record<string, unknown>);
          } catch (parseError) {
            setError(parseError instanceof Error ? parseError.message : 'Geçersiz JSON.');
          }
        }}
      />
    </div>
  );
};
