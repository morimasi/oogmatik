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
        ' adet AÇIK UÇLU MATEMATİK PROBLEMİ üretmektir.\n\n' +
        '🚨 KULLANICI AYARLARI VE ZORUNLU UYUM TALİMATLARI 🚨\n' +
        '- Sınıf Seviyesi: ' + sinif + '. Sınıf\n' +
        (kazanimDetaylari ? '\n🎯 KAZANIM KISITI (%100 BİREBİR KAZANIM UYUMU ZORUNLUDUR):\n' + kazanimDetaylari + '\nÜretilecek her problem SADECE VE SADECE yukarıdaki kazanımların matematiksel mantığına, işlem seviyesine ve soru tipine dayalı olmalıdır.\n\n' : '\n') +
        '- Tercih Edilen Şema Tipi: "' + settings.semaTipiTercihi + '"\n' +
        '  (Eğer "otomatik" seçilmişse: Problemin mantığına en uygun şema tipini [kutu-modeli, sayı-doğrusu, kesir-blokları, geometrik-sekil, zaman-tüneli, para-matrisi, tablo, grafik, denklem-şeması, parça-bütün, oran-orantı] sen OTOMATİK BELİRLE ve "semaTipi" alanına yaz!)\n' +
        '  (Geometri konularında [geometrik-sekil] seç ve şekil detaylarını [geometriDetayi] objesinde tanımla!)\n' +
        '- Problem Kategorisi: "' + settings.kategori + '"\n' +
        '- Zorluk Seviyesi: "' + settings.zorlukSeviyesi + '"\n' +
        '- Verilenler/İstenenler Kutusu: ' + (settings.verilenlerGosterilsinMi ? 'EVET (Doldurulacak)' : 'HAYIR') + '\n' +
        '- Çözüm Kutusu: ' + (settings.cozumKutusuGosterilsinMi ? 'EVET' : 'HAYIR') + '\n' +
        '- Görsel Veri/Grafik Talebi: ' + (settings.gorselVeriEklensinMi ? 'EVET (Grafik/Tablo verisini ekle)' : 'HAYIR') + '\n' +
        '- LGS Yeni Nesil Modu: ' + (settings.isLgsMode ? 'AKTİF (PISA/LGS Mantık Sorusu)' : 'PASİF') + '\n\n' +
        '🚨 KRİTİK BENZERSİZLİK VE ORİJİNALİLK KURALI 🚨\n' +
        '- Benzersizlik Tohumu (Random Seed): ' + randomSeed + '\n' +
        '- İlham Teması: "' + secilenKurgu + '"\n' +
        '- HER PROBLEM TAZE, BENZERSİZ VE DAHA ÖNCE HİÇ KULLANILMASI GÖRÜLMEMİŞ İSİMLER, RAKAMLAR VE KURGULAR İÇERMELİDİR.\n\n' +
        '⚠️ ÖNEMLİ: ÇOKTAN SEÇMELİ ŞIKLAR (A, B, C, D) KESİNLİKLE ÜRETME!\n' +
        '⚠️ ÖNEMLİ: SADECE RAKAMLARIN OLDUĞU DÜMDÜZ İŞLEM SORULARI ÜRETME!\n' +
        '⚠️ ÖNEMLİ: Her problem MUTLAKA ilgi çekici bir gerçek yaşam senaryosu barındırmalıdır.\n\n'
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
        '2. Her problem için "verilenler" (problem metninden çıkarılan somut bilgiler) listesi verilmelidir.\n' +
        '3. Her problem için "istenenler" (çözülmesi istenen) açıkça belirtilmelidir.\n' +
        '4. Her problem için adım adım "cozumAdimlari" detaylı ve açıklayıcı yazılmalıdır.\n' +
        '5. Zorluk seviyesi: ' + (settings.zorlukSeviyesi === 'Otomatik' ? 'Karma (Kolay, Orta, Zor)' : settings.zorlukSeviyesi) + '\n'
    );

    if (settings.isLgsMode) {
        parts.push(
            '\n🚨 LGS YENİ NESİL PROBLEM MODU AKTİF 🚨\n' +
            'Tüm problemler LGS/PISA standardında beceri temelli, çok adımlı mantık yürütme gerektiren açık uçlu problemler olmalıdır.\n' +
            'Tablo, grafik veya şema içeren problemlere öncelik ver.\n'
        );
    }

    if (settings.gorselVeriEklensinMi) {
        parts.push(
            '\nGrafik/şekil gerektiren problem varsa "grafikVerisi" alanını JSON içinde ver:\n' +
            '- "tip": grafik türü (sutun_grafigi, pasta_grafigi, tablo, ucgen, dikdortgen vb.)\n' +
            '- "baslik": başlık\n' +
            '- "veri": [{etiket, deger}] dizisi\n'
        );
    }

    parts.push(
        '\nJSON ÇIKTI FORMATI:\n' +
        '```json\n{\n' +
        '  "pedagogicalNote": "Öğretmen için eğitsel amaç açıklaması",\n' +
        '  "problemler": [\n' +
        '    {\n' +
        '      "soruMetni": "Gerçek yaşam senaryolu problem metni...",\n' +
        '      "verilenler": ["Elma kilosu: 25 TL", "Alınan miktar: 3 kg"],\n' +
        '      "istenenler": "Toplam ödenecek tutar",\n' +
        '      "cozumAdimlari": ["1. Adım: ...", "2. Adım: ..."],\n' +
        '      "dogruCevap": "75 TL",\n' +
        '      "gercekYasamBaglantisi": "Markette alışveriş yaparken...",\n' +
        '      "zorluk": "Kolay",\n' +
        '      "kazanimKodu": "M.5.1.1.2",\n' +
        '      "semaTipi": "kutu-modeli",\n' +
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
        pedagogicalNote: { type: 'STRING', description: 'Öğretmen için eğitsel amaç ve disleksi/DEHB öğrenciye faydası üzerine pedagojik not' },
        problemler: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    soruMetni: { type: 'STRING', description: 'Gerçek yaşam senaryolu açık uçlu problem metni' },
                    verilenler: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Problemdeki verilen bilgilerin listesi' },
                    istenenler: { type: 'STRING', description: 'Öğrenciden istenen' },
                    cozumAdimlari: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Adım adım çözüm açıklamaları' },
                    dogruCevap: { type: 'STRING', description: 'Problemin doğru cevabı' },
                    gercekYasamBaglantisi: { type: 'STRING', description: 'Gerçek yaşam bağlantısı açıklaması' },
                    zorluk: { type: 'STRING', description: 'Kolay, Orta veya Zor' },
                    kazanimKodu: { type: 'STRING', description: 'MEB kazanım kodu, ör: M.5.1.1.2' },
                    semaTipi: { type: 'STRING', description: 'kutu-modeli, sayı-doğrusu, tablo, grafik, denklem-şeması, çizim-alanı, parça-bütün, oran-orantı, kesir-blokları, geometrik-sekil, zaman-tüneli, para-matrisi' },
                    semaVerisi: {
                        type: 'OBJECT',
                        description: 'Soru metnindeki sayısal veriler ve etiketlerle %100 birebir uyuşan şema verisi',
                        properties: {
                            sekilTipi: { type: 'STRING', description: 'dik-ucgen, dikdortgen, kare, cember, aci, yamuk, paralelkenar vb.' },
                            etiketler: { type: 'OBJECT', description: 'Kenar, açı ve isim etiketleri, ör: {"taban": "12 cm", "yukseklik": "5 cm", "hipotenus": "13 cm", "aci": "90°"}' },
                            kesirOrani: { type: 'OBJECT', properties: { pay: { type: 'NUMBER' }, paydaya: { type: 'NUMBER' }, etiket: { type: 'STRING' } } },
                            zamanAkisi: { type: 'OBJECT', properties: { baslangic: { type: 'STRING' }, bitis: { type: 'STRING' }, gecenSure: { type: 'STRING' } } },
                            paraMatrisi: { type: 'OBJECT', properties: { verilen: { type: 'STRING' }, tutar: { type: 'STRING' }, paraUstu: { type: 'STRING' } } },
                            kutuModeli: { type: 'OBJECT', properties: { parcaA: { type: 'STRING' }, parcaB: { type: 'STRING' }, toplam: { type: 'STRING' } } },
                            denklemSol: { type: 'STRING' },
                            denklemSag: { type: 'STRING' },
                        }
                    },
                    tabloVerisi: {
                        type: 'OBJECT',
                        description: 'Problemde tablo varsa tablo başlık ve satır verileri',
                        properties: {
                            baslik: { type: 'STRING' },
                            sutunlar: { type: 'ARRAY', items: { type: 'STRING' } },
                            satirData: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } }
                        }
                    },
                    grafikVerisi: {
                        type: 'OBJECT',
                        description: 'Problemde grafik varsa sütun/pasta grafiği verileri',
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
                    puan: { type: 'NUMBER', description: 'Puan değeri' },
                    tahminiSure: { type: 'NUMBER', description: 'Tahmini çözüm süresi (saniye)' },
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
        tabloVerisi: p.tabloVerisi,
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
