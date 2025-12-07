

import React, { useState, useEffect } from 'react';
import { UiSettings } from '../types/core';
import { CustomTheme, PRESET_THEMES, applyTheme, checkAccessibility } from '../utils/theme';
import { useAuth } from '../context/AuthContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    uiSettings: UiSettings;
    onUpdateUiSettings: (newSettings: UiSettings) => void;
    // We now handle themes internally or via props, but passing down current active ID is cleaner
    activeThemeId: string;
    onUpdateTheme: (theme: CustomTheme) => void;
}

const ColorPicker = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
    <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">{label}</label>
        <div className="flex items-center gap-2">
            <input 
                type="color" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-10 h-10 p-0 border-0 rounded-lg cursor-pointer shadow-sm"
            />
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                className="flex-1 p-2 text-xs border rounded bg-zinc-50 dark:bg-zinc-800 font-mono"
            />
        </div>
    </div>
);

const ContrastBadge = ({ ratio, aa, aaa }: { ratio: number, aa: boolean, aaa: boolean }) => (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold ${aa ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
        <span className="text-lg">{aa ? '✓' : '⚠'}</span>
        <div className="flex flex-col leading-none">
            <span>Oran: {ratio}:1</span>
            <span className="text-[9px] opacity-70">{aaa ? 'Mükemmel (AAA)' : (aa ? 'İyi (AA)' : 'Okunamaz')}</span>
        </div>
    </div>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, uiSettings, onUpdateUiSettings, activeThemeId, onUpdateTheme }) => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'themes' | 'studio' | 'typography' | 'system'>('themes');
    const [themes, setThemes] = useState<CustomTheme[]>(PRESET_THEMES);
    
    // Studio State
    const [editingTheme, setEditingTheme] = useState<CustomTheme>(PRESET_THEMES[0]);
    const [previewContrast, setPreviewContrast] = useState({ ratio: 0, aa: false, aaa: false });

    // Load User Custom Themes
    useEffect(() => {
        if (user && user.customThemes) {
            setThemes([...PRESET_THEMES, ...user.customThemes]);
        } else {
            setThemes(PRESET_THEMES);
        }
    }, [user]);

    // Update Contrast Check when editing
    useEffect(() => {
        const bg = editingTheme.colors['--bg-primary'];
        const text = editingTheme.colors['--text-primary'];
        setPreviewContrast(checkAccessibility(bg, text));
    }, [editingTheme.colors['--bg-primary'], editingTheme.colors['--text-primary']]);

    if (!isOpen) return null;

    const handleSelectTheme = (theme: CustomTheme) => {
        onUpdateTheme(theme);
    };

    const handleStartEditing = (baseTheme: CustomTheme) => {
        setEditingTheme({
            ...baseTheme,
            id: `custom_${Date.now()}`,
            name: `${baseTheme.name} (Kopya)`,
            isCustom: true
        });
        setActiveTab('studio');
    };

    const handleSaveCustomTheme = async () => {
        if (!user) {
            alert("Tema kaydetmek için giriş yapmalısınız.");
            return;
        }
        
        const newCustomThemes = user.customThemes ? [...user.customThemes, editingTheme] : [editingTheme];
        // Optimistic update local
        setThemes([...PRESET_THEMES, ...newCustomThemes]);
        // Persist to user profile
        await updateUser({ customThemes: newCustomThemes });
        
        // Apply immediately
        onUpdateTheme(editingTheme);
        setActiveTab('themes');
    };

    const handleDeleteTheme = async (id: string) => {
        if (!user || !confirm("Bu temayı silmek istediğinize emin misiniz?")) return;
        const newCustomThemes = (user.customThemes || []).filter(t => t.id !== id);
        await updateUser({ customThemes: newCustomThemes });
        setThemes([...PRESET_THEMES, ...newCustomThemes]);
        // Revert to default if deleting active
        if (activeThemeId === id) onUpdateTheme(PRESET_THEMES[0]);
    };
    
    const handleClearCache = () => {
        if(confirm("Tüm yerel veriler ve önbellek temizlenecek. Sayfa yenilenecek. Devam edilsin mi?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-indigo-600 dark:text-indigo-400"></i> Ayarlar
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                        <i className="fa-solid fa-times text-zinc-500"></i>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Nav */}
                    <div className="w-64 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-zinc-700 p-4 flex flex-col gap-2">
                        <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Görsel</p>
                        <button 
                            onClick={() => setActiveTab('themes')}
                            className={`p-3 rounded-xl text-left font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'themes' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                        >
                            <i className="fa-solid fa-swatchbook"></i> Temalar
                        </button>
                        <button 
                            onClick={() => handleStartEditing(PRESET_THEMES[0])}
                            className={`p-3 rounded-xl text-left font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'studio' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                        >
                            <i className="fa-solid fa-palette"></i> Tema Stüdyosu
                        </button>
                        
                        <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-2"></div>
                        
                        <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Düzen</p>
                        <button 
                            onClick={() => setActiveTab('typography')}
                            className={`p-3 rounded-xl text-left font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'typography' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                        >
                            <i className="fa-solid fa-font"></i> Tipografi
                        </button>

                        <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-2"></div>
                        
                        <p className="px-3 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Gelişmiş</p>
                        <button 
                            onClick={() => setActiveTab('system')}
                            className={`p-3 rounded-xl text-left font-bold text-sm flex items-center gap-3 transition-colors ${activeTab === 'system' ? 'bg-white dark:bg-zinc-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                        >
                            <i className="fa-solid fa-gears"></i> Sistem
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
                        
                        {activeTab === 'themes' && (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {themes.map(t => (
                                    <div 
                                        key={t.id}
                                        onClick={() => handleSelectTheme(t)}
                                        className={`group relative rounded-2xl border-2 overflow-hidden cursor-pointer transition-all hover:scale-105 ${activeThemeId === t.id ? 'border-indigo-500 ring-4 ring-indigo-500/20' : 'border-zinc-200 dark:border-zinc-700'}`}
                                    >
                                        {/* Live Preview Mini */}
                                        <div className="h-24 p-3 relative" style={{ backgroundColor: t.colors['--bg-primary'] }}>
                                            <div className="absolute top-3 left-3 right-3 h-2 rounded-full" style={{ backgroundColor: t.colors['--bg-paper'] }}></div>
                                            <div className="absolute top-7 left-3 w-1/3 h-2 rounded-full" style={{ backgroundColor: t.colors['--accent-color'] }}></div>
                                            <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full shadow-lg flex items-center justify-center" style={{ backgroundColor: t.colors['--accent-color'] }}>
                                                <div className="w-3 h-3 bg-white rounded-full"></div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-white dark:bg-zinc-800 flex justify-between items-center">
                                            <span className="font-bold text-sm text-zinc-700 dark:text-zinc-200">{t.name}</span>
                                            <div className="flex gap-2">
                                                {t.isCustom && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleStartEditing(t); }} 
                                                        className="text-zinc-400 hover:text-indigo-500"
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                )}
                                                {t.isCustom && (
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTheme(t.id); }} 
                                                        className="text-zinc-400 hover:text-red-500"
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {activeThemeId === t.id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs shadow-md">
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'studio' && (
                            <div className="flex flex-col lg:flex-row gap-8 h-full">
                                {/* Controls */}
                                <div className="flex-1 space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Tema İsmi</label>
                                        <input 
                                            type="text" 
                                            value={editingTheme.name} 
                                            onChange={e => setEditingTheme({...editingTheme, name: e.target.value})}
                                            className="w-full p-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl bg-transparent font-bold outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <ColorPicker label="Arkaplan (Ana)" value={editingTheme.colors['--bg-primary']} onChange={v => setEditingTheme({...editingTheme, colors: {...editingTheme.colors, '--bg-primary': v}})} />
                                        <ColorPicker label="Metin (Ana)" value={editingTheme.colors['--text-primary']} onChange={v => setEditingTheme({...editingTheme, colors: {...editingTheme.colors, '--text-primary': v}})} />
                                        <ColorPicker label="Kart / Panel" value={editingTheme.colors['--bg-paper']} onChange={v => setEditingTheme({...editingTheme, colors: {...editingTheme.colors, '--bg-paper': v}})} />
                                        <ColorPicker label="Vurgu Rengi" value={editingTheme.colors['--accent-color']} onChange={v => setEditingTheme({...editingTheme, colors: {...editingTheme.colors, '--accent-color': v}})} />
                                    </div>

                                    {/* Accessibility Check */}
                                    <div className="p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-universal-access"></i> Erişilebilirlik Kontrolü
                                        </h4>
                                        <ContrastBadge {...previewContrast} />
                                    </div>

                                    <div className="pt-4 flex justify-end gap-3">
                                        <button onClick={() => setActiveTab('themes')} className="px-4 py-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">İptal</button>
                                        <button onClick={handleSaveCustomTheme} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg">Kaydet ve Uygula</button>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div className="w-full lg:w-80 shrink-0">
                                    <p className="text-xs font-bold text-zinc-400 uppercase mb-2 text-center">Canlı Önizleme</p>
                                    <div 
                                        className="rounded-2xl shadow-2xl overflow-hidden border-4 border-zinc-200 dark:border-zinc-700 h-[400px] relative flex flex-col"
                                        style={{
                                            backgroundColor: editingTheme.colors['--bg-primary'],
                                            color: editingTheme.colors['--text-primary']
                                        }}
                                    >
                                        <div className="p-4 border-b" style={{ borderColor: editingTheme.colors['--border-color'], backgroundColor: editingTheme.colors['--panel-bg'] }}>
                                            <div className="w-8 h-8 rounded-lg mb-2" style={{ backgroundColor: editingTheme.colors['--accent-color'] }}></div>
                                            <div className="h-2 w-20 rounded-full opacity-50" style={{ backgroundColor: editingTheme.colors['--text-secondary'] }}></div>
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h1 className="text-2xl font-bold mb-2">Başlık</h1>
                                            <p className="text-sm opacity-80 mb-4">Bu bir örnek metindir. Okunabilirliği kontrol edin.</p>
                                            <button 
                                                className="px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                                style={{ backgroundColor: editingTheme.colors['--accent-color'], color: '#fff' }}
                                            >
                                                Buton
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'typography' && (
                             <div className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-3">Yazı Tipi Ailesi</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'OpenDyslexic', name: 'OpenDyslexic (Okuma Dostu)' },
                                            { id: 'Lexend', name: 'Lexend (Modern)' },
                                            { id: 'Inter', name: 'Inter (Standart)' },
                                            { id: 'Comic Neue', name: 'Comic (Eğlenceli)' },
                                            { id: 'Lora', name: 'Lora (Kitap)' }
                                        ].map(f => (
                                            <button
                                                key={f.id}
                                                onClick={() => onUpdateUiSettings({...uiSettings, fontFamily: f.id as any})}
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
                                </div>
                            </div>
                        )}

                        {activeTab === 'system' && (
                            <div className="space-y-6">
                                <div className="p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Hareketi Azalt</h4>
                                        <p className="text-xs text-zinc-500">Animasyonları ve geçiş efektlerini devre dışı bırakır.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={uiSettings.reduceMotion || false} 
                                            onChange={(e) => onUpdateUiSettings({...uiSettings, reduceMotion: e.target.checked})} 
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                    </label>
                                </div>

                                <div className="p-4 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Önbellek Yönetimi</h4>
                                        <p className="text-xs text-zinc-500">Uygulama yavaşlarsa veya hata verirse kullanın.</p>
                                    </div>
                                    <button 
                                        onClick={handleClearCache}
                                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Temizle ve Yenile
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700 text-center">
                                    <p className="text-xs font-mono text-zinc-400">Bursa Disleksi AI v1.3.0</p>
                                    <p className="text-[10px] text-zinc-400 mt-1">Build: 2024.10.15</p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};