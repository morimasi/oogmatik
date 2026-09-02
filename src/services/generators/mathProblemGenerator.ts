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
        problemSayisi +
        ' adet GEREKİRSE HEM GÖRSEL VE ŞEMA ODAKLI HEM DE SADE YENİ NESİL AÇIK UÇLU MATEMATİK PROBLEMİ üret, ' +
        '🚨 KULLANICI AYARLARI VE ZORUNLU UYUM TALİMATLARI 🚨\n' +
        '- Sınıf Seviyesi: ' + sinif + '. Sınıf\n' +
        (kazanimDetaylari ? '\n🎯 KAZANIM KISITI (%100 BİREBİR KAZANIM UYUMU ZORUNLUDUR):\n' + kazanimDetaylari + '\nÜretilecek her problem SADECE VE SADECE yukarıdaki kazanımların matematiksel mantığına, işlem seviyesine ve soru tipine dayalı olmalıdır.\n\n' : '\n') +
        '- Tercih Edilen Şema Tipi: "' + settings.semaTipiTercihi + '"\n' +
        '- Problem Kategorisi: "' + settings.kategori + '"\n' +
        '- Zorluk Seviyesi: "' + settings.zorlukSeviyesi + '"\n' +
        '- Verilenler/İstenenler Kutusu: ' + (settings.verilenlerGosterilsinMi ? 'EVET (Doldurulacak)' : 'HAYIR') + '\n' +
        '- Çözüm Kutusu: ' + (settings.cozumKutusuGosterilsinMi ? 'EVET' : 'HAYIR') + '\n' +
        '- LGS Yeni Nesil Modu: ' + (settings.isLgsMode ? 'AKTİF (PISA/LGS Mantık Sorusu)' : 'PASİF') + '\n\n' +
        '🚨 KRİTİK ŞEMA VE GÖRSEL KURGUSU KURALLARI (VERY IMPORTANT) 🚨\n' +
        '1. ŞEMA ZORUNLULUĞU ESNEKLİĞİ: Her problemde şema/görsel çıkmak ZORUNDA DEĞİLDİR. Eğer soru sözel veya zihinsel mantık problemi ise "semaTipi": "yok" seç!\n' +
        '2. GÖRSELLİ VE ŞEMALI SORULAR: Soru bir tablo, grafik veya geometrik şekil gerektiriyorsa soru metninde görsele atıf yap ("Aşağıdaki çetele tablosuna göre...", "Yukarıda verilen dik üçgene göre...") ve uygun "semaTipi" seç:\n' +
        '   - Çetele / Sıklık / Nesne Grafiği: "cetele-tablosu", "siklik-tablosu", "nesne-grafigi", "nesne-izgarasi"\n' +
        '   - İlkokul (1-4. Sınıf): kesir-pastasi, saat-zaman, para-matrisi, abakus-basamak, cetvel-olcme, oruntu-blok, cetele-tablosu, siklik-tablosu, nesne-grafigi, nesne-izgarasi, sayi-dogrusu\n' +
        '   - Ortaokul & LGS (5-8. Sınıf): birim-kareli-zemin, paralelkenar-yamuk, terazi-denklem, iletki-aciolcer, lgs-ikili-grafik, lgs-alan-modeli, lgs-egim-koordinat, lgs-3d-acinim, lgs-ebob-ekok, lgs-karekok-uslu, lgs-pisagor-ucgen, yok\n' +
        '3. ÇOKLU ALT SORU DESTEĞİ: Özellikle Tablo ve Grafik sorularında tek bir görsele bağlı 2-5 adet alt soru ("altSorular": ["1. En çok sevilen meyve hangisidir?", "2. Toplam kaç öğrenci vardır?"]) ve bunların cevaplarını ("altCevaplar": ["Çilek", "32 öğrenci"]) üret!\n' +
        '4. NESNE GRAFİĞİ LEJANTİ VE İLKOKUL ŞEMALARI: "semaVerisi": {"lejantNotu": "Not: Her resim 3 adet oyunu göstermektedir.", "nesneGrafikData": [{"kategori": "Ayıcık", "adet": 7, "simge": "🧸"}], "ceteleData": {"Kiraz": 10}, "etiketler": {"taban": "15 cm", "yukseklik": "8 cm", "aci": "65°"}} verisini aktar.\n' +
        '5. BİREBİR ŞEMA VE VERİ UYUMU: Soru metnindeki tüm sayılar ve veriler "semaVerisi", "tabloVerisi" veya "grafikVerisi" objelerine EKSİKSİZ aktarılmalıdır.\n\n' +
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
            'Çiftli grafik, cebirsel alan modeli veya rampa eğimi içeren problemlere ağırlık ver.\n'
        );
    }

    parts.push(
        '\nJSON ÇIKTI FORMATI:\n' +
        '```json\n{\n' +
        '  "pedagogicalNote": "Öğretmen için eğitsel amaç açıklaması",\n' +
        '  "problemler": [\n' +
        '    {\n' +
        '      "soruMetni": "Aşağıdaki sıklık tablosuna göre soruları cevaplayalım...",\n' +
        '      "verilenler": ["Akvaryumdaki balık sayıları tablosu"],\n' +
        '      "istenenler": "Tablodaki verilere dayalı alt soruların çözümü",\n' +
        '      "altSorular": ["1. En çok bulunan balık hangisidir?", "2. Japon balıklarının sayısı vatözlerin kaç katıdır?"],\n' +
        '      "altCevaplar": ["Sarı Prenses (16)", "4 katıdır (8 / 2 = 4)"],\n' +
        '      "cozumAdimlari": ["1. Adım: Tablodan sayıları oku", "2. Adım: Oranlama yap"],\n' +
        '      "dogruCevap": "1) Sarı Prenses, 2) 4 katı",\n' +
        '      "gercekYasamBaglantisi": "Akvaryum ve canlı sayılarını kategorize etme...",\n' +
        '      "zorluk": "Orta",\n' +
        '      "kazanimKodu": "M.2.4.1.1",\n' +
        '      "semaTipi": "siklik-tablosu",\n' +
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
                    altSorular: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tek şemaya bağlı 1-5 adet alt soru' },
                    altCevaplar: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Alt soruların doğru yanıtları' },
                    cozumAdimlari: { type: 'ARRAY', items: { type: 'STRING' } },
                    dogruCevap: { type: 'STRING' },
                    gercekYasamBaglantisi: { type: 'STRING' },
                    zorluk: { type: 'STRING' },
                    kazanimKodu: { type: 'STRING' },
                    semaTipi: { type: 'STRING', description: 'cetele-tablosu, siklik-tablosu, nesne-grafigi, nesne-izgarasi, lgs-ikili-grafik, lgs-alan-modeli, lgs-egim-koordinat, lgs-3d-acinim, lgs-ebob-ekok, lgs-karekok-uslu, lgs-pisagor-ucgen, kutu-modeli, sayi-dogrusu, yok vb.' },
                    semaVerisi: {
                        type: 'OBJECT',
                        properties: {
                            sekilTipi: { type: 'STRING' },
                            etiketler: { type: 'OBJECT' },
                            lejantNotu: { type: 'STRING', description: 'Not: Her resim 3 adet oyunu temsil eder vb.' },
                            ceteleData: { type: 'OBJECT', description: '{"Kiraz": 10, "Armut": 7, "Çilek": 13}' },
                            nesneGrafikData: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        kategori: { type: 'STRING' },
                                        adet: { type: 'NUMBER' },
                                        simge: { type: 'STRING' }
                                    }
                                }
                            },
                            kesirOrani: { type: 'OBJECT', properties: { pay: { type: 'NUMBER' }, paydaya: { type: 'NUMBER' } } },
                            zamanAkisi: { type: 'OBJECT', properties: { baslangic: { type: 'STRING' }, bitis: { type: 'STRING' } } },
                        }
                    },
                    tabloVerisi: {
                        type: 'OBJECT',
                        properties: {
                            baslik: { type: 'STRING' },
                            sutunlar: { type: 'ARRAY', items: { type: 'STRING' } },
                            satirData: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
                        }
                    },
                    grafikVerisi: {
                        type: 'OBJECT',
                        properties: {
                            tip: { type: 'STRING' },
                            baslik: { type: 'STRING' },
                            veriler: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        etiket: { type: 'STRING' },
                                        deger: { type: 'NUMBER' },
                                        renk: { type: 'STRING' }
                                    }
                                }
                            }
                        }
                    },
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
        temperature: 0.75,
    });

    const parsed = typeof result === 'string' ? JSON.parse(result) : result;
    const rawProblemler = parsed?.problemler || parsed?.data?.problemler || [];

    const problemler: MatProblem[] = rawProblemler.map((p: Record<string, unknown>, i: number) => ({
        id: `problem-${Date.now()}-${i}`,
        soruMetni: (p.soruMetni as string) || (p.soru_metni as string) || '',
        verilenler: Array.isArray(p.verilenler) ? p.verilenler as string[] : [],
        istenenler: (p.istenenler as string) || '',
        altSorular: Array.isArray(p.altSorular) ? p.altSorular as string[] : undefined,
        altCevaplar: Array.isArray(p.altCevaplar) ? p.altCevaplar as string[] : undefined,
        cozumAdimlari: Array.isArray(p.cozumAdimlari) ? p.cozumAdimlari as string[] : [],
        dogruCevap: (p.dogruCevap as string) || (p.dogru_cevap as string) || '',
        gercekYasamBaglantisi: (p.gercekYasamBaglantisi as string) || (p.gercek_yasam_baglantisi as string) || '',
        zorluk: ((p.zorluk as string) || 'Orta') as 'Kolay' | 'Orta' | 'Zor',
        kazanimKodu: (p.kazanimKodu as string) || (p.kazanim_kodu as string) || `M.${sinif}.1.1`,
        kazanimMetni: (p.kazanimMetni as string) || undefined,
        sinif,
        unite_adi: (p.unite_adi as string) || undefined,
        semaTipi: ((p.semaTipi as string) || 'yok') as MatProblem['semaTipi'],
        semaVerisi: p.semaVerisi as MatProblem['semaVerisi'],
        tabloVerisi: p.tabloVerisi as MatProblemSeti['problemler'][0]['tabloVerisi'],
        kategori: settings.kategori || 'gercek-yasam',
        grafikVerisi: p.grafikVerisi as MatProblem['grafikVerisi'],
        puan: (p.puan as number) || 10,
        tahminiSure: (p.tahminiSure as number) || 120,
    }));

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
