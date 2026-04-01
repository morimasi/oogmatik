import React, { useState } from 'react';
import { LeftPanel } from './panels/LeftPanel';
import { CenterPanel } from './panels/CenterPanel';
import { RightPanel } from './panels/RightPanel';
import { ParameterPanelState } from './panels/LeftPanel/ParameterPanel';
import { useInfographicStudio } from './hooks/useInfographicStudio';
import { useInfographicGenerate } from './hooks/useInfographicGenerate';
import { useInfographicExport } from './hooks/useInfographicExport';
import { WorksheetActivityRenderer } from '../WorksheetActivityRenderer';
import { generateWorksheetActivity } from '../../services/generators/infographic/worksheetTemplates';
import { WORKSHEET_TEMPLATES_META, WORKSHEET_CATEGORIES } from './constants/worksheetActivityMeta';
import { useToastStore } from '../../store/useToastStore';
import { Sparkles, Loader2, Plus, X, PenTool, BarChart3 } from 'lucide-react';
import { cn } from '../../utils/tailwindUtils';
import type { WorksheetActivityData, WorksheetActivityCategory, WorksheetTemplateType } from '../../types/worksheetActivity';

export interface AddedWidget {
  id: string;
  activityId: string;
}

type StudioTab = 'infographic' | 'worksheet';

export const InfographicStudio: React.FC = () => {
  // ── Üst Seviye Sekme Durumu ──
  const [activeTab, setActiveTab] = useState<StudioTab>('worksheet');

  // ── İnfografik Stüdyosu (mevcut) ──
  const {
    selectedCategory,
    selectedActivity,
    mode,
    isAnonymousMode,
    handleCategoryChange,
    handleActivitySelect,
    handleModeChange,
  } = useInfographicStudio();

  const { isGenerating: isInfographicGenerating, result: infographicResult, generate, enrichPrompt } = useInfographicGenerate();
  const { handleExportToWorksheet, handleExportToPDF, handlePrint } = useInfographicExport();

  const [params, setParams] = useState<ParameterPanelState>({
    topic: '',
    ageGroup: '8-10',
    profile: 'general',
    difficulty: 'Orta',
  });

  const [addedWidgets, setAddedWidgets] = useState<AddedWidget[]>([]);

  // ── Etkinlik Oluşturucu (yeni) ──
  const [wsCategory, setWsCategory] = useState<WorksheetActivityCategory>('ws-visual-spatial');
  const [wsSelectedTemplate, setWsSelectedTemplate] = useState<WorksheetTemplateType | null>(null);
  const [wsTopic, setWsTopic] = useState('');
  const [wsDifficulty, setWsDifficulty] = useState<'Kolay' | 'Orta' | 'Zor'>('Orta');
  const [wsAgeGroup, setWsAgeGroup] = useState<'5-7' | '8-10' | '11-13' | '14+'>('8-10');
  const [wsSectionCount, setWsSectionCount] = useState(4);
  const [wsIsGenerating, setWsIsGenerating] = useState(false);
  const [wsResult, setWsResult] = useState<WorksheetActivityData | null>(null);
  const [wsShowAnswerKey, setWsShowAnswerKey] = useState(false);
  const { show } = useToastStore();

  const currentTemplates = WORKSHEET_TEMPLATES_META.filter(t => t.categoryId === wsCategory);

  const handleWsGenerate = async () => {
    if (!wsSelectedTemplate) {
      show('Lütfen bir etkinlik şablonu seçin.', 'warning');
      return;
    }
    setWsIsGenerating(true);
    setWsResult(null);
    try {
      const result = await generateWorksheetActivity(wsSelectedTemplate, {
        topic: wsTopic || 'Genel',
        ageGroup: wsAgeGroup,
        profile: 'general',
        difficulty: wsDifficulty,
        sectionCount: wsSectionCount,
        mode: 'offline',
      });
      setWsResult(result);
      show('Etkinlik başarıyla üretildi!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Etkinlik üretilirken hata oluştu.';
      show(msg, 'error');
    } finally {
      setWsIsGenerating(false);
    }
  };

  // ── İnfografik Yardımcıları (mevcut) ──
  const onAddWidget = (activityId: string) => {
    setAddedWidgets(prev => [...prev, { id: Date.now().toString(), activityId }]);
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
      {/* Üst Header + Sekme Sistemi */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 bg-slate-900/80 backdrop-blur-md justify-between">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {activeTab === 'worksheet' ? 'Etkinlik Oluşturucu Stüdyosu' : 'İnfografik Stüdyosu'}
            <span className="text-xs text-white/50 font-normal ml-2 tracking-widest uppercase">
              {activeTab === 'worksheet' ? 'Kalemle Çözülecek Etkinlikler' : 'Composite Generator'}
            </span>
          </h1>
        </div>

        {/* Sekme butonları */}
        <div className="flex items-center bg-slate-800/50 rounded-full p-1 border border-white/10">
          <button
            onClick={() => setActiveTab('worksheet')}
            className={cn(
              "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
              activeTab === 'worksheet'
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-white/60 hover:text-white"
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Etkinlik Oluşturucu</span>
          </button>
          <button
            onClick={() => setActiveTab('infographic')}
            className={cn(
              "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
              activeTab === 'infographic'
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg"
                : "text-white/60 hover:text-white"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>İnfografik</span>
          </button>
        </div>
      </div>

      {/* İçerik Alanı */}
      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'worksheet' ? (
          /* ═══════════════════════════════════════════════════════════
             ETKİNLİK OLUŞTURUCU STÜDYOSU (YENİ)
             ═══════════════════════════════════════════════════════════ */
          <>
            {/* Sol Panel: Kategoriler + Şablonlar + Parametreler */}
            <div className="w-80 h-full flex flex-col bg-slate-900/50 backdrop-blur-md border-r border-white/10 p-4">
              <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                {/* Kategoriler */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Kategori</h3>
                  <div className="space-y-1">
                    {WORKSHEET_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { setWsCategory(cat.id); setWsSelectedTemplate(null); }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          wsCategory === cat.id
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Şablonlar */}
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                    Etkinlik Şablonları ({currentTemplates.length})
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {currentTemplates.map(tmpl => (
                      <button
                        key={tmpl.id}
                        onClick={() => setWsSelectedTemplate(tmpl.id)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl text-center transition-all border",
                          wsSelectedTemplate === tmpl.id
                            ? "bg-indigo-500/20 border-indigo-500/60 text-white shadow-lg shadow-indigo-500/10"
                            : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
                        )}
                      >
                        <span className="text-lg mb-1">✏️</span>
                        <span className="text-[11px] font-semibold leading-tight">{tmpl.title}</span>
                        <span className="text-[9px] text-white/40 mt-1">{tmpl.studentAction}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parametreler */}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Konu / Bağlam</label>
                    <textarea
                      value={wsTopic}
                      onChange={e => setWsTopic(e.target.value)}
                      placeholder="Ör: Hayvanlar, Mevsimler, Toplama İşlemi..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 resize-none h-16 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Zorluk</label>
                      <select
                        value={wsDifficulty}
                        onChange={e => setWsDifficulty(e.target.value as 'Kolay' | 'Orta' | 'Zor')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                      >
                        <option value="Kolay">Kolay</option>
                        <option value="Orta">Orta</option>
                        <option value="Zor">Zor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 mb-1 block">Yaş Grubu</label>
                      <select
                        value={wsAgeGroup}
                        onChange={e => setWsAgeGroup(e.target.value as '5-7' | '8-10' | '11-13' | '14+')}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                      >
                        <option value="5-7">5-7 yaş</option>
                        <option value="8-10">8-10 yaş</option>
                        <option value="11-13">11-13 yaş</option>
                        <option value="14+">14+ yaş</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-1 block">Soru Sayısı: {wsSectionCount}</label>
                    <input
                      type="range"
                      min={2}
                      max={12}
                      value={wsSectionCount}
                      onChange={e => setWsSectionCount(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Üret Butonu */}
              <div className="pt-4 mt-2">
                <button
                  onClick={handleWsGenerate}
                  disabled={!wsSelectedTemplate || wsIsGenerating}
                  className={cn(
                    "w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg",
                    wsSelectedTemplate && !wsIsGenerating
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-indigo-500/25"
                      : "bg-white/5 text-white/40 cursor-not-allowed"
                  )}
                >
                  {wsIsGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Etkinlik Üretiliyor...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Etkinlik Üret</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Orta Panel: Önizleme */}
            <div className="flex-1 h-full bg-slate-950/40 relative flex flex-col">
              <div className="flex-1 flex items-start justify-center overflow-auto py-8 px-4">
                {wsIsGenerating ? (
                  <div className="flex flex-col items-center justify-center p-8 text-white/50 space-y-4 mt-20">
                    <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="font-medium animate-pulse">Etkinlik üretiliyor...</p>
                  </div>
                ) : wsResult ? (
                  <div className="w-[210mm] min-h-[297mm] bg-white shadow-2xl border border-slate-300 overflow-hidden">
                    <WorksheetActivityRenderer data={wsResult} showAnswerKey={wsShowAnswerKey} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-white/30 mt-20 space-y-4">
                    <PenTool className="w-16 h-16 opacity-30" />
                    <div>
                      <p className="text-lg font-semibold">Etkinlik Oluşturucu Stüdyosu</p>
                      <p className="text-sm mt-1">Soldaki menüden bir kategori ve şablon seçin, ardından "Etkinlik Üret" butonuna tıklayın.</p>
                      <p className="text-xs mt-3 text-white/20">Öğrencilerin kalemle yazıp çizeceği çalışma kağıtları üretin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Alt Araç Çubuğu */}
              {wsResult && (
                <div className="h-12 flex items-center justify-center gap-3 border-t border-white/10 bg-slate-900/60 px-4">
                  <button
                    onClick={() => setWsShowAnswerKey(!wsShowAnswerKey)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-medium transition-all border",
                      wsShowAnswerKey
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                    )}
                  >
                    🔑 {wsShowAnswerKey ? 'Cevapları Gizle' : 'Cevap Anahtarı'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    🖨️ Yazdır
                  </button>
                  <button
                    onClick={() => { setWsResult(null); setWsSelectedTemplate(null); }}
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    🔄 Yeni Etkinlik
                  </button>
                </div>
              )}
            </div>

            {/* Sağ Panel: Pedagojik Not */}
            {wsResult && (
              <div className="w-72 h-full bg-slate-900/50 backdrop-blur-md border-l border-white/10 p-4 overflow-y-auto">
                <h3 className="text-sm font-semibold text-white/70 mb-3">📚 Pedagojik Not</h3>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white/60 leading-relaxed">
                  {wsResult.pedagogicalNote}
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-white/50 mb-2">Hedef Beceriler</h4>
                  <div className="flex flex-wrap gap-1">
                    {wsResult.targetSkills.map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-white/40">
                  <div>⏱ Tahmini süre: {wsResult.estimatedDuration} dk</div>
                  <div>📊 Zorluk: {wsResult.difficultyLevel}</div>
                  <div>🎯 Yaş: {wsResult.ageGroup}</div>
                  <div>📝 Soru: {wsResult.sections.length} adet</div>
                  <div>🔑 Cevap anahtarı: {wsResult.hasAnswerKey ? 'Var' : 'Yok'}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════
             İNFOGRAFİK STÜDYOSU (MEVCUT — KORUNUYOR)
             ═══════════════════════════════════════════════════════════ */
          <>
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
              isGenerating={isInfographicGenerating}
              addedWidgets={addedWidgets}
              onAddWidget={onAddWidget}
              onRemoveWidget={onRemoveWidget}
              onEnrichPrompt={handleEnrichPrompt}
            />
            <CenterPanel
              result={infographicResult}
              isGenerating={isInfographicGenerating}
            />
            <RightPanel
              result={infographicResult}
              onExportWorksheet={() => handleExportToWorksheet(infographicResult as never)}
              onExportPDF={() => handleExportToPDF(infographicResult as never)}
              onPrint={() => handlePrint(infographicResult as never)}
              onSubmitForApproval={async () => {
                if (infographicResult) {
                  try {
                    const token = localStorage.getItem('auth_token');
                    const response = await fetch('/api/worksheets', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                      },
                      body: JSON.stringify({
                        name: infographicResult.title || 'Premium Worksheet',
                        activityType: 'COMPOSITE_WORKSHEET',
                        category: infographicResult.topic || 'Genel',
                        data: { ...infographicResult, status: 'pending_approval' }
                      })
                    });
                    if (!response.ok) {
                      const errJson = await response.json().catch(() => ({}));
                      throw new Error((errJson as Record<string, Record<string, string>>).error?.message || 'Kaydetme hatası');
                    }
                    alert('Başarılı! Çalışma kağıdı klinik kurula (Admin onayına) gönderildi.');
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
                    alert(`Onaya gönderilirken bir hata oluştu: ${msg}`);
                  }
                }
              }}
              isGenerating={isInfographicGenerating}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InfographicStudio;
