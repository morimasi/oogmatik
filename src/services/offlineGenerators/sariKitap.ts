import { GeneratorOptions } from '../../types';

export const generateOfflineSariKitapStudio = async (options: GeneratorOptions): Promise<any[]> => {
    const opts = options || {};
    const customSettings = (opts as any).customSettings || {};

    const moduleType = customSettings.moduleType || 'pencere';

    // Standart Sarı Kitap Stüdyosu Taslak Dönüşü
    return [
        {
            title: 'Sarı Kitap Stüdyosu (Taslak)',
            instruction: 'Seçili Modül: ' + moduleType.toUpperCase(),
            puzzles: [],
            content: { moduleType },
            settings: customSettings
        }
    ];
};
