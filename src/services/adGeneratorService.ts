import { AppError } from '../utils/AppError';
import {
  AdStudioSettings,
  BrandKit,
  AdOutput,
  AdStudioTarget,
  AD_TARGET_DESCRIPTIONS,
} from '../types/adStudio';
import { generateOfflineAd } from './adOfflineEngine';
import { auditAdContent } from './adComplianceAuditor';
import { logWarn } from '../utils/logger';

export { generateOfflineAd };

const AD_SYSTEM_INSTRUCTION = `Sen bdmind'in kıdemli reklam yazarısın. [DEPLOY: 2025_07_v6]
bdmind, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocukları için AI destekli eğitim platformudur.

## PLATFORM MODÜLLERİ (Hedef Kitleye Göre Vurgula)
1. **Fasikül Sistemi**: Premium kapak tasarımı, AI kapak üretimi, A4 baskı motoru, filigran
2. **Süper Türkçe Stüdyosu**: MEB kazanımlı okuma, yazma, dil bilgisi etkinlikleri
3. **Matematik Stüdyosu**: Görsel problemler, Futoshiki, Sudoku, işlem akıcılığı
4. **Sarı Kitap (Hızlı Okuma)**: 6 disleksi dostu okuma tekniği
5. **Dijital Arşiv**: Şifreli kayıt, kategori filtreleme, arama, sıralama, PDF çıktı
6. **BEP (Bireysel Eğitim Planı)**: MEB 573 KHK uyumlu, SMART hedefler

## HEDEF KİTLE STRATEJİLERİ
- **Okul yöneticileri**: Kurumsal fayda, toplu lisans, MEB uyumu, okul genelinde ölçeklenebilirlik
- **Veliler**: Çocuğun potansiyeli, umut, özel eğitimde fırsat eşitliği, bireysel gelişim
- **Öğretmenler**: Zaman tasarrufu, kişiselleştirme, BEP/BİP uyumu, anlık veri takibi
- **Özel eğitim uzmanları**: Kanıta dayalı yaklaşım, nöro-çeşitlilik, multidisipliner değerlendirme

## KURALLAR (ZORUNLU)
1. **Tanı koyucu dil KESİNLİKLE YASAK**: "disleksisi var" YERİNE "disleksi desteğine ihtiyacı var"
2. Her sahne için detaylı görsel açıklaması yaz (kamera açısı, renk paleti, atmosfer, tipografi)
3. Voiceover hızı: saniyede 3 kelime (disleksi dostu tempo)
4. Pastel renk paleti kullan: mavi (#7BA7C9), mor (#B39DDB), pembe (#F8BBD0), yeşil (#A5D6A7), turuncu (#FFCC80)
5. Her reklamda bir "güven duygusu" (trust) ve "başarı hikayesi" (success story) anlat
6. Çıktı SADECE geçerli JSON olmalıdır, markdown kullanma`;

function buildPrompt(settings: AdStudioSettings, brandKit: BrandKit): string {
  const moduleDesc = AD_TARGET_DESCRIPTIONS[settings.target] || 'bdmind eğitim platformu';
  const audienceLabels: Record<string, string> = {
    teachers: 'Ogretmenler',
    parents: 'Veliler',
    therapists: 'Özel Eğitim Uzmanları',
    school_admin: 'Okul Yoneticileri',
    investors: 'Yatirimcilar',
  };

  return `BIR BDMIND REKLAMI OLUSTUR.

HEDEF MODUL: ${settings.target}
MODUL ACIKLAMASI: ${moduleDesc}
HEDEF KITLE: ${settings.audience.map(a => audienceLabels[a] || a).join(', ')}
TON: ${settings.tone} (Karışim: ${JSON.stringify(settings.toneMix)})
FORMAT: ${settings.format}
SÜRE: ${settings.duration} saniye
DIL: ${settings.language === 'tr' ? 'Turkce' : 'Ingilizce'}
CAGRI METNI: ${settings.callToAction}
ACILIYET: ${settings.urgency}
ETIKETLER: ${settings.tags.join(', ')}
SEZON: ${settings.season || 'Genel'}

MARKA BILGILERI:
- Isim: bdmind
- Slogan: ${brandKit.slogan}
- Web: ${brandKit.website}
- Renkler: ${brandKit.primaryColor}, ${brandKit.secondaryColor}

YANIT FORMATI (JSON):
{
  "title": "reklam basligi (10-50 karakter)",
  "scenes": [
    {
      "sceneNo": 1,
      "duration": 5,
      "visualDesc": "Gorsel aciklama (kamera, isik, atmosfer)",
      "voiceover": "seslendirme metni",
      "textOverlay": "ekranda gorunecek yazi",
      "transition": "gecis turu (cut/fade/dissolve)",
      "sceneVisual": "<svg>...</svg>"
    }
  ],
  "sceneVisuals": {
    "1": "<svg>…gorsel anlatim…</svg>",
    "2": "<svg>…gorsel anlatim…</svg>"
  },
  "script": "tam video senaryo (pazarlama metni olarak)",
  "socialCopy": "sosyal medya postu (280 karakter)",
  "emailSubject": "eposta konu basligi",
  "emailBody": "eposta govde metni"
}

KURAL: Tum sahnelerin toplam suresi ${settings.duration} saniyeyi gecmesin.

KURAL 2: Her sahne icin kisa bir SVG gorsel olustur (400x300, basit geometri, mor #7c3aed ana renk). sceneVisuals objesinde sahne numarasi key olarak kullan.`;
}

async function callGemini(prompt: string, systemInstruction: string): Promise<Record<string, unknown>> {
  const url = '/api/generate';

  const body = {
    prompt,
    systemInstruction,
    temperature: 0.7,
    model: 'gemini-3.8-flash',
    schema: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING' },
        scenes: { type: 'ARRAY', items: {
          type: 'OBJECT',
          properties: {
            sceneNo: { type: 'NUMBER' },
            duration: { type: 'NUMBER' },
            visualDesc: { type: 'STRING' },
            voiceover: { type: 'STRING' },
            textOverlay: { type: 'STRING' },
            transition: { type: 'STRING' },
            sceneVisual: { type: 'STRING' },
          },
        }},
        sceneVisuals: { type: 'OBJECT' },
        script: { type: 'STRING' },
        socialCopy: { type: 'STRING' },
        emailSubject: { type: 'STRING' },
        emailBody: { type: 'STRING' },
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new AppError(
      `Reklam uretilemedi: ${response.status}`,
      'AD_GENERATION_FAILED',
      500,
      { details: errText }
    );
  }

  const data = await response.json() as Record<string, unknown>;

  if (data.error) {
    const errMsg = typeof data.error === 'object' && data.error !== null
      ? String((data.error as Record<string, unknown>).message || '')
      : String(data.error);
    throw new AppError(
      errMsg || 'AI servisi hata döndürdü',
      'AD_API_ERROR',
      500
    );
  }

  if (data.text && typeof data.text === 'string') {
    try {
      return JSON.parse(data.text) as Record<string, unknown>;
    } catch {
      return { script: data.text } as Record<string, unknown>;
    }
  }

  return data as Record<string, unknown>;
}

export async function generateAd(settings: AdStudioSettings, brandKit: BrandKit): Promise<AdOutput> {
  try {
    const prompt = buildPrompt(settings, brandKit);
    const systemInstr = `${AD_SYSTEM_INSTRUCTION}\n\nFORMAT: ${settings.format}\nHEDEF KITLE: ${settings.audience.join(', ')}\n`;

    const result = await callGemini(prompt, systemInstr);

    const sceneVisuals = result.sceneVisuals as Record<string, string> | undefined;
    const scenes = Array.isArray(result.scenes) ? result.scenes.map((s: Record<string, unknown>) => ({
      sceneNo: Number(s.sceneNo) || 0,
      duration: Number(s.duration) || 5,
      visualDesc: String(s.visualDesc || ''),
      voiceover: String(s.voiceover || ''),
      textOverlay: String(s.textOverlay || ''),
      transition: String(s.transition || 'cut'),
      sceneVisual: String(s.sceneVisual || sceneVisuals?.[String(s.sceneNo)] || ''),
    })) : [];

    const script = String(result.script || '');
    const socialCopy = String(result.socialCopy || '');
    const emailSubject = String(result.emailSubject || '');
    const emailBody = String(result.emailBody || '');
    const title = String(result.title || `${settings.target} - ${settings.format}`);

    const pedagogicalNote = String(
      result.pedagogicalNote ||
      `[Pedagojik Not]: Bu reklam materyali, disleksi ve öğrenme çeşitliliği gösteren öğrencilerin özgüvenini ve güçlü yönlerini destekleyecek şekilde sıfır bilişsel yük standardında tasarlanmıştır.`
    );

    const score = auditAdContent(`${script} ${socialCopy} ${emailBody}`, title, settings.callToAction);

    return {
      id: crypto.randomUUID(),
      campaignId: '',
      title,
      target: settings.target,
      audience: settings.audience,
      tone: settings.tone,
      format: settings.format,
      duration: settings.duration,
      language: settings.language,
      brandKitId: settings.brandKitId,
      scenes,
      script,
      socialCopy,
      emailSubject,
      emailBody,
      tags: settings.tags,
      status: 'generated',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      pedagogicalNote,
      score,
      callToActionUrl: brandKit.website,
    };
  } catch (err: unknown) {
    logWarn('AI reklam üretimi başarısız oldu veya çevrimdışı moddasınız, profesyonel çevrimdışı motor devreye alınıyor', {
      error: err instanceof Error ? err.message : String(err),
    });
    // Sıfır Hata Toleransı: Akıllı Çevrimdışı Motor ile zengin reklam üret
    return generateOfflineAd(settings, brandKit);
  }
}

export async function generateBatch(
  targets: AdStudioTarget[],
  settings: AdStudioSettings,
  brandKit: BrandKit,
  onProgress?: (current: number, total: number) => void
): Promise<AdOutput[]> {
  const results: AdOutput[] = [];
  const total = targets.length;

  for (let i = 0; i < total; i++) {
    const batchSettings = { ...settings, target: targets[i] };
    const output = await generateAd(batchSettings, brandKit);
    results.push(output);
    onProgress?.(i + 1, total);
  }

  return results;
}

export async function generateABVariation(
  settings: AdStudioSettings,
  brandKit: BrandKit,
  variation: 'a' | 'b'
): Promise<AdOutput> {
  const variantSettings = {
    ...settings,
    tone: variation === 'a' ? settings.tone : (settings.tone === 'corporate' ? 'emotional' : 'corporate'),
  };
  return generateAd(variantSettings, brandKit);
}

export function exportAd(output: AdOutput, format: 'md' | 'json' | 'html'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(output, null, 2);

    case 'md': {
      let md = `# ${output.title}

## Hedef Modül: ${output.target}
## Hedef Kitle: ${output.audience.join(', ')}
## Ton: ${output.tone} | Süre: ${output.duration}s
${output.pedagogicalNote ? `\n> **Pedagojik Not:** ${output.pedagogicalNote}\n` : ''}
${output.score ? `\n### AI Reklam Skoru: %${output.score.overall} (Kanca: ${output.score.hookScore}, Okunabilirlik: ${output.score.readabilityScore}, Uyum: ${output.score.complianceScore})\n` : ''}
## Storyboard

${output.scenes.map(s => `### Sahne ${s.sceneNo} (${s.duration}s)
- **Görsel:** ${s.visualDesc}
- **Seslendirme:** ${s.voiceover}
- **Ekran Yazısı:** ${s.textOverlay}
- **Geçiş:** ${s.transition}
`).join('\n')}

## Tam Senaryo

${output.script}

## Sosyal Medya

${output.socialCopy}

## E-posta

**Konu:** ${output.emailSubject}
**Gövde:**
${output.emailBody}
`;

      if (output.brochureData && output.brochureData.length > 0) {
        md += `\n## Broşür & El İlanı Bölümleri\n\n`;
        output.brochureData.forEach((sec, idx) => {
          md += `### Bölüm ${idx + 1}: ${sec.title}\n`;
          if (sec.subtitle) md += `*${sec.subtitle}*\n`;
          sec.points.forEach(p => { md += `- ${p}\n`; });
          if (sec.callout) md += `> **Vurgu:** ${sec.callout}\n`;
          md += `\n`;
        });
      }

      if (output.webData) {
        md += `\n## Web & Açılış Sayfası Metni\n\n`;
        md += `**Hero Başlığı:** ${output.webData.heroTitle}\n`;
        md += `**Hero Alt Başlığı:** ${output.webData.heroSubtitle}\n`;
        md += `**CTA:** ${output.webData.ctaPrimary} / ${output.webData.ctaSecondary}\n\n`;
        md += `### Temel Özellikler:\n`;
        output.webData.features.forEach(f => {
          md += `- **${f.title}:** ${f.desc}\n`;
        });
      }

      if (output.googleData) {
        md += `\n## Google & Meta Reklamları\n\n`;
        md += `**Başlıklar:**\n${output.googleData.headlines.map(h => `- ${h}`).join('\n')}\n\n`;
        md += `**Açıklamalar:**\n${output.googleData.descriptions.map(d => `- ${d}`).join('\n')}\n`;
      }

      md += `\n---\n_bdmind AdStudio Ultra-Premium AI ile üretilmiştir._\n`;
      return md;
    }

    case 'html': {
      const scenesHtml = output.scenes.map(s => `
        <div style="background:#1e1b4b;border-radius:1rem;padding:1.5rem;margin-bottom:1rem;border:1px solid rgba(255,255,255,0.1)">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <strong style="color:#a78bfa">Sahne ${s.sceneNo}</strong>
            <span style="color:#94a3b8;font-size:0.875rem">${s.duration}s</span>
          </div>
          <p><strong>Görsel:</strong> ${s.visualDesc}</p>
          <p><strong>Seslendirme:</strong> <em style="color:#cbd5e1">"${s.voiceover}"</em></p>
          <p><strong>Yazı:</strong> <span style="color:#f59e0b">${s.textOverlay}</span></p>
          <p style="font-size:0.75rem;color:#64748b">Geçiş: ${s.transition}</p>
        </div>`).join('');

      return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>${output.title}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600;700;900&display=swap');
body{font-family:'Lexend',sans-serif;background:#0b081e;color:#e2e8f0;max-width:850px;margin:auto;padding:2.5rem;line-height:1.6}
h1{font-size:2.2rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:0.5rem}
.badge{display:inline-block;padding:0.25rem 0.75rem;border-radius:9999px;background:rgba(99,102,241,0.2);color:#a5b4fc;font-size:0.75rem;font-weight:700;margin-right:0.5rem}
.meta{color:#94a3b8;font-size:0.875rem;margin-bottom:2rem;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:1.5rem}
.card{background:rgba(255,255,255,0.04);border-radius:1rem;padding:1.5rem;margin-bottom:1.5rem;border:1px solid rgba(255,255,255,0.08)}
hr{border-color:rgba(255,255,255,0.1);margin:2.5rem 0}
@media print {
  body{background:#ffffff;color:#0f172a;padding:0}
  .card{border:1px solid #cbd5e1;background:#f8fafc}
}
</style></head><body>
<span class="badge">bdmind AdStudio Premium</span>
<h1>${output.title}</h1>
<div class="meta">
  <p><strong>Hedef:</strong> ${output.target} | <strong>Kitle:</strong> ${output.audience.join(', ')} | <strong>Ton:</strong> ${output.tone} | <strong>Süre:</strong> ${output.duration}s</p>
  ${output.pedagogicalNote ? `<p style="color:#38bdf8;font-size:0.8rem;margin-top:0.5rem"><strong>Pedagojik Not:</strong> ${output.pedagogicalNote}</p>` : ''}
</div>

<h2>🎬 Storyboard & Sahneler</h2>
${scenesHtml}

<hr>
<h2>📜 Tam Senaryo Metni</h2>
<div class="card">
  <p style="white-space:pre-wrap">${output.script}</p>
</div>

<hr>
<h2>📱 Sosyal Medya İletişimi</h2>
<div class="card" style="border-left:4px solid #7c3aed">
  <p style="white-space:pre-wrap">${output.socialCopy}</p>
</div>

<hr>
<h2>📧 E-posta Kampanyası</h2>
<div class="card">
  <p><strong>Konu:</strong> ${output.emailSubject}</p>
  <div style="margin-top:1rem;white-space:pre-wrap">${output.emailBody}</div>
</div>

<p style="color:#64748b;font-size:0.75rem;margin-top:3rem;text-align:center">bdmind EdTech AdStudio ile AI destekli oluşturulmuştur.</p>
</body></html>`;
    }

    default:
      return JSON.stringify(output, null, 2);
  }
}
