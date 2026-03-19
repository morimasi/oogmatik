import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';
import { useSuperTurkceStore } from '../../core/store';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
    },
    column: {
        width: '40%',
        flexDirection: 'column',
        gap: 25,
    },
    itemBox: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        position: 'relative',
        minHeight: 50,
        justifyContent: 'center',
    },
    text: {
        fontSize: 12,
        textAlign: 'center',
    },
    // Disleksi hedef kitleye özel nokta büyüklükleri
    dotLeft: {
        position: 'absolute',
        right: -25,
        top: '50%',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#475569',
        transform: 'translateY(-5px)',
    },
    dotRight: {
        position: 'absolute',
        left: -25,
        top: '50%',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#475569',
        transform: 'translateY(-5px)',
    },
    dotLarge: {
        width: 16,
        height: 16,
        borderRadius: 8,
        transform: 'translateY(-8px)',
    }
});

interface MatchingLinesPdfProps {
    title?: string;
    subtitle?: string;
    data?: {
        leftItems: string[];
        rightItems: string[];
    };
}

export const MatchingLinesPdf: React.FC<MatchingLinesPdfProps> = ({
    title = "EŞLEŞTİRME ETKİNLİĞİ",
    subtitle = "Aşağıdaki eş anlamlı kelimeleri çizgilerle eşleştiriniz.",
    data
}) => {
    const { audience } = useSuperTurkceStore();
    const isDyslexic = audience === 'hafif_disleksi' || audience === 'derin_disleksi';

    // Fallback Mock Data as Default
    const activeData = data || {
        leftItems: ['İhtiyar', 'Talebe', 'Muallim', 'Mektep'],
        rightItems: ['Okul', 'Öğretmen', 'Öğrenci', 'Yaşlı']
    };

    return (
        <A4PrintableSheet
            title={title}
            subtitle={subtitle}
        >
            <View style={styles.container}>
                {/* Sol Sütun */}
                <View style={styles.column}>
                    {activeData.leftItems.map((item, index) => (
                        <View key={`left-${index}`} style={styles.itemBox}>
                            <Text style={styles.text}>{item}</Text>
                            <View style={[styles.dotLeft, isDyslexic ? styles.dotLarge : {}]} />
                        </View>
                    ))}
                </View>

                {/* Orta Çizgi Alanı (Boşluk) */}
                <View style={{ width: '20%' }} />

                {/* Sağ Sütun */}
                <View style={styles.column}>
                    {activeData.rightItems.map((item, index) => (
                        <View key={`right-${index}`} style={styles.itemBox}>
                            <View style={[styles.dotRight, isDyslexic ? styles.dotLarge : {}]} />
                            <Text style={styles.text}>{item}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </A4PrintableSheet>
    );
};
