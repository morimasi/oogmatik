import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { CiftMetinConfig } from '../../../../types/sariKitap';

export const CiftMetinConfigPanel: React.FC<ConfigPanelProps> = React.memo(({ config, onUpdate }) => {
    if (config.type !== 'cift_metin') return null;
    const c = config as CiftMetinConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Çift Metin Ayarları</div>

            <div>
                <label className="sk-label">Karışım Modu</label>
                <select className="sk-select" value={c.interleaveMode} onChange={(e) => onUpdate({ interleaveMode: e.target.value as 'kelime' | 'satir' | 'paragraf' })}>
                    <option value="satir">Satır Satır</option>
                    <option value="kelime">Kelime Kelime</option>
                    <option value="paragraf">Paragraf Paragraf</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Hikaye A Rengi</label>
                <input type="color" value={c.sourceAColor} onChange={(e) => onUpdate({ sourceAColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>

            <div>
                <label className="sk-label">Hikaye B Rengi</label>
                <input type="color" value={c.sourceBColor} onChange={(e) => onUpdate({ sourceBColor: e.target.value })} style={{ width: '100%', height: '2rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }} />
            </div>

            <div>
                <label className="sk-label">Hikaye A Stili</label>
                <select className="sk-select" value={c.sourceAStyle} onChange={(e) => onUpdate({ sourceAStyle: e.target.value as 'bold' | 'normal' | 'italic' })}>
                    <option value="bold">Kalın</option>
                    <option value="normal">Normal</option>
                    <option value="italic">İtalik</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Hikaye B Stili</label>
                <select className="sk-select" value={c.sourceBStyle} onChange={(e) => onUpdate({ sourceBStyle: e.target.value as 'bold' | 'normal' | 'italic' })}>
                    <option value="bold">Kalın</option>
                    <option value="normal">Normal</option>
                    <option value="italic">İtalik</option>
                </select>
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showSourceLabels} onChange={(e) => onUpdate({ showSourceLabels: e.target.checked })} />
                    Kaynak Etiketlerini Göster
                </label>
            </div>
        </div>
    );
});
CiftMetinConfigPanel.displayName = 'CiftMetinConfigPanel';
