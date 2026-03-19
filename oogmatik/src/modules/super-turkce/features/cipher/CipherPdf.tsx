import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { A4PrintableSheet } from '../../shared/pdf-utils/pdf-core';

const styles = StyleSheet.create({
    itemBox: {
        marginBottom: 35,
        padding: 10,
        backgroundColor: '#ffffff',
    },
    jumbledContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    jumbledWordWrap: {
        flexDirection: 'row',
        gap: 3,
    },
    letterBox: {
        width: 24,
        height: 28,
        borderWidth: 2,
        borderColor: '#4f46e5',
        backgroundColor: '#e0e7ff',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    letterText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#312e81',
        textTransform: 'uppercase',
    },
    // Kılavuz Çizgi (İlkokul Yazı Satırı Dizaynı)
    guideLineContainer: {
        height: 38,
        width: '100%',
        position: 'relative',
        marginTop: 5,
    },
    lineOuter: {
        position: 'absolute',
        width: '100%',
        height: 1,
        backgroundColor: '#94a3b8',
    },
    lineInner: {
        position: 'absolute',
        width: '100%',
        height: 1,
        borderBottomWidth: 1,
        borderBottomColor: '#f43f5e', // Orta kırmızı kılavuz çizgisi
        borderBottomStyle: 'dashed',
    }
});

const MOCK_DATA = [
    { id: 1, jumbledWords: ["BÜYÜK", "YENİ", "ALDI", "BİR", "BİSİKLET"] },
    { id: 2, jumbledWords: ["GÜZEL", "KİTAPLAR", "OKUR", "ÇOK", "AYŞE"] },
    { id: 3, jumbledWords: ["SABAH", "ERKEN", "KALKAR", "GÜNEŞ", "DOĞMADAN", "O"] }
];

export const CipherPdf: React.FC = () => {
    return (
        <A4PrintableSheet
            title="ŞİFRE ÇÖZÜCÜ: CÜMLE OLUŞTURMA"
            subtitle="Karışık verilen kelimeleri anlamlı ve kurallı cümleler haline getiriniz."
        >
            {MOCK_DATA.map((item) => (
                <View key={item.id} style={styles.itemBox} wrap={false}>

                    <View style={styles.jumbledContainer}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginRight: 10 }}>{item.id})</Text>
                        {item.jumbledWords.map((word, wIdx) => (
                            <View key={wIdx} style={styles.jumbledWordWrap}>
                                {word.split('').map((char, cIdx) => (
                                    <View key={`${wIdx}-${cIdx}`} style={styles.letterBox}>
                                        <Text style={styles.letterText}>{char}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}
                    </View>

                    {/* Kılavuz Çizgiler (3 Çizgili Klasik İlkokul Formatı) */}
                    <View style={styles.guideLineContainer}>
                        <View style={[styles.lineOuter, { top: 0 }]} />
                        <View style={[styles.lineInner, { top: 18 }]} />
                        <View style={[styles.lineOuter, { top: 36 }]} />
                    </View>

                </View>
            ))}
        </A4PrintableSheet>
    );
};
