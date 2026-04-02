import React, { useState } from 'react';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { ParameterPanelState } from './panels/LeftPanel/ParameterPanel';
import { useInfographicStudio } from './hooks/useInfographicStudio';
import { useInfographicGenerate } from './hooks/useInfographicGenerate';
import { useInfographicExport } from './hooks/useInfographicExport';

export interface AddedWidget {
  id: string;
  activityId: string;
}

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

  const { isGenerating, result, generate, enrichPrompt } = useInfographicGenerate();
  const { handleExportToWorksheet, handleExportToPDF, handlePrint } = useInfographicExport();

  const [params, setParams] = useState<ParameterPanelState>({
    topic: '',
    ageGroup: '8-10',
    profile: 'general',
    difficulty: 'Orta',
  });

  const [addedWidgets, setAddedWidgets] = useState<AddedWidget[]>([]);

  const onAddWidget = (activityId: string) => {
    setAddedWidgets(prev => [...prev, { id: Date.now().toString(), activityId }]);
    
    // Konu/Prompt metnine otomatik ekleme yap
    setParams(prev => ({
        ...prev,
        topic: prev.topic 
            ? `${prev.topic}\n+ ${activityId.replace(/_/g, ' ')} modülü eklendi.` 
            : `Bu kağıt şu modülleri içermelidir:\n- ${activityId.replace(/_/g, ' ')}`
    }));
  };

  const onRemoveWidget = (id: string) => {
    setAddedWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleEnrichPrompt = async () => {
      const enriched = await enrichPrompt(params.topic);
      if (enriched && enriched !== params.topic) {
          setParams(prev => ({ ...prev, topic: enriched }));
      }
  };

  const onGenerate = () => {
    if (addedWidgets.length > 0) {
      generate(addedWidgets, mode, params.topic, {
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
          <h1 className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
            Premium Worksheet Studio <span className="text-xs text-white/50 font-normal ml-2 tracking-widest uppercase">Composite Generator</span>
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
          addedWidgets={addedWidgets}
          onAddWidget={onAddWidget}
          onRemoveWidget={onRemoveWidget}
          onEnrichPrompt={handleEnrichPrompt}
        />

        {/* Orta Panel: Önizleme Alanı */}
        <CenterPanel
          result={result}
          isGenerating={isGenerating}
        />

        {/* Sağ Panel: Pedagojik Notlar ve Çıktı Alma */}
        <RightPanel
          result={result}
          onExportWorksheet={() => handleExportToWorksheet(result as any)}
          onExportPDF={() => handleExportToPDF(result as any)}
          onPrint={() => handlePrint(result as any)}
          onSubmitForApproval={async () => {
            if (result) {
              try {
                // Auth token for the API request
                const token = localStorage.getItem('auth_token');
                
                const response = await fetch('/api/worksheets', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                  },
                  body: JSON.stringify({ 
                    name: result.title || 'Premium Worksheet',
                    activityType: 'COMPOSITE_WORKSHEET',
                    category: result.topic || 'Genel',
                    data: { ...result, status: 'pending_approval' } 
                  })
                });

                if (!response.ok) {
                  const errJson = await response.json().catch(()=>({}));
                  throw new Error(errJson.error?.message || 'Kaydetme hatası');
                }
                
                alert('Başarılı! Çalışma kağıdı klinik kurula (Admin onayına) gönderildi.');
              } catch (err: any) {
                console.error(err);
                alert(`Onaya gönderilirken bir hata oluştu: ${err.message}`);
              }
            }
          }}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default InfographicStudio;
