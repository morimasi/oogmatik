import React from 'react';
import { KelimeCumleConfig } from '../../../types/kelimeCumle';

interface CommonConfigPanelProps {
    config: KelimeCumleConfig;
    generationMode: 'ai' | 'offline';
    onConfigChange: (updates: Partial<KelimeCumleConfig>) => void;
    onModeChange: (mode: 'ai' | 'offline') => void;
    onGenerate: () => void;
    isGenerating: boolean;
}

export const CommonConfigPanel: React.FC<CommonConfigPanelProps> = ({
    config,
    generationMode,
    onConfigChange,
    onModeChange,
    onGenerate,
    isGenerating
}) => {
    return (
        <div className="sk-panel">
            <div className="sk-section-title">Genel Ayarlar</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Üretim Modu */}
                <div>
                    <label className="sk-label">Üretim Modu</label>
                    <div className="sk-mode-toggle">
                        <button
                            className={generationMode === 'ai' ? 'active' : ''}
                            onClick={() => onModeChange('ai')}
                            title="AI Modu: İçerik anlayışına dayalı yeni üretim"
                        >
                            🤖 AI Modu
                        </button>
                        <button
                            className={generationMode === 'offline' ? 'active' : ''}
                            onClick={() => onModeChange('offline')}
                            title="Hızlı Mod: Kaynak kitaptan anlık kopyalama"
                        >
                            ⚡ Hızlı Mod
                        </button>
                    </div>
                </div>

                {/* Yaş Grubu */}
                <div>
                    <label className="sk-label">Yaş Grubu</label>
                    <select 
                        className="sk-select"
                        value={config.ageGroup}
                        onChange={(e) => onConfigChange({ ageGroup: e.target.value as any })}
                    >
                        <option value="5-7">5-7 Yaş</option>
                        <option value="8-10">8-10 Yaş</option>
                        <option value="11-13">11-13 Yaş</option>
                        <option value="14+">14+ Yaş</option>
                    </select>
                </div>

                {/* Zorluk */}
                <div>
                    <label className="sk-label">Zorluk Seviyesi</label>
                    <select 
                        className="sk-select"
                        value={config.difficulty}
                        onChange={(e) => onConfigChange({ difficulty: e.target.value as any })}
                    >
                        <option value="Başlangıç">Başlangıç</option>
                        <option value="Orta">Orta</option>
                        <option value="İleri">İleri</option>
                        <option value="Uzman">Uzman</option>
                    </select>
                </div>

                {/* Soru Sayısı */}
                <div>
                    <label className="sk-label">Soru Sayısı: {config.itemCount}</label>
                    <input 
                        type="range" 
                        min="5" 
                        max="20" 
                        step="1"
                        className="sk-range"
                        value={config.itemCount}
                        onChange={(e) => onConfigChange({ itemCount: parseInt(e.target.value) })}
                    />
                </div>

                {/* Cevapları Göster */}
                <label className="sk-checkbox-label">
                    <input 
                        type="checkbox" 
                        checked={config.showAnswers}
                        onChange={(e) => onConfigChange({ showAnswers: e.target.checked })}
                    />
                    <span>Cevap Anahtarını Göster</span>
                </label>

                {/* Oluştur Butonu */}
                <button 
                    className="sk-generate-btn"
                    onClick={onGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <span className="animate-spin">⏳</span> Üretiliyor...
                        </>
                    ) : (
                        <>✨ Etkinlik Oluştur</>
                    )}
                </button>
            </div>
        </div>
    );
};
