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
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-slate-800/50">
          <h2 className="text-xl font-bold text-white flex items-center">
            <LayoutTemplate className="mr-3 text-indigo-400" size={24} />
            Premium Kapak Ayarları
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
             <div>
                <h3 className="text-white font-bold mb-1">Kapak Sayfasını Aktifleştir</h3>
                <p className="text-xs text-indigo-200">Fasikülün ilk sayfasına şık bir kapak ekler.</p>
             </div>
             <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={currentSettings.enabled} onChange={e => handleChange('enabled', e.target.checked)} />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
             </label>
          </div>

          <div className={`space-y-6 transition-opacity duration-300 ${!currentSettings.enabled ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
             
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Type size={16} className="text-slate-500" /> Metin ve İçerik
              </h3>
              
              <div className="space-y-3">
                <div>
                   <label className="block text-xs text-slate-400 mb-1">Kapak Başlığı (Fasikül Adı)</label>
                   <input type="text" value={currentSettings.title || ''} onChange={e => handleChange('title', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">Alt Başlık (Zorunlu Değil)</label>
                   <input type="text" value={currentSettings.subtitle || ''} onChange={e => handleChange('subtitle', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1">Kurum / Okul Adı</label>
                   <input type="text" value={currentSettings.schoolName || ''} onChange={e => handleChange('schoolName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Palette size={16} className="text-slate-500" /> Tasarım Teması
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                 {THEMES.map(theme => (
                    <button key={theme.id} onClick={() => handleChange('themeStyle', theme.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${currentSettings.themeStyle === theme.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800 border-transparent hover:bg-slate-700'}`}>
                      <h4 className="text-white font-bold text-sm leading-tight">{theme.label}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{theme.desc}</p>
                    </button>
                 ))}
              </div>

              <div className="mt-4">
                 <label className="block text-xs text-slate-400 mb-2">Ana Renk Paleti</label>
                 <div className="flex flex-wrap gap-2">
                   {COLORS.map(color => (
                     <button
                        key={color.id}
                        onClick={() => handleChange('primaryColor', color.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border-2
                         ${currentSettings.primaryColor === color.id ? `border-${color.id}-500 bg-${color.id}-500/20 text-${color.id}-300` : `bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700`}
                        `}
                     >
                       {color.name}
                     </button>
                   ))}
                 </div>
              </div>
            </div>

            <div className="h-px bg-slate-800" />

            <div className="space-y-4">
               <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${currentSettings.showStudentLine ? 'bg-indigo-500' : 'bg-slate-800 border border-slate-700 group-hover:border-slate-500'}`}>
                     {currentSettings.showStudentLine && <i className="fa-solid fa-check text-white text-xs" />}
                  </div>
                  <div>
                    <span className="text-white font-medium block text-sm">Öğrenci Bilgisi Alanını Göster</span>
                    <span className="text-[10px] text-slate-400">Öğrencinin adını yazabileceği "Adı Soyadı / Sınıfı" çizgi alanı.</span>
                  </div>
               </label>
            </div>

          </div>

        </div>

        <div className="p-4 border-t border-white/5 bg-slate-900/50 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition">
             Uygula ve Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
