import { useCallback } from 'react';
import { useWorksheetStore } from '@/store/useWorksheetStore';
import { useToastStore } from '@/store/useToastStore';
import { WorksheetBlock } from '@/types/activity';
import { InfographicActivityResult } from '@/types/infographic';
import { printService } from '@/utils/printService';

export const useInfographicExport = () => {
    const { addBlockToActiveWorksheet, activeWorksheet } = useWorksheetStore();
    const { showToast } = useToastStore();

    const handleExportToWorksheet = useCallback((
        result: InfographicActivityResult | null,
        customStyle?: any
    ) => {
        if (!result) {
            showToast('Eklenecek bir üretim bulunamadı.', 'warning');
            return;
        }

        if (!activeWorksheet) {
            showToast('Öncelikle sağ panelden bir çalışma kâğıdı seçmeli veya oluşturmalısınız.', 'warning');
            return;
        }

        try {
            const block: WorksheetBlock = {
                id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                type: 'visual_clue_card',
                content: result,
                style: customStyle || {
                    backgroundColor: '#FFFFFF',
                    borderRadius: 8,
                },
                weight: 1
            };

            addBlockToActiveWorksheet(block);
            showToast('İnfografik başarıyla çalışma kâğıdına eklendi.', 'success');

        } catch (error) {
            showToast('Çalışma kâğıdına eklenirken bir hata oluştu.', 'error');
        }
    }, [activeWorksheet, addBlockToActiveWorksheet, showToast]);

    const handleExportToPDF = useCallback(async (result: InfographicActivityResult | null) => {
        if (!result) return;

        try {
            await printService.captureAndPrint(
                '#infographic-render-area',
                result.title || 'Oogmatik_Infografik',
                'download'
            );
            showToast('PDF dışa aktarma işlemi başlatıldı.', 'success');
        } catch (error) {
            showToast('PDF oluşturulurken bir hata oluştu.', 'error');
        }
    }, [showToast]);

    const handlePrint = useCallback(async (result: InfographicActivityResult | null) => {
        if (!result) return;

        try {
            await printService.captureAndPrint(
                '#infographic-render-area',
                result.title || 'Oogmatik_Infografik',
                'print'
            );
        } catch (error) {
            showToast('Yazdırma işlemi başlatılırken bir hata oluştu.', 'error');
        }
    }, [showToast]);

    return {
        handleExportToWorksheet,
        handleExportToPDF,
        handlePrint,
    };
};
