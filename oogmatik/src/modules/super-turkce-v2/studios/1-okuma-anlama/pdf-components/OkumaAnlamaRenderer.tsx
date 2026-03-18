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
    }
});

interface Props {
    data: any;
    templateId: string;
    settings: PrintSettings;
}

export const OkumaAnlamaRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const txtStyle = getPdfTextStyles(settings);

    // Tema 1: 5N1K Haber Küpürü / Hikaye Analizi
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
                            {/* Çocuğun yazması için dinamik boşluk çizgileri */}
                            {Array.from({ length: q.emptyLines || 2 }).map((_, j) => (
                                <View key={j} style={styles.answerLine} />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // Tema 2: Venn Diyagramı (Mock Layout)
    if (templateId === 'READ_02_VENN') {
        return (
            <View>
                <Text style={[styles.articleBody, txtStyle, { marginBottom: 20 }]}>
                    {applyDyslexiaSpacing(data.text, settings.b_d_spacing)}
                </Text>

                {/* Kesit alanı için kutular  */}
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

    // Varsayılan / Bulunamayan Format
    return (
        <View style={coreStyles.card}>
            <Text style={[txtStyle, { color: '#EF4444' }]}>
                PDF Render Hatası: {templateId} için uygun görselleştirici (renderer) bulunamadı.
            </Text>
        </View>
    );
};
