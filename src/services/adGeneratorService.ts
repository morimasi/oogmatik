import { AppError } from '../utils/AppError';
import {
  AdStudioSettings,
  BrandKit,
  AdOutput,
  AdStudioTarget,
  AD_TARGET_DESCRIPTIONS,
} from '../types/adStudio';

const AD_SYSTEM_INSTRUCTION = `Sen Oogmatik'in kıdemli reklam yazarısın.
Oogmatik, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan Türk çocukları için AI destekli eğitim platformudur.

KURALLAR:
1. Asla tani koyucu dil kullanma: "disleksisi var" YERINE "disleksi destegine ihtiyaci var"
2. Her sahne icin detayli gorsel aciklamasi yaz (kamera acisi, renk paleti, atmosfer)
3. Voiceover hizi: saniyede 3 kelime
4. Okul yoneticilerine hitap ederken: kurumsal fayda, toplu lisans, MEB uyumu vurgula
5. Veliye hitap ederken: cocugun potansiyeli, umut, ozel egitimde firsat esitligi
6. Ogretmene hitap ederken: zaman tasarrufu, kisisellestirme, BEP uyumu
7. Cikti SADECE gecerli JSON olmalidir`;

function buildPrompt(settings: AdStudioSettings, brandKit: BrandKit): string {
  const moduleDesc = AD_TARGET_DESCRIPTIONS[settings.target] || 'Oogmatik egitim platformu';
  const audienceLabels: Record<string, string> = {
    teachers: 'Ogretmenler',
    parents: 'Veliler',
    therapists: 'Ozel Egitim Uzmanlari',
    school_admin: 'Okul Yoneticileri',
    investors: 'Yatirimcilar',
  };

  return `BIR OOGMATIK REKLAMI OLUSTUR.

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
- Isim: Oogmatik
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
      "transition": "gecis turu (cut/fade/dissolve)"
    }
  ],
  "script": "tam video senaryo (pazarlama metni olarak)",
  "socialCopy": "sosyal medya postu (280 karakter)",
  "emailSubject": "eposta konu basligi",
  "emailBody": "eposta govde metni"
}

KURAL: Tum sahnelerin toplam suresi ${settings.duration} saniyeyi gecmesin.`;
}

async function callGemini(prompt: string, systemInstruction: string): Promise<Record<string, unknown>> {
  const url = '/api/generate';

  const body = {
    prompt,
    systemInstruction,
    temperature: 0.7,
    model: 'gemini-2.5-flash',
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
          },
        }},
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
    throw new AppError({
      message: `Reklam uretilemedi: ${response.status}`,
      code: 'AD_GENERATION_FAILED',
      details: errText,
    });
  }

  const data = await response.json() as { content?: unknown };
  if (!data.content) {
    throw new AppError({
      message: 'AI yanitinda icerik bulunamadi',
      code: 'AD_EMPTY_RESPONSE',
    });
  }

  if (typeof data.content === 'string') {
    try {
      return JSON.parse(data.content) as Record<string, unknown>;
    } catch {
      return { script: data.content } as Record<string, unknown>;
    }
  }

  return data.content as Record<string, unknown>;
}

export async function generateAd(settings: AdStudioSettings, brandKit: BrandKit): Promise<AdOutput> {
  const prompt = buildPrompt(settings, brandKit);
  const systemInstr = `${AD_SYSTEM_INSTRUCTION}\n\nFORMAT: ${settings.format}\nHEDEF KITLE: ${settings.audience.join(', ')}\n`;

  const result = await callGemini(prompt, systemInstr);

  const scenes = Array.isArray(result.scenes) ? result.scenes.map((s: Record<string, unknown>) => ({
    sceneNo: Number(s.sceneNo) || 0,
    duration: Number(s.duration) || 5,
    visualDesc: String(s.visualDesc || ''),
    voiceover: String(s.voiceover || ''),
    textOverlay: String(s.textOverlay || ''),
    transition: String(s.transition || 'cut'),
  })) : [];

  return {
    id: crypto.randomUUID(),
    campaignId: '',
    title: String(result.title || `${settings.target} - ${settings.format}`),
    target: settings.target,
    audience: settings.audience,
    tone: settings.tone,
    format: settings.format,
    duration: settings.duration,
    language: settings.language,
    brandKitId: settings.brandKitId,
    scenes,
    script: String(result.script || ''),
    socialCopy: String(result.socialCopy || ''),
    emailSubject: String(result.emailSubject || ''),
    emailBody: String(result.emailBody || ''),
    tags: settings.tags,
    status: 'generated',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  };
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

    case 'md':
      return `# ${output.title}

## Hedef Modul: ${output.target}
## Hedef Kitle: ${output.audience.join(', ')}
## Ton: ${output.tone} | Sure: ${output.duration}s

## Storyboard

${output.scenes.map(s => `### Sahne ${s.sceneNo} (${s.duration}s)
- **Gorsel:** ${s.visualDesc}
- **Seslendirme:** ${s.voiceover}
- **Ekran Yazisi:** ${s.textOverlay}
- **Gecis:** ${s.transition}
`).join('\n')}

## Tam Senaryo

${output.script}

## Sosyal Medya

${output.socialCopy}

## E-posta

**Konu:** ${output.emailSubject}
**Govde:** ${output.emailBody}

---
_Oogmatik AdStudio ile AI destekli olusturulmustur._`;

    case 'html': {
      const scenesHtml = output.scenes.map(s => `
        <div style="background:#1e1b4b;border-radius:1rem;padding:1.5rem;margin-bottom:1rem;border:1px solid rgba(255,255,255,0.1)">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
            <strong>Sahne ${s.sceneNo}</strong>
            <span>${s.duration}s</span>
          </div>
          <p><em>Gorsel:</em> ${s.visualDesc}</p>
          <p><em>Ses:</em> ${s.voiceover}</p>
          <p><em>Yazi:</em> ${s.textOverlay}</p>
          <p><em>Gecis:</em> ${s.transition}</p>
        </div>`).join('');

      return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body{font-family:'Lexend',sans-serif;background:#0f0a2e;color:#e2e8f0;max-width:800px;margin:auto;padding:2rem}
h1{font-size:2rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.meta{color:#94a3b8;font-size:0.875rem;margin-bottom:2rem}
hr{border-color:rgba(255,255,255,0.1);margin:2rem 0}
</style></head><body>
<h1>${output.title}</h1>
<div class="meta">
  <p>Hedef: ${output.target} | Kitle: ${output.audience.join(', ')} | Ton: ${output.tone} | Sure: ${output.duration}s</p>
</div>
<h2>Storyboard</h2>
${scenesHtml}
<hr>
<h2>Tam Senaryo</h2>
<p>${output.script.replace(/\n/g, '<br>')}</p>
<hr>
<h2>Sosyal Medya</h2>
<blockquote style="border-left:4px solid #7c3aed;padding-left:1rem;font-style:italic">${output.socialCopy}</blockquote>
<hr>
<h2>E-posta</h2>
<p><strong>Konu:</strong> ${output.emailSubject}</p>
<p>${output.emailBody.replace(/\n/g, '<br>')}</p>
<p style="color:#64748b;font-size:0.75rem;margin-top:3rem">Oogmatik AdStudio ile AI destekli olusturulmustur.</p>
</body></html>`;
    }

    default:
      return JSON.stringify(output, null, 2);
  }
}
