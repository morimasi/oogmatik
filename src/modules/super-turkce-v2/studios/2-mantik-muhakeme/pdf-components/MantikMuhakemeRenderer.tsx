import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { coreStyles } from '../../../shared/pdf/styles';
import { PrintSettings, getPdfTextStyles, applyDyslexiaSpacing } from '../../../core/store/print-settings';

const styles = StyleSheet.create({
    scenarioBox: {
        backgroundColor: '#F5F3FF',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#DDD6FE'
    },
    clueList: {
        marginTop: 14,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 6
    },
    clueItem: { flexDirection: 'row', marginBottom: 6 },
    clueBullet: { width: 15, fontFamily: 'Inter', fontWeight: 700, color: '#4C1D95' },
    gridContainer: { marginTop: 16, borderWidth: 1, borderColor: '#0F172A' },
    gridRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#94A3B8' },
    gridCellHeader: { flex: 1, padding: 8, backgroundColor: '#EDE9FE', borderRightWidth: 1, borderColor: '#94A3B8', textAlign: 'center', fontFamily: 'Inter', fontWeight: 700, fontSize: 10 },
    gridCell: { flex: 1, padding: 12, borderRightWidth: 1, borderColor: '#94A3B8' },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeader: { flex: 1, padding: 8, backgroundColor: '#EDE9FE', fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#4C1D95' },
    tableCell: { flex: 1, padding: 8, fontFamily: 'Inter', fontSize: 10, color: '#0F172A' },
    writingLine: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', marginVertical: 8, height: 20 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    errorWord: { backgroundColor: '#FEF2F2', padding: 4, borderRadius: 3, borderWidth: 1, borderColor: '#FCA5A5', color: '#B91C1C', fontFamily: 'Inter', fontWeight: 700 },
});

interface Props {
    data: any;
    templateId: string;
    settings: PrintSettings;
}

export const MantikMuhakemeRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const txtStyle = getPdfTextStyles(settings);

    // ── LOGIC_01: 4x4 Mantık Grid ──
    if (templateId === 'LOGIC_01_GRID') {
        return (
            <View>
                <View style={styles.scenarioBox}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#4C1D95', marginBottom: 6 }}>SENARYO</Text>
                    <Text style={[txtStyle]}>{applyDyslexiaSpacing(data.scenario, settings.b_d_spacing)}</Text>
                    <Text style={[txtStyle, { marginTop: 8, color: '#6B7280', fontSize: 10 }]}>
                        Kişiler / Varlıklar: {data.entities?.join(' • ')}
                    </Text>
                </View>
                <View style={styles.clueList}>
                    <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 8, fontFamily: 'Inter', fontWeight: 700 }}>KESİN İPUÇLARI</Text>
                    {data.clues?.map((c: string, i: number) => (
                        <View key={i} style={styles.clueItem} wrap={false}>
                            <Text style={styles.clueBullet}>{i + 1}.</Text>
                            <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(c, settings.b_d_spacing)}</Text>
                        </View>
                    ))}
                </View>
                <View style={styles.gridContainer} wrap={false}>
                    <View style={[styles.gridRow, { borderBottomColor: '#4C1D95', borderBottomWidth: 2 }]}>
                        <Text style={[styles.gridCellHeader, { fontSize: 9 }]}>KİŞİLER \ KATEGORİ</Text>
                        {data.categories?.map((c: any, i: number) => (
                            <Text key={i} style={[styles.gridCellHeader, i === data.categories.length - 1 ? { borderRightWidth: 0 } : {}]}>
                                {c.name?.toUpperCase()}
                            </Text>
                        ))}
                    </View>
                    {data.entities?.map((ent: string, rowIndex: number) => (
                        <View key={rowIndex} style={[styles.gridRow, rowIndex === data.entities.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                            <Text style={[txtStyle, styles.gridCell, { fontFamily: 'Inter', fontWeight: 700, backgroundColor: '#F5F3FF' }]}>{ent}</Text>
                            {data.categories?.map((_: any, colIndex: number) => (
                                <View key={colIndex} style={[styles.gridCell, colIndex === data.categories.length - 1 ? { borderRightWidth: 0 } : {}]} />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── LOGIC_02: Hata Bul ──
    if (templateId === 'LOGIC_02_FIND_ERROR') {
        return (
            <View>
                <View style={[styles.scenarioBox, { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' }]}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#C2410C', marginBottom: 6 }}>⚠️ HATALI YARGININ İÇEREN METIN</Text>
                    <Text style={[txtStyle, { lineHeight: 1.7 }]}>
                        {applyDyslexiaSpacing(data.textWithError || data.text || '', settings.b_d_spacing)}
                    </Text>
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#C2410C', marginBottom: 8 }}>HATALI CÜMLE / İFADE:</Text>
                    <View style={styles.writingLine} />
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#059669', marginTop: 12, marginBottom: 8 }}>DOĞRUSU / AÇIKLAMA:</Text>
                    <View style={styles.writingLine} />
                    <View style={styles.writingLine} />
                </View>
            </View>
        );
    }

    // ── LOGIC_03: Şifre Çözme ──
    if (templateId === 'LOGIC_03_CIPHER') {
        return (
            <View>
                <View style={styles.scenarioBox}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#4C1D95', marginBottom: 8 }}>ŞİFRE ANAHTARI</Text>
                    {data.cipherKey && (
                        <View style={{ borderWidth: 1, borderColor: '#DDD6FE', borderRadius: 6, overflow: 'hidden' }}>
                            <View style={styles.tableRow}>
                                <Text style={styles.tableHeader}>Şifreli</Text>
                                <Text style={styles.tableHeader}>Gerçek</Text>
                                <Text style={styles.tableHeader}>Şifreli</Text>
                                <Text style={styles.tableHeader}>Gerçek</Text>
                            </View>
                            {Object.entries(data.cipherKey || {}).slice(0, 13).map(([k, v], i) => (
                                <View key={i} style={styles.tableRow}>
                                    <Text style={[txtStyle, styles.tableCell, { fontFamily: 'Inter', fontWeight: 700, color: '#4C1D95' }]}>{k}</Text>
                                    <Text style={[txtStyle, styles.tableCell]}>{String(v)}</Text>
                                    <Text style={[txtStyle, styles.tableCell, { fontFamily: 'Inter', fontWeight: 700, color: '#4C1D95' }]}></Text>
                                    <Text style={[txtStyle, styles.tableCell]}></Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#0F172A', marginBottom: 8 }}>ŞİFRELİ MESAJ:</Text>
                    <Text style={[txtStyle, { letterSpacing: 2, fontSize: (txtStyle.fontSize || 12) + 2, color: '#4C1D95', fontFamily: 'Inter', fontWeight: 700 }]}>
                        {data.encodedMessage}
                    </Text>
                    <Text style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 10, color: '#059669', marginTop: 14, marginBottom: 6 }}>ÇÖZÜMÜNÜZ:</Text>
                    {[1, 2].map((_, i) => <View key={i} style={styles.writingLine} />)}
                </View>
            </View>
        );
    }

    // ── LOGIC_04: Koşullu Önermeler ──
    if (templateId === 'LOGIC_04_IF_THEN') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Verilen Eğer–O Zaman önermelerini okuyun ve soruları yanıtlayın:
                </Text>
                {(data.premises || []).map((p: string, i: number) => (
                    <View key={i} style={[styles.optionRow, { marginBottom: 8 }]}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#4C1D95', width: 70, fontWeight: 700 }}>Önerme {i + 1}:</Text>
                        <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(p, settings.b_d_spacing)}</Text>
                    </View>
                ))}
                <View style={coreStyles.card}>
                    {(data.questions || []).map((q: any, i: number) => (
                        <View key={i} style={{ marginBottom: 14 }} wrap={false}>
                            <Text style={[txtStyle, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 6 }]}>{i + 1}. {applyDyslexiaSpacing(q.question || q, settings.b_d_spacing)}</Text>
                            {q.options ? q.options.map((opt: string, j: number) => (
                                <View key={j} style={styles.optionRow}>
                                    <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#475569' }}>{String.fromCharCode(65 + j)}</Text>
                                    </View>
                                    <Text style={[txtStyle, { flex: 1 }]}>{opt}</Text>
                                </View>
                            )) : <View style={styles.writingLine} />}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── LOGIC_05: Kıyas (Syllogism) ──
    if (templateId === 'LOGIC_05_SYLLOGISM') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Öncülleri okuyun ve sonuçların doğru/yanlış olduğunu gerekçesiyle yazın:
                </Text>
                {(data.syllogisms || []).map((syl: any, i: number) => (
                    <View key={i} style={[coreStyles.card, { marginBottom: 14 }]} wrap={false}>
                        <View style={{ backgroundColor: '#EDE9FE', borderRadius: 6, padding: 8, marginBottom: 8 }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#4C1D95', fontWeight: 700, marginBottom: 4 }}>ÖNCÜLLER</Text>
                            {(syl.premises || []).map((p: string, j: number) => (
                                <Text key={j} style={[txtStyle, { marginBottom: 2 }]}>• {applyDyslexiaSpacing(p, settings.b_d_spacing)}</Text>
                            ))}
                        </View>
                        <Text style={[txtStyle, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 6 }]}>
                            Sonuç: "{applyDyslexiaSpacing(syl.conclusion, settings.b_d_spacing)}"
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
                            {['DOĞRU', 'YANLIŞ', 'BELİRSİZ'].map((opt) => (
                                <View key={opt} style={[styles.optionRow, { flex: 1 }]}>
                                    <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#CBD5E1', marginRight: 6 }} />
                                    <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700 }}>{opt}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 4 }}>Gerekçe:</Text>
                        <View style={styles.writingLine} />
                    </View>
                ))}
            </View>
        );
    }

    // ── LOGIC_06: Parçalı Hikaye ──
    if (templateId === 'LOGIC_06_FRACTURED_STORY') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Karışık olay cümlelerini doğru sıraya koyun (kutucuğa numara yazın):
                </Text>
                {(data.shuffledEvents || data.events || []).map((event: string, i: number) => (
                    <View key={i} style={[styles.optionRow, { marginBottom: 10 }]} wrap={false}>
                        <View style={{ width: 32, height: 32, borderWidth: 1.5, borderColor: '#4C1D95', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#A78BFA' }}>#</Text>
                        </View>
                        <Text style={[txtStyle, { flex: 1 }]}>{applyDyslexiaSpacing(event, settings.b_d_spacing)}</Text>
                    </View>
                ))}
                {data.comprehensionQuestion && (
                    <View style={coreStyles.card}>
                        <Text style={[txtStyle, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 8 }]}>
                            Anlama Sorusu: {applyDyslexiaSpacing(data.comprehensionQuestion, settings.b_d_spacing)}
                        </Text>
                        <View style={styles.writingLine} />
                        <View style={styles.writingLine} />
                    </View>
                )}
            </View>
        );
    }

    // ── LOGIC_07: Hangisi Farklı ──
    if (templateId === 'LOGIC_07_ODD_ONE_OUT') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her grupta hangi öğe farklıdır? Neden farklı olduğunu da yazın:
                </Text>
                {(data.groups || []).map((group: any, i: number) => (
                    <View key={i} style={[coreStyles.card, { marginBottom: 12 }]} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#4C1D95', fontWeight: 700, marginBottom: 8 }}>GRUP {i + 1}</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                            {(group.items || []).map((item: string, j: number) => (
                                <View key={j} style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1.5, borderColor: '#DDD6FE', borderRadius: 20, backgroundColor: '#F5F3FF' }}>
                                    <Text style={[txtStyle, { fontSize: 11 }]}>{item}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', width: 100 }}>Farklı olan:</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', width: 100 }}>Neden?</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── LOGIC_08: Bilmece ──
    if (templateId === 'LOGIC_08_RIDDLE_ME_THIS') {
        return (
            <View>
                {(data.riddles || []).map((riddle: any, i: number) => (
                    <View key={i} style={[styles.scenarioBox, { marginBottom: 16 }]} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#4C1D95', fontWeight: 700, marginBottom: 6 }}>
                            BİLMECE {i + 1}
                        </Text>
                        <Text style={[txtStyle, { lineHeight: 1.8, fontStyle: 'italic', marginBottom: 10 }]}>
                            {applyDyslexiaSpacing(riddle.riddle || riddle.text || '', settings.b_d_spacing)}
                        </Text>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 4 }}>Cevabım:</Text>
                        <View style={{ borderBottomWidth: 1.5, borderBottomColor: '#4C1D95', marginBottom: 8 }} />
                        {riddle.hint && (
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#A78BFA', marginTop: 4 }}>
                                İpucu: {riddle.hint}
                            </Text>
                        )}
                    </View>
                ))}
            </View>
        );
    }

    // ── LOGIC_09: Görsel Matematik / Denklem ──
    if (templateId === 'LOGIC_09_VISUAL_MATH') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her sembole karşılık gelen değeri bulun:
                </Text>
                {(data.equations || []).map((eq: any, i: number) => (
                    <View key={i} style={[styles.optionRow, { marginBottom: 10 }]} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 11, color: '#4C1D95', fontWeight: 700, width: 30 }}>{i + 1}.</Text>
                        <Text style={[txtStyle, { flex: 1, fontSize: (txtStyle.fontSize || 12) + 1 }]}>
                            {applyDyslexiaSpacing(eq.equation || eq, settings.b_d_spacing)}
                        </Text>
                        <View style={{ width: 60, borderBottomWidth: 1.5, borderBottomColor: '#4C1D95' }} />
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginLeft: 4 }}>= ?</Text>
                    </View>
                ))}
            </View>
        );
    }

    // ── LOGIC_10: Yön / Sıra / Hareket ──
    if (templateId === 'LOGIC_10_DIRECTIONAL') {
        return (
            <View>
                <View style={styles.scenarioBox}>
                    <Text style={[txtStyle, { lineHeight: 1.7 }]}>
                        {applyDyslexiaSpacing(data.scenario || data.description || '', settings.b_d_spacing)}
                    </Text>
                </View>
                {(data.questions || []).map((q: any, i: number) => (
                    <View key={i} style={{ marginBottom: 14 }} wrap={false}>
                        <Text style={[txtStyle, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 8 }]}>
                            {i + 1}. {applyDyslexiaSpacing(q.question || q, settings.b_d_spacing)}
                        </Text>
                        {q.options ? q.options.map((opt: string, j: number) => (
                            <View key={j} style={styles.optionRow}>
                                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
                                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#475569' }}>{String.fromCharCode(65 + j)}</Text>
                                </View>
                                <Text style={[txtStyle, { flex: 1 }]}>{opt}</Text>
                            </View>
                        )) : <><View style={styles.writingLine} /><View style={styles.writingLine} /></>}
                    </View>
                ))}
            </View>
        );
    }

    // Varsayılan
    return (
        <View style={coreStyles.card}>
            <Text style={[txtStyle, { color: '#EF4444' }]}>
                PDF Render: {templateId} için görselleştirici bulunamadı (Mantık Muhakeme).
            </Text>
        </View>
    );
};
