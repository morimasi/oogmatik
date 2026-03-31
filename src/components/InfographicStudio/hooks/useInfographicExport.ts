import { useCallback } from 'react';
import { useWorksheetStore } from '../../../store/useWorksheetStore';
import { useToastStore } from '../../../store/useToastStore';
import { WorksheetBlock } from '../../../types/activity';
import { CompositeWorksheet } from '../../../types/worksheet';
import { printService } from '../../../utils/printService';

export const useInfographicExport = () => {
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

    const handleExportToPDF = useCallback(async (result: CompositeWorksheet | null) => {
        if (!result) return;

        try {
            show('PDF dışa aktarma işlemi başlatıldı.', 'success');
            await printService.captureAndPrint(
                '#a4-printable-sheet',
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
                '#a4-printable-sheet',
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
    };
};
