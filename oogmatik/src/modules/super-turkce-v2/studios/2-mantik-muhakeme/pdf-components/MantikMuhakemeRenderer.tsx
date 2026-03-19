import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { coreStyles } from '../../../shared/pdf/styles';
import { PrintSettings, getPdfTextStyles, applyDyslexiaSpacing } from '../../../core/store/print-settings';

const styles = StyleSheet.create({
    scenarioBox: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    clueList: {
        marginTop: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        borderRadius: 6
    },
    clueItem: {
        flexDirection: 'row',
        marginBottom: 6
    },
    clueBullet: {
        width: 15,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#0F172A'
    },
    gridContainer: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#0F172A'
    },
    gridRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#94A3B8'
    },
    gridCellHeader: {
        flex: 1,
        padding: 8,
        backgroundColor: '#E2E8F0',
        borderRightWidth: 1,
        borderColor: '#94A3B8',
        textAlign: 'center',
        fontFamily: 'Inter',
        fontWeight: 700
    },
    gridCell: {
        flex: 1,
        padding: 12,
        borderRightWidth: 1,
        borderColor: '#94A3B8'
    }
});

interface Props {
    data: any;
    templateId: string;
    settings: PrintSettings;
}

export const MantikMuhakemeRenderer: React.FC<Props> = ({ data, templateId, settings }) => {
    const txtStyle = getPdfTextStyles(settings);

    // LOGIC_01: LGS Tipi Sözel Mantık 4x4 Grid
    if (templateId === 'LOGIC_01_GRID') {
        return (
            <View>
                <View style={styles.scenarioBox}>
                    <Text style={[txtStyle, { color: '#0F172A', fontFamily: 'Inter', fontWeight: 700 }]}>
                        OLAY VE KİŞİLER:
                    </Text>
                    <Text style={[txtStyle, { marginTop: 8 }]}>
                        {applyDyslexiaSpacing(data.scenario, settings.b_d_spacing)}
                    </Text>
                    <Text style={[txtStyle, { marginTop: 10, color: '#334155' }]}>
                        Kişiler: {data.entities?.join(', ')}
                    </Text>
                </View>

                <View style={styles.clueList}>
                    <Text style={{ fontSize: 10, color: '#64748B', marginBottom: 10, fontFamily: 'Inter' }}>KESİN İPUÇLARI</Text>
                    {data.clues?.map((c: string, i: number) => (
                        <View key={i} style={styles.clueItem} wrap={false}>
                            <Text style={styles.clueBullet}>•</Text>
                            <Text style={[txtStyle, { flex: 1 }]}>
                                {applyDyslexiaSpacing(c, settings.b_d_spacing)}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.gridContainer} wrap={false}>
                    {/* Header Row */}
                    <View style={[styles.gridRow, { borderBottomColor: '#0F172A', borderBottomWidth: 2 }]}>
                        <Text style={styles.gridCellHeader}>KİŞİLER \ KATEGORİ</Text>
                        {data.categories?.map((c: any, i: number) => (
                            <Text key={i} style={[styles.gridCellHeader, i === data.categories.length - 1 ? { borderRightWidth: 0 } : {}]}>
                                {c.name.toUpperCase()}
                            </Text>
                        ))}
                    </View>

                    {/* Data Rows */}
                    {data.entities?.map((ent: string, rowIndex: number) => (
                        <View key={rowIndex} style={[styles.gridRow, rowIndex === data.entities.length - 1 ? { borderBottomWidth: 0 } : {}]}>
                            <Text style={[styles.gridCell, { fontFamily: 'Inter', fontWeight: 700, backgroundColor: '#F8FAFC' }]}>
                                {ent}
                            </Text>
                            {data.categories?.map((_, colIndex) => (
                                <View key={colIndex} style={[styles.gridCell, colIndex === data.categories.length - 1 ? { borderRightWidth: 0 } : {}]} />
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // Varsayılan
    return (
        <View style={coreStyles.card}>
            <Text style={[txtStyle, { color: '#EF4444' }]}>
                PDF Render Bekleniyor: {templateId} (Mantık Muhakeme)
            </Text>
        </View>
    );
};
