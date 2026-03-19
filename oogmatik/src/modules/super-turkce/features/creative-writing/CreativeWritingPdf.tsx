import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';
import { useSuperTurkceStore } from '../../core/store';

// Yaratıcı Yazarlık için Geniş Satırlı A4 Dizaynı
const styles = StyleSheet.create({
    topSection: {
        height: 250,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginBottom: 30,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    },
    aiPromptText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#334155',
        textAlign: 'center',
        lineHeight: 1.6,
        zIndex: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 15,
        borderRadius: 8,
    },
    imagePlaceholder: {
        position: 'absolute',
        opacity: 0.1,
        fontSize: 80,
        color: '#64748b'
    },
    linesContainer: {
        flex: 1,
        gap: 32, // Satır arası el yazısı boşluğu 
        paddingTop: 10,
    },
    writingLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#94a3b8',
        width: '100%',
    }
});

const MOCK_DATA = {
    starterPrompt: "\"Derin ormanın kalbinde saklı, yalnızca dolunay geceleri ortaya çıkan efsanevi mavi tapınağın kapısında duruyordu. Elindeki harita aniden parlamaya başladığında, içeriden gelen fısıltılar duydu...\"\n\nHikayeyi bu cümleden itibaren hayal gücünü kullanarak sen tamamla."
};

export const CreativeWritingPdf: React.FC = () => {
    const { includeIllustration } = useSuperTurkceStore();
    // 10 boş satır üretmek için yardımcı dizi
    const lines = Array.from({ length: 15 });

    return (
        <A4PrintableSheet
            title="YARATICI YAZARLIK ATÖLYESİ"
            subtitle="Hayal Gücünü Kağıda Dök"
        >
            {/* Üst Alan: AI Görseli (Placeholder) ve Başlangıç Cümlesi */}
            <View style={styles.topSection}>
                {includeIllustration && (
                    <Text style={styles.imagePlaceholder}>🖼️</Text>
                )}
                <Text style={styles.aiPromptText}>{MOCK_DATA.starterPrompt}</Text>
            </View>

            {/* Alt Alan: Defter Çizgisi Formatlı Boş Sayfa */}
            <View style={styles.linesContainer}>
                {lines.map((_, i) => (
                    <View key={i} style={styles.writingLine} />
                ))}
            </View>
        </A4PrintableSheet>
    );
};
