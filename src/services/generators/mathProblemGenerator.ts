/**
 * MatProblemStudyosu — Gemini 2.5 Flash AI Problem Generator
 * Tamamen bağımsız modül — mevcut mathSinavGenerator.ts'ye dokunmaz
 * Sadece açık uçlu gerçek yaşam matematik problemleri üretir
 */

import { generateWithSchema } from '../geminiClient';
import type {
    MatProblemAyarlari,
    MatProblemSeti,
    MatProblem,
    MatProblemCevapAnahtari,
} from '../../types/matProblem';

import { getMebMufredatBySinif } from '../../constants/mebMathCurriculum';

// ─── Prompt Builder ───────────────────────────────────────────
const buildMathProblemPrompt = (settings: MatProblemAyarlari): string => {
    const sinif = settings.sinif ?? 5;
    const problemSayisi = settings.problemSayisi ?? 5;

    const mufredat = getMebMufredatBySinif(sinif);
    const tumKazanimlarMap = new Map<string, string>();
    if (mufredat) {
        mufredat.uniteler.forEach((u) => {
            u.kazanimlar.forEach((k) => {
                tumKazanimlarMap.set(k.kod, `📌 [${k.kod}] ${k.tanim}`);
            });
        });
    }

    const kazanimDetaylari = settings.secilenKazanimlar
        .map((kod) => tumKazanimlarMap.get(kod) || `📌 [${kod}]`)
        .join('\n');

    // Her üretimde tamamen benzersiz senaryolar ve sayılar oluşturulmasını sağlayan tohum
    const randomSeed = Math.random().toString(36).substring(2, 9) + '-' + Date.now();
    const rastgeleKurgular = ['uzay araştırmaları ve roketler', 'doğa yürüyüşü ve kampçılık', 'robotik ve yapay zeka atölyesi', 'yenilenebilir güneş/rüzgar enerjisi', 'mimarlık ve akıllı şehir tasarımı', 'gastronomi ve gurme mutfağı', 'denizcilik ve okyanus araştırmaları', 'arkeoloji ve antik şehir kazısı', 'olimpik spor turnuvası', 'biyo-tarım ve dikey çiftlik'];
    const secilenKurgu = rastgeleKurgular[Math.floor(Math.random() * rastgeleKurgular.length)];

    const parts: string[] = [];

    parts.push(
        'Görevin, 2025 yılı itibarıyla yürürlükte olan Türkiye Millî Eğitim Bakanlığı Matematik dersi öğretim programına (müfredata) sadık kalarak, belirtilen sınıf, üniteler ve kazanımlara uygun, ' +
        'TAM OLARAK ' + problemSayisi + ' ADET SADE YENİ NESİL AÇIK UÇLU MATEMATİK PROBLEMİ üret, ' +
        '🚨 KULLANICI AYARLARI VE ZORUNLU UYUM TALİMATLARI 🚨\n' +
        '- İSTENEN PROBLEM SAYISI: TAM ' + problemSayisi + ' ADET (ZORUNLU: JSON dizisindeki "problemler" listesinde tam olarak ' + problemSayisi + ' adet problem nesnesi bulunmalıdır! Ne 1 eksik, ne 1 fazla!)\n' +
        '- Sınıf Seviyesi: ' + sinif + '. Sınıf\n' +
        (kazanimDetaylari ? '\n🎯 KAZANIM KISITI (%100 BİREBİR KAZANIM UYUMU ZORUNLUDUR):\n' + kazanimDetaylari + '\nÜretilecek her problem SADECE VE SADECE yukarıdaki kazanımların matematiksel mantığına, işlem seviyesine ve soru tipine dayalı olmalıdır.\n\n' : '\n') +
        '- Problem Kategorisi: "' + settings.kategori + '"\n' +
        '- Zorluk Seviyesi: "' + settings.zorlukSeviyesi + '"\n' +
        '- Verilenler/İstenenler Kutusu: ' + (settings.verilenlerGosterilsinMi ? 'EVET (Doldurulacak)' : 'HAYIR') + '\n' +
        '- Çözüm Kutusu: ' + (settings.cozumKutusuGosterilsinMi ? 'EVET' : 'HAYIR') + '\n' +
        '- LGS Yeni Nesil Modu: ' + (settings.isLgsMode ? 'AKTİF (PISA/LGS Mantık Sorusu)' : 'PASİF') + '\n\n' +
        '🚨 KRİTİK BENZERSİZLİK VE ORİJİNALİLK KURALI 🚨\n' +
        '- Benzersizlik Tohumu: ' + randomSeed + '\n' +
        '- İlham Teması: "' + secilenKurgu + '"\n' +
        '- HER PROBLEM TAZE, BENZERSİZ VE DAHA ÖNCE HİÇ GÖRÜLMEMİŞ İSİMLER, RAKAMLAR VE KURGULAR İÇERMELİDİR.\n\n' +
        '⚠️ ÖNEMLİ: ÇOKTAN SEÇMELİ ŞIKLAR (A, B, C, D) KESİNLİKLE ÜRETME!\n' +
        '⚠️ ÖNEMLİ: SADECE RAKAMLARIN OLDUĞU DÜMDÜZ İŞLEM SORULARI ÜRETME!\n'
    );

    if (settings.ozelKonu) {
        parts.push('Konu: ' + settings.ozelKonu + '\n');
    }

    if (settings.ozelTalimatlar) {
        parts.push('Özel Talimatlar: ' + settings.ozelTalimatlar + '\n');
    }

    parts.push(
        '\nPROBLEM KURALLARI:\n' +
        '1. Her problem günlük yaşamdan taze ve özgün bir senaryo/hikaye İÇERMELİDİR.\n' +
        '2. Her problem için "verilenler" ve "istenenler" açıklanmalıdır.\n' +
        '3. Her problem için adım adım "cozumAdimlari" detaylı yazılmalıdır.\n' +
        '4. Zorluk seviyesi: ' + (settings.zorlukSeviyesi === 'Otomatik' ? 'Karma (Kolay, Orta, Zor)' : settings.zorlukSeviyesi) + '\n'
    );

    if (settings.isLgsMode) {
        parts.push(
            '\n🚨 LGS YENİ NESİL PROBLEM MODU AKTİF 🚨\n' +
            'Tüm problemler LGS/PISA standardında beceri temelli, çok adımlı mantık yürütme gerektiren açık uçlu problemler olmalıdır.\n' +
            'Çok adımlı mantık yürütme ve beceri temelli problemlere ağırlık ver.\n'
        );
    }

    parts.push(
        '\nJSON ÇIKTI FORMATI:\n' +
        '```json\n{\n' +
        '  "pedagogicalNote": "Öğretmen için eğitsel amaç açıklaması",\n' +
        '  "problemler": [\n' +
        '    {\n' +
        '      "soruMetni": "Aşağıdaki senaryoya göre problemi çözünüz...",\n' +
        '      "verilenler": ["Akvaryumdaki balık sayıları"],\n' +
        '      "istenenler": "Tablodaki verilere dayalı alt soruların çözümü",\n' +
        '      "altSorular": ["1. En çok bulunan balık hangisidir?", "2. Japon balıklarının sayısı vatözlerin kaç katıdır?"],\n' +
        '      "altCevaplar": ["Sarı Prenses (16)", "4 katıdır (8 / 2 = 4)"],\n' +
        '      "cozumAdimlari": ["1. Adım: Tablodan sayıları oku", "2. Adım: Oranlama yap"],\n' +
        '      "dogruCevap": "1) Sarı Prenses, 2) 4 katı",\n' +
        '      "gercekYasamBaglantisi": "Akvaryum ve canlı sayılarını kategorize etme...",\n' +
        '      "zorluk": "Orta",\n' +
        '      "kazanimKodu": "M.2.4.1.1",\n' +
        '      "kazanimMetni": "Sıklık tablosu veya çetele tablosu oluşturur; yorumlar.",\n' +
        '      "puan": 10,\n' +
        '      "tahminiSure": 120\n' +
        '    }\n  ]\n}\n```\n' +
        '\nSADECE JSON döndür. Başka hiçbir metin ekleme.'
    );

    return parts.join('');
};

// ─── JSON Schema ──────────────────────────────────────────────
const PROBLEM_SCHEMA = {
    type: 'OBJECT',
    properties: {
        pedagogicalNote: { type: 'STRING', description: 'Öğretmen için eğitsel amaç notu' },
        problemler: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    soruMetni: { type: 'STRING', description: 'Gerçek yaşam senaryolu açık uçlu problem metni' },
                    verilenler: { type: 'ARRAY', items: { type: 'STRING' } },
                    istenenler: { type: 'STRING' },
                    altSorular: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tek probleme bağlı 1-5 adet alt soru' },
                    altCevaplar: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Alt soruların doğru yanıtları' },
                    cozumAdimlari: { type: 'ARRAY', items: { type: 'STRING' } },
                    dogruCevap: { type: 'STRING' },
                    gercekYasamBaglantisi: { type: 'STRING' },
                    zorluk: { type: 'STRING' },
                    kazanimKodu: { type: 'STRING' },
                    kazanimMetni: { type: 'STRING', description: 'MEB kazanım açıklaması (öğretmen/veli bilgi kartı için zorunlu)' },
                    puan: { type: 'NUMBER' },
                    tahminiSure: { type: 'NUMBER' },
                }
            }
        }
    },
    required: ['pedagogicalNote', 'problemler']
};

// ─── Ana Üretim Fonksiyonu ─────────────────────────────────────
export const generateMathProblems = async (settings: MatProblemAyarlari): Promise<MatProblemSeti> => {
    const prompt = buildMathProblemPrompt(settings);
    const sinif = settings.sinif ?? 5;

    const result = await generateWithSchema(prompt, PROBLEM_SCHEMA, {
        temperature: 0.25,
    });

    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const rawProblemler = parsed?.problemler || parsed?.data?.problemler || [];

    const problemler: MatProblem[] = rawProblemler.map((p: Record<string, unknown>, i: number) => {
        // ─── Otomatik Cevap Birleştirici ─────────────────────────────
        // altSorular varsa ve dogruCevap boşsa ya da sadece etiket gibi kısa
        // görünüyorsa, altCevaplar'ı çok satırlı string olarak birleştir.
        const altSorular = Array.isArray(p.altSorular) ? p.altSorular as string[] : undefined;
        const altCevaplar = Array.isArray(p.altCevaplar) ? p.altCevaplar as string[] : undefined;
        const rawDogruCevap = ((p.dogruCevap as string) || (p.dogru_cevap as string) || '').trim();

        let dogruCevap = rawDogruCevap;
        if (altSorular && altCevaplar && altCevaplar.length > 0) {
            const altCevapJoined = altCevaplar
                .map((c, idx) => `${String.fromCharCode(97 + idx)}) ${c}`)
                .join('  |  ');
            const looksLikeLabel = rawDogruCevap.length === 0
                || /^\d+\)\s/.test(rawDogruCevap)  // "1) 2) 3)" gibi sadece etiket
                || (rawDogruCevap.length < altCevaplar.join('').length / 2);
            if (looksLikeLabel) {
                dogruCevap = altCevapJoined;
            }
        }

        return {
            id: `problem-${Date.now()}-${i}`,
            soruMetni: (p.soruMetni as string) || (p.soru_metni as string) || '',
            verilenler: Array.isArray(p.verilenler) ? p.verilenler as string[] : [],
            istenenler: (p.istenenler as string) || '',
            altSorular,
            altCevaplar,
            cozumAdimlari: Array.isArray(p.cozumAdimlari) ? p.cozumAdimlari as string[] : [],
            dogruCevap,
            gercekYasamBaglantisi: (p.gercekYasamBaglantisi as string) || (p.gercek_yasam_baglantisi as string) || '',
            zorluk: ((p.zorluk as string) || 'Orta') as 'Kolay' | 'Orta' | 'Zor',
            kazanimKodu: (p.kazanimKodu as string) || (p.kazanim_kodu as string) || `M.${sinif}.1.1`,
            kazanimMetni: (p.kazanimMetni as string) || undefined,
            sinif,
            unite_adi: (p.unite_adi as string) || undefined,
            kategori: settings.kategori || 'gercek-yasam',
            puan: (p.puan as number) || 10,
            tahminiSure: (p.tahminiSure as number) || 120,
        };
    });

    const toplamPuan = problemler.reduce((sum, p) => sum + p.puan, 0);
    const toplamSure = problemler.reduce((sum, p) => sum + p.tahminiSure, 0);

    const cevapAnahtari: MatProblemCevapAnahtari = {
        problemler: problemler.map((p, index) => ({
            problemNo: index + 1,
            dogruCevap: p.dogruCevap,
            puan: p.puan,
            kazanimKodu: p.kazanimKodu,
            cozumAdimlari: p.cozumAdimlari,
            gercekYasamBaglantisi: p.gercekYasamBaglantisi,
            seviye: p.zorluk,
        })),
    };

    return {
        id: `problem-seti-${Date.now()}`,
        baslik: `${sinif}. Sınıf Matematik Problemleri`,
        sinif,
        secilenKazanimlar: settings.secilenKazanimlar,
        problemler,
        toplamPuan,
        tahminiSure: toplamSure,
        olusturmaTarihi: new Date().toISOString(),
        olusturanKullanici: 'AI Generator',
        cevapAnahtari,
        dizgiAyarlari: {
            fontAilesi: 'Lexend',
            fontBoyutu: '11pt',
            kenarBoslugu: 'orta',
            sutunDuzeni: 'tek',
            metinHizalama: 'left',
            satirAraligi: 'normal',
        },
    };
};

// ─── Registry Export ───────────────────────────────────────────
export const generateMatProblemFromAI = async (options: MatProblemAyarlari | Record<string, unknown>) => {
    return await generateMathProblems(options as MatProblemAyarlari);
};

export const generateMatProblemFromOptions = async (options: Record<string, unknown>): Promise<MatProblemSeti> => {
    const settings: MatProblemAyarlari = {
        sinif: typeof options.sinif === 'number' ? options.sinif : (typeof options.grade === 'number' ? options.grade : 5),
        secilenUniteler: Array.isArray(options.secilenUniteler) ? (options.secilenUniteler as string[]) : [],
        secilenKazanimlar: Array.isArray(options.secilenKazanimlar) ? (options.secilenKazanimlar as string[]) : [],
        problemSayisi: typeof options.problemSayisi === 'number' ? options.problemSayisi : (typeof options.itemCount === 'number' ? options.itemCount : 5),
        zorlukSeviyesi: typeof options.zorlukSeviyesi === 'string' ? options.zorlukSeviyesi as MatProblemAyarlari['zorlukSeviyesi'] : 'Orta',
        ozelTalimatlar: typeof options.ozelTalimatlar === 'string' ? options.ozelTalimatlar : undefined,
        ozelKonu: typeof options.ozelKonu === 'string' ? options.ozelKonu : undefined,
        kategori: typeof options.kategori === 'string' ? options.kategori as MatProblemAyarlari['kategori'] : 'gercek-yasam',
        verilenlerGosterilsinMi: typeof options.verilenlerGosterilsinMi === 'boolean' ? options.verilenlerGosterilsinMi : true,
        cozumKutusuGosterilsinMi: typeof options.cozumKutusuGosterilsinMi === 'boolean' ? options.cozumKutusuGosterilsinMi : true,
        isLgsMode: typeof options.isLgsMode === 'boolean' ? options.isLgsMode : false,
    };

    return generateMathProblems(settings);
};
