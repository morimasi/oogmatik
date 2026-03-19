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
    sentenceBox: {
        padding: 15,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        marginBottom: 20,
        borderLeft: '4px solid #3B82F6'
    },
    elementRow: {
        flexDirection: 'row',
        marginBottom: 15,
        alignItems: 'center',
        borderBottom: '1px solid #E2E8F0',
        paddingBottom: 4
    },
    label: { width: 120, color: '#334155', fontWeight: 'bold' },
    dashedLine: { flex: 1, borderBottom: '1px dashed #94A3B8', marginHorizontal: 10 },
    grammarTable: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    grammarRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    grammarCellHeader: {
        flex: 1,
        padding: 8,
        backgroundColor: '#F1F5F9',
        color: '#334155',
    },
    grammarCell: {
        flex: 1,
        padding: 8,
        color: '#0F172A'
    }
});

export const DilBilgisiRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const ts = getPdfTextStyles(settings);

    if (templateId === 'GRAM_01_SENTENCE_TREE') {
        const elements = data.elements || [];
        return (
            <View style={styles.container}>
                <View style={styles.sentenceBox}>
                    <Text style={[ts, { fontSize: ts.fontSize + 2, color: '#0F172A', fontWeight: 'bold' }]}>
                        {applyDyslexiaSpacing(data.sentence || '', settings)}
                    </Text>
                </View>

                <Text style={[ts, { marginBottom: 15, color: '#475569' }]}>
                    {applyDyslexiaSpacing('Aşağıdaki ögeleri cümleden bularak boşluklara yazınız:', settings)}
                </Text>

                {elements.map((el: any, i: number) => (
                    <View key={i} style={styles.elementRow}>
                        <Text style={[ts, styles.label]}>{applyDyslexiaSpacing(el.type || 'Öge', settings)}</Text>
                        <View style={styles.dashedLine} />
                    </View>
                ))}
            </View>
        );
    }

    if (templateId === 'GRAM_03_VERB_CONJUGATION') {
        const tenses = data.tenses || [];
        return (
            <View style={styles.container}>
                <Text style={[ts, { marginBottom: 5, color: '#64748B' }]}>
                    {applyDyslexiaSpacing(`Kök Fiil: ${data.rootVerb}`, settings)}
                </Text>
                <Text style={[ts, { marginBottom: 15, fontWeight: 'bold' }]}>
                    {applyDyslexiaSpacing(data.context || '', settings)}
                </Text>

                <View style={styles.grammarTable}>
                    <View style={styles.grammarRow}>
                        <Text style={[ts, styles.grammarCellHeader]}>Kip / Zaman</Text>
                        <Text style={[ts, styles.grammarCellHeader]}>Örnek Cümle Görevi</Text>
                    </View>
                    {tenses.map((t: any, i: number) => (
                        <View key={i} style={styles.grammarRow}>
                            <Text style={[ts, styles.grammarCell]}>{t.tenseName}</Text>
                            <Text style={[ts, styles.grammarCell, { color: '#94A3B8' }]}>....................................................</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // Fallback for other templates
    return (
        <View style={styles.container}>
            <Text style={[ts, { fontSize: 18, marginBottom: 10 }]}>{data.title || 'Dil Bilgisi Etkinliği'}</Text>
            <Text style={[ts, { marginTop: 10, lineHeight: 1.6 }]}>{applyDyslexiaSpacing(data.content || JSON.stringify(data), settings)}</Text>
        </View>
    );
};
