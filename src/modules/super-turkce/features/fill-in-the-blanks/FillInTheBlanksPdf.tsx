import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';
// import { useSuperTurkceStore } from '../../core/store';

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    instructionText: {
        fontSize: 11,
        fontStyle: 'italic',
        color: '#64748b',
        marginBottom: 20,
        textAlign: 'center'
    },
    textParagraph: {
        fontSize: 13,
        lineHeight: 2, // Boşlukları doldurmak için rahat satır aralığı
        color: '#1e293b',
        textAlign: 'justify'
    },
    blankSpace: {
        width: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#475569',
        marginHorizontal: 4,
    },
    wordBankContainer: {
        marginTop: 40,
        padding: 15,
        borderRadius: 8,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#94a3b8',
        backgroundColor: '#f8fafc',
    },
    wordBankTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#64748b',
        textTransform: 'uppercase',
        marginBottom: 10,
        textAlign: 'center'
    },
    wordsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    wordPill: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 12,
    },
    wordText: {
        fontSize: 11,
        color: '#334155',
    }
});

// Mock Data
const MOCK_DATA = {
    textParts: [
        "Sonbahar gelince her yer",
        "yapraklarla doldu. Ağaçlar",
        "renge büründü. Rüzgar",
        "esmeye başlayınca çocuklar",
        "içeri kaçtılar."
    ],
    words: ["sarı", "soğuk", "hemen", "dökülen"]
};

export const FillInTheBlanksPdf: React.FC = () => {
    return (
        <A4PrintableSheet
            title="BOŞLUK DOLDURMA ETKİNLİĞİ"
            subtitle="Okuduğunu Anlama ve Sözcük Yerleştirme"
        >
            <View style={styles.container}>
                <Text style={styles.instructionText}>
                    Aşağıdaki metinde boş bırakılan yerleri, sayfanın altındaki kelime havuzundan uygun olanları seçerek tamamlayınız.
                </Text>

                {/* Paragraf ve Boşluklar */}
                <Text style={styles.textParagraph}>
                    {MOCK_DATA.textParts.map((part, index) => (
                        <React.Fragment key={index}>
                            <Text>{part}</Text>
                            {/* Son parça değilse boşluk çizgisi ekle */}
                            {index < MOCK_DATA.textParts.length - 1 && (
                                <Text>  ......................  </Text>
                            )}
                        </React.Fragment>
                    ))}
                </Text>

                {/* Kelime Havuzu */}
                <View style={styles.wordBankContainer} wrap={false}>
                    <Text style={styles.wordBankTitle}>Kelime Havuzu</Text>
                    <View style={styles.wordsGrid}>
                        {MOCK_DATA.words.map((w, i) => (
                            <View key={i} style={styles.wordPill}>
                                <Text style={styles.wordText}>{w}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </View>
        </A4PrintableSheet>
    );
};
