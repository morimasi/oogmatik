import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { useSuperTurkceStore } from '../../core/store';

// Ultra-Kompakt Matbaa Tarzı A4 Düzeni (Minimum Boşluk, Maksimum Verim)
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 35,
        paddingRight: 35,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
    },
    // Üst Bilgi (Header) Alanı
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        paddingBottom: 10,
        marginBottom: 15,
    },
    brandContainer: {
        flexDirection: 'column',
    },
    institutionName: {
        fontFamily: 'Lexend',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    moduleName: {
        fontFamily: 'Lexend',
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },
    studentInfoBox: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 5,
    },
    infoLabel: {
        fontFamily: 'Lexend',
        fontSize: 9,
        color: '#475569',
    },
    infoLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        width: 120,
        height: 10,
    },
    // Ana Grid ve Bileşen Alanı
    gridContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12, // Bileşenler arası esnek kompakt boşluk
    },
    // Taslak Bileşen (Block) Tasarımı
    componentBlock: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafaf9',
        position: 'relative',
    },
    componentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4,
    },
    blockTitle: {
        fontFamily: 'Lexend',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#334155',
        textTransform: 'uppercase',
    },
    blockBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 7,
        fontFamily: 'Lexend',
        color: '#0284c7',
        fontWeight: 'bold',
    },
    // İçerik Mock Tarzları
    mockLine: {
        height: 8,
        backgroundColor: '#cbd5e1',
        borderRadius: 4,
        marginBottom: 6,
    },
    mockLineShort: {
        width: '60%',
    },
    // Filigran
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        opacity: 0.04,
    },
    watermarkText: {
        fontFamily: 'Lexend',
        fontSize: 80,
        fontWeight: 'bold',
        color: '#000000',
        transform: 'rotate(-45deg)',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 35,
        right: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 8,
    },
    footerText: {
        fontFamily: 'Lexend',
        fontSize: 8,
        color: '#94a3b8',
    }
});

// =========================================================
// Dinamik PDF Element Haritalayıcı — NULL-SAFE, Faz 8 Uyumlu
// @react-pdf/renderer içinde null döndürmek TypeError'a yol açar.
// Tüm alanlar güvenli fallback ile korunuyor.
// =========================================================
const safeText = (val: any, fallback = '') =>
    typeof val === 'string' ? val : (val != null ? String(val) : fallback);

const safeArray = (val: any): any[] => Array.isArray(val) ? val : [];

const renderComponentByType = (type: string, draft: any) => {
    const data = draft.data ?? {};  // null/undefined'ı boş objeyle kapat

    // --- Boş Veri Çizgileri (İçerik henüz üretilmedi) ---
    const emptyLines = (
        <View style={{ gap: 4, marginTop: 5 }}>
            <View style={[styles.mockLine]} />
            <View style={[styles.mockLine]} />
            <View style={[styles.mockLine, styles.mockLineShort]} />
            <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>Üretim bekleniyor...</Text>
        </View>
    );

    // --- Generic soru listesi render ---
    const renderQuestionList = (questions: any[]) => (
        <View style={{ gap: 6, marginTop: 4 }}>
            {questions.map((q: any, i: number) => {
                const soruText = typeof q === 'string' ? q : safeText(q?.soru || q?.question, `Soru ${i + 1}`);
                const opts: string[] = safeArray(q?.options || q?.seçenekler);
                return (
                    <View key={i} style={{ gap: 3 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a' }}>{i + 1}. {soruText}</Text>
                        {opts.length > 0 && (
                            <View style={{ paddingLeft: 12, gap: 2 }}>
                                {opts.map((opt: string, j: number) => (
                                    <Text key={j} style={{ fontSize: 8, color: '#475569' }}>{opt}</Text>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    );

    // --- Sol/Sağ Eşleştirme render ---
    const renderMatching = (left: any[], right: any[]) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 20 }}>
            <View style={{ gap: 8, flex: 1 }}>
                {left.map((l: any, i: number) => (
                    <View key={`l-${i}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 9, color: '#334155' }}>{safeText(l, `Sol ${i + 1}`)}</Text>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' }} />
                    </View>
                ))}
            </View>
            <View style={{ gap: 8, flex: 1 }}>
                {right.map((r: any, i: number) => (
                    <View key={`r-${i}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' }} />
                        <Text style={{ fontSize: 9, color: '#334155' }}>{safeText(r, `Sağ ${i + 1}`)}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    // --- Cümle listesi render ---
    const renderSentenceList = (sentences: any[]) => (
        <View style={{ gap: 5, marginTop: 4 }}>
            {sentences.map((s: any, i: number) => (
                <Text key={i} style={{ fontSize: 9, color: '#334155', lineHeight: 1.5 }}>
                    {i + 1}. {safeText(typeof s === 'string' ? s : s?.cumle || s?.bozuk || s?.kelime || '', `Cümle ${i + 1}`)}
                </Text>
            ))}
        </View>
    );

    switch (type) {
        // ---- OKUMA ANLAMA ----
        case '5N1K_NEWS':
        case '5N1K': {
            const title = safeText(data.title, 'Haber Başlığı');
            const content = safeText(data.content, 'Haber içeriği yükleniyor...');
            const questions = safeArray(data.questions);
            return (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                    <View style={{ width: 80, height: 60, backgroundColor: '#cbd5e1', borderRadius: 4 }} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontFamily: 'Lexend', fontSize: 11, fontWeight: 'bold' }}>{title}</Text>
                        <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.4 }}>{content}</Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                            {(questions.length > 0 ? questions : ['Kim?', 'Ne?', 'Nerede?']).map((q: any, i: number) => (
                                <Text key={i} style={{ fontSize: 8, color: '#0284c7', fontWeight: 'bold' }}>{safeText(q, `S${i + 1}`)}</Text>
                            ))}
                        </View>
                    </View>
                </View>
            );
        }

        case 'ANA_DUSUNCE': {
            const paragraf = safeText(data.paragraf || data.content, 'Paragraf yükleniyor...');
            const question = safeText(data.question || data.soru, 'Ana düşünce sorusu');
            const options = safeArray(data.options);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.4, backgroundColor: '#f8fafc', padding: 6 }}>{paragraf}</Text>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a' }}>{question}</Text>
                    {options.length > 0 && (
                        <View style={{ gap: 3, paddingLeft: 10 }}>
                            {options.map((o: string, i: number) => <Text key={i} style={{ fontSize: 8, color: '#475569' }}>{o}</Text>)}
                        </View>
                    )}
                </View>
            );
        }

        case 'OLAY_SIRALAMA': {
            const shuffled = safeArray(data.shuffled);
            return (
                <View style={{ gap: 5, marginTop: 4 }}>
                    <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>Aşağıdaki cümleleri doğru sıraya koyunuz:</Text>
                    {(shuffled.length > 0 ? shuffled : ['Cümle 1', 'Cümle 2', 'Cümle 3']).map((s: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <View style={{ width: 16, height: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 2 }} />
                            <Text style={{ fontSize: 9, color: '#334155', flex: 1 }}>{safeText(s, `Cümle ${i + 1}`)}</Text>
                        </View>
                    ))}
                </View>
            );
        }

        // ---- EŞLEŞTIRME GRUBu ----
        case 'SUPER_TURKCE_MATCHING':
        case 'SEBEP_SONUC_ESLESTIR':
        case 'KAVRAM_ESLESTIRME':
        case 'DEYIM_ANLAM':
        case 'ATASOZI_ESLESTIR':
        case 'ES_ANLAMLI_ZITLIK':
        case 'ESLESTIRME':
        case 'DOLDUR_DEYIM':
        case 'KELIME_ANLAM': {
            const left = safeArray(data.left || data.deyimler?.map((d: any) => d.deyim) || data.kelimeler?.map((k: any) => k.kelime) || []);
            const right = safeArray(data.right || data.deyimler?.map((d: any) => d.anlam) || data.kelimeler?.map((k: any) => k.esAnlamli) || []);
            const words = safeArray(data.words);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    {words.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 5, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 4 }}>
                            {words.map((w: string, i: number) => (
                                <Text key={i} style={{ fontSize: 8, fontWeight: 'bold', color: '#0284c7' }}>[{safeText(w)}]</Text>
                            ))}
                        </View>
                    )}
                    {(left.length > 0 || right.length > 0) ? renderMatching(left, right) : emptyLines}
                </View>
            );
        }

        // ---- ÇOKTAN SEÇMELİ SORULAR ----
        case 'MULTIPLE_CHOICE':
        case 'DIL_BILGISI_TEST':
        case 'PARAGRAF_MANTIK_TEST':
        case 'STANDART_TEST':
        case 'YENI_NESIL':
        case 'SES_ETKIN_QUIZ':
        case 'UNLU_UYUMU':
        case 'BASLIK_BULMA':
        case 'BILMECELI_DUSUNME': {
            // Hem tekil soru hem sorular[] dizisi destekleniyor
            if (data.sorular || data.questions) {
                const sorular = safeArray(data.sorular || data.questions);
                return sorular.length > 0 ? renderQuestionList(sorular) : emptyLines;
            }
            const question = safeText(data.question || data.soru, 'Soru metni yükleniyor...');
            const options = safeArray(data.options || data.seçenekler);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: '#0f172a', fontWeight: 'bold' }}>{question}</Text>
                    <View style={{ gap: 3, paddingLeft: 10 }}>
                        {(options.length > 0 ? options : ['A) ...', 'B) ...', 'C) ...', 'D) ...']).map((opt: string, i: number) => (
                            <Text key={i} style={{ fontSize: 9, color: '#475569' }}>{safeText(opt)}</Text>
                        ))}
                    </View>
                </View>
            );
        }

        // ---- BOŞLUK DOLDURMA ----
        case 'FILL_IN_THE_BLANKS':
        case 'BOSLUK_CEKIM_EKI':
        case 'BOSLUK_DOLDURMA':
        case 'SOZCUK_SIRALA':
        case 'KELIME_TAHMINI':
        case 'ULASMA': {
            const words = safeArray(data.words || data.kelimeler?.map((k: any) => safeText(k?.kelime || k, '')) || []);
            const sentences = safeArray(data.sentences || data.cumleler || []);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    {words.length > 0 && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, padding: 5, backgroundColor: '#f1f5f9', borderRadius: 3 }}>
                            {words.map((w: any, i: number) => (
                                <Text key={i} style={{ fontSize: 8, fontWeight: 'bold', color: '#0284c7' }}>[{safeText(w)}]</Text>
                            ))}
                        </View>
                    )}
                    {sentences.length > 0 ? renderSentenceList(sentences) : emptyLines}
                </View>
            );
        }

        // ---- METİN PARÇASI (okuma paragrafı) ----
        case 'CIKARIM_YAPMA':
        case 'METIN_KARSILASTIRMA':
        case 'SIIR_INCELEME':
        case 'GORSEL_OKUMA':
        case 'HIKAYE_TAMAMLAMA':
        case 'DIKTE_CALISMA':
        case 'METIN_DUZELT':
        case 'YAZIM_HATASI_BUL': {
            const metin = safeText(data.metin || data.text || data.content || data.siir, '');
            const sorular = safeArray(data.sorular || data.questions || []);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    {metin ? (
                        <Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.5, backgroundColor: '#f8fafc', padding: 8, borderRadius: 4 }}>{metin}</Text>
                    ) : (
                        <View style={{ height: 50, backgroundColor: '#f1f5f9', borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 8, color: '#94a3b8' }}>Metin alanı</Text>
                        </View>
                    )}
                    {sorular.length > 0 && renderQuestionList(sorular)}
                </View>
            );
        }

        // ---- DOĞRU/YANLIŞ ----
        case 'TRUE_FALSE_DIL':
        case 'MANTIKSIZLIGI_BUL': {
            const maddeler = safeArray(data.maddeler || data.cumleler || []);
            return (
                <View style={{ gap: 5, marginTop: 4 }}>
                    {(maddeler.length > 0 ? maddeler : ['İfade 1', 'İfade 2', 'İfade 3']).map((m: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                <View style={{ width: 14, height: 10, borderWidth: 1, borderColor: '#60a5fa', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 6, color: '#3b82f6' }}>D</Text>
                                </View>
                                <View style={{ width: 14, height: 10, borderWidth: 1, borderColor: '#f87171', borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 6, color: '#ef4444' }}>Y</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 9, color: '#334155', flex: 1 }}>
                                {safeText(typeof m === 'string' ? m : m?.ifade || m?.cumle || m?.bozuk, `İfade ${i + 1}`)}
                            </Text>
                        </View>
                    ))}
                </View>
            );
        }

        // ---- HECE / SES OLAYLARI ----
        case 'HECE_YAPI':
        case 'HECE_BOLME':
        case 'BUYUK_KUCUK_HARF':
        case 'KELIME_ANALIZI':
        case 'RADYOAKTIF_HARF': {
            const kelimeler = safeArray(data.kelimeler || []);
            return (
                <View style={{ gap: 5, marginTop: 4 }}>
                    {(kelimeler.length > 0 ? kelimeler : ['kelime1', 'kelime2', 'kelime3']).map((k: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#334155', width: 80 }}>
                                {safeText(k?.kelime || k, `Kelime ${i + 1}`)}
                            </Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: '#e2e8f0' }} />
                            <View style={{ width: 40, height: 12, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 2 }} />
                        </View>
                    ))}
                </View>
            );
        }

        // ---- AÇIK UÇLU / ÇİZİM ALANI ----
        case 'OKUDUGUNU_CIZ':
        case 'YARATICI_CUMLE':
        case 'ACIK_UCLU': {
            const yonerge = safeText(data.yonerge || data.text || data.kelimeler?.map((k: any) => safeText(k?.kelime || k, '')).join(', '), 'Cevabınızı aşağıya yazınız:');
            const satirSayisi = Number(data.satirSayisi || data.cizgiSayisi || 4);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    <Text style={{ fontSize: 9, color: '#334155' }}>{yonerge}</Text>
                    <View style={{ gap: 8, marginTop: 4 }}>
                        {Array.from({ length: Math.max(2, Math.min(satirSayisi, 8)) }).map((_, i) => (
                            <View key={i} style={{ height: 1, backgroundColor: '#d1d5db', width: '100%' }} />
                        ))}
                    </View>
                </View>
            );
        }

        // ---- SÖZEL MANTIK TABLO / DİĞER MANTIK ----
        case 'SOZEL_MANTIK_TABLO':
        case 'KAVRAM_HARITASI':
        case 'YONERGE_TAKIBI': {
            // kisiler + degiskenler mantık tablosu
            const kisiler = safeArray(data.kisiler || data.dallar || []);
            const degiskenler = safeArray(data.degiskenler || []);
            const merkez = safeText(data.merkez || data.merkezKelime, '');
            const ipuclari = safeArray(data.ipuclari || data.yonlendirmeler || []);
            return (
                <View style={{ gap: 5, marginTop: 4 }}>
                    {merkez ? <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' }}>{merkez}</Text> : null}
                    {ipuclari.length > 0 && (
                        <View style={{ gap: 3, marginBottom: 4 }}>
                            {ipuclari.map((ip: any, i: number) => (
                                <Text key={i} style={{ fontSize: 8, color: '#64748b' }}>• {safeText(ip, `İpucu ${i + 1}`)}</Text>
                            ))}
                        </View>
                    )}
                    {degiskenler.length > 0 ? (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                            {kisiler.map((k: any, i: number) => (
                                <View key={i} style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 4, borderRadius: 4, minWidth: 60 }}>
                                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#334155' }}>{safeText(k, `Kişi ${i + 1}`)}</Text>
                                    {degiskenler.map((_: any, j: number) => (
                                        <View key={j} style={{ width: '100%', height: 1, backgroundColor: '#f1f5f9', marginTop: 3 }} />
                                    ))}
                                </View>
                            ))}
                        </View>
                    ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            {kisiler.map((dal: any, i: number) => (
                                <View key={i} style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 8, color: '#334155' }}>{safeText(typeof dal === 'string' ? dal : dal?.dal, `Kavram ${i + 1}`)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            );
        }

        // ---- ANLATIM BOZUKLUĞU / CÜMLE DÖNÜŞTÜRME ----
        case 'ANLATIM_BOZUKLUGU':
        case 'HATALI_SOZCUK':
        case 'CUMLE_DONUSTUR':
        case 'CUMLE_OGESI_AYIRMA': {
            const cumleler = safeArray(data.cumleler || []);
            const paragraf = safeText(data.paragraf || data.metin, '');
            return (
                <View style={{ gap: 5, marginTop: 4 }}>
                    {paragraf ? (
                        <Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.5, backgroundColor: '#fff7ed', padding: 6, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#f97316' }}>
                            {paragraf}
                        </Text>
                    ) : null}
                    {cumleler.length > 0 && (
                        <View style={{ gap: 6 }}>
                            {cumleler.map((c: any, i: number) => {
                                const bozukMetin = safeText(typeof c === 'string' ? c : c?.bozuk || c?.cumle, `Cümle ${i + 1}`);
                                const duzgun = safeText(c?.duzgun, '');
                                return (
                                    <View key={i} style={{ borderWidth: 1, borderColor: '#fecaca', borderRadius: 4, padding: 5 }}>
                                        <Text style={{ fontSize: 9, color: '#991b1b' }}>{i + 1}. {bozukMetin}</Text>
                                        {duzgun ? (
                                            <View style={{ height: 12, borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginTop: 4 }} />
                                        ) : null}
                                    </View>
                                );
                            })}
                        </View>
                    )}
                    {cumleler.length === 0 && !paragraf && emptyLines}
                </View>
            );
        }

        // ---- TABLOLU FORMATLAR (Tablo Hata Avı, Kısaltma, Sözlük, Yazım Panosu) ----
        case 'TABLODA_HATA_AVI':
        case 'KISALTMA_SEMBOL':
        case 'OKUMALIK_SOZLUK':
        case 'YAZIM_KURALI_PANO': {
            // Genel amaçlı tablo renderer
            const kurallar = safeArray(data.kurallar || data.kisaltmalar || data.sozluk || []);
            const tablo = safeArray(data.tablo || []);
            if (tablo.length > 0) {
                return (
                    <View style={{ gap: 2, marginTop: 4 }}>
                        {tablo.map((row: any[], r: number) => (
                            <View key={r} style={{ flexDirection: 'row', gap: 2 }}>
                                {safeArray(row).map((cell: any, c: number) => (
                                    <View key={c} style={{ flex: 1, borderWidth: 1, borderColor: '#e2e8f0', padding: 3, borderRadius: 2 }}>
                                        <Text style={{ fontSize: 7, color: '#334155' }}>{safeText(cell, '')}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>
                );
            }
            if (kurallar.length > 0) {
                return (
                    <View style={{ gap: 5, marginTop: 4 }}>
                        {kurallar.map((k: any, i: number) => (
                            <View key={i} style={{ flexDirection: 'row', gap: 6, alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#0284c7', width: 14 }}>{i + 1}.</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 9, color: '#0f172a', fontWeight: 'bold' }}>
                                        {safeText(k?.kural || k?.kisaltma || k?.kelime, `Madde ${i + 1}`)}
                                    </Text>
                                    {k?.dogru && <Text style={{ fontSize: 8, color: '#16a34a' }}>✓ {safeText(k.dogru)}</Text>}
                                    {k?.yanlis && <Text style={{ fontSize: 8, color: '#dc2626' }}>✗ {safeText(k.yanlis)}</Text>}
                                    {k?.acilimi && <Text style={{ fontSize: 8, color: '#64748b' }}>{safeText(k.acilimi)}</Text>}
                                    {k?.tanim && <Text style={{ fontSize: 8, color: '#475569' }}>{safeText(k.tanim)}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>
                );
            }
            return emptyLines;
        }

        // ---- DEYİM / ATASÖZLERİ DETAY ----
        case 'DEYIM_CUMLE':
        case 'OZDEYIS_ANALIZ': {
            const deyimler = safeArray(data.deyimler || data.ozdeyisler || []);
            return (
                <View style={{ gap: 6, marginTop: 4 }}>
                    {(deyimler.length > 0 ? deyimler : [{ deyim: 'Deyim', bosluk: '______' }]).map((d: any, i: number) => (
                        <View key={i} style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 4, padding: 6 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#0f172a' }}>{safeText(d.deyim || d.ozdeyis, `${i + 1}. Deyim`)}</Text>
                            {d.anlam && <Text style={{ fontSize: 8, color: '#64748b', marginTop: 1 }}>({safeText(d.anlam)})</Text>}
                            <View style={{ height: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e1', marginTop: 6 }} />
                        </View>
                    ))}
                </View>
            );
        }

        // ---- SES OLAYLARI DETAY ----
        case 'SES_OLAY_TANI':
        case 'UNSUZ_BENZEŞMESI':
        case 'SES_DUSME_TUREME':
        case 'KAYNAŞTIRMA': {
            const ornekler = safeArray(data.ornekler || data.kelimeler || []);
            return (
                <View style={{ gap: 4, marginTop: 4 }}>
                    {(ornekler.length > 0 ? ornekler : [{ temel: 'Örnek', ek: '(ek)' }]).map((o: any, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 3 }}>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#1e40af', width: 70 }}>
                                {safeText(o?.temel || o?.kelime || o?.kok, `Sözcük ${i + 1}`)}
                            </Text>
                            <Text style={{ fontSize: 8, color: '#64748b' }}>{safeText(o?.ek || o?.dogru, '+ek')}</Text>
                            <Text style={{ fontSize: 8, color: '#059669' }}>→ {safeText(o?.sonuc || o?.dogru || o?.olay, '...')}</Text>
                        </View>
                    ))}
                </View>
            );
        }



        // ---- DEFAULT (Bilinmeyen Format) ----
        default: {
            const text = safeText(data.text || data.content || data.metin, '');
            const sorular = safeArray(data.sorular || data.questions || data.bilmeceler || []);
            return (
                <View style={{ gap: 4, marginTop: 5 }}>
                    {text ? (
                        <Text style={{ fontSize: 9, color: '#334155', lineHeight: 1.5 }}>{text}</Text>
                    ) : null}
                    {sorular.length > 0 ? renderQuestionList(sorular) : (text ? null : emptyLines)}
                    <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>
                        ({safeText(draft.type, '?')} — {draft.settings?.engineMode === 'ai' ? 'AI ✨' : 'Hızlı ⚡'})
                    </Text>
                </View>
            );
        }
    }
};



// A4 Matbaa Dizgi Motoru (PDF Rendering)
export const A4PrintableSheetV2: React.FC = () => {
    // Tüm güncel state ve taslak üretim verisi store'dan alınır
    const {
        institutionName,
        includeWatermark,
        watermarkText,
        selectedGrade,
        selectedObjective,
        draftComponents,
        audience
    } = useSuperTurkceStore();

    // Dinamik Font Kararı (Disleksi modlarına özel fontlar)
    const fontStyle = {
        fontFamily: audience === 'derin_disleksi' ? 'OpenDyslexic' : 'Lexend',
        fontSize: audience === 'derin_disleksi' || audience === 'hafif_disleksi' ? 12 : 10
    };

    return (
        <Document title="Süper Türkçe Karma Çalışma Kağıdı">
            <Page size="A4" style={[styles.page, fontStyle]}>

                {/* 1. Kurumsal Filigran (Watermark) */}
                {includeWatermark && (
                    <View style={styles.watermarkContainer} fixed>
                        <Text style={styles.watermarkText}>{watermarkText || 'OOGMATIK'}</Text>
                    </View>
                )}

                {/* 2. Dinamik Matbaa Başlığı (Header) */}
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <Text style={styles.institutionName}>{institutionName || 'Eğitim Kurumu'}</Text>
                        <Text style={styles.moduleName}>
                            Süper Türkçe V2 - {selectedGrade ? `${selectedGrade}. Sınıf Çalışma Kağıdı` : 'Karma Etkinlik'}
                        </Text>
                    </View>
                    <View style={styles.studentInfoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Adı Soyadı:</Text>
                            <View style={styles.infoLine}></View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Sınıf / No:</Text>
                            <View style={[styles.infoLine, { width: 80 }]}></View>
                        </View>
                    </View>
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontFamily: 'Lexend', fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
                        Ders Konusu: <Text style={{ fontWeight: 'normal' }}>{selectedObjective?.title || 'Genel Tekrar'}</Text>
                    </Text>
                </View>

                {/* 3. Taslak Bileşenlerin (Drafts) Sütunlu Grid Render'ı */}
                <View style={styles.gridContainer}>
                    {draftComponents.length === 0 ? (
                        <View style={[styles.componentBlock, { alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#f8fafc' }]}>
                            <Text style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'Lexend' }}>Lütfen kokpitten modülleri seçip "Sihirli Üret" butonuna basın.</Text>
                        </View>
                    ) : (
                        draftComponents.map((draft: any, idx: number) => (
                            <View key={draft.id} style={styles.componentBlock} wrap={false}>
                                <View style={styles.componentHeader}>
                                    <Text style={styles.blockTitle}>{idx + 1}. {draft.type.replace(/_/g, ' ')}</Text>
                                    <Text style={styles.blockBadge}>Puan: ____</Text>
                                </View>

                                {/* Gerçekçi Görsel Bileşen (Element Mapper) */}
                                {draft.data ? (
                                    <View>
                                        <Text style={{ fontSize: 8, color: '#10b981', fontWeight: 'bold', marginBottom: 6 }}>✓ {draft.settings?.engineMode === 'ai' ? 'Yapay Zeka (AI)' : 'Hızlı'} Üretimi Başarılı</Text>
                                        {renderComponentByType(draft.type, draft)}
                                    </View>
                                ) : (
                                    <View style={{ gap: 4, marginTop: 5 }}>
                                        <View style={[styles.mockLine]} />
                                        <View style={[styles.mockLine]} />
                                        <View style={[styles.mockLine, styles.mockLineShort]} />
                                        <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>
                                            Üretim bekliyor... (Sihirli butona basıldığında otomatik dolacaktır)
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* 4. Alt Bilgi (Footer) */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Üretim Kimliği: #{Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                        `Sayfa ${pageNumber} / ${totalPages}`
                    )} fixed />
                </View>

            </Page>
        </Document>
    );
};
