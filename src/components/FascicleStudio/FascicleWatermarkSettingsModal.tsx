import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { WatermarkSettings } from '../../types/fascicle';
import { X, Droplets } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings: WatermarkSettings = {
  enabled: false,
  type: 'text',
  text: 'bdmind',
  opacity: 5,
  color: '#cbd5e1',
  fontSize: 48,
  rotation: -45,
};

export const FascicleWatermarkSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { metadata, updateMetadata } = useFascicleStore();

  if (!isOpen) return null;

  const settings = metadata.watermarkSettings || defaultSettings;

  const handleChange = (key: keyof WatermarkSettings, value: unknown) => {
    updateMetadata({
      watermarkSettings: { ...settings, [key]: value }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[var(--radius-premium)] flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
        <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-paper)]/50">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center">
            <Droplets className="mr-3" size={24} style={{ color: 'var(--accent-color)' }} />
            Filigran Ayarları
          </h2>
          <button onClick={onClose} className="studio-icon-btn p-2 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5">
          <div className="flex items-center justify-between p-4 rounded-[var(--radius-premium)] glass-layer-1">
            <div>
              <h3 className="text-[var(--text-primary)] font-bold mb-1">Filigranı Aktifleştir</h3>
              <p className="text-xs text-[var(--text-muted)]">Sayfa üzerinde filigran gösterir.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.enabled} onChange={e => handleChange('enabled', e.target.checked)} />
              <div className="w-11 h-6 bg-[var(--bg-inset)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: settings.enabled ? 'var(--accent-color)' : undefined }}></div>
            </label>
          </div>

          <div className={`space-y-5 transition-opacity duration-300 ${!settings.enabled ? 'opacity-30 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Filigran Türü</label>
              <div className="flex gap-2">
                <button onClick={() => handleChange('type', 'text')}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2"
                  style={{
                    backgroundColor: settings.type === 'text' ? 'var(--accent-muted)' : 'var(--bg-paper)',
                    borderColor: settings.type === 'text' ? 'var(--accent-color)' : 'var(--border-color)',
                    color: settings.type === 'text' ? 'var(--accent-color)' : 'var(--text-muted)'
                  }}>
                  Metin
                </button>
                <button onClick={() => handleChange('type', 'image')}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2"
                  style={{
                    backgroundColor: settings.type === 'image' ? 'var(--accent-muted)' : 'var(--bg-paper)',
                    borderColor: settings.type === 'image' ? 'var(--accent-color)' : 'var(--border-color)',
                    color: settings.type === 'image' ? 'var(--accent-color)' : 'var(--text-muted)'
                  }}>
                  Logo
                </button>
              </div>
            </div>

            {settings.type === 'text' && (
              <>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Filigran Metni</label>
                  <input type="text" value={settings.text} onChange={e => handleChange('text', e.target.value)}
                    className="w-full bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[var(--radius-premium)] px-4 py-3 transition-all" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Yazı Rengi</label>
                  <div className="flex gap-2">
                    {['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#000000', '#ef4444', '#3b82f6', '#10b981'].map(c => (
                      <button key={c} onClick={() => handleChange('color', c)}
                        className="w-8 h-8 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: c,
                          borderColor: settings.color === c ? 'var(--accent-color)' : 'transparent'
                        }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Yazı Boyutu: {settings.fontSize}px</label>
                  <input type="range" min="16" max="120" value={settings.fontSize} onChange={e => handleChange('fontSize', parseInt(e.target.value))}
                    className="w-full" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Dönüş Açısı: {settings.rotation}°</label>
                  <input type="range" min="-90" max="90" value={settings.rotation} onChange={e => handleChange('rotation', parseInt(e.target.value))}
                    className="w-full" />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Opaklık: {settings.opacity}%</label>
              <input type="range" min="1" max="30" value={settings.opacity} onChange={e => handleChange('opacity', parseInt(e.target.value))}
                className="w-full" />
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
