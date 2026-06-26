import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { CoverPageSettings } from '../../types/fascicle';
import { X, Palette, Type, LayoutTemplate } from 'lucide-react';

interface FascicleCoverSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEMES = [
  { id: 'modern', label: 'Eğitim Modern', desc: 'Minimal köşeler ve degredeler' },
  { id: 'playful', label: 'Canlı & Neşeli', desc: 'Renkli lekeler ve enerjik yapı' },
  { id: 'geometric', label: 'Geometrik Çizgiler', desc: 'Keskin hatlar ve profesyonel' },
  { id: 'elegant', label: 'Elegant Sade', desc: 'Sakin çerçeve ve klasik zerafet' }
] as const;

const COLORS = [
  { id: 'indigo', name: 'İndigo' },
  { id: 'blue', name: 'Mavi' },
  { id: 'emerald', name: 'Zümrüt' },
  { id: 'rose', name: 'Pembe' },
  { id: 'amber', name: 'Kehribar' },
  { id: 'violet', name: 'Mor' }
];

export const FascicleCoverSettingsModal: React.FC<FascicleCoverSettingsModalProps> = ({ isOpen, onClose }) => {
  const { metadata, updateMetadata } = useFascicleStore();

  if (!isOpen) return null;

  const currentSettings = metadata.coverPageSettings || {
    enabled: true,
    title: metadata.title,
    subtitle: 'Kişiselleştirilmiş Öğrenme Materyali',
    themeStyle: 'modern',
    primaryColor: 'indigo',
    showStudentLine: true,
    schoolName: 'Oogmatik Eğitim Platformu'
  };

  const handleChange = (key: keyof CoverPageSettings, value: any) => {
    updateMetadata({
      coverPageSettings: {
        ...currentSettings,
        [key]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: 'transparent' }} onClick={onClose} />
      <div className="relative w-full max-w-xl glass-layer-3 rounded-[var(--radius-premium)] flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-paper)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <LayoutTemplate className="mr-3" size={24} style={{ color: 'var(--accent-color)' }} />
            Premium Kapak Ayarları
          </h2>
          <button onClick={onClose} className="studio-icon-btn p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          <div className="flex items-center justify-between p-4 rounded-[var(--radius-premium)] glass-layer-1">
             <div>
                <h3 className="text-[var(--text-primary)] font-bold mb-1">Kapak Sayfasını Aktifleştir</h3>
                <p className="text-xs text-[var(--text-muted)]">Fasikülün ilk sayfasına şık bir kapak ekler.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={currentSettings.enabled} onChange={e => handleChange('enabled', e.target.checked)} />
                <div className="w-11 h-6 bg-[var(--bg-inset)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: currentSettings.enabled ? 'var(--accent-color)' : undefined }}></div>
             </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-300 ${!currentSettings.enabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
             
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Type size={16} className="text-[var(--text-muted)]" /> Metin ve İçerik
              </h3>
              
              <div className="space-y-3">
                <div>
                   <label className="block text-xs text-[var(--text-muted)] mb-1">Kapak Başlığı (Fasikül Adı)</label>
                   <input type="text" value={currentSettings.title || ''} onChange={e => handleChange('title', e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[var(--radius-premium)] px-4 py-3 transition-all" style={{ borderColor: 'var(--border-color)' }} />
                </div>
                <div>
                   <label className="block text-xs text-[var(--text-muted)] mb-1">Alt Başlık (Zorunlu Değil)</label>
                   <input type="text" value={currentSettings.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[var(--radius-premium)] px-4 py-3 transition-all" />
                </div>
                <div>
                   <label className="block text-xs text-[var(--text-muted)] mb-1">Kurum / Okul Adı</label>
                   <input type="text" value={currentSettings.schoolName || ''} onChange={e => handleChange('schoolName', e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[var(--radius-premium)] px-4 py-3 transition-all" />
                </div>
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: 'var(--border-color)' }} />

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                <Palette size={16} className="text-[var(--text-muted)]" /> Tasarım Teması
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                 {THEMES.map(theme => (
                    <button key={theme.id} onClick={() => handleChange('themeStyle', theme.id)}
                      className="text-left p-3 rounded-[var(--radius-premium)] border-2 transition-all"
                      style={{
                        backgroundColor: currentSettings.themeStyle === theme.id ? 'var(--accent-muted)' : 'var(--bg-paper)',
                        borderColor: currentSettings.themeStyle === theme.id ? 'var(--accent-color)' : 'var(--border-color)'
                      }}>
                      <h4 className="text-[var(--text-primary)] font-bold text-sm leading-tight">{theme.label}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{theme.desc}</p>
                    </button>
                 ))}
              </div>

              <div className="mt-4">
                 <label className="block text-xs text-[var(--text-muted)] mb-2">Ana Renk Paleti</label>
                 <div className="flex flex-wrap gap-2">
                   {COLORS.map(color => (
                     <button
                        key={color.id}
                        onClick={() => handleChange('primaryColor', color.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold transition-all border-2"
                        style={{
                          backgroundColor: currentSettings.primaryColor === color.id ? 'var(--accent-muted)' : 'var(--bg-paper)',
                          borderColor: currentSettings.primaryColor === color.id ? 'var(--accent-color)' : 'var(--border-color)',
                          color: currentSettings.primaryColor === color.id ? 'var(--accent-color)' : 'var(--text-muted)'
                        }}
                     >
                       {color.name}
                     </button>
                   ))}
                 </div>
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: 'var(--border-color)' }} />

            <div className="space-y-4">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: currentSettings.showStudentLine ? 'var(--accent-color)' : 'var(--bg-paper)',
                      border: currentSettings.showStudentLine ? 'none' : '1px solid var(--border-color)'
                    }}>
                     {currentSettings.showStudentLine && <i className="fa-solid fa-check text-white text-xs" />}
                  </div>
                  <div>
                    <span className="text-[var(--text-primary)] font-medium block text-sm">Öğrenci Bilgisi Alanını Göster</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Öğrencinin adını yazabileceği "Adı Soyadı / Sınıfı" çizgi alanı.</span>
                  </div>
               </label>
            </div>

          </div>

        </div>

        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 font-bold rounded-[var(--radius-premium)] transition-all" style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff' }}>
             Uygula ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
