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
    idiomBox: { padding: 14, backgroundColor: '#FAF5FF', borderLeftWidth: 4, borderLeftColor: '#A855F7', borderRadius: 8, marginBottom: 14, borderWidth: 1, borderColor: '#E9D5FF' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeader: { flex: 1, padding: 8, backgroundColor: '#FAF5FF', fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#7C3AED' },
    tableCell: { flex: 1, padding: 8, fontFamily: 'Inter', fontSize: 10, color: '#0F172A' },
    writingLine: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', marginVertical: 8, height: 20 },
    halfBox: { flex: 1, padding: 10, borderWidth: 1, borderColor: '#E9D5FF', borderRadius: 8, backgroundColor: '#FFFFFF', marginHorizontal: 4 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
});

export const DeyimlerAtasozleriRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    // ── IDIOM_01: Görselden Deyim ──
    if (templateId === 'IDIOM_01_MATCH_PICTURE') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her sahne tasvirini okuyun ve hangi deyimi anlattığını bulun:
                </Text>
                {(data.items || []).map((item: any, i: number) => (
                    <View key={i} style={styles.idiomBox} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#7C3AED', marginBottom: 4, fontWeight: 700 }}>SAHNE {i + 1}</Text>
                        <Text style={[ts, { marginBottom: 8, fontStyle: 'italic' }]}>
                            {applyDyslexiaSpacing(item.visualDescription, settings.b_d_spacing)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#6B7280', width: 100 }}>Bu deyim hangisi?</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#A855F7' }} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── PROVERB_02 / IDIOM_01_HALF (Atasözü Tamamlama) ──
    if (templateId === 'PROVERB_02_FILL_BLANK') {
        const proverbs: any[] = data.proverbs || [];
        // İkinci yarıları karıştırarak iki sütun göster
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Sol sütundaki atasözü başlangıçlarını, sağ sütundaki devamlarıyla eşleştirin:
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* Sol: İlk yarılar */}
                    <View style={{ flex: 1 }}>
                        {proverbs.map((p: any, i: number) => (
                            <View key={i} style={[styles.halfBox, { marginBottom: 10 }]}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#6B7280', marginBottom: 4 }}>{i + 1}.</Text>
                                <Text style={[ts]}>{applyDyslexiaSpacing(p.firstHalf, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                    {/* Sağ: İkinci yarılar (karıştırılmış sıra) */}
                    <View style={{ flex: 1 }}>
                        {[...proverbs].reverse().map((p: any, i: number) => (
                            <View key={i} style={[styles.halfBox, { marginBottom: 10 }]}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#6B7280', marginBottom: 4 }}>{String.fromCharCode(65 + i)}.</Text>
                                <Text style={[ts]}>{applyDyslexiaSpacing(p.secondHalf, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    // ── IDIOM_03: Bağlama Uygun Deyim ──
    if (templateId === 'IDIOM_03_CONTEXT_MATCH') {
        return (
            <View>
                {(data.questions || []).map((q: any, i: number) => (
                    <View key={i} style={[coreStyles.card, { marginBottom: 14 }]} wrap={false}>
                        <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 8 }]}>
                            {i + 1}. {applyDyslexiaSpacing(q.situation, settings.b_d_spacing)}
                        </Text>
                        {(q.options || []).map((opt: string, j: number) => (
                            <View key={j} style={styles.optionRow}>
                                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: '#475569' }}>{String.fromCharCode(65 + j)}</Text>
                                </View>
                                <Text style={[ts, { flex: 1 }]}>{applyDyslexiaSpacing(opt, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    }

    // ── IDIOM_04: Anlam Kartı Eşleştirme ──
    if (templateId === 'IDIOM_04_MEANING_CARD') {
        const pairs: any[] = data.pairs || [];
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Deyimleri anlamlarıyla eşleştirin (numara ile harf eşleştirir):
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        {pairs.map((p: any, i: number) => (
                            <View key={i} style={[styles.idiomBox, { marginBottom: 8 }]}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#7C3AED', fontWeight: 700, marginBottom: 4 }}>{i + 1}.</Text>
                                <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700 }]}>{applyDyslexiaSpacing(p.idiom, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={{ flex: 1 }}>
                        {[...pairs].reverse().map((p: any, i: number) => (
                            <View key={i} style={[coreStyles.card, { marginBottom: 8 }]}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', fontWeight: 700, marginBottom: 4 }}>{String.fromCharCode(65 + i)}.</Text>
                                <Text style={[ts, { fontSize: 10 }]}>{applyDyslexiaSpacing(p.meaning, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    // ── IDIOM_05: Metindeki Deyim Dedektifi ──
    if (templateId === 'IDIOM_05_STORY_DETECTIVE') {
        return (
            <View>
                <View style={[coreStyles.card, { marginBottom: 16 }]}>
                    <Text style={[ts, { lineHeight: 1.7 }]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 8 }}>
                    Metindeki deyimleri bulup anlamlarını yazın:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Deyim</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Metindeki Cümle</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Anlamı</Text>
                    </View>
                    {(data.hiddenIdioms || []).map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── IDIOM_07: Deyimle Cümle Kurma ──
    if (templateId === 'IDIOM_07_SENTENCE_CREATION') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her deyimi kullanarak anlamlı bir cümle kurun:
                </Text>
                {(data.idioms || []).map((item: any, i: number) => (
                    <View key={i} style={[styles.idiomBox, { marginBottom: 14 }]} wrap={false}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#6D28D9', marginRight: 8 }}>{applyDyslexiaSpacing(item.idiom, settings.b_d_spacing)}</Text>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#9CA3AF' }}>({item.meaning})</Text>
                        </View>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#6B7280', marginBottom: 6 }}>Cümlenizi yazın:</Text>
                        <View style={styles.writingLine} />
                    </View>
                ))}
            </View>
        );
    }

    // ── IDIOM_09: Vücut Deyimleri ──
    if (templateId === 'IDIOM_09_BODY_IDIOMS') {
        return (
            <View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Organ</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Deyim</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Anlamı</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Örnek Cümle</Text>
                    </View>
                    {(data.bodyIdioms || []).map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{item.bodyPart}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 2, color: '#6D28D9' }]}>{applyDyslexiaSpacing(item.idiom, settings.b_d_spacing)}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 2, fontSize: 9 }]}>{item.meaning}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 2, fontSize: 9, color: '#64748B' }]}>{applyDyslexiaSpacing(item.exampleSentence, settings.b_d_spacing)}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── IDIOM_10: LGS Tarzı Test ──
    if (templateId === 'IDIOM_10_PROVERB_QUIZ') {
        return (
            <View>
                <View style={[coreStyles.card, { marginBottom: 16 }]}>
                    <Text style={[ts, { lineHeight: 1.7 }]}>{applyDyslexiaSpacing(data.passage, settings.b_d_spacing)}</Text>
                </View>
                {(data.questions || []).map((q: any, i: number) => (
                    <View key={i} style={{ marginBottom: 18 }} wrap={false}>
                        <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 8 }]}>{i + 1}. {applyDyslexiaSpacing(q.question, settings.b_d_spacing)}</Text>
                        {(q.options || []).map((opt: string, j: number) => (
                            <View key={j} style={styles.optionRow}>
                                <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: '#475569' }}>{String.fromCharCode(65 + j)}</Text>
                                </View>
                                <Text style={[ts, { flex: 1 }]}>{applyDyslexiaSpacing(opt, settings.b_d_spacing)}</Text>
                            </View>
                        ))}
                    </View>
                ))}
            </View>
        );
    }

    // Genel görünüm (kalan şablonlar için)
    const generalItems: any[] = data.items || data.debates || data.stories || data.proverbs || [];
    return (
        <View>
            {generalItems.map((item: any, i: number) => (
                <View key={i} style={[styles.idiomBox, { marginBottom: 12 }]} wrap={false}>
                    <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 6 }]}>
                        {applyDyslexiaSpacing(item.idiom || item.proverb || item.proverb1 || `Madde ${i + 1}`, settings.b_d_spacing)}
                    </Text>
                    {item.firstHalf && (
                        <Text style={[ts, { color: '#64748B' }]}>{applyDyslexiaSpacing(item.firstHalf, settings.b_d_spacing)}</Text>
                    )}
                    {item.visualDescription && (
                        <Text style={[ts, { fontStyle: 'italic', color: '#475569' }]}>{applyDyslexiaSpacing(item.visualDescription, settings.b_d_spacing)}</Text>
                    )}
                    {item.meaning && (
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#6D28D9', marginTop: 4 }}>{item.meaning}</Text>
                    )}
                    <View style={styles.writingLine} />
                </View>
            ))}
            {generalItems.length === 0 && (
                <View style={coreStyles.card}>
                    <Text style={[ts, { color: '#EF4444' }]}>PDF Render: {templateId} için görünüm bulunamadı.</Text>
                </View>
            )}
        </View>
    );
};
