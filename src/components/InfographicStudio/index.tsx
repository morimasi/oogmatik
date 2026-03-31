import React, { useState } from 'react';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { ParameterPanelState } from './panels/LeftPanel/ParameterPanel';
import { useInfographicStudio } from './hooks/useInfographicStudio';
import { useInfographicGenerate } from './hooks/useInfographicGenerate';
import { useInfographicExport } from './hooks/useInfographicExport';

export const InfographicStudio: React.FC = () => {
  const {
    selectedCategory,
    selectedActivity,
    mode,
    isAnonymousMode,
    handleCategoryChange,
    handleActivitySelect,
    handleModeChange,
  } = useInfographicStudio();

  const { isGenerating, result, generate } = useInfographicGenerate();
  const { handleExportToWorksheet, handleExportToPDF, handlePrint } = useInfographicExport();

  const [params, setParams] = useState<ParameterPanelState>({
    topic: '',
    ageGroup: '8-10',
    profile: 'general',
    difficulty: 'Orta',
  });

  const onGenerate = () => {
    if (selectedActivity) {
      generate(selectedActivity, mode, params.topic, {
        studentAge: params.ageGroup,
        difficulty: params.difficulty,
        profile: params.profile
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B1120] text-slate-200 overflow-hidden font-inter">
      {/* Üst Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            İnfografik Stüdyosu <span className="text-xs text-white/50 font-normal ml-2 tracking-widest uppercase">v3 Ultra Premium</span>
          </h1>
        </div>
      </div>

      {/* 3 Panelli İçerik Alanı */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol Panel: Kategoriler, Aktiviteler, Parametreler */}
        <LeftPanel
          selectedCategory={selectedCategory}
          selectedActivity={selectedActivity}
          mode={mode}
          onCategoryChange={handleCategoryChange}
          onActivitySelect={handleActivitySelect}
          onModeChange={handleModeChange}
          params={params}
          onParamsChange={setParams}
          isClinicalMode={isAnonymousMode}
          onGenerate={onGenerate}
          isGenerating={isGenerating}
        />

        {/* Orta Panel: Önizleme Alanı */}
        <CenterPanel
          result={result}
          isGenerating={isGenerating}
        />

        {/* Sağ Panel: Pedagojik Notlar ve Çıktı Alma */}
        <RightPanel
          result={result}
          onExportWorksheet={() => handleExportToWorksheet(result)}
          onExportPDF={() => handleExportToPDF(result)}
          onPrint={() => handlePrint(result)}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default InfographicStudio;
