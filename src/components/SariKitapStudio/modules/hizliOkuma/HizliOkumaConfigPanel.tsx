import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { HizliOkumaConfig } from '../../../../types/sariKitap';

export const HizliOkumaConfigPanel = React.memo(({ config, onUpdate }: ConfigPanelProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config as HizliOkumaConfig;

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Hızlı Okuma Ayarları</div>

            <div>
                <label className="sk-label">Satır Başına Kelime ({c.wordsPerBlock})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={1} max={5} step={1} value={c.wordsPerBlock} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate?.({ wordsPerBlock: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Satır Sayısı ({c.blockRows})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={5} max={45} step={1} value={c.blockRows} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate?.({ blockRows: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Satır Aralığı</label>
                <select className="sk-select" value={c.lineSpacing} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate?.({ lineSpacing: e.target.value as 'sıkı' | 'normal' | 'geniş' })}>
                    <option value="sıkı">Sıkı (Kompakt)</option>
                    <option value="normal">Normal</option>
                    <option value="geniş">Geniş</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Sütun Düzeni</label>
                <select className="sk-select" value={c.columnMode} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate?.({ columnMode: e.target.value as 'tek' | 'cift' })}>
                    <option value="tek">Tek Sütun</option>
                    <option value="cift">Çift Sütun</option>
                </select>
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.autoFill} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate?.({ autoFill: e.target.checked })} />
                    Sayfa Otomatik Doldur
                </label>
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.rhythmicMode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdate?.({ rhythmicMode: e.target.checked })} />
                    Ritmik Modu (Zebra Çizgi)
                </label>
            </div>
        </div>
    );
});
HizliOkumaConfigPanel.displayName = 'HizliOkumaConfigPanel';
