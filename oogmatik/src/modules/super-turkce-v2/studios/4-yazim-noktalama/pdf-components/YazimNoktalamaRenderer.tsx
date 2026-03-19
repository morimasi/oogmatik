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
    paragraphBox: {
        padding: 20,
        backgroundColor: '#FEF2F2',
        border: '2px dashed #EF4444',
        borderRadius: 8,
        marginBottom: 20,
    },
    correctionRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
    },
    circleNum: {
        width: 24, height: 24,
        borderRadius: 12,
        backgroundColor: '#EF4444',
        color: 'white',
        textAlign: 'center',
        paddingTop: 4,
        marginRight: 10,
        fontSize: 10
    },
    correctionLine: { flex: 1, borderBottom: '1px solid #CBD5E1', paddingBottom: 5, marginLeft: 10 }
});

export const YazimNoktalamaRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    if (templateId === 'ORTHO_01_DOCTOR') {
        const corrections = data.corrections || [1, 2, 3, 4, 5]; // Mock if not exists
        return (
            <View style={styles.container}>
                <View style={styles.paragraphBox}>
                    <Text style={[ts, { lineHeight: 1.8, fontSize: ts.fontSize + 2 }]}>
                        {applyDyslexiaSpacing(data.textWithErrors || 'Metin yüklenmedi...', settings)}
                    </Text>
                </View>

                <Text style={[ts, { marginBottom: 15, fontWeight: 'bold' }]}>
                    {applyDyslexiaSpacing('Bu metin hasta! İçindeki yazım yanlışlarını bularak aşağıya doğrusunu yazınız:', settings)}
                </Text>

                {corrections.map((_: any, i: number) => (
                    <View key={i} style={styles.correctionRow}>
                        <Text style={styles.circleNum}>{i + 1}</Text>
                        <View style={styles.correctionLine}>
                            <Text style={[ts, { color: '#94A3B8' }]}>Yanlış:</Text>
                        </View>
                        <View style={styles.correctionLine}>
                            <Text style={[ts, { color: '#94A3B8' }]}>Doğrusu:</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Fallback for Noktalama and others
    return (
        <View style={styles.container}>
            <Text style={[ts, { fontSize: 18, marginBottom: 10, color: '#0F172A' }]}>{data.title || 'Yazım ve Noktalama Düzeltme'}</Text>
            <View style={{ padding: 15, backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                <Text style={[ts, { lineHeight: 1.8 }]}>
                    {applyDyslexiaSpacing(data.textWithBlanks || data.content || JSON.stringify(data), settings)}
                </Text>
            </View>
        </View>
    );
};
