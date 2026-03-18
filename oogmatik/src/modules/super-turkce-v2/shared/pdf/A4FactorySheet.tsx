import React from 'react';
import { Page, Document, View, Text } from '@react-pdf/renderer';
import { coreStyles } from './styles';
import { PdfHeader, PdfFooter, PdfWatermark } from './common-blocks';
import { WorksheetInstance, StudioDef } from '../../core/types';
import { useSuperTurkceV2Store } from '../../core/store';

// Dynamic Renderers (Sadece tamamlanmış 2 stüdyoyu dahil ettik)
import { OkumaAnlamaRenderer } from '../../studios/1-okuma-anlama/pdf-components/OkumaAnlamaRenderer';
import { MantikMuhakemeRenderer } from '../../studios/2-mantik-muhakeme/pdf-components/MantikMuhakemeRenderer';

// Örnek Stüdyo Listesi (Gerçekte config veya store'dan gelebilir)
const STUDIO_DATA: Record<string, StudioDef> = {
    'okuma-anlama': {
        id: 'okuma-anlama',
        title: 'Okuma Anlama',
        description: '',
        icon: 'fa-book-open',
        colorHex: '#3B82F6'
    },
    'mantik-muhakeme': {
        id: 'mantik-muhakeme',
        title: 'Mantık Muhakeme',
        description: '',
        icon: 'fa-brain',
        colorHex: '#8B5CF6'
    }
};

interface Props {
    worksheet?: WorksheetInstance;
}

export const A4FactorySheet: React.FC<Props> = ({ worksheet }) => {
    // Eğer dışarıdan bir worksheet nesnesi verilmediyse, aktif session'ı kullan
    const currentWorksheet = useSuperTurkceV2Store(state => state.currentWorksheet);
    const dataToRender = worksheet || currentWorksheet;

    if (!dataToRender || !dataToRender.data) {
        return (
            <Document>
                <Page size="A4" style={coreStyles.page}>
                    <Text style={{ fontFamily: 'Inter', color: '#64748B', textAlign: 'center', marginTop: 150 }}>
                        PDF Önizlemesi hazırlanıyor... Lütfen sol panelden bilgileri seçip "Üret" butonuna basın.
                    </Text>
                </Page>
            </Document>
        );
    }

    const { templateId, data, printSettingsSnapshot } = dataToRender;
    const storeStudioId = useSuperTurkceV2Store(state => state.activeStudioId) || 'okuma-anlama'; // Mock default
    const studioDef = STUDIO_DATA[storeStudioId] || STUDIO_DATA['okuma-anlama'];
    const storeObjective = useSuperTurkceV2Store(state => state.objective);
    const storeGrade = useSuperTurkceV2Store(state => state.grade);

    const topicTitle = storeObjective?.title || data.title || 'Uygulama Çalışması';
    const gradeLabel = storeGrade ? `${storeGrade}. Sınıf` : 'Değerlendirme';

    const renderStudioContent = () => {
        switch (storeStudioId) {
            case 'okuma-anlama':
                return <OkumaAnlamaRenderer data={data} templateId={templateId} settings={printSettingsSnapshot} />;
            case 'mantik-muhakeme':
                return <MantikMuhakemeRenderer data={data} templateId={templateId} settings={printSettingsSnapshot} />;
            default:
                return (
                    <View style={coreStyles.card}>
                        <Text style={{ fontFamily: 'Inter', fontSize: 12, color: '#334155' }}>
                            Yapımaşamasında: {storeStudioId} stüdyosu çıktı motoru.
                        </Text>
                    </View>
                );
        }
    };

    return (
        <Document>
            <Page size="A4" style={[coreStyles.page, { backgroundColor: printSettingsSnapshot.highContrast ? '#FEF08A' : '#ffffff' }]}>
                <PdfWatermark settings={printSettingsSnapshot} />

                {/* Header - Fixed to top of every page */}
                <PdfHeader
                    studio={studioDef}
                    topicTitle={topicTitle}
                    gradeLabel={gradeLabel}
                    settings={printSettingsSnapshot}
                />

                {/* Dynamic Studio Content Blocks */}
                <View style={{ flex: 1 }}>
                    {renderStudioContent()}
                </View>

                {/* Footer - Fixed to bottom of every page */}
                <PdfFooter settings={printSettingsSnapshot} />
            </Page>
        </Document>
    );
};
