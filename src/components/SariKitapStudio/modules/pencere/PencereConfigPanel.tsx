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
                <label className="sk-label">Pencere Boyutu ({c.windowSize} hece)</label>
                <select className="sk-select" value={c.windowSize} onChange={(e) => onUpdate({ windowSize: Number(e.target.value) as 1 | 2 | 3 })}>
                    <option value={1}>1 Hece</option>
                    <option value={2}>2 Hece</option>
                    <option value={3}>3 Hece</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Açılma Hızı</label>
                <select className="sk-select" value={c.revealSpeed} onChange={(e) => onUpdate({ revealSpeed: e.target.value as 'yavaş' | 'orta' | 'hızlı' })}>
                    <option value="yavaş">Yavaş</option>
                    <option value="orta">Orta</option>
                    <option value="hızlı">Hızlı</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Maske Opaklığı ({Math.round(c.maskOpacity * 100)}%)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={0.3} max={0.9} step={0.05} value={c.maskOpacity} onChange={(e) => onUpdate({ maskOpacity: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Maske Rengi</label>
                <input type="color" value={c.maskColor} onChange={(e) => onUpdate({ maskColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showSequential} onChange={(e) => onUpdate({ showSequential: e.target.checked })} />
                    Sıralı Gösterim
                </label>
            </div>
        </div>
    );
});
PencereConfigPanel.displayName = 'PencereConfigPanel';
