import type { WorksheetBlock, WorksheetData } from '../../types';
import { blockTypeLabel, flattenBlocks } from '../../services/a4EditorService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import {
  ColorField,
  EmptyState,
  Field,
  MiniButton,
  NumberField,
  RangeField,
  Section,
  Segmented,
} from './controls';

type Style = NonNullable<WorksheetBlock['style']>;

const TEXT_BLOCKS: Array<WorksheetBlock['type']> = [
  'header',
  'text',
  'question',
  'cloze_test',
  'logic_card',
  'footer_validation',
  'visual_clue_card',
];
const ALIGN_BLOCKS: Array<WorksheetBlock['type']> = [
  'header',
  'text',
  'question',
  'footer_validation',
  'image',
  'svg_shape',
];

const STYLE_PRESETS: Array<{
  label: string;
  icon: string;
  description: string;
  swatch: string;
  patch: Partial<Style>;
}> = [
  {
    label: 'Vurgu Kartı',
    icon: 'fa-star',
    description: 'İndigo çerçeveli yumuşak vurgu kartı',
    swatch: '#4F46E5',
    patch: {
      backgroundColor: '#EEF2FF',
      borderWidth: 2,
      borderColor: '#4F46E5',
      borderRadius: 16,
      padding: 12,
      color: '#1E293B',
    },
  },
  {
    label: 'Güven Kutusu',
    icon: 'fa-shield-heart',
    description: 'Yeşil tonlu destek kutusu',
    swatch: '#0D9488',
    patch: {
      backgroundColor: '#F0FDFA',
      borderWidth: 2,
      borderColor: '#0D9488',
      borderRadius: 12,
      padding: 10,
      color: '#1E293B',
    },
  },
  {
    label: 'Dikkat Uyarısı',
    icon: 'fa-triangle-exclamation',
    description: 'Kırmızı çerçeveli dikkat bloğu',
    swatch: '#E11D48',
    patch: {
      backgroundColor: '#FFF1F2',
      borderWidth: 2,
      borderColor: '#E11D48',
      borderRadius: 12,
      padding: 10,
      color: '#1E293B',
    },
  },
  {
    label: 'Sade Metin',
    icon: 'fa-feather',
    description: 'Çerçevesiz, kağıtla bütünleşik sade görünüm',
    swatch: '#F59E0B',
    patch: {
      backgroundColor: undefined,
      borderWidth: undefined,
      borderColor: undefined,
      borderRadius: undefined,
      padding: undefined,
      color: '#1E293B',
    },
  },
];

/**
 * Stil paneli — seçili bileşen(ler)in tipografi, aralık, renk ve kutu
 * özelliklerini düzenler. Tüm değerler boş bırakıldığında sayfa varsayılanı
 * (devralınan stil) geçerli olur; bu sayede sayfa geneli ayarlar korunur.
 */
export const StylePanel = ({
  selectedBlock,
  selectedIds,
  worksheetData,
}: {
  selectedBlock?: WorksheetBlock;
  selectedIds: string[];
  worksheetData: WorksheetData;
}) => {
  const updateBlockStyle = useA4EditorStore((state) => state.updateBlockStyle);
  const applyBlockAction = useA4EditorStore((state) => state.applyBlockAction);
  const copiedStyle = useA4EditorStore((state) => state.copiedStyle);
  const dataSnapshot = worksheetData;

  if (!selectedBlock) {
    return (
      <EmptyState
        icon="fa-palette"
        title="Bileşen Seçilmedi"
        description="Stilini değiştirmek istediğiniz bileşene sayfadan veya Katmanlar sekmesinden tıklayın."
      />
    );
  }

  const style: Style = selectedBlock.style ?? {};
  const ids = selectedIds.length ? selectedIds : selectedBlock.id ? [selectedBlock.id] : [];
  const supportsText = TEXT_BLOCKS.includes(selectedBlock.type);
  const supportsAlign = ALIGN_BLOCKS.includes(selectedBlock.type);

  const patch = (values: Partial<Style>) => updateBlockStyle(ids, values);

  return (
    <div className="space-y-3 p-3">
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)]/50 p-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black text-[var(--text-primary)]">
            {blockTypeLabel(selectedBlock.type)} stili
          </p>
          <p className="text-[8px] uppercase tracking-widest text-[var(--text-muted)]">
            {ids.length > 1 ? `${ids.length} bileşene uygulanır` : 'canlı önizleme'}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <MiniButton
            icon="fa-copy"
            title="Stili kopyala"
            onClick={() => applyBlockAction('copy-style', [ids[0]])}
          />
          <MiniButton
            icon="fa-paste"
            title="Kopyalanan stili uygula"
            disabled={!copiedStyle}
            onClick={() => applyBlockAction('paste-style', ids)}
          />
          <MiniButton
            icon="fa-rotate-left"
            title="Stili sıfırla"
            onClick={() => applyBlockAction('reset-style', ids)}
          />
        </div>
      </div>

      {ids.length > 1 && (
        <p className="rounded-lg border border-[var(--border-color)] bg-[var(--surface-glass)]/40 px-2 py-1.5 text-[9px] leading-relaxed text-[var(--text-muted)]">
          <i className="fa-solid fa-object-group mr-1"></i>
          Seçili {ids.length} bileşenin ortak özellikleri toplu düzenleniyor.
        </p>
      )}

      <Section
        title="Tipografi"
        icon="fa-font"
        description={
          supportsText
            ? 'Punto ve ağırlık bireysel uygulanır; boş bırakılan değer sayfa ayarını devralır.'
            : 'Bu bileşen türü metin tipografisi desteklemez (yapısal/grafik blok).'
        }
      >
        {supportsText ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Punto" hint="px">
                <NumberField
                  value={style.fontSize}
                  min={6}
                  max={72}
                  placeholder="devralınan"
                  onChange={(fontSize) => patch({ fontSize })}
                />
              </Field>
              <Field label="Ağırlık">
                <select
                  value={style.fontWeight ?? 'inherit'}
                  onChange={(event) =>
                    patch({
                      fontWeight:
                        event.target.value === 'inherit'
                          ? undefined
                          : (event.target.value as Style['fontWeight']),
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                >
                  <option value="inherit">Devralınan</option>
                  <option value="normal">Normal</option>
                  <option value="600">Yarı Kalın</option>
                  <option value="bold">Kalın</option>
                  <option value="900">Ekstra Kalın</option>
                </select>
              </Field>
            </div>

            <Field label="Stil">
              <Segmented
                ariaLabel="Yazı stili"
                value={style.fontStyle ?? 'normal'}
                options={[
                  { value: 'normal' as const, label: 'Düz' },
                  { value: 'italic' as const, label: 'İtalik' },
                ]}
                onChange={(fontStyle) => patch({ fontStyle })}
              />
            </Field>

            <Field label="Hizalama" hint={supportsAlign ? undefined : 'bu blokta sabittir'}>
              <Segmented<string>
                ariaLabel="Metin hizalaması"
                value={style.textAlign ?? 'left'}
                options={[
                  { value: 'left', icon: 'fa-align-left', title: 'Sola' },
                  { value: 'center', icon: 'fa-align-center', title: 'Ortaya' },
                  { value: 'right', icon: 'fa-align-right', title: 'Sağa' },
                  { value: 'justify', icon: 'fa-align-justify', title: 'İki yana yay' },
                ]}
                onChange={(textAlign) => patch({ textAlign })}
              />
            </Field>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-[var(--border-color)] px-2 py-2 text-[9px] leading-relaxed text-[var(--text-muted)]">
            <i className="fa-solid fa-circle-info mr-1"></i>
            {blockTypeLabel(selectedBlock.type)} bloğunun metni kendi bileşen yapısında
            biçimlendirilir. Bunun yerine kutu, arka plan ve aralık ayarlarını kullanabilirsiniz.
          </p>
        )}
      </Section>

      <Section title="Aralıklar" icon="fa-text-height" description="Okunabilirlik ve disleksi dostu ritim.">
        <RangeField
          label="Satır Yüksekliği"
          value={style.lineHeight}
          min={1}
          max={3}
          step={0.05}
          unit="×"
          onChange={(lineHeight) => patch({ lineHeight })}
          onReset={() => patch({ lineHeight: undefined })}
        />
        <RangeField
          label="Harf Aralığı"
          value={style.letterSpacing}
          min={-1}
          max={6}
          step={0.1}
          onChange={(letterSpacing) => patch({ letterSpacing })}
          onReset={() => patch({ letterSpacing: undefined })}
        />
        <RangeField
          label="Paragraf Boşluğu"
          value={style.paragraphSpacing}
          min={0}
          max={48}
          onChange={(paragraphSpacing) => patch({ paragraphSpacing })}
          onReset={() => patch({ paragraphSpacing: undefined })}
        />
      </Section>

      <Section
        title="Hızlı Stil Ön Ayarları"
        icon="fa-wand-sparkles"
        description="Disleksi dostu palet ve WCAG AA kontrastına uygun hazır kombinasyonlar."
      >
        <div className="grid grid-cols-2 gap-1.5">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => patch(preset.patch)}
              title={preset.description}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1.5 text-left text-[9px] font-black text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--text-primary)]"
            >
              <i className={`fa-solid ${preset.icon} text-[10px] text-[var(--accent-color)]`}></i>
              <span className="min-w-0 flex-1 truncate">{preset.label}</span>
              <span
                className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                style={{ backgroundColor: preset.swatch }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </Section>

      <Section title="Kutu & Aralık" icon="fa-square" description="İç/dış boşluklar akış düzenini korur.">
        <div className="grid grid-cols-2 gap-2">
          <Field label="İç Boşluk" hint="px">
            <NumberField
              value={style.padding}
              min={0}
              max={64}
              placeholder="0"
              onChange={(padding) => patch({ padding })}
            />
          </Field>
          <Field label="Köşe" hint="px">
            <NumberField
              value={style.borderRadius}
              min={0}
              max={64}
              placeholder="0"
              onChange={(borderRadius) => patch({ borderRadius })}
            />
          </Field>
          <Field label="Üst Boşluk" hint="px">
            <NumberField
              value={style.marginTop}
              min={0}
              max={64}
              placeholder="0"
              onChange={(marginTop) => patch({ marginTop })}
            />
          </Field>
          <Field label="Alt Boşluk" hint="px">
            <NumberField
              value={style.marginBottom}
              min={0}
              max={64}
              placeholder="0"
              onChange={(marginBottom) => patch({ marginBottom })}
            />
          </Field>
        </div>
        <RangeField
          label="Kenarlık Kalınlığı"
          value={style.borderWidth}
          min={0}
          max={8}
          onChange={(borderWidth) => patch({ borderWidth })}
          onReset={() => patch({ borderWidth: undefined })}
        />
        <RangeField
          label="Saydamlık"
          value={style.opacity === undefined ? 100 : Math.round(style.opacity * 100)}
          min={10}
          max={100}
          unit="%"
          onChange={(value) => patch({ opacity: value / 100 })}
          onReset={() => patch({ opacity: undefined })}
        />
      </Section>

      <Section title="Renkler" icon="fa-droplet" description="Baskıda WCAG AA kontrastı korunmalıdır.">
        <ColorField
          label="Yazı Rengi"
          value={style.color}
          onChange={(color) => patch({ color })}
        />
        <ColorField
          label="Arka Plan"
          value={style.backgroundColor}
          fallback="#ffffff"
          onChange={(backgroundColor) => patch({ backgroundColor })}
        />
        <ColorField
          label="Kenarlık"
          value={style.borderColor}
          onChange={(borderColor) => patch({ borderColor })}
        />
      </Section>

      <Section title="Bileşen İşlemleri" icon="fa-screwdriver-wrench">
        <div className="flex flex-wrap gap-1.5">
          <MiniButton icon="fa-arrow-up" label="Yukarı" title="Yukarı taşı" onClick={() => applyBlockAction('move-up', ids)} />
          <MiniButton icon="fa-arrow-down" label="Aşağı" title="Aşağı taşı" onClick={() => applyBlockAction('move-down', ids)} />
          <MiniButton
            icon={selectedBlock.locked ? 'fa-lock-open' : 'fa-lock'}
            label={selectedBlock.locked ? 'Kilidi Aç' : 'Kilitle'}
            title="Kilitleme, sürükleme sırasında kazara taşımayı önler"
            onClick={() => applyBlockAction(selectedBlock.locked ? 'unlock' : 'lock', ids)}
          />
          <MiniButton
            icon={selectedBlock.hidden ? 'fa-eye' : 'fa-eye-slash'}
            label={selectedBlock.hidden ? 'Göster' : 'Gizle'}
            title="Gizlenen bileşen yazdırmada da görünmez"
            onClick={() => applyBlockAction(selectedBlock.hidden ? 'show' : 'hide', ids)}
          />
          <MiniButton icon="fa-clone" label="Çoğalt" title="Çoğalt" onClick={() => applyBlockAction('duplicate', ids)} />
          <MiniButton icon="fa-trash-can" label="Sil" title="Sil" danger onClick={() => applyBlockAction('delete', ids)} />
        </div>
        <MiniButton
          icon="fa-brush"
          label="Stili Tümüne Uygula"
          title="Kopyalanan stili sayfadaki her bileşene uygula"
          disabled={!copiedStyle}
          onClick={() => {
            const everyId = Array.from(
              new Set(
                flattenBlocks(dataSnapshot)
                  .map((entry) => entry.block.id)
                  .filter((id): id is string => !!id)
              )
            );
            applyBlockAction('paste-style', everyId);
          }}
        />
      </Section>

      <p className="px-1 text-[9px] leading-relaxed text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Döndürme, serbest X/Y konumu ve katman sırası (z-index) A4 akış düzeni ve yazdırma
        bütünlüğü nedeniyle devre dışıdır; sıralama dikey akış içinde yönetilir.
      </p>
    </div>
  );
};
