import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { generateSuperStudioContent } from '../../../services/generators/superStudioGenerator';
import { TemplateSettingsRegistry, GenericTemplateSettings } from '../templates';

export const ConfiguratorCascade: React.FC = () => {
    const {
        selectedTemplates, templateSettings, generationMode, grade, difficulty, studentId,
        setIsGenerating, isGenerating, clearGeneratedContents, addGeneratedContent, setTemplateSetting
    } = useSuperStudioStore();

    const handleGenerate = async () => {
        setIsGenerating(true);
        clearGeneratedContents();

        try {
            const results = await generateSuperStudioContent({
                templates: selectedTemplates,
                settings: templateSettings,
                mode: generationMode,
                grade,
                difficulty,
                studentId
            });

            for (const res of results) {
                addGeneratedContent(res);
            }
        } catch (error) {
            console.error("Üretim sırasında hata:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    if (selectedTemplates.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed border-slate-700 rounded-xl text-slate-500 text-sm">
                Lütfen yukarıdaki menüden bir veya daha fazla şablon seçin. Seçtiğiniz şablonların özel ayarları burada sırayla (cascade) açılacaktır.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-medium text-slate-200 mb-2 flex items-center">
                <span className="w-1.5 h-5 bg-teal-500 rounded-full mr-2"></span>
                Şablon Ayarları
            </h2>
            {selectedTemplates.map((templateId: string, index: number) => (
                <div key={templateId} className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">
                            <span className="text-slate-500 mr-2">#{index + 1}</span>
                            {templateId.replace('-', ' ')}
                        </h3>
                    </div>
                    <div className="mt-2 text-slate-200">
                        {(() => {
                            const SettingsComponent = TemplateSettingsRegistry[templateId] || GenericTemplateSettings;
                            const currentSettings = templateSettings[templateId] || {};
                            return (
                                <SettingsComponent
                                    templateId={templateId}
                                    settings={currentSettings}
                                    onChange={(payload: any) => setTemplateSetting(templateId, payload)}
                                />
                            );
                        })()}
                    </div>
                </div>
            ))}

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full mt-4 text-white font-medium py-3 rounded-xl shadow-lg transition-all flex justify-center items-center ${isGenerating ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-indigo-500/20'
                    }`}
            >
                <span>{isGenerating ? 'İçerikler Sistematik Olarak Üretiliyor...' : 'İçerikleri Üret (Batch Mod)'}</span>
                {!isGenerating && <span className="ml-2">✨</span>}
            </button>
        </div>
    );
};
