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
    container: { flex: 1, padding: 20 },
    wordRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center',
        paddingBottom: 8,
        borderBottom: '1px dashed #E2E8F0'
    },
    wordPart: { width: '25%', textAlign: 'center' },
    droppedVowelBox: {
        width: 30, height: 30,
        border: '1px solid #EF4444',
        borderRadius: 15,
        textAlign: 'center',
        paddingTop: 6,
        color: '#EF4444'
    }
});

export const SesOlaylariRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    if (templateId === 'PHONO_01_SOUND_DROP') {
        const words = data.words || [];
        return (
            <View style={styles.container}>
                <Text style={[ts, { marginBottom: 20, fontWeight: 'bold' }]}>
                    {applyDyslexiaSpacing('Aşağıdaki kelimelerde düşen ünlü harfi kırmızı yuvarlağın içine yazınız:', settings)}
                </Text>

                <View style={[styles.wordRow, { borderBottom: '2px solid #334155', paddingBottom: 5 }]}>
                    <Text style={[ts, styles.wordPart, { fontWeight: 'bold' }]}>Kök</Text>
                    <Text style={[ts, styles.wordPart, { fontWeight: 'bold' }]}>Ek</Text>
                    <Text style={[ts, styles.wordPart, { fontWeight: 'bold', color: '#10B981' }]}>Sonuç</Text>
                    <Text style={[ts, styles.wordPart, { fontWeight: 'bold', color: '#EF4444' }]}>Düşen Ses</Text>
                </View>

                {words.map((w: any, i: number) => (
                    <View key={i} style={styles.wordRow}>
                        <Text style={[ts, styles.wordPart]}>{w.root}</Text>
                        <Text style={[ts, styles.wordPart]}>+ {w.suffix}</Text>
                        <Text style={[ts, styles.wordPart, { color: '#10B981', fontWeight: 'bold' }]}>= {w.result}</Text>
                        <View style={{ width: '25%', alignItems: 'center' }}>
                            <Text style={[ts, styles.droppedVowelBox]}>{''}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Fallback
    return (
        <View style={styles.container}>
            <Text style={[ts, { fontSize: 18, marginBottom: 15 }]}>{data.title || 'Ses Olayları'}</Text>
            <Text style={[ts, { lineHeight: 1.8 }]}>{data.text || data.content || JSON.stringify(data)}</Text>
        </View>
    );
};
