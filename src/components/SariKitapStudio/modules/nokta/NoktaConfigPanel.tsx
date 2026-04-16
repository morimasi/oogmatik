import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { NoktaConfig } from '../../../../types/sariKitap';

export const NoktaConfigPanel = React.memo(({ config, onUpdate }: ConfigPanelProps) => {
    if (config.type !== 'nokta') return null;
    const c = config as NoktaConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Nokta Ayarları</div>

            <div>
                <label className="sk-label">Nokta Yerleşimi</label>
                <select className="sk-select" value={c.dotPlacement} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ dotPlacement: e.target.value as 'kelime' | 'hece' })}>
                    <option value="kelime">Her Kelime Altında</option>
                    <option value="hece">Her Hece Altında</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Nokta Sıklığı</label>
                <select className="sk-select" value={c.dotDensity} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ dotDensity: Number(e.target.value) as 1 | 2 | 3 })}>
                    <option value={1}>{c.dotPlacement === 'kelime' ? 'Her kelime' : 'Her hece'}</option>
                    <option value={2}>{c.dotPlacement === 'kelime' ? 'Her 2 kelime' : 'Her 2 hece'}</option>
                    <option value={3}>{c.dotPlacement === 'kelime' ? 'Her 3 kelime' : 'Her 3 hece'}</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Nokta Şekli</label>
                <select className="sk-select" value={c.dotStyle} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate({ dotStyle: e.target.value as 'yuvarlak' | 'kare' | 'elips' })}>
                    <option value="yuvarlak">● Yuvarlak</option>
                    <option value="kare">■ Kare</option>
                    <option value="elips">⬮ Elips</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Nokta Boyutu ({c.dotSize}px)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={4} max={12} step={1} value={c.dotSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ dotSize: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Font Boyutu ({c.compactFontSize}pt)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={12} max={22} step={1} value={c.compactFontSize} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ compactFontSize: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Kelime Aralığı ({c.wordGap}rem)</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={0.2} max={1.5} step={0.1} value={c.wordGap} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ wordGap: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Nokta Rengi</label>
                <input type="color" value={c.dotColor} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ dotColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showGuideLine} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate({ showGuideLine: e.target.checked })} />
                    Alt Çizgi Göster
                </label>
            </div>
        </div>
    );
});
NoktaConfigPanel.displayName = 'NoktaConfigPanel';
