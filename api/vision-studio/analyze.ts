// ============================================================
// Serverless Endpoint: POST /api/vision-studio/analyze
// - Firebase ID Token doğrulama
// - Rate limit (kullanıcı başına günlük kota)
// - Gemini Vision API çağrısı
// - Zod doğrulama + onarım turu (max 2 deneme)
// ============================================================
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuid } from 'uuid';

import {
  AnalyzeRequestSchema,
  GeneratedActivitySchema,
  AIAnalysisResultSchema,
} from '../../src/utils/schemas/visionStudio';
import type { GeneratedActivity } from '../../src/types/visionStudio';

// ---- Firebase Admin başlat ----
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    }),
  });
}

const adminAuth = getAuth();
const adminDb   = getFirestore();

// ---- Rate limit: kullanıcı başına günlük 20 analiz ----
const DAILY_LIMIT = 20;

async function checkRateLimit(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key   = `visionStudioQuota/${userId}/${today}`;
  const ref   = adminDb.doc(key);

  const snap = await ref.get();
  const count = (snap.data()?.count as number) ?? 0;

  if (count >= DAILY_LIMIT) {
    throw { status: 429, message: 'Gunluk analiz kotanizi doldurdunuz. Yarin tekrar deneyin.' };
  }

  await ref.set({ count: count + 1, userId, date: today }, { merge: true });
}

// ---- Gemini Vision çağrısı ----
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');
const model  = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

function buildAnalysisPrompt(fileType: string, variations: number): string {
  return `
Sen bir eğitim uzmanısın. Sana verilen ${fileType === 'pdf' ? 'PDF' : 'görsel'} bir eğitim etkinliğini analiz et.

GÖREV:
1. Etkinliği analiz et ve aşağıdaki JSON formatında döndür.
2. Orijinal etkinliğe dayanarak ${variations} adet yeni varyasyon üret.

FORMAT — SADECE GEÇERLİ JSON ÇıKTISI VER, BAŞKA BİR ŞEY YOK:
{
  "analysis": {
    "detectedCategory": "<matematik|turkce|fen|sosyal|ingilizce|sanat|beden|diger>",
    "detectedGrade": "<sınıf düzeyi, örn: 5. Sınıf>",
    "detectedSubject": "<ders adı>",
    "detectedDifficulty": "<kolay|orta|zor>",
    "detectedObjectives": [{"code": "...", "text": "..."}],
    "detectedActivityType": "<çalışma sayfası|test|bulmaca|...>",
    "summary": "<etkinliğin kısa özeti>",
    "tokensUsed": 0,
    "modelUsed": "gemini-2.5-flash"
  },
  "activities": [
    {
      "id": "<uuid>",
      "schemaVersion": 1,
      "title": "<etkinlik başlığı>",
      "grade": "<sınıf>",
      "subject": "<ders>",
      "category": "<matematik|turkce|...>",
      "difficulty": "<kolay|orta|zor>",
      "durationMinutes": 40,
      "objectives": [{"code": "...", "text": "..."}],
      "instructions": "<öğrenciye yönerge>",
      "sections": [
        {
          "id": "<uuid>",
          "order": 1,
          "type": "<text|question|fillInTheBlank|matching|table|image|instruction|pageBreak>",
          "title": "<bölüm başlığı>",
          "content": { "type": "...", ... },
          "points": 10,
          "objectiveRefs": []
        }
      ],
      "answerKey": [{"sectionId": "...", "answer": "...", "explanation": "..."}],
      "teacherNotes": "<öğretmene not>",
      "pedagogicalNote": "<pedagojik gerekçe — ZPD, disleksi dostu, neden bu aktivite>",
      "status": "ready",
      "ownerId": "__OWNER_ID__",
      "sourceFileId": "__FILE_ID__",
      "createdAt": "${new Date().toISOString()}",
      "updatedAt": "${new Date().toISOString()}",
      "version": 1
    }
  ]
}

ÖNEMLİ KURALLAR:
- pedagogicalNote zorunludur ve pedagojik gerekçe içermelidir.
- Tanı koyucu dil (örn. 'disleksisi var') kullanma; bunun yerine 'disleksi desteğine ihtiyacı var' gibi ifadeler kullan.
- Tüm metinler Türkçe olsun.
- Her sorunun cevap anahtarda karşılığı olsun.
- id alanlarına gerçek UUID yaz.
`.trim();
}

// ---- JSON onarım (max 2 tur) ----
async function repairJSON(
  rawText: string,
  errorMsg: string,
  _variations: number
): Promise<string> {
  const repairPrompt = `
Aşağıdaki JSON geçersiz. Hata: ${errorMsg}
Sadece düzeltilmiş, geçerli JSON çıktısı ver.

${rawText}
  `.trim();

  const repairResult = await model.generateContent(repairPrompt);
  return repairResult.response.text();
}

// ---- Ana handler ----
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
  }

  // 1. Auth
  const authHeader = req.headers.authorization ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'Kimlik dogrulama gerekli.', code: 'AUTH_REQUIRED' } });
  }

  let userId: string;
  try {
    const decoded = await adminAuth.verifyIdToken(authHeader.replace('Bearer ', ''));
    userId = decoded.uid;
  } catch {
    return res.status(401).json({ success: false, error: { message: 'Gecersiz oturum. Lutfen tekrar giris yapin.', code: 'INVALID_TOKEN' } });
  }

  // 2. Girdi doğrulama
  const parsed = AnalyzeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    return res.status(400).json({ success: false, error: { message: msg, code: 'VALIDATION_ERROR' } });
  }

  const { fileUrl, fileType, fileId, generateVariations } = parsed.data;

  if (parsed.data.userId !== userId) {
    return res.status(403).json({ success: false, error: { message: 'Bu dosyaya erisim yetkiniz yok.', code: 'FORBIDDEN' } });
  }

  // 3. Rate limit
  try {
    await checkRateLimit(userId);
  } catch (e: unknown) {
    const err = e as { status: number; message: string };
    return res.status(err.status).json({ success: false, error: { message: err.message, code: 'RATE_LIMIT_EXCEEDED' } });
  }

  // 4. Gemini Vision çağrısı
  let rawText = '';
  try {
    const prompt = buildAnalysisPrompt(fileType, generateVariations);

    let base64Data = '';
    let mimeType = fileType === 'pdf' ? 'application/pdf' : 'image/jpeg';

    if (parsed.data.fileBase64) {
      const rawBase64 = parsed.data.fileBase64;
      if (rawBase64.includes(',')) {
        const parts = rawBase64.split(',');
        base64Data = parts[1];
        const headerMatch = parts[0].match(/data:(.*?);base64/);
        if (headerMatch) mimeType = headerMatch[1];
      } else {
        base64Data = rawBase64;
      }
    } else if (parsed.data.fileUrl) {
      const fileRes = await fetch(parsed.data.fileUrl);
      if (!fileRes.ok) {
        throw new Error(`Dosya indirilemedi: ${fileRes.statusText}`);
      }
      const arrayBuffer = await fileRes.arrayBuffer();
      base64Data = Buffer.from(arrayBuffer).toString('base64');
      mimeType = fileRes.headers.get('content-type') || (fileType === 'pdf' ? 'application/pdf' : 'image/jpeg');
    }

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    rawText = result.response.text();
  } catch (err: unknown) {
    console.error('[VisionStudio] Gemini API hatası:', err);
    return res.status(502).json({
      success: false,
      error: { message: 'Yapay zeka servisi su an yanit vermiyor. Lutfen tekrar deneyin.', code: 'AI_SERVICE_ERROR' },
    });
  }

  // 5. JSON ayrıştırma + onarım (max 2 tur)
  let parsed_json: { analysis: unknown; activities: unknown[] } | null = null;
  let attempts = 0;
  let currentText = rawText;

  while (attempts < 3 && parsed_json === null) {
    try {
      const jsonMatch = currentText.match(/```json\s*([\s\S]*?)\s*```/) ?? currentText.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[1] : currentText;
      parsed_json = JSON.parse(jsonStr);
    } catch (e: unknown) {
      attempts++;
      if (attempts >= 3) break;
      const errMsg = e instanceof Error ? e.message : 'JSON parse hatasi';
      console.warn(`[VisionStudio] JSON onarim turu ${attempts}:`, errMsg);
      currentText = await repairJSON(currentText, errMsg, generateVariations);
    }
  }

  if (!parsed_json) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Yapay zeka ciktisi gecersiz bicimde dondu. Lutfen tekrar deneyin veya farkli bir dosya yukleyin.',
        code: 'AI_OUTPUT_INVALID',
      },
    });
  }

  // 6. Zod doğrulama
  const analysisCheck = AIAnalysisResultSchema.safeParse(parsed_json.analysis);
  if (!analysisCheck.success) {
    console.error('[VisionStudio] Analysis schema hatasi:', analysisCheck.error.issues);
  }

  const activities: GeneratedActivity[] = [];
  for (const raw of (parsed_json.activities ?? [])) {
    const enriched = {
      ...(raw as object),
      id: uuid(),
      ownerId: userId,
      sourceFileId: fileId,
      status: 'ready',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      schemaVersion: 1,
    };

    const check = GeneratedActivitySchema.safeParse(enriched);
    if (check.success) {
      activities.push(check.data);
    } else {
      console.error('[VisionStudio] Activity schema hatasi:', check.error.issues);
    }
  }

  if (activities.length === 0) {
    return res.status(500).json({
      success: false,
      error: { message: 'Etkinlik uretilemedi. Farkli bir dosya deneyin.', code: 'NO_ACTIVITIES_GENERATED' },
    });
  }

  // 7. Uretilen aktiviteleri Firestore'a kaydet (Admin SDK guvencesiyle)
  for (const act of activities) {
    try {
      await adminDb.collection('visionStudioActivities').doc(act.id).set(act);
    } catch (dbErr) {
      console.error('[VisionStudio] AdminDb aktivite kaydetme hatasi:', dbErr);
    }
  }

  // 8. generationJobs log
  await adminDb.collection('visionStudioJobs').add({
    userId,
    fileId,
    fileType,
    activitiesGenerated: activities.length,
    modelUsed: 'gemini-2.5-flash',
    createdAt: new Date().toISOString(),
  });

  return res.status(200).json({
    success: true,
    data: {
      analysis: analysisCheck.success ? analysisCheck.data : parsed_json.analysis,
      activities,
    },
    timestamp: new Date().toISOString(),
  });
}
