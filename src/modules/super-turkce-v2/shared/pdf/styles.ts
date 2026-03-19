import { StyleSheet, Font } from '@react-pdf/renderer';

// Premium Fontlar
Font.register({
    family: 'OpenDyslexic',
    src: '/fonts/OpenDyslexic-Regular.otf'
});

Font.register({
    family: 'Inter',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' }, // Regular
        { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 } // Bold
    ]
});

// Temel Vektör Stilleri
export const coreStyles = StyleSheet.create({
    page: {
        paddingTop: 35,
        paddingBottom: 40,
        paddingHorizontal: 45,
        backgroundColor: '#ffffff',
    },
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    watermarkText: {
        fontSize: 60,
        color: 'rgba(230, 230, 230, 0.4)',
        transform: 'rotate(-45deg)',
        fontFamily: 'Inter',
        fontWeight: 700,
    },
    divider: {
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // slate-200
    },

    // Header Stilleri
    headerContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#0F172A', // slate-900
        paddingBottom: 10,
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4
    },
    titleCategory: {
        fontSize: 10,
        fontFamily: 'Inter',
        color: '#64748B', // slate-500
        textTransform: 'uppercase',
        letterSpacing: 2
    },
    titleMain: {
        fontSize: 18,
        fontFamily: 'Inter',
        fontWeight: 700,
        color: '#0F172A', // slate-900
    },
    titleSub: {
        fontSize: 11,
        fontFamily: 'Inter',
        color: '#334155', // slate-700
        marginTop: 2
    },

    // Footer Stilleri
    footerContainer: {
        position: 'absolute',
        bottom: 25,
        left: 45,
        right: 45,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 8,
    },
    footerText: {
        fontSize: 8,
        fontFamily: 'Inter',
        color: '#94A3B8' // slate-400
    },

    // Genel Bileşen Stilleri (Premium Kutular)
    card: {
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    badge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 9,
        color: '#2563EB',
        alignSelf: 'flex-start'
    }
});
