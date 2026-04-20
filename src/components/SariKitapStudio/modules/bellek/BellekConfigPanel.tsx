import React from 'react';
import type { ConfigPanelProps } from '../../registry';
import type { BellekConfig } from '../../../../types/sariKitap';

export const BellekConfigPanel: React.FC<ConfigPanelProps> = React.memo(({ config, onUpdate }) => {
    if (config.type !== 'bellek') return null;
    const c = config as BellekConfig;

    const togglePhase = (phase: 'A' | 'B' | 'C' | 'D') => {
        const current = c.phases ?? ['A', 'B', 'C', 'D'];
        const updated = current.includes(phase)
            ? current.filter(p => p !== phase)
            : [...current, phase].sort();
        if (updated.length > 0) {
            onUpdate?.({ phases: updated as ('A' | 'B' | 'C' | 'D')[] });
        }
    };

    return (
        <div className="sk-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <div className="sk-section-title">Bellek Etkinlik Ayarları</div>

            {/* Faz Seçimi */}
            <div>
                <label className="sk-label">Aktif Fazlar</label>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {(['A', 'B', 'C', 'D'] as const).map(phase => (
                        <button
                            key={phase}
                            type="button"
                            onClick={() => togglePhase(phase)}
                            style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '0.5rem',
                                border: '1px solid',
                                borderColor: (c.phases ?? []).includes(phase) ? '#eab308' : 'rgba(255,255,255,0.1)',
                                background: (c.phases ?? []).includes(phase) ? 'rgba(234,179,8,0.15)' : 'transparent',
                                color: (c.phases ?? []).includes(phase) ? '#eab308' : 'rgba(255,255,255,0.5)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {phase === 'A' && '📖 Çalışma'}
                            {phase === 'B' && '✏️ Hatırla'}
                            {phase === 'C' && '🔍 Bul'}
                            {phase === 'D' && '💬 Cümle'}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="sk-label">Kelime Sayısı ({c.blockCount})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={6} max={30} step={1} value={c.blockCount} onChange={(e) => onUpdate?.({ blockCount: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Sütun Sayısı</label>
                <select className="sk-select" value={c.gridColumns} onChange={(e) => onUpdate?.({ gridColumns: Number(e.target.value) as 2 | 3 | 4 | 5 })}>
                    <option value={2}>2 Sütun</option>
                    <option value={3}>3 Sütun</option>
                    <option value={4}>4 Sütun</option>
                    <option value={5}>5 Sütun</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Kelime Kategorisi</label>
                <select className="sk-select" value={c.category} onChange={(e) => onUpdate?.({ category: e.target.value as 'hayvanlar' | 'doğa' | 'okul' | 'karışık' })}>
                    <option value="karışık">🎲 Karışık</option>
                    <option value="hayvanlar">🐾 Hayvanlar</option>
                    <option value="doğa">🌿 Doğa</option>
                    <option value="okul">📚 Okul</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Boşaltma Oranı (%{Math.round(c.blankRatio * 100)})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={0.1} max={0.9} step={0.05} value={c.blankRatio} onChange={(e) => onUpdate?.({ blankRatio: Number(e.target.value) })} />
            </div>

            <div>
                <label className="sk-label">Dikkat Dağıtıcı Yoğunluğu</label>
                <select className="sk-select" value={c.distractorRatio} onChange={(e) => onUpdate?.({ distractorRatio: e.target.value as 'düşük' | 'orta' | 'yüksek' })}>
                    <option value="düşük">Düşük (~%30)</option>
                    <option value="orta">Orta (~%50)</option>
                    <option value="yüksek">Yüksek (~%80)</option>
                </select>
            </div>

            <div>
                <label className="sk-label">Cümle Satır Sayısı ({c.sentenceLines})</label>
                <input type="range" className="sk-input" style={{ padding: '0.25rem' }} min={2} max={8} step={1} value={c.sentenceLines} onChange={(e) => onUpdate?.({ sentenceLines: Number(e.target.value) })} />
            </div>

            <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={c.showNumbers} onChange={(e) => onUpdate?.({ showNumbers: e.target.checked })} />
                    Numaraları Göster
                </label>
            </div>
        </div>
    );
});
BellekConfigPanel.displayName = 'BellekConfigPanel';
