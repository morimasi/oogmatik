
import React, { useState } from 'react';
import { UiSettings, AppTheme } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    uiSettings: UiSettings;
    onUpdateUiSettings: (newSettings: UiSettings) => void;
    theme: AppTheme;
    onUpdateTheme: (newTheme: AppTheme) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, uiSettings, onUpdateUiSettings, theme, onUpdateTheme }) => {
    const [activeTab, setActiveTab] = useState<'appearance' | 'typography' | 'accessibility'>('appearance');

    if (!isOpen) return null;

    const themes: { id: AppTheme; name: string; color: string }[] = [
        { id: 'light', name: 'Açık', color: '#fafafa' },
        { id: 'dark', name: 'Koyu', color: '#18181b' },
        { id: 'anthracite', name: 'Antrasit', color: '#222226' },
        { id: 'space', name: 'Uzay', color: '#0b0d17' },
        { id: 'nature', name: 'Doğa', color: '#f0fdf4' },
        { id: 'ocean', name: 'Okyanus', color: '#ecfeff' },
        { id: 'anthracite-gold', name: 'Altın', color: '#1f1f22' },
        { id: 'anthracite-cyber', name: 'Cyber', color: '#000000' },
    ];

    const fonts: { id: UiSettings['fontFamily']; name: string }[] = [
        { id: 'OpenDyslexic', name: 'OpenDyslexic (Varsayılan)' },
        { id: 'Lexend', name: 'Lexend (Okuma Dostu)' },
        { id: 'Inter', name: 'Inter (Modern)' },
        { id: 'Comic Neue', name: 'Comic Sans (Samimi)' },
        { id: 'Lora', name: 'Serif (Kitap)' }
    ];

    const handleReset = () => {
        onUpdateUiSettings({
            fontFamily: 'OpenDyslexic',
            fontSizeScale: 1,
            letterSpacing: 'normal',
            lineHeight: 1.6,
            saturation: 100
        });
        onUpdateTheme('anthracite');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-indigo-600 dark:text-indigo-400"></i> Görünüm Ayarları
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <i className="fa-solid fa-times text-zinc-500"></i>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                    <button 
                        onClick={() => setActiveTab('appearance')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-palette mr-2"></i> Tema
                    </button>
                    <button 
                        onClick={() => setActiveTab('typography')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'typography' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-font mr-2"></i> Yazı Tipi
                    </button>
                    <button 
                        onClick={() => setActiveTab('accessibility')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'accessibility' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                    >
                        <i className="fa-solid fa-universal-access mr-2"></i> Erişilebilirlik
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {/* Live Preview Box */}
                    <div className={`mb-8 p-4 rounded-xl border-2 transition-all duration-300 ${theme === 'light' ? '' : (theme === 'dark' ? 'theme-dark' : `theme-${theme}`)}`}
                         style={{
                             fontFamily: uiSettings.fontFamily,
                             lineHeight: uiSettings.lineHeight,
                             letterSpacing: uiSettings.letterSpacing === 'wide' ? '0.05em' : 'normal',
                             filter: `saturate(${uiSettings.saturation}%)`,
                             backgroundColor: 'var(--bg-primary)',
                             color: 'var(--text-primary)',
                             borderColor: 'var(--border-color)',
                             backgroundImage: 'var(--pattern-image)',
                             backgroundSize: '550px 550px'
                         }}>
                        <p className="text-xs opacity-70 uppercase font-bold mb-2">Önizleme</p>
                        <h3 className="text-xl font-bold mb-2">Bursa Disleksi AI</h3>
                        <p className="text-base">
                            Yapay zeka destekli eğitim materyalleri ile öğrenme sürecini kişiselleştirin. 
                            Okuma, yazma ve matematik becerilerini geliştirmek için tasarlandı.
                        </p>
                    </div>

                    {activeTab === 'appearance' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => onUpdateTheme(t.id)}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group ${theme === t.id ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'}`}
                                >
                                    <div className="w-full aspect-video rounded-lg shadow-sm border border-zinc-200/20" style={{ backgroundColor: t.color }}></div>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'typography' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Yazı Tipi Ailesi</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {fonts.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => onUpdateUiSettings({...uiSettings, fontFamily: f.id})}
                                            className={`p-4 text-left border-2 rounded-xl transition-all ${uiSettings.fontFamily === f.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'}`}
                                        >
                                            <span className="block text-lg" style={{ fontFamily: f.id }}>Aa Bb Cc</span>
                                            <span className="text-xs text-zinc-500">{f.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Satır Yüksekliği</label>
                                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-700 px-2 rounded">{uiSettings.lineHeight}</span>
                                </div>
                                <input 
                                    type="range" min="1.0" max="2.5" step="0.1"
                                    value={uiSettings.lineHeight}
                                    onChange={(e) => onUpdateUiSettings({...uiSettings, lineHeight: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                    <span>Sıkışık</span>
                                    <span>Geniş</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accessibility' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div>
                                    <p className="font-bold text-zinc-800 dark:text-zinc-200">Geniş Harf Aralığı</p>
                                    <p className="text-xs text-zinc-500">Harflerin birbirine karışmasını önler.</p>
                                </div>
                                <div className="relative inline-block w-12 align-middle select-none">
                                    <input type="checkbox" 
                                        checked={uiSettings.letterSpacing === 'wide'}
                                        onChange={(e) => onUpdateUiSettings({...uiSettings, letterSpacing: e.target.checked ? 'wide' : 'normal'})}
                                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-indigo-600"/>
                                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-zinc-300 cursor-pointer"></label>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Arayüz Ölçeği</label>
                                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-700 px-2 rounded">{Math.round(uiSettings.fontSizeScale * 100)}%</span>
                                </div>
                                <input 
                                    type="range" min="0.8" max="1.5" step="0.05"
                                    value={uiSettings.fontSizeScale}
                                    onChange={(e) => onUpdateUiSettings({...uiSettings, fontSizeScale: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                    <span>Küçük</span>
                                    <span>Büyük</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Renk Doygunluğu</label>
                                    <span className="text-xs font-mono bg-zinc-100 dark:bg-zinc-700 px-2 rounded">{uiSettings.saturation}%</span>
                                </div>
                                <input 
                                    type="range" min="0" max="100" step="10"
                                    value={uiSettings.saturation}
                                    onChange={(e) => onUpdateUiSettings({...uiSettings, saturation: parseFloat(e.target.value)})}
                                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                                <div className="flex justify-between text-xs text-zinc-400 mt-1">
                                    <span>Siyah Beyaz</span>
                                    <span>Canlı</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                    <button onClick={handleReset} className="text-sm text-red-500 hover:text-red-700 font-medium">
                        Varsayılanlara Dön
                    </button>
                    <button onClick={onClose} className="px-6 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-bold rounded-lg transition-colors">
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
};
