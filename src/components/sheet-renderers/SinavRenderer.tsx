import React from 'react';
import { SinavOnizleme } from '../SinavStudyosu/SinavOnizleme';
import { CollectionItem, WorkbookSettings } from '../../types';

interface SinavRendererProps {
    data: any;
    settings: WorkbookSettings;
}

export const SinavRenderer: React.FC<SinavRendererProps> = ({ data, settings }) => {
    // data[0] veya data'nın kendisi SingleWorksheetData olabilir.
    const activeData = Array.isArray(data) ? data[0] : data;
    
    // Sinav objesini ayıkla
    // Eğer data bir 'chunk' ise (useWorkbookActions tarafından bölünmüş), 
    // sorular dizisi doğrudan activeData içindedir.
    const sinavObj = activeData;
    const printConfig = activeData?.printConfig || (activeData?.config as any);

    // Eğer sorular yoksa, meta verilerin içindeki asıl nesneyi ara
    const finalSinav = (sinavObj?.sorular) ? sinavObj : (activeData?.data?.[0] || activeData);

    if (!finalSinav || !finalSinav.sorular) {
        return (
            <div className="p-8 text-center text-gray-400">
                Sınav verisi yüklenemedi.
            </div>
        );
    }

    return (
        <div className="sinav-workbook-wrapper w-full bg-white">
            <SinavOnizleme 
                sinav={sinavObj} 
                config={printConfig} 
                isPrinting={true} // Kitapçıkta daima temiz çıktı ver
            />
        </div>
    );
};
