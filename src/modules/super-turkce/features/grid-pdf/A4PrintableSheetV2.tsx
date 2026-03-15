import React from 'react';
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import { useSuperTurkceStore } from '../../core/store';

// Ultra-Kompakt Matbaa Tarzı A4 Düzeni (Minimum Boşluk, Maksimum Verim)
const styles = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 30,
        paddingLeft: 35,
        paddingRight: 35,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
    },
    // Üst Bilgi (Header) Alanı
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        paddingBottom: 10,
        marginBottom: 15,
    },
    brandContainer: {
        flexDirection: 'column',
    },
    institutionName: {
        fontFamily: 'Lexend',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    moduleName: {
        fontFamily: 'Lexend',
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },
    studentInfoBox: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 5,
    },
    infoLabel: {
        fontFamily: 'Lexend',
        fontSize: 9,
        color: '#475569',
    },
    infoLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#cbd5e1',
        width: 120,
        height: 10,
    },
    // Ana Grid ve Bileşen Alanı
    gridContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 12, // Bileşenler arası esnek kompakt boşluk
    },
    // Taslak Bileşen (Block) Tasarımı
    componentBlock: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fafaf9',
        position: 'relative',
    },
    componentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 4,
    },
    blockTitle: {
        fontFamily: 'Lexend',
        fontSize: 11,
        fontWeight: 'bold',
        color: '#334155',
        textTransform: 'uppercase',
    },
    blockBadge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 7,
        fontFamily: 'Lexend',
        color: '#0284c7',
        fontWeight: 'bold',
    },
    // İçerik Mock Tarzları
    mockLine: {
        height: 8,
        backgroundColor: '#cbd5e1',
        borderRadius: 4,
        marginBottom: 6,
    },
    mockLineShort: {
        width: '60%',
    },
    // Filigran
    watermarkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
        opacity: 0.04,
    },
    watermarkText: {
        fontFamily: 'Lexend',
        fontSize: 80,
        fontWeight: 'bold',
        color: '#000000',
        transform: 'rotate(-45deg)',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 35,
        right: 35,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 8,
    },
    footerText: {
        fontFamily: 'Lexend',
        fontSize: 8,
        color: '#94a3b8',
    }
});

// Dinamik PDF Component Haritalayıcı (Element Mapper)
// Sadece yazıları JSON olarak basmak yerine, draft type'ına göre şık bir görsel bileşen çizer
const renderComponentByType = (type: string, draft: any) => {
    const data = draft.data;

    // Eğer veri henüz yoksa mock çizgileri göster
    if (!data) {
        return (
            <View style={{ gap: 4, marginTop: 5 }}>
                <View style={[styles.mockLine]} />
                <View style={[styles.mockLine]} />
                <View style={[styles.mockLine, styles.mockLineShort]} />
            </View>
        );
    }

    switch (type) {
        case '5N1K_NEWS':
        case '5N1K':
            return (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                    <View style={{ width: 80, height: 60, backgroundColor: '#cbd5e1', borderRadius: 4 }} />
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontFamily: 'Lexend', fontSize: 11, fontWeight: 'bold' }}>{data.title || "Haber Başlığı"}</Text>
                        <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.4 }}>
                            {data.content || "Haber içeriği yükleniyor..."}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                            {(data.questions || ['Kim?', 'Nerede?', 'Ne zaman?']).map((q: string, i: number) => (
                                <Text key={i} style={{ fontSize: 8, color: '#0284c7', fontWeight: 'bold' }}>{q}</Text>
                            ))}
                        </View>
                    </View>
                </View>
            );
        case 'SUPER_TURKCE_MATCHING':
        case 'SEBEP_SONUC_ESLESTIR':
        case 'KAVRAM_ESLESTIRME':
        case 'ESLESTIRME':
            return (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10, gap: 40 }}>
                    <View style={{ gap: 10, flex: 1 }}>
                        {(data.left || []).map((l: string, i: number) => (
                            <View key={`l-${i}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 9, color: '#334155' }}>{l}</Text>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' }} />
                            </View>
                        ))}
                    </View>
                    <View style={{ gap: 10, flex: 1 }}>
                        {(data.right || []).map((r: string, i: number) => (
                            <View key={`r-${i}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#cbd5e1' }} />
                                <Text style={{ fontSize: 9, color: '#334155' }}>{r}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            );
        case 'MULTIPLE_CHOICE':
        case 'DIL_BILGISI_TEST':
        case 'PARAGRAF_MANTIK_TEST':
        case 'STANDART_TEST':
        case 'YENI_NESIL':
            return (
                <View style={{ marginTop: 5, gap: 8 }}>
                    <Text style={{ fontSize: 10, color: '#0f172a', fontWeight: 'bold' }}>{data.question || "Soru metni yükleniyor..."}</Text>
                    <View style={{ gap: 4, paddingLeft: 10 }}>
                        {(data.options || []).map((opt: string, i: number) => (
                            <Text key={i} style={{ fontSize: 9, color: '#475569' }}>{opt}</Text>
                        ))}
                    </View>
                </View>
            );
        case 'FILL_IN_THE_BLANKS':
        case 'BOSLUK_CEKIM_EKI':
        case 'BOSLUK_DOLDURMA':
            return (
                <View style={{ marginTop: 5, gap: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', backgroundColor: '#f1f5f9', padding: 6, borderRadius: 4 }}>
                        {(data.words || []).map((w: string, i: number) => (
                            <Text key={i} style={{ fontSize: 8, fontWeight: 'bold', color: '#0284c7' }}>[{w}]</Text>
                        ))}
                    </View>
                    <View style={{ gap: 6 }}>
                        {(data.sentences || []).map((s: string, i: number) => (
                            <Text key={i} style={{ fontSize: 9, color: '#334155', lineHeight: 1.5 }}>{i + 1}. {s}</Text>
                        ))}
                    </View>
                </View>
            );
        default:
            return (
                <View style={{ gap: 4, marginTop: 5 }}>
                    <Text style={{ fontSize: 9, color: '#334155' }}>
                        {data.text || `${type} için veri üretildi.`}
                    </Text>
                    <Text style={{ fontSize: 7, color: '#94a3b8', marginTop: 4 }}>
                        ({draft.type} bileşeni {draft.settings?.engineMode === 'ai' ? 'AI' : 'Fast'} modunda üretildi.)
                    </Text>
                </View>
            );
    }
}

// A4 Matbaa Dizgi Motoru (PDF Rendering)
export const A4PrintableSheetV2: React.FC = () => {
    // Tüm güncel state ve taslak üretim verisi store'dan alınır
    const {
        institutionName,
        includeWatermark,
        watermarkText,
        selectedGrade,
        selectedObjective,
        draftComponents,
        audience
    } = useSuperTurkceStore();

    // Dinamik Font Kararı (Disleksi modlarına özel fontlar)
    const fontStyle = {
        fontFamily: audience === 'derin_disleksi' ? 'OpenDyslexic' : 'Lexend',
        fontSize: audience === 'derin_disleksi' || audience === 'hafif_disleksi' ? 12 : 10
    };

    return (
        <Document title="Süper Türkçe Karma Çalışma Kağıdı">
            <Page size="A4" style={[styles.page, fontStyle]}>

                {/* 1. Kurumsal Filigran (Watermark) */}
                {includeWatermark && (
                    <View style={styles.watermarkContainer} fixed>
                        <Text style={styles.watermarkText}>{watermarkText || 'OOGMATIK'}</Text>
                    </View>
                )}

                {/* 2. Dinamik Matbaa Başlığı (Header) */}
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <Text style={styles.institutionName}>{institutionName || 'Eğitim Kurumu'}</Text>
                        <Text style={styles.moduleName}>
                            Süper Türkçe V2 - {selectedGrade ? `${selectedGrade}. Sınıf Çalışma Kağıdı` : 'Karma Etkinlik'}
                        </Text>
                    </View>
                    <View style={styles.studentInfoBox}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Adı Soyadı:</Text>
                            <View style={styles.infoLine}></View>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Sınıf / No:</Text>
                            <View style={[styles.infoLine, { width: 80 }]}></View>
                        </View>
                    </View>
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontFamily: 'Lexend', fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>
                        Ders Konusu: <Text style={{ fontWeight: 'normal' }}>{selectedObjective?.title || 'Genel Tekrar'}</Text>
                    </Text>
                </View>

                {/* 3. Taslak Bileşenlerin (Drafts) Sütunlu Grid Render'ı */}
                <View style={styles.gridContainer}>
                    {draftComponents.length === 0 ? (
                        <View style={[styles.componentBlock, { alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#f8fafc' }]}>
                            <Text style={{ fontSize: 14, color: '#94a3b8', fontFamily: 'Lexend' }}>Lütfen kokpitten modülleri seçip "Sihirli Üret" butonuna basın.</Text>
                        </View>
                    ) : (
                        draftComponents.map((draft: any, idx: number) => (
                            <View key={draft.id} style={styles.componentBlock} wrap={false}>
                                <View style={styles.componentHeader}>
                                    <Text style={styles.blockTitle}>{idx + 1}. {draft.type.replace(/_/g, ' ')}</Text>
                                    <Text style={styles.blockBadge}>Puan: ____</Text>
                                </View>

                                {/* Gerçekçi Görsel Bileşen (Element Mapper) */}
                                {draft.data ? (
                                    <View>
                                        <Text style={{ fontSize: 8, color: '#10b981', fontWeight: 'bold', marginBottom: 6 }}>✓ {draft.settings?.engineMode === 'ai' ? 'Yapay Zeka (AI)' : 'Hızlı'} Üretimi Başarılı</Text>
                                        {renderComponentByType(draft.type, draft)}
                                    </View>
                                ) : (
                                    <View style={{ gap: 4, marginTop: 5 }}>
                                        <View style={[styles.mockLine]} />
                                        <View style={[styles.mockLine]} />
                                        <View style={[styles.mockLine, styles.mockLineShort]} />
                                        <Text style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>
                                            Üretim bekliyor... (Sihirli butona basıldığında otomatik dolacaktır)
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {/* 4. Alt Bilgi (Footer) */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>Üretim Kimliği: #{Math.random().toString(36).substring(2, 10).toUpperCase()}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                        `Sayfa ${pageNumber} / ${totalPages}`
                    )} fixed />
                </View>

            </Page>
        </Document>
    );
};
