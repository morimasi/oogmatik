import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { PencereConfig } from '../../../../types/sariKitap';

export const PencereConfigPanel: React.FC<ConfigPanelProps> = React.memo(({ config, onUpdate }) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Pencere Ayarları</div>

            <div>
                <label className="sk-label">Pencere Açıklık Oranı (%{Math.round((c as any).visibilityRatio * 100 || 40)})</label>
                <input 
                  type="range" 
                  className="sk-input" 
                  min={0.1} 
                  max={0.8} 
                  step={0.05} 
                  value={(c as any).visibilityRatio || 0.4} 
                  onChange={(e) => onUpdate?.({ visibilityRatio: Number(e.target.value) } as any)} 
                />
            </div>

            <div>
                <label className="sk-label">Grid Sütun Sayısı</label>
                <select className="sk-select" value={(c as any).gridColumns || 'auto'} onChange={(e) => onUpdate?.({ gridColumns: e.target.value } as any)}>
                    <option value="auto">Otomatik (Hecelere Göre)</option>
                    <option value="6">6 Sütun</option>
                    <option value="8">8 Sütun</option>
                    <option value="10">10 Sütun</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Hücre Kenarlık Stili</label>
                <select className="sk-select" value={(c as any).borderStyle || 'solid'} onChange={(e) => onUpdate?.({ borderStyle: e.target.value } as any)}>
                    <option value="solid">İnce Düz</option>
                    <option value="bold">Kalın Düz</option>
                    <option value="dashed">Kesikli</option>
                    <option value="none">Kenarlıksız</option>
                </select>
            </div>

            <div style={{ padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <label className="sk-label">Görünüm Ayarları</label>
            </div>

            <div>
                <label className="sk-label">Maske Opaklığı ({Math.round(c.maskOpacity * 100)}%)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={0.3} max={0.9} step={0.05} value={c.maskOpacity} onChange={(e) => onUpdate?.({ maskOpacity: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Maske Rengi</label>
                <input type="color" value={c.maskColor} onChange={(e) => onUpdate?.({ maskColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showSequential} onChange={(e) => onUpdate?.({ showSequential: e.target.checked })} />
                    Sıralı Gösterim (Mod)
                </label>
            </div>
        </div>
    );
});
PencereConfigPanel.displayName = 'PencereConfigPanel';
