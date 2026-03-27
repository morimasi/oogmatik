import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { KelimeBilgisiSettings } from './types';

export const KelimeBilgisiSettingsPanel: React.FC<TemplateSettingsProps<KelimeBilgisiSettings>> = ({ settings, onChange }) => {
    const wordTypesList = [
        { id: 'es-anlamli', label: 'Eş Anlamlı', icon: '🔄', color: 'blue' },
        { id: 'zit-anlamli', label: 'Zıt Anlamlı', icon: '⚡', color: 'red' },
        { id: 'es-sesli', label: 'Eş Sesli', icon: '🎵', color: 'green' }
    ];

    const templateStyles = [
        { id: 'match-card', label: 'Eşleştirme Kartları', icon: '🃏' },
        { id: 'fill-blank', label: 'Boşluk Doldurma', icon: '✏️' },
        { id: 'word-web', label: 'Kelime Ağı', icon: '🕸️' },
        { id: 'bingo', label: 'Kelime Bingosu', icon: '🎱' }
    ];

    const toggleWordType = (typeId: string) => {
        const newTypes = settings.wordTypes.includes(typeId as any)
            ? settings.wordTypes.filter(t => t !== typeId)
            : [...settings.wordTypes, typeId as any];
        onChange({ wordTypes: newTypes });
    };

    const updateAiSettings = (key: string, value: unknown) => {
        onChange({
            aiSettings: { ...settings.aiSettings, [key]: value }
        });
    };

    const updateHizliSettings = (key: string, value: unknown) => {
        onChange({
            hizliSettings: { ...settings.hizliSettings, [key]: value }
        });
    };

    const updateVisualSettings = (key: string, value: boolean) => {
        onChange({
            visualSettings: { ...settings.visualSettings, [key]: value }
        });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Kelime Bilgisi Ayarları</h3>

            {/* Mod Seçimi */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Üretim Modu</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => onChange({ generationMode: 'ai' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            settings.generationMode === 'ai'
                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-purple-500'
                        }`}
                    >
                        <div className="text-2xl mb-1">🤖</div>
                        <div className="font-bold text-sm">AI Modu</div>
                        <div className="text-[10px] opacity-70">Gemini ile Özel Üretim</div>
                    </button>
                    <button
                        onClick={() => onChange({ generationMode: 'hizli' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            settings.generationMode === 'hizli'
                                ? 'bg-gradient-to-br from-teal-600 to-emerald-600 border-teal-400 text-white'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-teal-500'
                        }`}
                    >
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="font-bold text-sm">Hızlı Mod</div>
                        <div className="text-[10px] opacity-70">Hazır Şablonlar</div>
                    </button>
                </div>
            </div>

            {/* Kelime Türü Seçimi */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Kelime Türleri</label>
                <div className="grid grid-cols-3 gap-2">
                    {wordTypesList.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => toggleWordType(type.id)}
                            className={`p-3 rounded-lg border transition-all ${
                                settings.wordTypes.includes(type.id as any)
                                    ? `bg-${type.color}-600/20 border-${type.color}-500 text-white`
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                            style={{
                                backgroundColor: settings.wordTypes.includes(type.id as any)
                                    ? type.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' 
                                    : type.color === 'red' ? 'rgba(239, 68, 68, 0.2)' 
                                    : 'rgba(34, 197, 94, 0.2)'
                                    : undefined,
                                borderColor: settings.wordTypes.includes(type.id as any)
                                    ? type.color === 'blue' ? '#3b82f6' 
                                    : type.color === 'red' ? '#ef4444' 
                                    : '#22c55e'
                                    : undefined
                            }}
                        >
                            <div className="text-xl mb-1">{type.icon}</div>
                            <div className="text-[10px] font-medium">{type.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* AI Mod Ayarları */}
            {settings.generationMode === 'ai' && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-800/30">
                    <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                        <span>🤖</span> AI Üretim Ayarları
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Kelime Sayısı (Her Tür)</label>
                            <input
                                type="number"
                                min="3"
                                max="15"
                                value={settings.aiSettings.wordCount}
                                onChange={(e) => updateAiSettings('wordCount', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Zorluk</label>
                            <select
                                value={settings.aiSettings.difficulty}
                                onChange={(e) => updateAiSettings('difficulty', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                            >
                                <option value="kolay">Kolay</option>
                                <option value="orta">Orta</option>
                                <option value="zor">Zor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                        <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition">
                            <input
                                type="checkbox"
                                checked={settings.aiSettings.includeExamples}
                                onChange={(e) => updateAiSettings('includeExamples', e.target.checked)}
                                className="form-checkbox text-purple-500 rounded"
                            />
                            <span className="text-sm text-slate-300">Cümle İçinde Kullanım Örnekleri</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition">
                            <input
                                type="checkbox"
                                checked={settings.aiSettings.includeMnemonics}
                                onChange={(e) => updateAiSettings('includeMnemonics', e.target.checked)}
                                className="form-checkbox text-purple-500 rounded"
                            />
                            <span className="text-sm text-slate-300">Akılda Kalıcı İpuçları (Mnemonikler)</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-purple-500 transition">
                            <input
                                type="checkbox"
                                checked={settings.aiSettings.themeBased}
                                onChange={(e) => updateAiSettings('themeBased', e.target.checked)}
                                className="form-checkbox text-purple-500 rounded"
                            />
                            <span className="text-sm text-slate-300">Tematik Kelime Grupları</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Hızlı Mod Ayarları */}
            {settings.generationMode === 'hizli' && (
                <div className="space-y-4 p-4 bg-gradient-to-br from-teal-900/20 to-emerald-900/20 rounded-xl border border-teal-800/30">
                    <h4 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                        <span>⚡</span> Hızlı Şablon Ayarları
                    </h4>

                    <div className="space-y-3">
                        <label className="text-xs font-medium text-slate-400">Şablon Stili</label>
                        <div className="grid grid-cols-2 gap-2">
                            {templateStyles.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => updateHizliSettings('templateStyle', style.id)}
                                    className={`p-3 rounded-lg border transition-all ${
                                        settings.hizliSettings.templateStyle === style.id
                                            ? 'bg-teal-600 border-teal-400 text-white'
                                            : 'bg-slate-800 border-slate-700 text-slate-400'
                                    }`}
                                >
                                    <div className="text-lg mb-1">{style.icon}</div>
                                    <div className="text-[10px] font-medium">{style.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Zorluk</label>
                            <select
                                value={settings.hizliSettings.difficulty}
                                onChange={(e) => updateHizliSettings('difficulty', e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                            >
                                <option value="kolay">Kolay</option>
                                <option value="orta">Orta</option>
                                <option value="zor">Zor</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-400">Soru Sayısı</label>
                            <input
                                type="number"
                                min="5"
                                max="30"
                                value={settings.hizliSettings.questionCount}
                                onChange={(e) => updateHizliSettings('questionCount', parseInt(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Süre Limiti (Dakika)</label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={settings.hizliSettings.timeLimit || ''}
                            onChange={(e) => updateHizliSettings('timeLimit', e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Sınırsız"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white"
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-teal-500 transition">
                        <input
                            type="checkbox"
                            checked={settings.hizliSettings.includeAnswerKey}
                            onChange={(e) => updateHizliSettings('includeAnswerKey', e.target.checked)}
                            className="form-checkbox text-teal-500 rounded"
                        />
                        <span className="text-sm text-slate-300">Cevap Anahtarı Dahil</span>
                    </label>
                </div>
            )}

            {/* Ortak Görsel Ayarlar */}
            <div className="space-y-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    <span>🎨</span> Görsel Ayarlar
                </h4>

                <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                        <input
                            type="checkbox"
                            checked={settings.visualSettings.useColorCoding}
                            onChange={(e) => updateVisualSettings('useColorCoding', e.target.checked)}
                            className="form-checkbox text-blue-500 rounded"
                        />
                        <span className="text-xs text-slate-300">Renk Kodlaması</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                        <input
                            type="checkbox"
                            checked={settings.visualSettings.useIcons}
                            onChange={(e) => updateVisualSettings('useIcons', e.target.checked)}
                            className="form-checkbox text-yellow-500 rounded"
                        />
                        <span className="text-xs text-slate-300">Görsel İkonlar</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                        <input
                            type="checkbox"
                            checked={settings.visualSettings.useFonts}
                            onChange={(e) => updateVisualSettings('useFonts', e.target.checked)}
                            className="form-checkbox text-green-500 rounded"
                        />
                        <span className="text-xs text-slate-300">Font Vurguları</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-500 transition">
                        <input
                            type="checkbox"
                            checked={settings.visualSettings.useGrid}
                            onChange={(e) => updateVisualSettings('useGrid', e.target.checked)}
                            className="form-checkbox text-purple-500 rounded"
                        />
                        <span className="text-xs text-slate-300">Tablo/Gri Görünümü</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default KelimeBilgisiSettingsPanel;
