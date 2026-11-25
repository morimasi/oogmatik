import type { StyleSettings, WorksheetData } from '../../types';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import {
  ColorField,
  Field,
  MiniButton,
  RangeField,
  Section,
  Segmented,
  TextField,
  ToggleRow,
} from './controls';

const DEFAULT_PAGE_SETTINGS: Partial<StyleSettings> = {
  orientation: 'portrait',
  margin: 5,
  columns: 1,
  gutter: 20,
  contentScale: 1,
  compact: false,
  showStudentInfo: false,
  showTitle: true,
  showInstruction: true,
  showFooter: true,
  showAnswers: false,
  showClues: true,
  footerText: 'Bursa Disleksi EduMind • Nöro-Mimari Motoru v7.0',
  fontSize: 'orta',
  lineHeight: 1.6,
  letterSpacing: 0,
  wordSpacing: 0,
  paragraphSpacing: 20,
  borderColor: '#000000',
  borderWidth: 2,
  paperTexture: 'none',
};

/**
 * Sayfa paneli — A4 sayfa geneli ayarları. Tüm değerler canlı olarak
 * önizlemeye ve çıktıya yansır (aynı StyleSettings nesnesi kullanılır).
 */
export const PagePanel = ({
  worksheetData,
  styleSettings,
  onStyleChange,
}: {
  worksheetData: WorksheetData;
  styleSettings: StyleSettings;
  onStyleChange?: (settings: StyleSettings) => void;
}) => {
  const showGrid = useA4EditorStore((state) => state.showGrid);
  const setShowGrid = useA4EditorStore((state) => state.setShowGrid);
  const snapToGrid = useA4EditorStore((state) => state.snapToGrid);
  const setSnapToGrid = useA4EditorStore((state) => state.setSnapToGrid);
  const gridSize = useA4EditorStore((state) => state.gridSize);
  const setGridSize = useA4EditorStore((state) => state.setGridSize);
  const showRulers = useA4EditorStore((state) => state.showRulers);
  const setShowRulers = useA4EditorStore((state) => state.setShowRulers);
  const showSafeArea = useA4EditorStore((state) => state.showSafeArea);
  const setShowSafeArea = useA4EditorStore((state) => state.setShowSafeArea);
  const applyLayout = useA4EditorStore((state) => state.applyLayout);
  const answerKeyMode = useA4EditorStore((state) => state.answerKeyMode);
  const setAnswerKeyMode = useA4EditorStore((state) => state.setAnswerKeyMode);
  const printLayout = useA4EditorStore((state) => state.printLayout);
  const setPrintLayout = useA4EditorStore((state) => state.setPrintLayout);
  const cutLines = useA4EditorStore((state) => state.cutLines);
  const setCutLines = useA4EditorStore((state) => state.setCutLines);

  const pages = Array.isArray(worksheetData) ? worksheetData : [];
  const architecture = pages.find((page) => page.layoutArchitecture)?.layoutArchitecture;
  const hasBlocks = pages.some((page) => page.layoutArchitecture || page.blocks);
  const disabled = !onStyleChange;

  const update = (patch: Partial<StyleSettings>) => {
    if (!onStyleChange) return;
    onStyleChange({ ...styleSettings, ...patch });
  };

  return (
    <div className="space-y-3 p-3">
      {disabled && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[9px] leading-relaxed text-amber-600 dark:text-amber-400">
          <i className="fa-solid fa-triangle-exclamation mr-1"></i>
          Sayfa ayarları bu görünümde bağlı değil; yalnızca görüntüleme yardımcıları kullanılabilir.
        </p>
      )}

      <Section title="Sayfa Düzeni" icon="fa-file-lines" description="A4 yönü, kenar boşluğu ve içerik ölçeği.">
        <Field label="Yön">
          <Segmented
            ariaLabel="Sayfa yönü"
            value={styleSettings.orientation}
            options={[
              { value: 'portrait' as const, icon: 'fa-file', label: 'Dikey', title: 'Dikey A4 (210×297)' },
              { value: 'landscape' as const, icon: 'fa-file-lines', label: 'Yatay', title: 'Yatay A4 (297×210)' },
            ]}
            onChange={(orientation) => update({ orientation })}
          />
        </Field>

        <RangeField
          label="Kenar Boşluğu"
          value={styleSettings.margin}
          min={2}
          max={25}
          unit="mm"
          onChange={(margin) => update({ margin })}
          onReset={() => update({ margin: DEFAULT_PAGE_SETTINGS.margin })}
        />

        <Field label="İçerik Ölçeği" hint={`${Math.round((styleSettings.contentScale ?? 1) * 100)}%`}>
          <input
            type="range"
            min={70}
            max={130}
            step={1}
            value={Math.round((styleSettings.contentScale ?? 1) * 100)}
            onChange={(event) => update({ contentScale: Number(event.target.value) / 100 })}
            className="h-1.5 w-full cursor-pointer accent-[var(--accent-color)]"
            aria-label="İçerik ölçeği"
          />
        </Field>

        <ToggleRow
          label="Kompakt yerleşim"
          hint="Daha az boşluk, daha çok içerik"
          icon="fa-compress"
          checked={!!styleSettings.compact}
          onChange={(compact) => update({ compact })}
        />
      </Section>

      <Section
        title="Kolon Düzeni"
        icon="fa-table-columns"
        description="Etkinlik blokları iki veya üç kolona akıtılabilir; blok bazlı kolon ayarı bu değeri geçersiz kılar."
      >
        <Field label="Kolon Sayısı">
          <Segmented
            ariaLabel="Kolon sayısı"
            value={String(styleSettings.columns ?? 1)}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
            ]}
            onChange={(columns) => {
              const nextColumns = Number(columns);
              if (hasBlocks) applyLayout({ cols: nextColumns });
              update({ columns: nextColumns });
            }}
          />
        </Field>

        <RangeField
          label="Kolon Aralığı"
          value={styleSettings.gutter ?? 20}
          min={4}
          max={60}
          onChange={(gutter) => {
            update({ gutter });
            if (architecture) applyLayout({ gap: gutter });
          }}
          onReset={() => update({ gutter: DEFAULT_PAGE_SETTINGS.gutter })}
        />
      </Section>

      <Section title="Tipografi" icon="fa-font" description="Disleksi standardı: Lexend kilidi korunur.">
        <div className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            Yazı Tipi
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-primary)]">
            <i className="fa-solid fa-lock text-[8px] text-[var(--text-muted)]"></i>
            Lexend
          </span>
        </div>

        <Field label="Punto Ölçeği">
          <Segmented
            ariaLabel="Punto ölçeği"
            value={typeof styleSettings.fontSize === 'string' ? styleSettings.fontSize : 'orta'}
            options={[
              { value: 'küçük', label: 'Küçük' },
              { value: 'orta', label: 'Orta' },
              { value: 'büyük', label: 'Büyük' },
            ]}
            onChange={(fontSize) => update({ fontSize })}
          />
        </Field>

        <RangeField
          label="Satır Yüksekliği"
          value={styleSettings.lineHeight ?? 1.6}
          min={1}
          max={3}
          step={0.05}
          unit="×"
          onChange={(lineHeight) => update({ lineHeight })}
          onReset={() => update({ lineHeight: DEFAULT_PAGE_SETTINGS.lineHeight })}
        />
        <RangeField
          label="Harf Aralığı"
          value={styleSettings.letterSpacing ?? 0}
          min={-1}
          max={6}
          step={0.1}
          onChange={(letterSpacing) => update({ letterSpacing })}
          onReset={() => update({ letterSpacing: 0 })}
        />
        <RangeField
          label="Kelime Aralığı"
          value={styleSettings.wordSpacing ?? 0}
          min={0}
          max={8}
          step={0.5}
          onChange={(wordSpacing) => update({ wordSpacing })}
          onReset={() => update({ wordSpacing: 0 })}
        />
        <RangeField
          label="Paragraf Boşluğu"
          value={styleSettings.paragraphSpacing ?? 20}
          min={0}
          max={48}
          onChange={(paragraphSpacing) => update({ paragraphSpacing })}
          onReset={() => update({ paragraphSpacing: 20 })}
        />
      </Section>

      <Section title="Başlık & Alt Bilgi" icon="fa-heading">
        <ToggleRow
          label="Öğrenci Bilgisi"
          hint="Ad, sınıf ve tarih alanı"
          icon="fa-user-pen"
          checked={!!styleSettings.showStudentInfo}
          onChange={(showStudentInfo) => update({ showStudentInfo })}
        />
        <ToggleRow
          label="Etkinlik Başlığı"
          icon="fa-heading"
          checked={styleSettings.showTitle !== false}
          onChange={(showTitle) => update({ showTitle })}
        />
        <ToggleRow
          label="Yönerge"
          icon="fa-circle-info"
          checked={styleSettings.showInstruction !== false}
          onChange={(showInstruction) => update({ showInstruction })}
        />
        <ToggleRow
          label="Sayfa Alt Bilgisi"
          icon="fa-shoe-prints"
          checked={styleSettings.showFooter !== false}
          onChange={(showFooter) => update({ showFooter })}
        />
        <ToggleRow
          label="Cevaplar"
          hint="Öğrenci nüshasında gizli kalır (KVKK)"
          icon="fa-key"
          checked={!!styleSettings.showAnswers}
          onChange={(showAnswers) => update({ showAnswers })}
        />
        <ToggleRow
          label="İpuçları"
          icon="fa-lightbulb"
          checked={styleSettings.showClues !== false}
          onChange={(showClues) => update({ showClues })}
        />
        {styleSettings.showFooter !== false && (
          <Field label="Alt Bilgi Metni">
            <TextField
              value={styleSettings.footerText ?? ''}
              onChange={(footerText) => update({ footerText })}
              placeholder="Bursa Disleksi EduMind"
            />
          </Field>
        )}
      </Section>

      <Section title="Baskı & Doku" icon="fa-print">
        <Field label="Kağıt Dokusu">
          <select
            value={styleSettings.paperTexture ?? 'none'}
            onChange={(event) =>
              update({ paperTexture: event.target.value as StyleSettings['paperTexture'] })
            }
            className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          >
            <option value="none">Yok (temiz)</option>
            <option value="ruled">Çizgili</option>
            <option value="grid">Kareli</option>
            <option value="dotted">Noktalı</option>
            <option value="parchment">Parşömen</option>
            <option value="sepia">Sepya</option>
            <option value="saman">Saman</option>
          </select>
        </Field>
        <RangeField
          label="Güvenli Baskı Sınırı"
          value={styleSettings.safeMarginMm ?? 12}
          min={8}
          max={25}
          unit="mm"
          onChange={(safeMarginMm) => update({ safeMarginMm })}
          onReset={() => update({ safeMarginMm: 12 })}
        />
        <ColorField
          label="Kenarlık Rengi"
          value={styleSettings.borderColor}
          onChange={(borderColor) => update({ borderColor: borderColor ?? '#000000' })}
        />
        <RangeField
          label="Kenarlık Kalınlığı"
          value={styleSettings.borderWidth}
          min={0}
          max={8}
          onChange={(borderWidth) => update({ borderWidth })}
          onReset={() => update({ borderWidth: 2 })}
        />
        <MiniButton
          icon="fa-rotate-left"
          label="Sayfa Ayarlarını Sıfırla"
          title="Sayfa geneli ayarları varsayılana döndür"
          onClick={() => update(DEFAULT_PAGE_SETTINGS)}
        />
      </Section>

      <Section
        title="Nüsha ve Kağıt Ekonomisi"
        icon="fa-key"
        description="Cevap anahtarı öğrenci çıktısına girmez; N-up fotokopi maliyetini yarıya indirir."
      >
        <Field label="Cevap Anahtarı">
          <Segmented
            ariaLabel="Cevap anahtarı görünümü"
            value={answerKeyMode}
            options={[
              { value: 'off' as const, label: 'Kapalı' },
              { value: 'overlay' as const, label: 'Rozet' },
              { value: 'appendix' as const, label: 'Ayrı Sayfa' },
            ]}
            onChange={setAnswerKeyMode}
          />
        </Field>
        <ToggleRow
          label="Yaprak başına 2 sayfa"
          hint="Baskıda N-up (tasarruf)"
          icon="fa-copy"
          checked={printLayout === 'nup2'}
          onChange={(checked) => setPrintLayout(checked ? 'nup2' : 'single')}
        />
        <ToggleRow
          label="Kesme çizgileri"
          hint="Kesme/katlama kılavuzu"
          icon="fa-scissors"
          checked={cutLines}
          onChange={setCutLines}
        />
      </Section>

      <Section title="Görüntüleme Yardımcıları" icon="fa-ruler-combined">
        <ToggleRow
          label="Izgara Göster"
          icon="fa-border-all"
          checked={showGrid}
          onChange={setShowGrid}
        />
        <ToggleRow
          label="Izgaraya Yapış"
          hint={`${gridSize}px adımlarla`}
          icon="fa-magnet"
          checked={snapToGrid}
          onChange={setSnapToGrid}
        />
        <RangeField
          label="Izgara Adımı"
          value={gridSize}
          min={4}
          max={100}
          step={2}
          onChange={setGridSize}
          onReset={() => setGridSize(10)}
        />
        <ToggleRow
          label="Cetveller"
          icon="fa-ruler"
          checked={showRulers}
          onChange={setShowRulers}
        />
        <ToggleRow
          label="Güvenli Baskı Alanı"
          hint="Taşma uyarısı sınırı"
          icon="fa-vector-square"
          checked={showSafeArea}
          onChange={setShowSafeArea}
        />
      </Section>

      <p className="px-1 pb-2 text-[9px] leading-relaxed text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Birden fazla sayfa otomatik akar; içerik taşarsa yeni A4 sayfası oluşturulur. Sayfa
        geçişleri önizleme alt şeridinden yapılır ve yazdırma her sayfayı ayrı yaprak olarak verir.
      </p>
    </div>
  );
};
