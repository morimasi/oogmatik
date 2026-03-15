import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';

// Gazete temalı özel CSS kuralları
const styles = StyleSheet.create({
    newspaperHeader: {
        borderBottomWidth: 4,
        borderBottomColor: '#1e293b',
        borderTopWidth: 1,
        borderTopColor: '#1e293b',
        paddingVertical: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    newspaperTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    newspaperDate: {
        fontSize: 8,
        fontStyle: 'italic',
        marginTop: 4,
    },
    articleBox: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    articleContent: {
        flex: 1,
    },
    mainText: {
        fontSize: 12,
        lineHeight: 1.6,
        textAlign: 'justify',
    },
    questionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15, // Grid gap
    },
    questionBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 0, // Gazete kutusu hissi için köşeli
        padding: 10,
        minHeight: 100,
        backgroundColor: '#fafafa',
    },
    questionTypeMarker: {
        fontSize: 11,
        fontWeight: 'bold',
        backgroundColor: '#1e293b',
        color: '#ffffff',
        padding: 4,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    answerLines: {
        flex: 1,
        borderBottomWidth: 1,
        borderBottomStyle: 'dashed',
        borderBottomColor: '#94a3b8',
        marginTop: 15,
    }
});

const MOCK_DATA = {
    headline: "OOGMATİK POSTASI",
    date: "Özgün Yayın - AI Üretimi",
    story: "Dün sabah saatlerinde, okyanusun derinliklerinde yeni bir denizanası türü keşfedildi. Bilim insanları, denizaltı araçlarıyla yaptıkları araştırmalarda, bu parlayan denizanasının daha önce hiçbir kitapta yer almadığını belirttiler. Ekip lideri Dr. Can, bu gelişmenin deniz biyolojisi için bir dönüm noktası olduğunu ifade etti.",
    questions: [
        { type: 'KİM?', text: "Bu araştırmayı kimler yapmıştır?" },
        { type: 'NE?', text: "Araştırma sonucunda ne keşfedilmiştir?" },
        { type: 'NEREDE?', text: "Bu keşif tam olarak nerede gerçekleşmiştir?" },
        { type: 'NE ZAMAN?', text: "Keşif ne zaman yapılmıştır?" },
        { type: 'NASIL?', text: "Bilim insanları bu keşfi nasıl başardılar?" },
        { type: 'NEDEN?', text: "Bu keşif neden önemli kabul ediliyor?" },
    ]
};

export const News5N1KPdf: React.FC = () => {
    return (
        <A4PrintableSheet
            title="5N1K HABER ANALİZİ"
            subtitle="Okuduğunu Anlama ve Yorumlama"
        >
            {/* Gazete Manşet Tasarımı */}
            <View style={styles.newspaperHeader}>
                <Text style={styles.newspaperTitle}>{MOCK_DATA.headline}</Text>
                <Text style={styles.newspaperDate}>{MOCK_DATA.date}</Text>
            </View>

            {/* Haber Metni Alanı */}
            <View style={styles.articleBox}>
                <View style={styles.articleContent}>
                    <Text style={styles.mainText}>{MOCK_DATA.story}</Text>
                </View>
            </View>

            {/* 5N1K Soru Kutuları (Gazete Sütunları Layout) */}
            <View style={styles.questionsGrid}>
                {MOCK_DATA.questions.map((q, i) => (
                    <View key={i} style={styles.questionBox}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Text style={styles.questionTypeMarker}>{q.type}</Text>
                        </View>
                        <Text style={{ fontSize: 10, color: '#475569' }}>{q.text}</Text>

                        {/* Cevap yazılması için 3 satırlık kılavuz çizgiler */}
                        <View style={styles.answerLines} />
                        <View style={styles.answerLines} />
                        <View style={styles.answerLines} />
                    </View>
                ))}
            </View>

        </A4PrintableSheet>
    );
};
