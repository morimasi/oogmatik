import React, { useState } from 'react';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { sanitizeMaterialsList } from '@/services/activityStudioContentService';
import { generateCreativeMultimodal } from '@/services/geminiClient';
import { ComponentFactory } from '@/components/ActivityStudio/factory/ComponentFactory';
import type { FactoryComponent, ActivityStudioState, ContentBlock, BlockType } from '@/types/activityStudio';

interface StepContentProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Gemini API'dan dönen ham veriyi güvenli şekilde ContentBlock[] dizisine çevirir.
 * Selin Arslan: unknown + type guard — any yasak.
 * Bora Demir: Try-catch fallback zinciri ile her formatta çıktı yakalanır.
 */
function parseResponseToBlocks(raw: unknown): ContentBlock[] {
  if (!raw || typeof raw !== 'object') {
    // Eğer raw bir string ise JSON parse dene
    if (typeof raw === 'string') {
      try {
        return parseResponseToBlocks(JSON.parse(raw));
      } catch {
        // Düz metin gelmiş, paragrafları blok yap
        return textToBlocks(raw);
      }
    }
    return [];
  }

  const data = raw as Record<string, unknown>;

  // Olası { text: "..." } sarmalayıcısını aç (API bazen böyle döner)
  if (typeof data['text'] === 'string' && !data['blocks']) {
    try {
      return parseResponseToBlocks(JSON.parse(data['text']));
    } catch {
      return textToBlocks(data['text']);
    }
  }

  // "blocks" anahtarını ara
  const blocksRaw = data['blocks'] ?? data['etkinlikler'] ?? data['adimlar'] ?? data['items'] ?? data['activities'];

  if (Array.isArray(blocksRaw) && blocksRaw.length > 0) {
    return blocksRaw.map((item: unknown, idx: number) => {
      const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
      const content =
        String(obj['content'] ?? obj['icerik'] ?? obj['text'] ?? obj['aciklama'] ?? obj['description'] ?? '');
      const type = mapBlockType(String(obj['type'] ?? obj['tip'] ?? 'activity'));
      const pedNote = String(obj['pedagogicalNote'] ?? obj['pedagojikNot'] ?? obj['not'] ?? '');

      return {
        id: `block_${Date.now()}_${idx}`,
        type,
        order: idx,
        content,
        pedagogicalNote: pedNote,
      };
    });
  }

  // Anahtar bulunamadıysa, objede metin içeren alanları blok yap
  const fallbackBlocks: ContentBlock[] = [];
  let order = 0;
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.length > 5 && key !== 'pedagogicalNote') {
      fallbackBlocks.push({
        id: `block_${Date.now()}_${order}`,
        type: 'activity',
        order,
        content: value,
        pedagogicalNote: '',
      });
      order++;
    } else if (Array.isArray(value)) {
      // Alt dizinin elemanlarını blok yap
      for (const subItem of value) {
        if (typeof subItem === 'string' && subItem.length > 3) {
          fallbackBlocks.push({
            id: `block_${Date.now()}_${order}`,
            type: 'activity',
            order,
            content: subItem,
            pedagogicalNote: '',
          });
          order++;
        } else if (typeof subItem === 'object' && subItem !== null) {
          const obj = subItem as Record<string, unknown>;
          const text = String(obj['content'] ?? obj['icerik'] ?? obj['text'] ?? obj['aciklama'] ?? JSON.stringify(obj));
          fallbackBlocks.push({
            id: `block_${Date.now()}_${order}`,
            type: 'activity',
            order,
            content: text,
            pedagogicalNote: '',
          });
          order++;
        }
      }
    }
  }

  return fallbackBlocks;
}

/** Düz metin paragraflarını ContentBlock[] dizisine dönüştürür */
function textToBlocks(text: string): ContentBlock[] {
  const paragraphs = text
    .split(/\n{2,}|\n(?=\d+[\.\)])/)
    .map((p) => p.trim())
    .filter((p) => p.length > 3);

  if (paragraphs.length === 0) {
    return [
      {
        id: `block_${Date.now()}_0`,
        type: 'activity',
        order: 0,
        content: text.trim(),
        pedagogicalNote: '',
      },
    ];
  }

  return paragraphs.map((p, idx) => ({
    id: `block_${Date.now()}_${idx}`,
    type: (idx === 0 ? 'explanation' : 'activity') as BlockType,
    order: idx,
    content: p,
    pedagogicalNote: '',
  }));
}

/** Tip eşleştirme — Gemini Türkçe veya farklı terimler kullanabilir */
function mapBlockType(raw: string): BlockType {
  const lower = raw.toLowerCase();
  if (lower.includes('title') || lower.includes('baslik')) return 'title';
  if (lower.includes('question') || lower.includes('soru')) return 'question';
  if (lower.includes('explanation') || lower.includes('aciklama')) return 'explanation';
  if (lower.includes('resource') || lower.includes('kaynak')) return 'resource';
  if (lower.includes('spacing') || lower.includes('bosluk')) return 'spacing';
  return 'activity';
}

/** Pedagojik notu veri içinden çıkar */
function extractPedNote(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return '';
  const data = raw as Record<string, unknown>;

  // text sarmalayıcısını aç
  if (typeof data['text'] === 'string' && !data['pedagogicalNote']) {
    try {
      return extractPedNote(JSON.parse(data['text']));
    } catch {
      return '';
    }
  }

  return String(
    data['pedagogicalNote'] ?? data['pedagojikNot'] ?? data['pedagogicalSummary'] ?? ''
  );
}

export const StepContent: React.FC<StepContentProps> = ({ onNext, onBack }: StepContentProps) => {
  const { isGenerating, wizardData } = useActivityStudioStore();
  const store = useActivityStudioStore();
  const [materials, setMaterials] = useState<string>(
    (wizardData.customization as Record<string, unknown>)?.materials as string || ''
  );
  const [components, setComponents] = useState<FactoryComponent[]>(
    ((wizardData.customization as Record<string, unknown>)?.components as FactoryComponent[]) || []
  );
  const [genError, setGenError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const goal = wizardData.goal;
    if (!goal || !goal.topic?.trim()) {
      store.setError('Lütfen önce bir konu belirleyin.');
      return;
    }

    store.setGenerating(true);
    store.setError(null);
    setGenError(null);

    try {
      // Malzemeleri sanitize et (Selin: max 5, max 500 char)
      const matList = sanitizeMaterialsList(
        materials.split('\n').filter((line: string) => line.trim().length > 0)
      );
      const matText = matList.length > 0 ? `\nKullanılacak malzemeler: ${matList.join(', ')}` : '';

      // Bileşen listesini prompt'a ekle
      const compText = components.length > 0
        ? `\nSayfada şu bileşenler olacak: ${components.map((c: FactoryComponent) => c.type).join(', ')}`
        : '';

      // Elif Yıldız: ZPD uyumlu, scaffolded prompt
      const prompt = `
Sen özel öğrenme güçlüğü yaşayan çocuklar için eğitim materyali üreten uzman bir pedagogsun.

GÖREV: Aşağıdaki kriterlere uygun, adım adım yapılandırılmış bir etkinlik üret.

Konu: ${goal.topic}
Yaş Grubu: ${goal.ageGroup}
Profil: ${goal.profile}
Zorluk: ${goal.difficulty}
Sınıf: ${goal.gradeLevel}. sınıf
Hedef Beceriler: ${goal.targetSkills.join(', ')}
Süre: ${goal.duration} dakika${matText}${compText}

KURALLAR:
1. İlk adım mutlaka kolay olsun (güven inşası — Elif Yıldız prensibi).
2. Yönergeler kısa, net ve görselleştirilebilir olsun.
3. Her adımda öğrenciye ne yapacağını açıkça söyle.
4. Negatif dil kullanma ("yapma" yerine "şöyle yap" de).
5. Toplam 4-6 etkinlik adımı olsun.

ÇIKTI FORMATI (SADECE JSON):
{
  "blocks": [
    { "type": "explanation", "content": "Açıklama veya kural hatırlatması", "pedagogicalNote": "Öğretmene not" },
    { "type": "activity", "content": "Öğrencinin yapacağı etkinlik adımı", "pedagogicalNote": "Bu adımın pedagojik amacı" },
    { "type": "question", "content": "Değerlendirme sorusu", "pedagogicalNote": "Ölçme amacı" }
  ],
  "pedagogicalNote": "Etkinliğin genel pedagojik katkısı"
}

Sadece geçerli JSON döndür. Başka metin ekleme.`;

      const schema = {
        type: 'OBJECT',
        properties: {
          blocks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                type: { type: 'STRING' },
                content: { type: 'STRING' },
                pedagogicalNote: { type: 'STRING' },
              },
              required: ['type', 'content'],
            },
          },
          pedagogicalNote: { type: 'STRING' },
        },
        required: ['blocks'],
      };

      // ─── Doğrudan Gemini API çağrısı (Selin Arslan: tek çağrı, düşük maliyet) ───
      const result = await generateCreativeMultimodal({
        prompt,
        schema,
        temperature: 0.3,
      });

      // ─── Gelen veriyi ContentBlock[] dizisine dönüştür ───
      const blocks = parseResponseToBlocks(result);
      const pedNote = extractPedNote(result) ||
        `${goal.targetSkills.join(', ')} becerileri için ZPD uyumlu, ${goal.difficulty.toLowerCase()} seviyede scaffolded etkinlik.`;

      if (blocks.length === 0) {
        setGenError('AI yanıt verdi ancak içerik blokları oluşturulamadı. Lütfen tekrar deneyin.');
        return;
      }

      // ─── Store'a yaz ───
      useActivityStudioStore.setState((prev: ActivityStudioState) => ({
        wizardData: {
          ...prev.wizardData,
          customization: { components, materials },
          generatedContent: { blockCount: blocks.length },
        } as ActivityStudioState['wizardData'],
      }));

      store.setContent(blocks);
      store.setPedagogicalNote(pedNote);
      onNext();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI içerik üretimi başarısız oldu.';
      setGenError(message);
      store.setError(message);
    } finally {
      store.setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">İçerik & Bileşen Tasarımı</h3>

      {/* Library Item Preview */}
      <div className="rounded-2xl border border-zinc-800 p-4 bg-zinc-900/50 backdrop-blur-sm">
        <p className="text-sm text-zinc-400">
          <strong className="text-amber-500/80">Kütüphane Ögesi:</strong>{' '}
          <span className="text-zinc-200">{wizardData.goal?.topic ?? '—'}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 font-['Lexend'] text-zinc-300">
          Malzemeler (satır başına bir madde)
        </label>
        <textarea
          placeholder={'Malzeme 1\nMalzeme 2\n(Maks. 5 madde, 500 karakter)'}
          value={materials}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMaterials(e.target.value)}
          className="w-full border border-zinc-700 bg-zinc-800/40 p-3 rounded-xl text-sm font-['Lexend'] text-zinc-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-zinc-600 transition-all"
          rows={4}
        />
      </div>

      {/* Content Blueprint Editor (ComponentFactory) */}
      <ComponentFactory
        components={components}
        onChange={(newComponents: FactoryComponent[]) => {
          setComponents(newComponents);
          useActivityStudioStore.setState((prev: ActivityStudioState) => ({
            wizardData: {
              ...prev.wizardData,
              customization: { components: newComponents, materials },
            } as ActivityStudioState['wizardData'],
          }));
        }}
      />

      {/* Hata mesajı */}
      {genError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <strong>Hata:</strong> {genError}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all"
        >
          Geri
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-bold text-zinc-950 disabled:opacity-50 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
        >
          {isGenerating ? 'Yapay Zeka Hazırlıyor...' : 'İçerik Üret'}
        </button>
      </div>
    </div>
  );
};
