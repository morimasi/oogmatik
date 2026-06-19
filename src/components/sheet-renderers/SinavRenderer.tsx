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
    
    // Self-healing: Sorular nerede?
    // 1. Doğrudan objede mi?
    // 2. data[0] içinde mi?
    // 3. content içinde mi?
    const sinavObj = 
        (activeData?.sorular) ? activeData : 
        (activeData?.content?.sorular) ? activeData.content :
        (activeData?.data?.[0]?.sorular) ? activeData.data[0] : 
        activeData;

    const printConfig = sinavObj?.printConfig || activeData?.printConfig || (activeData?.config as any);

    if (!sinavObj || !sinavObj.sorular) {
        return (
            <div className="p-8 text-center text-gray-400 border border-dashed rounded-2xl">
                Sınav içeriği (sorular) bulunamadı.
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
