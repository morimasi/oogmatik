import { useCallback } from 'react';
import { useWorksheetStore } from '../../../store/useWorksheetStore';
import { useToastStore } from '../../../store/useToastStore';
import { WorksheetBlock } from '../../../types/activity';
import { CompositeWorksheet } from '../../../types/worksheet';
import { printService } from '../../../utils/printService';

export const useInfographicExport = (
    onSave?: (name: string, activityType: any, data: any) => Promise<any>,
    onAddToWorkbook?: (item: any) => void
) => {
    const { worksheetData, setWorksheetData } = useWorksheetStore();
    const { show } = useToastStore();

    const handleExportToWorksheet = useCallback((
        result: CompositeWorksheet | null,
        customStyle?: any
    ) => {
        if (!result) {
            show('Eklenecek bir üretim bulunamadı.', 'warning');
            return;
        }

        if (!worksheetData) {
            show('Öncelikle sağ panelden bir çalışma kâğıdı seçmeli veya oluşturmalısınız.', 'warning');
            return;
        }

        try {
            const block: WorksheetBlock = {
                id: `composite_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: 'text',
                content: result,
                style: customStyle || {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                },
                weight: 1
            };

            const dataArray = Array.isArray(worksheetData) ? worksheetData : [worksheetData];
            const updatedData = [...dataArray, block as any];
            
            setWorksheetData(updatedData as any);

            show('Çalışma kâğıdı başarıyla eklendi.', 'success');

        } catch (error) {
            show('Çalışma kâğıdına eklenirken bir hata oluştu.', 'error');
        }
    }, [worksheetData, setWorksheetData, show]);

    const handleSaveToArchive = useCallback(async (result: CompositeWorksheet | null) => {
        if (!result || !onSave) return;
        try {
            const name = result.title || result.topic || 'İnfografik Çalışması';
            const activityType = 'INFOGRAPHIC_STUDIO' as any;
            const worksheetData = [
                {
                    id: 'info-' + Date.now(),
                    type: 'text',
                    content: result,
                    metadata: { isInfographic: true }
                }
            ];

            await onSave(name, activityType, worksheetData);
            show('Materyal başarıyla arşive kaydedildi.', 'success');
        } catch (error) {
            show('Arşive kaydedilirken bir hata oluştu.', 'error');
        }
    }, [onSave, show]);

    const handleAddToWorkbook = useCallback((result: CompositeWorksheet | null) => {
        if (!result || !onAddToWorkbook) return;
        try {
            const item = {
                id: crypto.randomUUID(),
                activityType: 'INFOGRAPHIC_STUDIO' as any,
                data: result,
                title: result.title || result.topic || 'İnfografik Sayfası',
                settings: {
                    theme: 'modern',
                    showFooter: true,
                    showStudentInfo: true
                }
            };
            onAddToWorkbook(item);
            show('İnfografik kitapçığa başarıyla eklendi.', 'success');
        } catch (error) {
            show('Kitapçığa eklenirken bir hata oluştu.', 'error');
        }
    }, [onAddToWorkbook, show]);

    const handleExportToPDF = useCallback(async (result: CompositeWorksheet | null) => {
        if (!result) return;

        try {
            show('PDF dışa aktarma işlemi başlatıldı.', 'success');
            await printService.captureAndPrint(
                '.infographic-page-container',
                result.title || 'Oogmatik_Premium_Worksheet',
                'download'
            );
        } catch (error) {
            show('PDF oluşturulurken bir hata oluştu.', 'error');
        }
    }, [show]);

    const handlePrint = useCallback(async (result: CompositeWorksheet | null) => {
        if (!result) return;

        try {
            await printService.captureAndPrint(
                '.infographic-page-container',
                result.title || 'Oogmatik_Premium_Worksheet',
                'print'
            );
        } catch (error) {
            show('Yazdırma işlemi başlatılırken bir hata oluştu.', 'error');
        }
    }, [show]);

    return {
        handleExportToWorksheet,
        handleExportToPDF,
        handlePrint,
        handleSaveToArchive,
        handleAddToWorkbook,
    };
};
