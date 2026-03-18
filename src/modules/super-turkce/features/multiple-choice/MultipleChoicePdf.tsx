import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';
import { useSuperTurkceStore } from '../../core/store';

const styles = StyleSheet.create({
    questionContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#ffffff'
    },
    questionText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        lineHeight: 1.6,
    },
    optionsContainerVertical: {
        flexDirection: 'column',
        gap: 8,
    },
    optionsContainerHorizontal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
    },
    optionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '45%', // Horizontal layout için
    },
    optionLetterBox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLetter: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    optionText: {
        fontSize: 11,
        color: '#334155'
    }
});

// Mock Data
const MOCK_QUESTIONS = [
    {
        id: 1,
        text: "1. Aşağıdaki cümlelerin hangisinde 'göz' kelimesi mecaz anlamda kullanılmıştır?",
        options: ["A) Gözüne toz kaçtığı için sürekli yaşarıyordu.", "B) Çocuğun gözlerinden uyku akıyordu.", "C) İğneyi deliğin gözünden tek seferde geçirdi.", "D) Bu işte kimin gözü varsa ortaya çıkacak."]
    },
    {
        id: 2,
        text: "2. 'Sıcak' kelimesi aşağıdaki cümlelerin hangisinde zıt anlamlısıyla birlikte KULLANILMAMIŞTIR?",
        options: ["A) Sıcak havalarda soğuk içecekler ferahlatır.", "B) Kalın giyin ki sıcaklayıp sonrasında üşütmeyesin.", "C) Dün çok sıcak olan çorba, bugün buz gibiydi.", "D) Bize çok sıcak davransa da içten içe mesafeliydi."]
    }
];

export const MultipleChoicePdf: React.FC = () => {
    // Gelecekte store'dan "LGS veya Normal", "Kolon Tipi" gibi spesifik ayarlar çekilecek.
    const { difficulty } = useSuperTurkceStore();

    // Eğer zorluk LGS ise yatay seçeneğe geç (örnek mantık)
    const isHorizontalLayout = difficulty === 'lgs';

    return (
        <A4PrintableSheet
            title="LGS DENEME ETKİNLİĞİ"
            subtitle="Çoktan Seçmeli Sorular"
        >
            {MOCK_QUESTIONS.map((q) => (
                <View key={q.id} style={styles.questionContainer} wrap={false}>
                    <Text style={styles.questionText}>{q.text}</Text>

                    <View style={isHorizontalLayout ? styles.optionsContainerHorizontal : styles.optionsContainerVertical}>
                        {q.options.map((opt, i) => {
                            // "A) Metin" gibi yapıyı "A" ve "Metin" olarak ayır
                            const letter = opt.substring(0, 1);
                            const text = opt.substring(3);
                            return (
                                <View key={i} style={isHorizontalLayout ? styles.optionBox : { flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={styles.optionLetterBox}>
                                        <Text style={styles.optionLetter}>{letter}</Text>
                                    </View>
                                    <Text style={styles.optionText}>{text}</Text>
                                </View>
                            )
                        })}
                    </View>
                </View>
            ))}
        </A4PrintableSheet>
    );
};
