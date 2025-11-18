
import React, { useState, useEffect } from 'react';
import { Activity } from '../types';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: any) => void;
    onBack: () => void;
    isLoading: boolean;
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading }) => {
    const [mode, setMode] = useState<'ai' | 'fast'>('ai');
    const [difficulty, setDifficulty] = useState<'Başlangıç' | 'Orta' | 'Zor' | 'Uzman'>('Orta');
    const [worksheetCount, setWorksheetCount] = useState(1);
    const [itemCount, setItemCount] = useState(10);
    const [gridSize, setGridSize] = useState(10);
    const [topic, setTopic] = useState('Rastgele');
    const [animateMeter, setAnimateMeter] = useState(false);

    // Trigger animation when difficulty changes
    useEffect(() => {
        setAnimateMeter(true);
        const timer = setTimeout(() => setAnimateMeter(false), 500);
        return () => clearTimeout(timer);
    }, [difficulty]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            mode,
            difficulty,
            worksheetCount,
            itemCount,
            gridSize,
            topic,
            timestamp: Date.now() // Ensure uniqueness for AI caching
        });
    };

    const hasTopic = ![
        'ANAGRAM', 'MATH_PUZZLE', 'STROOP_TEST', 'NUMBER_PATTERN', 'LETTER_GRID_TEST', 'NUMBER_SEARCH',
        'PROVERB_FILL_IN_THE_BLANK', 'LETTER_BRIDGE', 'FIND_THE_DUPLICATE_IN_ROW', 'WORD_LADDER',
        'FIND_IDENTICAL_WORD', 'FIND_LETTER_PAIR', 'TARGET_SEARCH', 'BURDON_TEST'
    ].includes(activity.id);

    const hasItemCount = ![
        'WORD_SEARCH', 'LETTER_GRID_TEST', 'PROVERB_SEARCH', 'TARGET_SEARCH', 'GRID_DRAWING'
    ].includes(activity.id);

    const hasGridSize = ['WORD_SEARCH', 'PROVERB_SEARCH', 'LETTER_GRID_TEST', 'FIND_LETTER_PAIR', 'TARGET_SEARCH'].includes(activity.id);

    // Difficulty Visuals Configuration
    const difficultyConfig = {
        'Başlangıç': { color: 'bg-emerald-400', width: '25%', text: 'Yeni Başlayanlar İçin', icon: 'fa-seedling' },
        'Orta': { color: 'bg-yellow-400', width: '50%', text: 'Standart Seviye', icon: 'fa-layer-group' },
        'Zor': { color: 'bg-orange-500', width: '75%', text: 'Zorlayıcı', icon: 'fa-bolt' },
        'Uzman': { color: 'bg-red-600', width: '100%', text: 'Profesyonel / Çok Zor', icon: 'fa-fire' }
    };

    const currentConfig = difficultyConfig[difficulty];

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b dark:border-zinc-700">
                <button onClick={onBack} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Etkinlik Listesine Dön
                </button>
                <h3 className="font-bold text-lg">{activity.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Üretim Modu */}
                <div>
                    <label className="block text-sm font-semibold mb-2">Üretim Modu</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setMode('ai')} className={`p-3 text-sm rounded-lg border-2 transition-all ${mode === 'ai' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/50 dark:border-indigo-400 dark:text-indigo-300' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-700/50 dark:border-zinc-600 dark:hover:border-zinc-500'}`}>
                            <div className="flex items-center justify-center mb-1"><i className="fa-solid fa-wand-magic-sparkles text-lg"></i></div>
                            <span className="font-bold block">Yapay Zeka</span>
                            <span className="text-xs opacity-70">Sınırsız & Özgün</span>
                        </button>
                        <button type="button" onClick={() => setMode('fast')} className={`p-3 text-sm rounded-lg border-2 transition-all ${mode === 'fast' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/50 dark:border-emerald-400 dark:text-emerald-300' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 dark:bg-zinc-700/50 dark:border-zinc-600 dark:hover:border-zinc-500'}`}>
                            <div className="flex items-center justify-center mb-1"><i className="fa-solid fa-bolt text-lg"></i></div>
                            <span className="font-bold block">Hızlı Mod</span>
                            <span className="text-xs opacity-70">Anında Hazır</span>
                        </button>
                    </div>
                </div>

                {/* Zorluk Seviyesi ve Görsel Animasyon */}
                <div>
                    <label className="block text-sm font-semibold mb-2 flex justify-between">
                        <span>Zorluk Seviyesi</span>
                        <span className={`text-xs font-normal transition-colors duration-300 ${difficulty === 'Uzman' ? 'text-red-600 font-bold animate-pulse' : 'text-zinc-500'}`}>
                            <i className={`fa-solid ${currentConfig.icon} mr-1`}></i>
                            {currentConfig.text}
                        </span>
                    </label>
                    
                    {/* Difficulty Select */}
                    <div className="relative">
                        <select 
                            value={difficulty} 
                            onChange={e => setDifficulty(e.target.value as any)} 
                            className="w-full p-3 border border-zinc-300 rounded-lg bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer z-10 relative"
                        >
                            <option value="Başlangıç">Başlangıç (Kolay)</option>
                            <option value="Orta">Orta (Standart)</option>
                            <option value="Zor">Zor (İleri)</option>
                            <option value="Uzman">Uzman (Profesyonel)</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none z-10 text-zinc-500">
                            <i className="fa-solid fa-chevron-down"></i>
                        </div>
                    </div>

                    {/* Difficulty Meter Bar */}
                    <div className="mt-3 h-2 w-full bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden shadow-inner">
                        <div 
                            className={`h-full transition-all duration-500 ease-out ${currentConfig.color} ${animateMeter && difficulty === 'Uzman' ? 'animate-pulse' : ''}`} 
                            style={{ width: currentConfig.width }}
                        ></div>
                    </div>
                </div>

                {/* Konu */}
                {mode === 'ai' && hasTopic && (
                     <div>
                        <label htmlFor="topic" className="block text-sm font-semibold mb-2">Konu / Tema</label>
                        <input 
                            type="text" 
                            id="topic" 
                            value={topic} 
                            onChange={e => setTopic(e.target.value)} 
                            placeholder="Örn: Uzay, Futbol, Orman..."
                            className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        />
                    </div>
                )}
                 {mode === 'fast' && hasTopic && (
                     <div>
                        <label htmlFor="topic-select" className="block text-sm font-semibold mb-2">Konu</label>
                        <select id="topic-select" value={topic} onChange={e => setTopic(e.target.value)} className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                           <option>Rastgele</option>
                           <option>Hayvanlar</option>
                           <option>Meyveler</option>
                           <option>Meslekler</option>
                           <option>Okul</option>
                           <option>Duygular</option>
                        </select>
                    </div>
                )}

                {/* Sayfa Sayısı */}
                <div>
                    <label htmlFor="worksheetCount" className="block text-sm font-semibold mb-2">Sayfa Sayısı (Çeşitlilik)</label>
                    <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            id="worksheetCount" 
                            min="1" 
                            max="5" 
                            step="1"
                            value={worksheetCount} 
                            onChange={e => setWorksheetCount(Number(e.target.value))} 
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <span className="font-mono font-bold text-lg w-8 text-center">{worksheetCount}</span>
                    </div>
                </div>
                
                {hasItemCount && (
                    <div>
                        <label htmlFor="itemCount" className="block text-sm font-semibold mb-2">Öğe/Kelime Sayısı</label>
                        <input type="number" id="itemCount" min="3" max="30" value={itemCount} onChange={e => setItemCount(Number(e.target.value))} className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                )}

                {hasGridSize && (
                     <div>
                        <label htmlFor="gridSize" className="block text-sm font-semibold mb-2">Tablo Boyutu (NxN)</label>
                        <input type="number" id="gridSize" min="5" max="25" value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                )}

            </form>

            <div className="p-4 border-t dark:border-zinc-700">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Oluşturuluyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>Etkinlik Oluştur</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
