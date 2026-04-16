import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';

export const KopruConfigPanel: React.FC<ConfigPanelProps> = React.memo(({ config, onUpdate }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Köprü Ayarları</div>

            <div>
                <label className="sk-label">Köprü Yerleşimi</label>
                <select className="sk-select" value={c.bridgePlacement} onChange={(e) => onUpdate({ bridgePlacement: e.target.value as 'kelime' | 'hece' })}>
                    <option value="kelime">Kelimeler Arası</option>
                    <option value="hece">Heceler Arası</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Köprü Genişliği ({c.bridgeWidth} karakter)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={2} max={8} step={1} value={c.bridgeWidth} onChange={(e) => onUpdate({ bridgeWidth: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Karakter Boşluğu ({c.charGap})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={0.5} max={4} step={0.5} value={c.charGap} onChange={(e) => onUpdate({ charGap: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Yay Yüksekliği ({c.bridgeHeight}px)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={8} max={40} step={2} value={c.bridgeHeight} onChange={(e) => onUpdate({ bridgeHeight: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Metin Yoğunluğu</label>
                <select className="sk-select" value={c.textDensity} onChange={(e) => onUpdate({ textDensity: e.target.value as 'düşük' | 'orta' | 'yüksek' })}>
                    <option value="düşük">Düşük (Geniş aralık)</option>
                    <option value="orta">Orta</option>
                    <option value="yüksek">Yüksek (Kompakt)</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Köprü Stili</label>
                <select className="sk-select" value={c.bridgeStyle} onChange={(e) => onUpdate({ bridgeStyle: e.target.value as 'yay' | 'düz' | 'noktalı' })}>
                    <option value="yay">⌢ Yay</option>
                    <option value="düz">─ Düz</option>
                    <option value="noktalı">┈ Noktalı</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Çizgi Kalınlığı ({c.bridgeThickness}px)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={1} max={4} step={0.5} value={c.bridgeThickness} onChange={(e) => onUpdate({ bridgeThickness: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Köprü Rengi</label>
                <input type="color" value={c.bridgeColor} onChange={(e) => onUpdate({ bridgeColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>
        </div>
    );
});
KopruConfigPanel.displayName = 'KopruConfigPanel';
