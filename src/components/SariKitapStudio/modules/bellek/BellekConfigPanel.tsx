import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { BellekConfig } from '../../../../types/sariKitap';

export const BellekConfigPanel: React.FC<ConfigPanelProps> = React.memo(({ config, onUpdate }) => {
    if (config.type !== 'bellek') return null;
    const c = config as BellekConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Bellek Ayarları</div>

            <div>
                <label className="sk-label">Kelime Sayısı ({c.blockCount})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={4} max={30} step={1} value={c.blockCount} onChange={(e) => onUpdate({ blockCount: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Sütun Sayısı</label>
                <select className="sk-select" value={c.gridColumns} onChange={(e) => onUpdate({ gridColumns: Number(e.target.value) as 2 | 3 | 4 | 5 })}>
                    <option value={2}>2 Sütun</option>
                    <option value={3}>3 Sütun</option>
                    <option value={4}>4 Sütun</option>
                    <option value={5}>5 Sütun</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Blok Boyutu</label>
                <select className="sk-select" value={c.blockSize} onChange={(e) => onUpdate({ blockSize: e.target.value as 'küçük' | 'orta' | 'büyük' })}>
                    <option value="küçük">Küçük</option>
                    <option value="orta">Orta</option>
                    <option value="büyük">Büyük</option>
                </select>
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showNumbers} onChange={(e) => onUpdate({ showNumbers: e.target.checked })} />
                    Numaraları Göster
                </label>
            </div>
        </div>
    );
});
BellekConfigPanel.displayName = 'BellekConfigPanel';
