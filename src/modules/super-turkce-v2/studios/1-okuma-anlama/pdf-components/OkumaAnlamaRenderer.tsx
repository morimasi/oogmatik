import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { coreStyles } from '../../../shared/pdf/styles';
import { PrintSettings, getPdfTextStyles, applyDyslexiaSpacing } from '../../../core/store/print-settings';

// Stüdyo 1 Özel Stilleri
const styles = StyleSheet.create({
    articleBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    articleTitle: {
        fontFamily: 'Inter',
        fontWeight: 700,
        fontSize: 16,
        color: '#0F172A',
        marginBottom: 10,
        textAlign: 'center'
    },
    articleBody: {
        color: '#1E293B',
        textAlign: 'justify'
    },
    questionRow: {
        marginBottom: 18
    },
    questionTypeBadge: {
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
        fontSize: 10,
        fontFamily: 'Inter',
        fontWeight: 700,
        marginBottom: 6,
        alignSelf: 'flex-start'
    },
    questionText: {
        color: '#0F172A',
        marginBottom: 8
    },
    answerLine: {
        borderBottomWidth: 1,
        borderBottomStyle: 'dashed',
        borderBottomColor: '#CBD5E1',
        marginTop: 18,
        marginHorizontal: 10
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    tableCell: {
        flex: 1,
        padding: 8,
        fontSize: 11,
        fontFamily: 'Inter',
        color: '#334155',
    },
    tableHeader: {
        flex: 1,
        padding: 8,
        backgroundColor: '#EFF6FF',
        fontSize: 10,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#1D4ED8',
    },
    optionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 8,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    optionLabel: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    writingLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1',
        marginVertical: 10,
        height: 22,
    },
});

interface Props {
    data: any;
    templateId: string;
    settings: PrintSettings;
}

export const OkumaAnlamaRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const txtStyle = getPdfTextStyles(settings);

    // ── READ_01: 5N1K Haber Küpürü / Hikaye Analizi ──
    if (templateId === 'READ_01_5N1K') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>
                        {applyDyslexiaSpacing(data.title, settings.b_d_spacing)}
                    </Text>
                    <Text style={[styles.articleBody, txtStyle]}>
                        {applyDyslexiaSpacing(data.content, settings.b_d_spacing)}
                    </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                    {data.questions?.map((q: any, i: number) => (
                        <View key={i} style={styles.questionRow} wrap={false}>
                            <Text style={styles.questionTypeBadge}>{q.type.toUpperCase()} ?</Text>
                            <Text style={[styles.questionText, txtStyle]}>
                                {i + 1}. {applyDyslexiaSpacing(q.question, settings.b_d_spacing)}
                            </Text>
                            {Array.from({ length: q.emptyLines || 2 }).map((_, j) => (
                                <View key={j} style={styles.answerLine} />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── READ_02: Venn Diyagramı ──
    if (templateId === 'READ_02_VENN') {
        return (
            <View>
                <Text style={[styles.articleBody, txtStyle, { marginBottom: 20 }]}>
                    {applyDyslexiaSpacing(data.text, settings.b_d_spacing)}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: 200, marginBottom: 20 }}>
                    <View style={{ flex: 1, borderWidth: 2, borderColor: '#3B82F6', borderRadius: 100, padding: 20, marginRight: -40, zIndex: 1, backgroundColor: 'rgba(59, 130, 246, 0.05)' }}>
                        <Text style={{ textAlign: 'center', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#1D4ED8', marginTop: 10 }}>
                            {data.conceptA}
                        </Text>
                    </View>
                    <View style={{ flex: 1, borderWidth: 2, borderColor: '#10B981', borderRadius: 100, padding: 20, marginLeft: -40, zIndex: 2, backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                        <Text style={{ textAlign: 'center', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, color: '#047857', marginTop: 10 }}>
                            {data.conceptB}
                        </Text>
                    </View>
                </View>
                {data.clues && data.clues.length > 0 && (
                    <View style={coreStyles.card}>
                        <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 8, fontFamily: 'Inter' }}>YUKARIDAKİ ŞEKLE YERLEŞTİRİLECEK ÖZELLİKLER</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {data.clues.map((c: string, i: number) => (
                                <View key={i} style={{ backgroundColor: '#F1F5F9', padding: 6, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' }}>
                                    <Text style={[txtStyle, { fontSize: Math.max(8, (txtStyle.fontSize || 12) - 2) }]}>
                                        {applyDyslexiaSpacing(c, settings.b_d_spacing)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    }

    // ── READ_03: Story Map (Hikaye Haritası) ──
    if (templateId === 'READ_03_STORY_MAP') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                    {[
                        { label: 'Kişiler', value: data.characters?.join(', ') },
                        { label: 'Yer / Zaman', value: data.setting },
                        { label: 'Problem', value: data.conflict },
                        { label: 'Çözüm', value: data.resolution },
                        { label: 'Ana Fikir / Mesaj', value: data.theme },
                    ].map((box, i) => (
                        <View key={i} style={{ flex: 1, minWidth: '45%', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, padding: 10, backgroundColor: '#FAFAFA' }}>
                            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#3B82F6', marginBottom: 4, textTransform: 'uppercase' }}>{box.label}</Text>
                            <Text style={[txtStyle, { fontSize: 10 }]}>{applyDyslexiaSpacing(box.value || '___', settings.b_d_spacing)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── READ_04: Çıkarım & Duygu Analizi ──
    if (templateId === 'READ_04_INFER_FEELING') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                {data.feelings && (
                    <View style={coreStyles.card}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#0F172A', marginBottom: 8 }}>DUYGULAR TABLOSU</Text>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableHeader}>Karakter</Text>
                            <Text style={styles.tableHeader}>Duygusu</Text>
                            <Text style={styles.tableHeader}>Kanıtı (Metinden)</Text>
                        </View>
                        {data.feelings.map((row: any, i: number) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={[styles.tableCell, txtStyle]}>{applyDyslexiaSpacing(row.character, settings.b_d_spacing)}</Text>
                                <Text style={[styles.tableCell, txtStyle]}>{applyDyslexiaSpacing(row.feeling, settings.b_d_spacing)}</Text>
                                <Text style={[styles.tableCell, txtStyle, { color: '#64748B' }]}>___________________________</Text>
                            </View>
                        ))}
                    </View>
                )}
                {data.inference && (
                    <View style={coreStyles.card}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#0F172A', marginBottom: 6 }}>ÇIKARIM SORUSU</Text>
                        <Text style={[txtStyle]}>{applyDyslexiaSpacing(data.inference, settings.b_d_spacing)}</Text>
                        {[1, 2, 3].map((_, i) => <View key={i} style={styles.writingLine} />)}
                    </View>
                )}
            </View>
        );
    }

    // ── READ_05: Neden–Sonuç Zinciri ──
    if (templateId === 'READ_05_CAUSE_EFFECT') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                {data.chain?.map((link: any, i: number) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }} wrap={false}>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#FBBF24', borderRadius: 6, padding: 10, backgroundColor: '#FFFBEB' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#D97706', marginBottom: 4, fontWeight: 700 }}>NEDEN</Text>
                            <Text style={[txtStyle, { fontSize: 10 }]}>{applyDyslexiaSpacing(link.cause, settings.b_d_spacing)}</Text>
                        </View>
                        <Text style={{ marginHorizontal: 8, fontSize: 18, color: '#94A3B8' }}>→</Text>
                        <View style={{ flex: 1, borderWidth: 1, borderColor: '#34D399', borderRadius: 6, padding: 10, backgroundColor: '#F0FDF4' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#047857', marginBottom: 4, fontWeight: 700 }}>SONUÇ</Text>
                            <Text style={[txtStyle, { fontSize: 10 }]}>{applyDyslexiaSpacing(link.effect, settings.b_d_spacing)}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── READ_06: Doğru–Yanlış Tablosu ──
    if (templateId === 'READ_06_TRUE_FALSE') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden', marginTop: 10 }}>
                    <View style={[styles.tableRow, { backgroundColor: '#F1F5F9' }]}>
                        <Text style={[styles.tableHeader, { flex: 4 }]}>İfade</Text>
                        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>D</Text>
                        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Y</Text>
                    </View>
                    {data.statements?.map((s: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.tableCell, txtStyle, { flex: 4 }]}>{i + 1}. {applyDyslexiaSpacing(s.statement, settings.b_d_spacing)}</Text>
                            <View style={[styles.tableCell, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#CBD5E1' }} />
                            </View>
                            <View style={[styles.tableCell, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                                <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#CBD5E1' }} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── READ_07: Başlık Bul ──
    if (templateId === 'READ_07_TITLE_FIND') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#64748B', marginBottom: 8 }}>📖 Aşağıdaki metni okuyun ve uygun başlık seçeneklerinden birini seçin:</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#0F172A', marginBottom: 10 }}>HANGİ BAŞLIK DAHA UYGUN?</Text>
                    {data.options?.map((opt: string, i: number) => (
                        <View key={i} style={styles.optionBubble}>
                            <View style={styles.optionLabel}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: '#475569' }}>{String.fromCharCode(65 + i)}</Text>
                            </View>
                            <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(opt, settings.b_d_spacing)}</Text>
                        </View>
                    ))}
                </View>
                {data.justification && (
                    <View style={coreStyles.card}>
                        <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#64748B', marginBottom: 6 }}>NEDEN? Metinden kanıt gösterin:</Text>
                        {[1, 2].map((_, i) => <View key={i} style={styles.writingLine} />)}
                    </View>
                )}
            </View>
        );
    }

    // ── READ_08: LGS Paragraf Sorusu ──
    if (templateId === 'READ_08_LGS_PARAGRAPH') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.passage, settings.b_d_spacing)}</Text>
                </View>
                {data.questions?.map((q: any, i: number) => (
                    <View key={i} style={{ marginBottom: 20 }} wrap={false}>
                        <Text style={[txtStyle, { fontWeight: 700, marginBottom: 8 }]}>{i + 1}. {applyDyslexiaSpacing(q.question, settings.b_d_spacing)}</Text>
                        {q.options?.map((opt: string, j: number) => (
                            <View key={j} style={styles.optionBubble}>
                                <View style={styles.optionLabel}>
                                    <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: '#475569' }}>{String.fromCharCode(65 + j)})</Text>
                                </View>
                                <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(opt, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    }

    // ── READ_09: Sıralama / Olay Örgüsü ──
    if (templateId === 'READ_09_SEQ_ORDER') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#0F172A', marginBottom: 8 }}>
                        OLAYLARI DOĞRU SIRAYA KOY (Kutuya numara yaz)
                    </Text>
                    {data.shuffledEvents?.map((event: string, i: number) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{ width: 28, height: 28, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 6, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'Inter' }}>#</Text>
                            </View>
                            <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(event, settings.b_d_spacing)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── READ_10: Kelime Anlam & Bağlam ──
    if (templateId === 'READ_10_VOCAB_CONTEXT') {
        return (
            <View>
                <View style={styles.articleBox}>
                    <Text style={styles.articleTitle}>{applyDyslexiaSpacing(data.title, settings.b_d_spacing)}</Text>
                    <Text style={[styles.articleBody, txtStyle]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#0F172A', marginBottom: 8 }}>
                        KALIN/ALTI ÇİZİLİ KELİMELERİN ANLAMLARI
                    </Text>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kelime</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Bağlam İpucu</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Anlamım</Text>
                    </View>
                    {data.vocabulary?.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.tableCell, txtStyle, { flex: 1, fontWeight: 700 }]}>{item.word}</Text>
                            <Text style={[styles.tableCell, { flex: 2, fontSize: 9, color: '#64748B', fontFamily: 'Inter' }]}>{item.contextClue}</Text>
                            <View style={[styles.tableCell, { flex: 2 }]}>
                                <View style={styles.writingLine} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // Varsayılan / Bulunamayan Format
    return (
        <View style={coreStyles.card}>
            <Text style={[txtStyle, { color: '#EF4444' }]}>
                PDF Render Hatası: {templateId} için uygun görselleştirici (renderer) bulunamadı.
            </Text>
        </View>
    );
};
