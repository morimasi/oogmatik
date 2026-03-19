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
    itemBox: {
        padding: 15,
        backgroundColor: '#FAF5FF',
        borderLeft: '4px solid #A855F7',
        borderRadius: 8,
        marginBottom: 15,
    },
    halfMatchRow: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    boxHalf: {
        width: '45%',
        padding: 10,
        border: '1px solid #E9D5FF',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        textAlign: 'center'
    }
});

export const DeyimlerAtasozleriRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    if (templateId === 'PROVERB_01_HALF_MATCH') {
        const proverbs = data.proverbs || [];
        // To simulate matching, we normally shuffle second halves, but for print we just display them for drawing lines
        return (
            <View style={styles.container}>
                <Text style={[ts, { marginBottom: 20, fontWeight: 'bold', fontSize: ts.fontSize + 2 }]}>
                    {applyDyslexiaSpacing('Atasözlerinin başını ve sonunu çizgiyle birleştirin:', settings)}
                </Text>

                {proverbs.map((p: any, i: number) => (
                    <View key={i} style={styles.halfMatchRow}>
                        <View style={styles.boxHalf}>
                            <Text style={ts}>{applyDyslexiaSpacing(p.firstHalf, settings)}</Text>
                        </View>
                        <View style={styles.boxHalf}>
                            <Text style={ts}>{applyDyslexiaSpacing(p.secondHalf, settings)}</Text>
                        </View>
                    </View>
                ))}
            </View>
        );
    }

    // Fallback for IDIOM_01_MATCH_PICTURE etc.
    return (
        <View style={styles.container}>
            <Text style={[ts, { fontSize: 18, marginBottom: 15, color: '#A855F7' }]}>{data.title || 'Deyimler ve Atasözleri'}</Text>
            {(data.items || []).map((item: any, idx: number) => (
                <View key={idx} style={styles.itemBox}>
                    <Text style={[ts, { fontWeight: 'bold', marginBottom: 5 }]}>{item.idiom || item.proverb}</Text>
                    <Text style={[ts, { color: '#4B5563' }]}>{item.visualDescription || item.meaning}</Text>
                </View>
            ))}
        </View>
    );
};
