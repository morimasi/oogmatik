import React from 'react';
import { MatSinavOnizleme } from '../MatSinavStudyosu/MatSinavOnizleme';
import { CollectionItem } from '../../types';

interface MatSinavRendererProps {
    data: any;
    settings: any;
}

export const MatSinavRenderer: React.FC<MatSinavRendererProps> = ({ data, settings }) => {
    const activeData = Array.isArray(data) ? data[0] : data;
    const sinavObj = activeData?.data?.[0] || activeData;
    const printConfig = activeData?.printConfig || (activeData?.config as any);

    if (!sinavObj || !sinavObj.sorular) {
        return (
            <div className="p-8 text-center text-gray-400">
                Matematik Sınav verisi yüklenemedi.
            </div>
        );
    }

    return (
        <div className="mat-sinav-workbook-wrapper w-full bg-white">
            <MatSinavOnizleme
                sinav={sinavObj}
                config={printConfig}
                isPrinting={true}
                onUpdateSoru={() => { }} // Workbook'ta editleme kapalı
                onRefreshSoru={() => { }}
                refreshingIndex={null}
            />
        </div>
    );
};
