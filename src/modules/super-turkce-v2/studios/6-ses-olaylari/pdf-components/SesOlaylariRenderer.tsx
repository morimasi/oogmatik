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
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeader: { flex: 1, padding: 8, backgroundColor: '#F0F9FF', fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#0369A1' },
    tableCell: { flex: 1, padding: 8, fontFamily: 'Inter', fontSize: 10, color: '#0F172A' },
    writingLine: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', marginVertical: 8, height: 20 },
    phoneticsBox: { backgroundColor: '#F0F9FF', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#BAE6FD', marginBottom: 14 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    redCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
});

export const SesOlaylariRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    // ── PHONO_01: Ünlü Düşmesi ──
    if (templateId === 'PHONO_01_SOUND_DROP') {
        const words: any[] = data.words || [];
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Düşen ünlü harfi kırmızı daireye yazın:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kök</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Ek</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Sonuç</Text>
                        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Düşen Ses</Text>
                    </View>
                    {words.map((w: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{w.root}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 1, color: '#64748B' }]}>+ {w.suffix}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 1, color: '#059669', fontFamily: 'Inter', fontWeight: 700 }]}>= {w.result}</Text>
                            <View style={[styles.tableCell, { flex: 1, alignItems: 'center', justifyContent: 'center' }]}>
                                <View style={styles.redCircle} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── PHONO_02: Sertleşme / Yumuşama ──
    if (templateId === 'PHONO_02_HARDENING_SOFTENING') {
        return (
            <View>
                <View style={[coreStyles.card, { marginBottom: 16 }]}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 6 }}>Metni okuyun, ses olaylarını tabloya yazın:</Text>
                    <Text style={[ts, { lineHeight: 1.7 }]}>{applyDyslexiaSpacing(data.text, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kelime</Text>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Ses Olayı</Text>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Değişim (? → ?)</Text>
                    </View>
                    {(data.events || []).map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 1.5 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 1.5 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── PHONO_03: Hece Bölme ──
    if (templateId === 'PHONO_03_SYLLABLE_SPLIT') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Kelimeleri hecelerine bölün ve hece sayısını yazın:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kelime</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Heceler (tire ile)</Text>
                        <Text style={[styles.tableHeader, { flex: 0.8, textAlign: 'center' }]}>Hece Sayısı</Text>
                    </View>
                    {(data.words || []).map((w: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{w.word}</Text>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 0.8, alignItems: 'center' }]}>
                                <View style={{ width: 30, height: 30, borderWidth: 1.5, borderColor: '#0369A1', borderRadius: 15 }} />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── PHONO_04: Ünlü Uyumu ──
    if (templateId === 'PHONO_04_VOWEL_HARMONY') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her kelime için ünlü uyumuna uyup uymadığını (✓/✗) işaretleyin:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Kelime</Text>
                        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Büyük Ünlü Uyumu</Text>
                        <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>Küçük Ünlü Uyumu</Text>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Not</Text>
                    </View>
                    {(data.words || []).map((w: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1, fontFamily: 'Inter', fontWeight: 700 }]}>{w.word}</Text>
                            <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#CBD5E1' }} />
                            </View>
                            <View style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}>
                                <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: '#CBD5E1' }} />
                            </View>
                            <View style={[styles.tableCell, { flex: 1.5 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── PHONO_05: Ünsüz Yumuşama Zinciri ──
    if (templateId === 'PHONO_05_CONSONANT_CLUSTER') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Adım adım dönüşümü izleyin ve son halini yazın:
                </Text>
                {(data.chains || []).map((chain: any, i: number) => (
                    <View key={i} style={[styles.phoneticsBox, { flexDirection: 'row', alignItems: 'center', gap: 8 }]} wrap={false}>
                        <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, minWidth: 60 }]}>{chain.baseWord}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>+</Text>
                        <Text style={[ts, { color: '#0369A1', minWidth: 30 }]}>{chain.suffix}</Text>
                        <Text style={{ color: '#94A3B8', fontSize: 14 }}>→</Text>
                        <View style={{ flex: 1, borderBottomWidth: 1.5, borderBottomColor: '#0369A1' }} />
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', minWidth: 100 }}>{chain.rule}</Text>
                    </View>
                ))}
            </View>
        );
    }

    // ── PHONO_06: Vurgu ──
    if (templateId === 'PHONO_06_STRESS_PATTERN') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Her kelimede hangi hece vurgulu? İşaretleyin:
                </Text>
                {(data.words || []).map((w: any, i: number) => (
                    <View key={i} style={[styles.phoneticsBox, { marginBottom: 10 }]} wrap={false}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 6 }}>
                            {i + 1}. {w.word}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                            {(w.syllables || []).map((syl: string, j: number) => (
                                <View key={j} style={{ paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1.5, borderColor: '#0369A1', borderRadius: 6, alignItems: 'center' }}>
                                    <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700 }]}>{syl}</Text>
                                </View>
                            ))}
                        </View>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8' }}>Kural: {w.rule}</Text>
                    </View>
                ))}
            </View>
        );
    }

    // ── PHONO_08: Ses Olayları Haritası (Genel Tekrar) ──
    if (templateId === 'PHONO_08_SOUND_MAP') {
        return (
            <View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Ses Olayı</Text>
                        <Text style={[styles.tableHeader, { flex: 2.5 }]}>Tanım</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Örnekler</Text>
                    </View>
                    {(data.events || []).map((event: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[ts, styles.tableCell, { flex: 1.5, fontFamily: 'Inter', fontWeight: 700, color: '#0369A1' }]}>{event.eventName}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 2.5, fontSize: 9 }]}>{applyDyslexiaSpacing(event.shortDefinition, settings.b_d_spacing)}</Text>
                            <Text style={[ts, styles.tableCell, { flex: 2, fontSize: 9, color: '#059669' }]}>{(event.examples || []).join(' | ')}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── PHONO_09: Ses Farkındalığı Şiiri ──
    if (templateId === 'PHONO_09_RHYTHM_POEM') {
        return (
            <View>
                <View style={[coreStyles.card, { marginBottom: 16 }]}>
                    <Text style={[ts, { lineHeight: 2, fontStyle: 'italic' }]}>{applyDyslexiaSpacing(data.poem, settings.b_d_spacing)}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                    <View style={styles.phoneticsBox}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#0369A1', fontWeight: 700, marginBottom: 4 }}>Uyak Şeması</Text>
                        <Text style={[ts]}>{data.rhymeScheme}</Text>
                    </View>
                    <View style={styles.phoneticsBox}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#0369A1', fontWeight: 700, marginBottom: 4 }}>Ses Örüntüleri</Text>
                        {(data.soundPatterns || []).map((p: any, i: number) => (
                            <Text key={i} style={[ts, { fontSize: 9, marginBottom: 4 }]}>• {p.patternName}: {p.example}</Text>
                        ))}
                    </View>
                </View>
                {(data.questions || []).map((q: string, i: number) => (
                    <View key={i} style={{ marginBottom: 10 }}>
                        <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 4 }]}>{i + 1}. {applyDyslexiaSpacing(q, settings.b_d_spacing)}</Text>
                        <View style={styles.writingLine} />
                        <View style={styles.writingLine} />
                    </View>
                ))}
            </View>
        );
    }

    // ── PHONO_10: LGS Ses Bilgisi Testi ──
    if (templateId === 'PHONO_10_LGS_SOUND_TEST') {
        return (
            <View>
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

    // Genel Fallback
    return (
        <View style={coreStyles.card}>
            <Text style={[ts, { color: '#EF4444' }]}>PDF Render: {templateId} için görünüm bulunamadı.</Text>
        </View>
    );
};
