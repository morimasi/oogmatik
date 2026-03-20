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
    errorBox: {
        padding: 15,
        backgroundColor: '#FEF2F2',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#EF4444',
        borderRadius: 8,
        marginBottom: 18,
    },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    tableHeader: { flex: 1, padding: 8, backgroundColor: '#FEE2E2', fontFamily: 'Inter', fontWeight: 700, fontSize: 9, color: '#B91C1C' },
    tableCell: { flex: 1, padding: 8, fontFamily: 'Inter', fontSize: 10, color: '#0F172A' },
    writingLine: { borderBottomWidth: 1, borderBottomColor: '#CBD5E1', marginVertical: 8, height: 20 },
    optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
    infoCard: { backgroundColor: '#F8FAFC', borderRadius: 6, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
});

export const YazimNoktalamaRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    // ── ORTHO_01: Metin Doktoru ──
    if (templateId === 'ORTHO_01_DOCTOR') {
        const corrections: any[] = data.corrections || [];
        return (
            <View>
                <View style={styles.errorBox}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#EF4444', marginBottom: 6, fontWeight: 700 }}>
                        🔴 BU METİN HASTA! Yazım yanlışlarını bulup altını çizin:
                    </Text>
                    <Text style={[ts, { lineHeight: 1.8 }]}>
                        {applyDyslexiaSpacing(data.textWithErrors || '', settings.b_d_spacing)}
                    </Text>
                </View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 10 }}>
                    Bulduğunuz hataları aşağıya yazın:
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 0.3, textAlign: 'center' }]}>#</Text>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Yanlış Yazım</Text>
                        <Text style={[styles.tableHeader, { flex: 1.5 }]}>Doğrusu</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Kural</Text>
                    </View>
                    {corrections.map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 0.3, textAlign: 'center', fontFamily: 'Inter', fontWeight: 700 }]}>{i + 1}</Text>
                            <View style={[styles.tableCell, { flex: 1.5 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 1.5 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── ORTHO_02: Kayıp Noktalama Yapbozu ──
    if (templateId === 'ORTHO_02_PUNCTUATION_PUZZLE') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Parantezlere uygun noktalama işaretini yazın (. , ; : ! ? " ' - …):
                </Text>
                <View style={styles.infoCard}>
                    <Text style={[ts, { lineHeight: 2 }]}>
                        {applyDyslexiaSpacing(data.textWithBlanks || '', settings.b_d_spacing)}
                    </Text>
                </View>
                <View style={coreStyles.card}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', marginBottom: 6 }}>CEVAP ANAHTARIM:</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {(data.answers || []).map((_: string, i: number) => (
                            <View key={i} style={{ width: 36, height: 36, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8' }}>{i + 1}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    }

    // ── ORTHO_03: Kesme İşareti Ustası ──
    if (templateId === 'ORTHO_03_APOSTROPHE') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 10 }}>
                    Aşağıdaki cümlelere kesme işaretini doğru yere ekleyin:
                </Text>
                {(data.exercises || []).map((ex: any, i: number) => (
                    <View key={i} style={[styles.infoCard, { marginBottom: 12 }]} wrap={false}>
                        <Text style={[ts, { marginBottom: 8 }]}>
                            {i + 1}. {applyDyslexiaSpacing(ex.rawSentence, settings.b_d_spacing)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', width: 70 }}>Doğrusu:</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── ORTHO_04: de/da, ki, mi Seçimi ──
    if (templateId === 'ORTHO_04_DE_DA_KI') {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 10 }}>
                    Boşluklara doğru yazım şeklini (bitişik/ayrı) yazın:
                </Text>
                {(data.items || []).map((item: any, i: number) => (
                    <View key={i} style={[styles.infoCard, { marginBottom: 10 }]} wrap={false}>
                        <Text style={[ts, { marginBottom: 6 }]}>
                            {i + 1}. {applyDyslexiaSpacing(item.sentence || '', settings.b_d_spacing)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B' }}>Cevabım:</Text>
                            <View style={{ width: 80, borderBottomWidth: 1, borderBottomColor: '#94A3B8' }} />
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#94A3B8' }}>Kural:</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // ── ORTHO_05: Büyük Harf Kural Avı ──
    if (templateId === 'ORTHO_05_CAPITAL_LETTERS') {
        return (
            <View>
                <View style={styles.errorBox}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#EF4444', marginBottom: 6, fontWeight: 700 }}>
                        🔡 Büyük harf hataları olan metni inceleyin:
                    </Text>
                    <Text style={[ts, { lineHeight: 1.8 }]}>
                        {applyDyslexiaSpacing(data.textWithErrors || '', settings.b_d_spacing)}
                    </Text>
                </View>
                <View style={{ borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Yanlış</Text>
                        <Text style={[styles.tableHeader, { flex: 1 }]}>Doğrusu</Text>
                        <Text style={[styles.tableHeader, { flex: 2 }]}>Kural</Text>
                    </View>
                    {(data.corrections || []).map((_: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 1 }]}><View style={styles.writingLine} /></View>
                            <View style={[styles.tableCell, { flex: 2 }]}><View style={styles.writingLine} /></View>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // ── ORTHO_06–10: Diğer Yazım Şablonları ──
    // Genel amaçlı görünüm
    const exercises: any[] = data.exercises || data.items || data.words || [];
    if (exercises.length > 0) {
        return (
            <View>
                <Text style={{ fontFamily: 'Inter', fontSize: 10, color: '#475569', marginBottom: 12 }}>
                    Aşağıdaki egzersizleri tamamlayın:
                </Text>
                {exercises.map((ex: any, i: number) => (
                    <View key={i} style={[styles.infoCard, { marginBottom: 12 }]} wrap={false}>
                        <Text style={[ts, { fontFamily: 'Inter', fontWeight: 700, marginBottom: 6 }]}>
                            {i + 1}. {applyDyslexiaSpacing(ex.incorrect || ex.rawForm || ex.word || ex.sentence || '', settings.b_d_spacing)}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: '#64748B', width: 80 }}>Doğrusu:</Text>
                            <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#CBD5E1' }} />
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Genel fallback
    return (
        <View style={coreStyles.card}>
            <Text style={[ts, { color: '#EF4444' }]}>
                PDF Render Hatası: {templateId} için görselleştirici bulunamadı.
            </Text>
        </View>
    );
};
