import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { pdfThemeColors } from './fonts';
import { useSuperTurkceStore } from '../../core/store';

// Stiller - A4 formatına "Ultra Premium" matbaacı gözüyle tam hizalanmış paddingler.
const createStyles = (theme: 'eco-black' | 'vibrant' | 'minimalist', font: string) => StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 45,
        paddingHorizontal: 40,
        backgroundColor: pdfThemeColors[theme].background,
        fontFamily: font,
        color: pdfThemeColors[theme].primary,
        lineHeight: 1.5,
    },
    headerMarker: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: pdfThemeColors[theme].border,
        paddingBottom: 10,
        marginBottom: 20,
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: pdfThemeColors[theme].accent,
        textTransform: 'uppercase',
    },
    subtitleText: {
        fontSize: 10,
        color: pdfThemeColors[theme].secondary,
        textAlign: 'right',
    },
    footerMarker: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: pdfThemeColors[theme].border,
        paddingTop: 5,
    },
    footerText: {
        fontSize: 8,
        color: pdfThemeColors[theme].secondary,
    },
    contentWrapper: {
        flex: 1,
        gap: 15, // Etkinlikler arası global boşluk
    }
});

interface A4PrintableSheetProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
}

/**
 * A4PrintableSheet: Her tam izole modülün (Boşluk doldurma, vs.) içine gömülebileceği dış çerçeve kağıt modeli.
 */
export const A4PrintableSheet: React.FC<A4PrintableSheetProps> = ({
    title = "SÜPER TÜRKÇE ETKİNLİĞİ",
    subtitle = "Ad Soyad: ........................",
    children
}) => {
    const store = useSuperTurkceStore.getState();
    const theme = store.themeColor;

    // Disleksi hedef kitleye özel font geçişi
    const fontFamily = store.audience === 'derin_disleksi' || store.audience === 'hafif_disleksi'
        ? 'OpenDyslexic'
        : 'Lexend'; // Default matbaa fontu

    const styles = createStyles(theme, fontFamily);

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Üst Bilgi (Kurum Logosu/İsmi) */}
                <View style={styles.headerMarker} fixed>
                    <View style={{ flexDirection: 'column', gap: 2 }}>
                        <Text style={styles.titleText}>{title}</Text>
                        {store.institutionName && (
                            <Text style={{ fontSize: 9, color: pdfThemeColors[theme as keyof typeof pdfThemeColors].secondary, marginTop: 4 }}>
                                {store.institutionName}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.subtitleText}>{subtitle}</Text>
                </View>

                {/* Kurum Filigranı (Watermark) */}
                {store.includeWatermark && store.watermarkText && (
                    <View style={{ position: 'absolute', top: 350, left: 100, right: 100, opacity: 0.04, transform: 'rotate(-45deg)', alignItems: 'center', justifyContent: 'center' }} fixed>
                        <Text style={{ fontSize: 60, fontWeight: 'bold', color: pdfThemeColors[theme as keyof typeof pdfThemeColors].primary, textAlign: 'center' }}>
                            {store.watermarkText.toUpperCase()}
                        </Text>
                    </View>
                )}

                {/* İçerik Gövdesi */}
                <View style={styles.contentWrapper}>
                    {children}
                </View>

                {/* Alt Bilgi */}
                <View style={styles.footerMarker} fixed>
                    <Text style={styles.footerText}>© Oogmatik Super Studio - {new Date().getFullYear()}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Sayfa ${pageNumber} / ${totalPages}`)} />
                </View>

            </Page>
        </Document>
    );
};
