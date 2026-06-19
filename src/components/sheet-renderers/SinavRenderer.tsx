import React from 'react';
import { SinavOnizleme } from '../SinavStudyosu/SinavOnizleme';
import { CollectionItem, WorkbookSettings } from '../../types';

interface SinavRendererProps {
    data: any;
    settings: WorkbookSettings;
}

export const SinavRenderer: React.FC<SinavRendererProps> = ({ data, settings }) => {
    // data[0] veya data'nın kendisi SingleWorksheetData olabilir.
    // Studio'dan gelen veride ana nesne içerisinde sınav objesi 'data' dizisi altındadır.
    const activeData = Array.isArray(data) ? data[0] : data;
    
    // Sinav objesini ayıkla (SinavOnizleme'nin beklediği format)
    // SinavStudyosu.tsx içindeki handleAddToWorkbook'tan gelen yapı: { ...aktifSinav, printConfig }
    const sinavObj = activeData?.data?.[0] || activeData;
    const printConfig = activeData?.printConfig || (activeData?.config as any);

    if (!sinavObj || !sinavObj.sorular) {
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
