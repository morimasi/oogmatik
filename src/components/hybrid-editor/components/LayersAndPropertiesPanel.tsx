import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  Group as GroupIcon,
  Layers,
  Lock,
  LockOpen,
  RotateCw,
  Trash2,
  Ungroup,
  X,
} from 'lucide-react';
import type { LayerInfo, LayerOrderAction, LayerPatch } from '../types/editor.types';

const ICONS: Record<string, string> = {
  text: 'T',
  'i-text': 'T',
  textbox: 'T',
  rect: '▭',
  ellipse: '◯',
  circle: '◯',
  triangle: '△',
  polygon: '★',
  line: '／',
  path: '✎',
  group: '▣',
  sticky: '▤',
  arrow: '→',
  image: '🖼',
};

const TYPE_LABELS: Record<string, string> = {
  text: 'Metin',
  'i-text': 'Metin',
  textbox: 'Metin kutusu',
  rect: 'Dikdörtgen',
  ellipse: 'Elips',
  circle: 'Daire',
  triangle: 'Üçgen',
  polygon: 'Yıldız',
  line: 'Çizgi',
  path: 'Serbest çizim',
  group: 'Grup',
  sticky: 'Yapışkan not',
  arrow: 'Ok',
  image: 'Görsel',
};

const NumericField = ({
  label,
  value,
  onChange,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
}) => (
  <label className="block">
    <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
      {label}
      {suffix ? ` (${suffix})` : ''}
    </span>
    <input
      type="number"
      step={step}
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
      onChange={(event) => onChange(Number(event.target.value) || 0)}
      className="h-7 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
    />
  </label>
);

const ActionButton = ({
  label,
  icon,
  onClick,
  disabled,
  danger,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-7 items-center gap-1 rounded-lg border border-[var(--border-color)] px-1.5 text-[9px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
      danger
        ? 'text-[var(--text-secondary)] hover:border-rose-400 hover:text-rose-500'
        : 'text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]'
    }`}
  >
    {icon}
    <span className="hidden 2xl:inline">{label}</span>
  </button>
);

/**
 * Sağ panel — katman ağacı ve seçili nesnenin özellikleri.
 * Sıralama, kilit, gizleme, gruplama, koordinat/boyut/döndürme ve stil denetimi.
 */
export const LayersAndPropertiesPanel = ({
  layers,
  selectedIds,
  onSelect,
  onReorder,
  onToggleLock,
  onToggleVisible,
  onGroup,
  onUngroup,
  onDuplicate,
  onDelete,
  onChange,
  onApplyImageFilter,
  onClose,
  mode,
}: {
  layers: LayerInfo[];
  selectedIds: string[];
  onSelect: (id: string, additive?: boolean) => void;
  onReorder: (action: LayerOrderAction) => void;
  onToggleLock: () => void;
  onToggleVisible: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onChange: (patch: LayerPatch) => void;
  onApplyImageFilter?: (
    filterType: 'grayscale' | 'sepia' | 'invert' | 'none',
    options?: { brightness?: number; contrast?: number }
  ) => void;
  onClose: () => void;
  mode: 'document' | 'whiteboard';
}) => {
  const primary = layers.find((layer) => layer.id === selectedIds[0]);
  const hasSelection = selectedIds.length > 0;
  const canUngroup = !!primary?.isGroup || selectedIds.length > 1;

  return (
    <aside
      className="flex w-[280px] shrink-0 flex-col border-l border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:z-40 max-lg:w-[300px] max-lg:shadow-2xl"
      aria-label="Katmanlar ve özellikler"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-muted)] text-[var(--accent-color)]">
            <Layers size={14} />
          </span>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.16em]">Katmanlar</h2>
            <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              {mode === 'document' ? 'Sayfa vektör katmanı' : 'Sınırsız tahta'} • {layers.length}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          title="Paneli kapat"
          aria-label="Katman panelini kapat"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
        >
          <X size={14} />
        </button>
      </header>

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        <ul className="space-y-1 p-2" role="listbox" aria-label="Katman listesi" aria-multiselectable>
          {layers.length === 0 && (
            <li className="rounded-xl border border-dashed border-[var(--border-color)] px-3 py-6 text-center text-[9px] leading-relaxed text-[var(--text-muted)]">
              Henüz nesne yok. Üst bardan kalem, şekil, metin veya yapışkan not ekleyin.
            </li>
          )}
          {layers.map((layer) => {
            const selected = selectedIds.includes(layer.id);
            return (
              <li key={layer.id}>
                <div
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={(event) => onSelect(layer.id, event.ctrlKey || event.metaKey || event.shiftKey)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(layer.id, event.ctrlKey || event.metaKey || event.shiftKey);
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-1.5 rounded-xl border px-1.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] ${
                    selected
                      ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50 hover:border-[var(--accent-color)]'
                  } ${layer.visible ? '' : 'opacity-50'}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--bg-paper)] text-[10px] font-black text-[var(--text-secondary)]">
                    {ICONS[layer.type] ?? '◻'}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[9px] font-black">{layer.label}</span>
                    <span className="block truncate text-[8px] text-[var(--text-muted)]">
                      {TYPE_LABELS[layer.type] ?? layer.type} • {layer.width}×{layer.height}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      title={layer.locked ? 'Kilidi aç' : 'Kilitle'}
                      aria-label={layer.locked ? 'Kilidi aç' : 'Kilitle'}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(layer.id);
                        onToggleLock();
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-[var(--text-muted)] hover:text-[var(--accent-color)]"
                    >
                      {layer.locked ? <Lock size={10} /> : <LockOpen size={10} />}
                    </button>
                    <button
                      type="button"
                      title={layer.visible ? 'Gizle' : 'Göster'}
                      aria-label={layer.visible ? 'Gizle' : 'Göster'}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(layer.id);
                        onToggleVisible();
                      }}
                      className="flex h-5 w-5 items-center justify-center rounded text-[9px] text-[var(--text-muted)] hover:text-[var(--accent-color)]"
                    >
                      {layer.visible ? <Eye size={10} /> : <EyeOff size={10} />}
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-[var(--border-color)] p-2">
          <p className="mb-1.5 text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Sıralama ve grup
          </p>
          <div className="flex flex-wrap gap-1">
            <ActionButton label="En öne" icon={<ArrowUp size={11} />} disabled={!hasSelection} onClick={() => onReorder('front')} />
            <ActionButton label="Bir öne" icon={<ArrowUp size={10} />} disabled={!hasSelection} onClick={() => onReorder('forward')} />
            <ActionButton label="Bir geri" icon={<ArrowDown size={10} />} disabled={!hasSelection} onClick={() => onReorder('backward')} />
            <ActionButton label="En arkaya" icon={<ArrowDown size={11} />} disabled={!hasSelection} onClick={() => onReorder('back')} />
            <ActionButton
              label="Grupla"
              icon={<GroupIcon size={11} />}
              disabled={selectedIds.length < 2}
              onClick={onGroup}
            />
            <ActionButton label="Çöz" icon={<Ungroup size={11} />} disabled={!canUngroup} onClick={onUngroup} />
            <ActionButton label="Çoğalt" icon={<Copy size={11} />} disabled={!hasSelection} onClick={onDuplicate} />
            <ActionButton label="Sil" icon={<Trash2 size={11} />} disabled={!hasSelection} danger onClick={onDelete} />
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] p-2">
          <div className="mb-1.5 flex items-center justify-between">
            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Özellikler
            </p>
            <span className="text-[8px] font-bold text-[var(--text-muted)]">
              {hasSelection ? `${selectedIds.length} seçili` : 'seçim yok'}
            </span>
          </div>

          {!primary ? (
            <p className="rounded-xl border border-dashed border-[var(--border-color)] px-2.5 py-4 text-center text-[9px] text-[var(--text-muted)]">
              Düzenlemek için tuvalde veya listede bir nesne seçin.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5">
                <NumericField label="X" value={primary.x} onChange={(x) => onChange({ x })} />
                <NumericField label="Y" value={primary.y} onChange={(y) => onChange({ y })} />
                <NumericField label="Genişlik" value={primary.width} onChange={(width) => onChange({ width })} />
                <NumericField label="Yükseklik" value={primary.height} onChange={(height) => onChange({ height })} />
                <NumericField label="Açı" value={primary.angle} suffix="°" onChange={(angle) => onChange({ angle })} />
                <NumericField
                  label="Opaklık"
                  value={Math.round(primary.opacity * 100)}
                  suffix="%"
                  onChange={(percent) => onChange({ opacity: Math.max(0, Math.min(100, percent)) / 100 })}
                />
              </div>

              {primary.hasText && primary.fontSize > 0 && (
                <NumericField
                  label="Punto"
                  value={primary.fontSize}
                  onChange={(fontSize) => onChange({ fontSize: Math.max(8, Math.min(144, fontSize)) })}
                />
              )}

              {primary.type === 'image' && onApplyImageFilter && (
                <div className="space-y-1.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-2">
                  <span className="block text-[8px] font-black uppercase tracking-wider text-indigo-600">
                    Görsel Baskı &amp; Filtreleri
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => onApplyImageFilter('grayscale')}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-1.5 py-1 text-[9px] font-bold hover:border-indigo-500"
                    >
                      🖨️ Siyah-Beyaz
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyImageFilter('none')}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-1.5 py-1 text-[9px] font-bold hover:border-indigo-500"
                    >
                      📷 Orijinal
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyImageFilter('sepia')}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-1.5 py-1 text-[9px] font-bold hover:border-indigo-500"
                    >
                      🎞️ Sepia
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyImageFilter('invert')}
                      className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-1.5 py-1 text-[9px] font-bold hover:border-indigo-500"
                    >
                      🔄 Negatif
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                <label className="block">
                  <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Dolgu
                  </span>
                  <input
                    type="color"
                    value={primary.fill.startsWith('#') ? primary.fill : '#4f46e5'}
                    onChange={(event) => onChange({ fill: event.target.value })}
                    aria-label="Dolgu rengi"
                    className="h-7 w-full cursor-pointer rounded-lg border border-[var(--border-color)] bg-transparent"
                  />
                </label>
                <label className="block">
                  <span className="mb-0.5 block text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Çizgi
                  </span>
                  <input
                    type="color"
                    value={primary.stroke.startsWith('#') ? primary.stroke : '#1e293b'}
                    onChange={(event) => onChange({ stroke: event.target.value })}
                    aria-label="Çizgi rengi"
                    className="h-7 w-full cursor-pointer rounded-lg border border-[var(--border-color)] bg-transparent"
                  />
                </label>
              </div>

              <NumericField
                label="Çizgi kalınlığı"
                value={primary.strokeWidth}
                onChange={(strokeWidth) => onChange({ strokeWidth: Math.max(0, strokeWidth) })}
              />

              <div className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[8px] font-bold text-[var(--text-muted)]">
                <RotateCw size={11} />
                Sürüklerken merkez ve diğer nesne kenarlarına hizalanır.
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default LayersAndPropertiesPanel;
