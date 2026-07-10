import React, { Suspense, useState, useCallback, useMemo } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useFascicleTemplateStore, SavedFascicleTemplate } from '../../store/useFascicleTemplateStore';
import { Eye, Smartphone, Monitor, Info, LayoutTemplate, BookTemplate, Save, Trash2, Check, Loader2, X, Droplets } from 'lucide-react';
import { SheetRenderer } from '../SheetRenderer';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../../types';
import { WatermarkSettings } from '../../types/fascicle';
import { FascicleCoverPage } from './FascicleCoverPage';
import { FascicleWatermarkSettingsModal } from './FascicleWatermarkSettingsModal';
import { useStudentStore } from '../../store/useStudentStore';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { normalizeFascicleContent, getFasciclePageCount } from '../../utils/fascicleContentNormalizer';

const renderWatermark = (ws: WatermarkSettings) => {
  if (ws.type === 'image') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden p-12" style={{ opacity: ws.opacity / 100 }}>
        <img src="/assets/logo.png" alt="" className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 overflow-hidden" style={{ transform: `rotate(${ws.rotation}deg)` }}>
      <span style={{
        fontSize: `${ws.fontSize}px`,
        color: ws.color,
        opacity: ws.opacity / 100,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        userSelect: 'none',
        fontFamily: 'Lexend, sans-serif',
      }}>
        {ws.text}
      </span>
    </div>
  );
};

export const FasciclePreview: React.FC = () => {
  const { items, metadata, setFascicle } = useFascicleStore();
  const { templates, saveTemplate, deleteTemplate } = useFascicleTemplateStore();
  const { activeStudent } = useStudentStore();
  const [viewState, setViewState] = useState<'desktop' | 'mobile'>('desktop');
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showWatermarkSettings, setShowWatermarkSettings] = useState(false);

  const handleSaveAsTemplate = useCallback(() => {
    if (items.length === 0) {
      toast.error('Kaydedilecek içerik bulunamadı.');
      return;
    }
    const name = templateName.trim() || `${metadata.title || 'Fasikül'} Şablonu`;
    const desc = `${items.length} aktivite, ${items.reduce((s, i) => s + i.pageCount, 0)} sayfa`;
    saveTemplate({
      title: name,
      description: desc,
      metadata: { ...metadata },
      items: JSON.parse(JSON.stringify(items)),
      pageCount: items.reduce((s, i) => s + i.pageCount, 0),
      activityCount: items.length,
    });
    toast.success('Fasikül şablon olarak kaydedildi!');
    setShowSaveConfirm(false);
    setTemplateName('');
  }, [items, metadata, saveTemplate, templateName]);

  const handleLoadTemplate = useCallback((tpl: SavedFascicleTemplate) => {
    const freshItems = tpl.items.map(item => ({
      ...item,
      id: uuidv4(),
    }));
    setFascicle({
      id: `fascicle-${Date.now()}`,
      createdAt: new Date().toISOString(),
      metadata: tpl.metadata,
      items: freshItems,
      creatorId: '',
      assignedStudentIds: [],
      isDraft: true,
    });
    setShowTemplates(false);
    toast.success(`"${tpl.title}" yüklendi!`);
  }, [setFascicle]);

  const handleDeleteTemplate = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteTemplate(id);
    toast.success('Şablon silindi.');
  }, [deleteTemplate]);

  return (
    <div className="w-full max-w-4xl h-full flex flex-col">
      {/* Preview Toolbar */}
       <div className="glass-layer-2 flex justify-between items-center px-4 py-3 mb-6 rounded-[var(--radius-premium)] no-print relative z-20">
         <div className="flex items-center text-[var(--text-secondary)]">
            <Eye size={18} className="mr-2" />
            <span className="text-sm font-medium">Canlı Önizleme Modu ({viewState === 'desktop' ? 'Baskı Ebatı' : 'Mobil/Tablet'})</span>
         </div>
         <div className="flex items-center space-x-2">
            {/* Template Save Button */}
            {items.length > 0 && (
              <button
                onClick={() => setShowSaveConfirm(true)}
                className="studio-icon-btn p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-400"
                title="Fasikülü Şablon Olarak Kaydet"
              >
                <Save size={16} />
              </button>
            )}

            {/* Template Load Button */}
            <div className="relative">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className={`studio-icon-btn p-1.5 rounded-lg ${showTemplates ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
                title="Kayıtlı Fasikül Şablonları"
              >
                <BookTemplate size={16} />
              </button>

              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowTemplates(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
                    <div className="p-3 border-b border-[var(--border-color)] flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">Kayıtlı Şablonlar</h4>
                      <span className="text-xs text-[var(--text-muted)]">{templates.length} adet</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar p-2 space-y-1">
                      {templates.length === 0 ? (
                        <div className="text-center py-6 text-[var(--text-muted)] text-xs">
                          <BookTemplate size={24} className="mx-auto mb-2 opacity-50" />
                          <p>Henüz kayıtlı şablon yok.</p>
                          <p className="mt-1">Fasikülü oluşturup kaydedin.</p>
                        </div>
                      ) : (
                        templates.map((tpl) => (
                          <div
                            key={tpl.id}
                            onClick={() => handleLoadTemplate(tpl)}
                            className="p-3 rounded-xl bg-[var(--bg-paper)]/50 border border-[var(--border-color)] hover:border-[var(--accent-muted)] cursor-pointer transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-semibold text-[var(--text-primary)] truncate">{tpl.title}</h5>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{tpl.description}</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
                                    {tpl.activityCount} aktivite
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)]">{tpl.pageCount} sayfa</span>
                                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(tpl.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                                className="studio-icon-btn p-1 rounded-lg opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all shrink-0 ml-2"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-[var(--border-color)] text-center">
                      <span className="text-[10px] text-[var(--text-muted)]">Bir şablona tıklayarak fasikülü tamamen yükleyin</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Watermark Settings */}
            <button
              onClick={() => setShowWatermarkSettings(true)}
              className={`studio-icon-btn p-1.5 rounded-lg ${metadata.watermarkSettings?.enabled ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
              title="Filigran Ayarları"
            >
              <Droplets size={16} />
            </button>

            {/* View Toggle */}
            <button 
               onClick={() => setViewState('mobile')}
               className={`studio-icon-btn p-1.5 rounded-lg ${viewState === 'mobile' ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
               title="Mobil/Tablet Küçültülmüş Görünüm">
              <Smartphone size={16} />
            </button>
            <button 
               onClick={() => setViewState('desktop')}
               className={`studio-icon-btn p-1.5 rounded-lg ${viewState === 'desktop' ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
               title="Gerçek Baskı Görünümü">
              <Monitor size={16} />
            </button>
         </div>
      </div>

      {/* Save as Template Confirm Modal */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-full max-w-md" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Şablon Olarak Kaydet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Mevcut fasikül ({items.length} aktivite) şablon olarak kaydedilecek. Daha sonra tekrar yükleyebilirsiniz.
            </p>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Şablon adı (opsiyonel)"
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-colors mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowSaveConfirm(false); setTemplateName(''); }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-paper)] transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleSaveAsTemplate}
                className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                style={{ background: 'var(--accent-color)', color: '#ffffff' }}
              >
                <Save size={16} />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* A4 Paper Mockup Scroll Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-20 transition-transform duration-300 origin-top ${viewState === 'mobile' ? 'scale-[0.85]' : 'scale-100'}`}>
         <div id="fascicle-print-container" className="w-full flex flex-col items-center">
              {/* Kapak Sayfası */}
               <FascicleCoverPage settings={metadata.coverPageSettings || {
                 enabled: true,
                 title: metadata.title,
                 subtitle: 'Kişiselleştirilmiş Öğrenme Materyali',
                 themeStyle: 'clouds',
                 primaryColor: 'lavender',
                 showStudentLine: true,
                 schoolName: 'Oogmatik Eğitim Platformu'
               }} student={activeStudent} fascicleTitle={metadata.title} watermarkSettings={metadata.watermarkSettings} />

             {/* İçerik Sayfaları (Items) */}
             {items.length > 0 ? items.map((item, index) => {
               const isExam = item.type === ActivityType.SINAV || item.type === ActivityType.MAT_SINAV;
               const defaultColumns = isExam ? 2 : 1;

               const normalized = normalizeFascicleContent(item, defaultColumns);

               const dynamicSettings = {
                 columns: defaultColumns,
                 ...((item.content as any)?.printConfig || {}),
                 ...(isExam ? {} : ((item.content as any)?.settings || {})),
                 ...(isExam ? {} : ((item.content as any)?.config || {})),
                 ...(isExam ? {} : ((item.content as any)?.styleSettings || {})),
               };

               return (
                 <div key={item.id} className="relative group/page">
                    <div className="absolute -left-48 top-0 w-40 h-full no-print hidden xl:flex flex-col gap-4 py-4 pointer-events-none">
                       <div className="glass-layer-3 p-4 rounded-2xl pointer-events-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--accent-color)' }}>Sayfa {index + 2}</span>
                          <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">{item.type.replace(/-/g, ' ').toUpperCase()}</h4>
                          <div className="mt-2 flex items-center gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${item.difficulty === 'Zor' ? 'bg-red-500' : item.difficulty === 'Orta' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                             <span className="text-[10px] text-[var(--text-muted)]">{item.difficulty} Seviye</span>
                          </div>
                       </div>
                    </div>

                    <div className="w-[210mm] h-[297mm] mx-auto shrink-0 shadow-2xl mb-12 bg-white relative print-exact worksheet-page overflow-hidden border border-[var(--border-color)]">
                      {metadata.watermarkSettings?.enabled && renderWatermark(metadata.watermarkSettings)}
                      <div className="p-[8mm] h-full flex flex-col">
                        <Suspense fallback={
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottomColor: 'var(--accent-color)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'transparent', borderWidth: '3px' }}></div>
                          </div>
                        }>
                          <SheetRenderer 
                            data={normalized.data}
                            activityType={normalized.activityType}
                            hideWrapper={true}
                            settings={{
                              fontSize: '1rem',
                              lineHeight: 1.6,
                              scale: 1,
                              borderColor: '#e2e8f0',
                              borderWidth: 1,
                              margin: 10,
                              columns: defaultColumns,
                              gap: 20,
                              orientation: 'portrait',
                              themeBorder: 'none',
                              contentAlign: 'left',
                              fontWeight: 'normal',
                              fontStyle: 'normal',
                               visualStyle: 'minimal',
                               showMascot: false,
                              showStudentInfo: false,
                              showTitle: true,
                              showInstruction: true,
                              showImage: true,
                              showFooter: true,
                              showAnswers: false,
                              showClues: false,
                              footerText: `Fasikül Sayfası • bdmind Education`,
                              smartPagination: true,
                              fontFamily: 'Lexend',
                              letterSpacing: 0,
                              wordSpacing: 0,
                              paragraphSpacing: 0,
                              ...dynamicSettings
                            } as StyleSettings}
                          />
                        </Suspense>
                      </div>
                    </div>
                 </div>
               );
             }) : (
                <div className="glass-layer-3 p-12 rounded-[var(--radius-premium)] text-center max-w-md mt-12 no-print">
                   <div className="w-20 h-20 bg-[var(--bg-paper)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                      <LayoutTemplate size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Fasikülünüz Henüz Boş</h3>
                   <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      Matematik, Okuma veya Sınav stüdyolarından içerik ekleyerek disleksi dostu bir fasikül oluşturmaya başlayın.
                   </p>
                </div>
             )}
         </div>
      </div>

      <FascicleWatermarkSettingsModal
        isOpen={showWatermarkSettings}
        onClose={() => setShowWatermarkSettings(false)}
      />
    </div>
  );
};
