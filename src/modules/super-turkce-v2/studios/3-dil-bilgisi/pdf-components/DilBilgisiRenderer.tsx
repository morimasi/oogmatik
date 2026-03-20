import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { coreStyles } from '../../../shared/pdf/styles';
import { PrintSettings, getPdfTextStyles, applyDyslexiaSpacing } from '../../../core/store/print-settings';

interface Props {
    data: any;
    templateId: string;
    settings: PrintSettings;
}

const styles = StyleSheet.create({
    sentenceBox: {
        padding: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    elementRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 4,
    },
    label: { width: 130, fontFamily: 'Inter', fontWeight: 700, color: '#334155', fontSize: 10 },
    dashedLine: { flex: 1, borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#94A3B8', marginHorizontal: 10 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeader: { flex: 1, padding: 8, backgroundColor: '#EFF6FF', fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#1D4ED8' },
    tableCell: { flex: 1, padding: 8, fontFamily: 'Inter', fontSize: 10, color: '#0F172A' },
    writingLine: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', marginVertical: 10, height: 20 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
});

export const DilBilgisiRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    // ── GRAM_01: Cümle Ögeleri Ağacı ──
    if (templateId === 'GRAM_01_SENTENCE_TREE') {
        const elements: any[] = data.elements || [];
        return (
            <View>
                <View style={styles.sentenceBox}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>Analiz Edilecek Cümle</Text>
                    <Text style={[ts, { color: '#0F172A', fontFamily: 'Inter', fontWeight: 700 }]}>
                        {applyDyslexiaSpacing(data.sentence || '', settings.b_d_spacing)}
                    </Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Yükleme soru sorarak her ögeyi bulun ve boşluklara yazın:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Öge Türü</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Sorulan Soru</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Cümledeki Karşılığı</Text>
                    </View>
                    {elements.map((el: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{el.type}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 1, color: '#64748B' }]}>{el.questionAsked}</Text>
                            <View style={[styles.tableCell, { flex: 2 }]}>
                                <View style={styles.writingLine} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── GRAM_02: Zamanlar Çarkı ──
    if (templateId === 'GRAM_02_TIME_WHEEL') {
        const tenses: any[] = data.tenses || [];
        return (
            <View>
                <View style={styles.sentenceBox}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 4 }}>Kök Fiil</Text>
                    <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, color: '#0F172A', marginBottom: 8 }]}>{data.rootVerb}</Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 4 }}>Bağlam</Text>
                    <Text style={[ts, { color: '#334155' }]}>{applyDyslexiaSpacing(data.context, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kip / Zaman</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Çekimli Hali</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Örnek Cümle (Kendiniz kurun)</Text>
                    </View>
                    {tenses.map((t: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1 }]}>{t.tenseName}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700, color: '#2563EB' }]}>{t.conjugated}</Text>
                            <View style={[styles.tableCell, { flex: 2 }]}>
                                <View style={styles.writingLine} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── GRAM_03: Sıfat Avcısı ──
    if (templateId === 'GRAM_03_ADJECTIVE_HUNT') {
        return (
            <View>
                <View style={[styles.sentenceBox, { marginBottom: 16 }]}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 6 }}>Metni okuyun; sıfatları bulup tabloya yazın:</Text>
                    <Text style={[ts]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Sıfat</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Nitelediği İsim</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Sıfat Türü</Text>
                    </View>
                    {(data.adjectives || []).map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8', marginTop: 8 }}>
                    İpucu: Metin içinde {(data.adjectives || []).length} adet sıfat var.
                </Text>
            </View>
        );
    }

    // ── GRAM_04: İsim Hâlleri Tablosu ──
    if (templateId === 'GRAM_04_NOUN_CASES') {
        const headers = ['Yalın', 'İlgi (-ın)', 'Yönelme (-a)', 'Belirtme (-ı)', 'Bulunma (-da)', 'Ayrılma (-dan)'];
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her ismin hâl ekli biçimlerini inceleyin; boş sütunları doldurun:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        {headers.map(h => <Text key={h} style={[styles.tableHeader, { flex: 1, fontSize: 8 }]}>{h}</Text>)}
                    </View>
                    {(data.words || []).map((w: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{w.root}</Text>
                            {[w.genitive, w.dative, w.accusative, w.locative, w.ablative].map((val, j) => (
                                <View key={j} style={[styles.tableCell, { flex: 1 }]}>
                                    <View style={[styles.writingLine, { marginTop: 4 }]} />
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── GRAM_05: Birleşik Kelime Fabrikası ──
    if (templateId === 'GRAM_05_COMPOUND_WORDS') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 10 }}>
                    İki sözcüğü birleştirerek yeni anlamlı kelimeler oluşturun:
                </Text>
                {(data.pairs || []).map((pair: any, i: number) => (
                    <View key={i} style={[styles.optionRow, { marginBottom: 10 }]} wrap={false}>
                        <Text style={[ts, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{pair.word1}</Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: 16, color: '#CBD5E1', marginHorizontal: 8 }}>+</Text>
                        <Text style={[ts, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{pair.word2}</Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: 16, color: '#CBD5E1', marginHorizontal: 8 }}>=</Text>
                        <View style={{ flex: 2, borderBottomWidth: 1, borderBottomColor: '#94A3B8' }}>
                            <Text style={[ts, { color: '#64748B', fontSize: 9 }]}>{pair.type}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── GRAM_06: Zamir Dedektifi ──
    if (templateId === 'GRAM_06_PRONOUN_FINDER') {
        return (
            <View>
                <View style={styles.sentenceBox}>
                    <Text style={[ts]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Zamir</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Türü</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Neyin / Kimin Yerine?</Text>
                    </View>
                    {(data.pronouns || []).map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8', marginTop: 8 }}>
                    İpucu: Metinde {(data.pronouns || []).length} zamir gizlenmiş!
                </Text>
            </View>
        );
    }

    // ── GRAM_07: Cümle Dönüştürme ──
    if (templateId === 'GRAM_07_SENTENCE_TRANSFORM') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Verilen cümleleri olumlu, olumsuz, soru ve ünlem biçimlerine dönüştürün:
                </Text>
                {(data.sentences || []).map((s: any, i: number) => (
                    <View key={i} style={[coreStyles.card, { marginBottom: 12 }]} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#0F172A', marginBottom: 8 }}>
                            {i + 1}. {applyDyslexiaSpacing(s.positive, settings.b_d_spacing)}
                        </Text>
                        {['Olumsuz', 'Soru', 'Ünlem'].map((form) => (
                            <View key={form} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                <Text style={{ width: 60, fontFamily: 'Inter', fontSize: 9, color: '#64748B' }}>{form}:</Text>
                                <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    }

    // ── GRAM_08: Edilgen Çatı ──
    if (templateId === 'GRAM_08_PASSIVE_VOICE') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Etken cümleleri edilgen yapıya dönüştürün:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Etken Cümle</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Edilgen Cümle (Yazın)</Text>
                    </View>
                    {(data.exercises || []).map((ex: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 2 }]}>{applyDyslexiaSpacing(ex.active, settings.b_d_spacing)}</Text>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── GRAM_09: Kelime Ailesi Ağacı ──
    if (templateId === 'GRAM_09_WORD_FAMILY') {
        return (
            <View>
                {(data.families || []).map((family: any, fi: number) => (
                    <View key={fi} style={[coreStyles.card, { marginBottom: 16 }]}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#3B82F6', marginBottom: 10, textAlign: 'center' }}>
                            KÖK: {family.root}
                        </Text>
                        <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden' }}>
                            <View style={styles.tableRow}>
                                <Text style={[styles.tableHeader, { flex: 1 }]}>Türemiş Kelime</Text>
                                <Text style={[styles.tableHeader, { flex: 1 }]}>Ek</Text>
                                <Text style={[styles.tableHeader, { flex: 1 }]}>Tür</Text>
                                <Text style={[styles.tableHeader, { flex: 2 }]}>Örnek Cümle</Text>
                            </View>
                            {(family.members || []).map((m: any, mi: number) => (
                                <View key={mi} style={styles.tableRow}>
                                    <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{m.word}</Text>
                                    <Text style={[ts, styles.tableCell, { flex: 1, color: '#64748B' }]}>{m.suffix}</Text>
                                    <Text style={[ts, styles.tableCell, { flex: 1, color: '#2563EB' }]}>{m.type}</Text>
                                    <Text style={[ts, styles.tableCell, { flex: 2, fontSize: 9 }]}>{applyDyslexiaSpacing(m.exampleSentence, settings.b_d_spacing)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── GRAM_10: Bağlaç Köprüsü ──
    if (templateId === 'GRAM_10_CONJUNCTION_BRIDGE') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    İki cümleyi doğru bağlaçla birleştirin:
                </Text>
                {(data.exercises || []).map((ex: any, i: number) => (
                    <View key={i} style={[coreStyles.card, { marginBottom: 10 }]} wrap={false}>
                        <Text style={[ts, { marginBottom: 6 }]}>
                            {i + 1}. <Text style={{ fontFamily: 'Inter', fontWeight: 700 }}>{applyDyslexiaSpacing(ex.sentence1, settings.b_d_spacing)}</Text>
                            {' '}/{' '}
                            <Text style={{ fontFamily: 'Inter', fontWeight: 700 }}>{applyDyslexiaSpacing(ex.sentence2, settings.b_d_spacing)}</Text>
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {(ex.options || []).map((opt: string, j: number) => (
                                <View key={j} style={[styles.optionRow, { paddingHorizontal: 12, paddingVertical: 6, minWidth: 80 }]}>
                                    <Text style={[ts, { fontSize: 10 }]}>{opt}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8', marginTop: 6 }}>Birleşik Cümle: _______________________________________________</Text>
                    </View>
                ))}
            </View>
        );
    }

    // Varsayılan
    return (
        <View style={coreStyles.card}>
            <Text style={[ts, { color: '#EF4444' }]}>
                PDF Render Hatası: {templateId} için görselleştirici bulunamadı.
            </Text>
        </View>
    );
};
