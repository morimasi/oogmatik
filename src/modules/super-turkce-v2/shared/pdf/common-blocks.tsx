import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { coreStyles } from './styles';
import { PrintSettings, getPdfTextStyles } from '../../core/store/print-settings';
import { StudioDef } from '../../core/types';

interface PdfHeaderProps {
    studio: StudioDef;
    topicTitle: string;
    gradeLabel: string;
    unitHint?: string;
    settings: PrintSettings;
}

export const PdfHeader: React.FC<PdfHeaderProps> = ({
    studio,
    topicTitle,
    gradeLabel,
    unitHint,
    settings
}) => {
    return (
        <View style={coreStyles.headerContainer} fixed>
            <View style={coreStyles.headerLeft}>
                <Text style={[coreStyles.titleCategory, { color: studio.colorHex || '#64748B' }]}>
                    SUPER TÜRKÇE V2 • {studio.title.toUpperCase()} STÜDYOSU
                </Text>
                <Text style={[coreStyles.titleMain, getPdfTextStyles(settings, true)]}>
                    {topicTitle}
                </Text>
                <Text style={[coreStyles.titleSub, getPdfTextStyles(settings)]}>
                    {gradeLabel}{unitHint ? ` • ${unitHint}` : ''} • Beceri Temelli Çalışma Kağıdı
                </Text>
            </View>

            {/* İsim Soyisim vs. için Sağ Blok */}
            <View style={{ width: 155, borderLeftWidth: 1, borderLeftColor: '#E2E8F0', paddingLeft: 10 }}>
                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2, fontFamily: 'Inter' }}>Adı Soyadı</Text>
                    <View style={{ borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#CBD5E1', height: 12 }} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2, fontFamily: 'Inter' }}>Sınıf / No</Text>
                        <View style={{ borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#CBD5E1', height: 12 }} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2, fontFamily: 'Inter' }}>Tarih</Text>
                        <View style={{ borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#CBD5E1', height: 12 }} />
                    </View>
                </View>
                <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 8, color: '#94A3B8', marginBottom: 2, fontFamily: 'Inter' }}>Puan</Text>
                    <View style={{ borderBottomWidth: 1, borderBottomStyle: 'dashed', borderBottomColor: '#CBD5E1', height: 12 }} />
                </View>
            </View>
        </View>
    );
};

export const PdfFooter: React.FC<{ settings: PrintSettings }> = ({ settings }) => (
    <View style={coreStyles.footerContainer} fixed>
        <Text style={coreStyles.footerText}>
            {settings.institutionName} • Oogmatik Eğitim Teknolojileri
        </Text>
        <Text style={coreStyles.footerText} render={({ pageNumber, totalPages }) => (
            `Sayfa ${pageNumber} / ${totalPages}`
        )} />
    </View>
);

export const PdfWatermark: React.FC<{ settings: PrintSettings }> = ({ settings }) => {
    if (!settings.showWatermark || !settings.watermarkText) return null;

    return (
        <View style={coreStyles.watermarkContainer} fixed>
            <Text style={coreStyles.watermarkText}>{settings.watermarkText}</Text>
        </View>
    );
};
