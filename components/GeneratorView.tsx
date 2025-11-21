
import React, { useState, useEffect, useMemo } from 'react';
import { Activity, ActivityType, GeneratorOptions } from '../types';

interface GeneratorViewProps {
    activity: Activity;
    onGenerate: (options: GeneratorOptions) => void;
    onBack: () => void;
    isLoading: boolean;
}

// Field Types
type FieldType = 'text' | 'number' | 'select' | 'range' | 'checkbox' | 'multiselect';

interface ConfigField {
    key: string;
    label: string;
    type: FieldType;
    defaultValue: any;
    options?: string[] | { label: string; value: any }[]; // For select/multiselect
    min?: number;
    max?: number;
    step?: number;
    description?: string;
    condition?: (currentValues: any) => boolean; // Conditional rendering
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading }) => {
    const [mode, setMode] = useState<'ai' | 'fast'>('ai');
    const [difficulty, setDifficulty] = useState<'Başlangıç' | 'Orta' | 'Zor' | 'Uzman'>('Orta');
    const [worksheetCount, setWorksheetCount] = useState(1);
    
    // Dynamic State for specific options
    const [specificOptions, setSpecificOptions] = useState<Record<string, any>>({});
    const [animateMeter, setAnimateMeter] = useState(false);

    // Difficulty Visuals Configuration
    const difficultyConfig = {
        'Başlangıç': { color: 'bg-emerald-400', width: '25%', text: 'Yeni Başlayanlar İçin', icon: 'fa-seedling' },
        'Orta': { color: 'bg-yellow-400', width: '50%', text: 'Standart Seviye', icon: 'fa-layer-group' },
        'Zor': { color: 'bg-orange-500', width: '75%', text: 'Zorlayıcı', icon: 'fa-bolt' },
        'Uzman': { color: 'bg-red-600', width: '100%', text: 'Profesyonel / Çok Zor', icon: 'fa-fire' }
    };

    const currentConfig = difficultyConfig[difficulty];

    // --- CONFIGURATION DEFINITIONS ---
    const getConfigFields = (actId: ActivityType): ConfigField[] => {
        const commonFields: ConfigField[] = [
             { key: 'topic', label: 'Konu / Tema', type: 'text', defaultValue: 'Rastgele', description: 'Örn: Uzay, Orman, Okul...' }
        ];
         const itemCountField = (defaultValue = 10, min = 4, max = 20, label = "Öğe / Soru Sayısı"): ConfigField => ({
            key: 'itemCount', label, type: 'number', defaultValue, min, max
        });
        const gridSizeField = (defaultValue = 12, min = 8, max = 20): ConfigField => ({
            key: 'gridSize', label: 'Tablo Boyutu', type: 'number', defaultValue, min, max
        });

        switch (actId) {
            // --- KELİME OYUNLARI ---
            case ActivityType.WORD_SEARCH:
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR:
            case ActivityType.WORD_SEARCH_WITH_PASSWORD:
            case ActivityType.SYNONYM_WORD_SEARCH:
            case ActivityType.LETTER_GRID_WORD_FIND:
            case ActivityType.SYLLABLE_WORD_SEARCH:
                return [
                    ...commonFields,
                    itemCountField(10, 5, 20, 'Kelime Sayısı'),
                    gridSizeField(12, 8, 20),
                    { key: 'case', label: 'Harf Durumu', type: 'select', defaultValue: 'upper', options: [{label: 'BÜYÜK HARF', value: 'upper'}, {label: 'küçük harf', value: 'lower'}] },
                    { key: 'directions', label: 'İzin Verilen Yönler', type: 'select', defaultValue: 'simple', options: [
                        {label: 'Sadece Yatay & Dikey (Kolay)', value: 'simple'},
                        {label: 'Çapraz Dahil (Orta)', value: 'diagonal'},
                        {label: 'Her Yön & Ters (Zor)', value: 'all'}
                    ]}
                ];
            case ActivityType.ANAGRAM:
            case ActivityType.IMAGE_ANAGRAM_SORT:
            case ActivityType.ANAGRAM_IMAGE_MATCH:
            case ActivityType.POSITIONAL_ANAGRAM:
                return [
                    ...commonFields,
                    itemCountField(8, 4, 15, 'Kelime Sayısı'),
                    { key: 'showImages', label: 'Görsel İpucu Olsun mu?', type: 'checkbox', defaultValue: true }
                ];
            case ActivityType.CROSSWORD:
            case ActivityType.SPIRAL_PUZZLE:
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE:
                 return [
                    ...commonFields,
                    gridSizeField(10, 8, 15),
                    itemCountField(8, 5, 12, 'Kelime Sayısı'),
                    { key: 'passwordLength', label: 'Şifre Uzunluğu', type: 'number', defaultValue: 5, min: 3, max: 10 },
                    { key: 'clueType', label: 'İpucu Türü', type: 'select', defaultValue: 'def', options: [{label: 'Tanım / Anlam', value: 'def'}, {label: 'Eş Anlamlısı', value: 'syn'}, {label: 'Zıt Anlamlısı', value: 'ant'}] }
                ];
            case ActivityType.WORD_LADDER:
                return [
                     { key: 'steps', label: 'Basamak Sayısı', type: 'number', defaultValue: 4, min: 3, max: 6 },
                     itemCountField(2, 1, 4, 'Merdiven Sayısı')
                ];
            case ActivityType.SPELLING_CHECK:
            case ActivityType.REVERSE_WORD:
            case ActivityType.LETTER_BRIDGE:
            case ActivityType.WORD_FORMATION:
            case ActivityType.JUMBLED_WORD_STORY:
            case ActivityType.HOMONYM_SENTENCE_WRITING:
            case ActivityType.MISSING_PARTS:
            case ActivityType.SYLLABLE_COMPLETION:
                return [ ...commonFields, itemCountField(8) ];
            case ActivityType.WORD_GROUPING:
                 return [
                     itemCountField(12, 6, 20, 'Toplam Kelime'),
                     { key: 'categoryCount', label: 'Kategori Sayısı', type: 'number', defaultValue: 3, min: 2, max: 4},
                 ];
            case ActivityType.WORD_WEB:
            case ActivityType.WORD_WEB_WITH_PASSWORD:
            case ActivityType.WORD_PLACEMENT_PUZZLE:
            case ActivityType.WORD_GRID_PUZZLE:
                return [ ...commonFields, itemCountField(10, 6, 15, 'Kelime Sayısı'), gridSizeField(15, 10, 20) ];

            // --- MATEMATİK & MANTIK ---
            case ActivityType.MATH_PUZZLE:
            case ActivityType.TARGET_NUMBER:
            case ActivityType.KENDOKU:
            case ActivityType.OPERATION_SQUARE_FILL_IN:
            case ActivityType.OPERATION_SQUARE_SUBTRACTION:
            case ActivityType.OPERATION_SQUARE_MULT_DIV:
            case ActivityType.MULTIPLICATION_WHEEL:
                return [
                    { key: 'operations', label: 'İşlemler', type: 'select', defaultValue: 'addsub', options: [
                        {label: 'Toplama (+)', value: 'add'},
                        {label: 'Toplama & Çıkarma (+ -)', value: 'addsub'},
                        {label: 'Çarpma Dahil (+ - x)', value: 'mult'},
                        {label: 'Dört İşlem (+ - x /)', value: 'all'}
                    ]},
                    { key: 'numberRange', label: 'Sayı Aralığı', type: 'select', defaultValue: '1-20', options: ['1-10', '1-20', '1-50', '1-100', '100-1000'] },
                    itemCountField(6, 4, 12)
                ];
            case ActivityType.NUMBER_PATTERN:
            case ActivityType.SHAPE_NUMBER_PATTERN:
            case ActivityType.VISUAL_NUMBER_PATTERN:
                 return [
                    { key: 'patternType', label: 'Örüntü Tipi', type: 'select', defaultValue: 'arithmetic', options: [
                        {label: 'Aritmetik Artış (2, 4, 6...)', value: 'arithmetic'},
                        {label: 'Geometrik Artış (2, 4, 8...)', value: 'geometric'},
                        {label: 'Karmaşık (x2 +1...)', value: 'complex'}
                    ]},
                    itemCountField(8, 4, 12)
                 ];
            case ActivityType.SUDOKU_6X6_SHADED:
            case ActivityType.SHAPE_SUDOKU:
            case ActivityType.ODD_EVEN_SUDOKU:
            case ActivityType.FUTOSHIKI:
            case ActivityType.NUMBER_PYRAMID:
            case ActivityType.DIVISION_PYRAMID:
            case ActivityType.MULTIPLICATION_PYRAMID:
            case ActivityType.LOGIC_GRID_PUZZLE:
                return [ itemCountField(2, 1, 4, 'Bulmaca Sayısı') ];

            // --- OKUMA & ANLAMA ---
            case ActivityType.STORY_COMPREHENSION:
            case ActivityType.STORY_ANALYSIS:
            case ActivityType.STORY_SEQUENCING:
            case ActivityType.WORDS_IN_STORY:
                return [
                    { key: 'topic', label: 'Hikaye Konusu', type: 'text', defaultValue: 'Rastgele' },
                    { key: 'characterName', label: 'Ana Karakter İsmi', type: 'text', defaultValue: '', description: 'İsteğe bağlı' },
                    { key: 'storyLength', label: 'Hikaye Uzunluğu', type: 'select', defaultValue: 'medium', options: [
                        {label: 'Kısa (50-80 kelime)', value: 'short'},
                        {label: 'Orta (100-150 kelime)', value: 'medium'},
                        {label: 'Uzun (200+ kelime)', value: 'long'}
                    ]},
                    { key: 'genre', label: 'Tür', type: 'select', defaultValue: 'adventure', options: [
                        {label: 'Macera', value: 'adventure'},
                        {label: 'Komik', value: 'funny'},
                        {label: 'Öğretici', value: 'educational'},
                        {label: 'Masal', value: 'fairytale'}
                    ]}
                ];
            case ActivityType.STORY_CREATION_PROMPT:
                return [ ...commonFields, itemCountField(5, 3, 8, 'Anahtar Kelime Sayısı') ];
            case ActivityType.PROVERB_FILL_IN_THE_BLANK:
            case ActivityType.PROVERB_SAYING_SORT:
            case ActivityType.PROVERB_WORD_CHAIN:
            case ActivityType.PROVERB_SEARCH:
            case ActivityType.PROVERB_SENTENCE_FINDER:
                return [ itemCountField(8, 5, 15) ];
            
            // --- HAFIZA & DİKKAT ---
            case ActivityType.WORD_MEMORY:
            case ActivityType.VISUAL_MEMORY:
            case ActivityType.CHARACTER_MEMORY:
            case ActivityType.COLOR_WHEEL_MEMORY:
                return [
                    ...commonFields,
                    itemCountField(12, 6, 24),
                    { key: 'memorizeRatio', label: 'Ezberlenecek Miktar', type: 'range', defaultValue: 50, min: 20, max: 80, description: '% kaçı ezberlenecek?' }
                ];
            case ActivityType.FIND_THE_DIFFERENCE:
            case ActivityType.FIND_DIFFERENT_STRING:
            case ActivityType.FIND_IDENTICAL_WORD:
            case ActivityType.ODD_ONE_OUT:
            case ActivityType.VISUAL_ODD_ONE_OUT:
            case ActivityType.VISUAL_ODD_ONE_OUT_THEMED:
                 return [
                    ...commonFields,
                    itemCountField(8, 5, 15),
                    { key: 'similarity', label: 'Benzerlik Oranı', type: 'select', defaultValue: 'high', options: [
                        {label: 'Düşük (Kolay Fark Edilir)', value: 'low'},
                        {label: 'Yüksek (Zor Fark Edilir)', value: 'high'}
                    ]}
                 ];
            case ActivityType.LETTER_GRID_TEST:
            case ActivityType.BURDON_TEST:
                return [
                    gridSizeField(15, 10, 25),
                    { key: 'targetLetters', label: 'Hedef Harfler', type: 'text', defaultValue: 'b,d,p', description: 'Virgülle ayırın' }
                ];
            case ActivityType.TARGET_SEARCH:
                 return [
                    gridSizeField(20, 10, 30),
                    { key: 'targetChar', label: 'Hedef Karakter', type: 'text', defaultValue: 'd'},
                    { key: 'distractorChar', label: 'Çeldirici Karakter', type: 'text', defaultValue: 'b'}
                 ];
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW:
                 return [
                    itemCountField(10, 5, 20, 'Satır Sayısı'),
                    { key: 'cols', label: 'Sütun Sayısı', type: 'number', defaultValue: 15, min: 10, max: 25}
                 ]
            case ActivityType.STROOP_TEST:
            case ActivityType.CHAOTIC_NUMBER_SEARCH:
                 return [itemCountField(20, 10, 40)];

            // --- GÖRSEL ALGI ---
            case ActivityType.GRID_DRAWING:
            case ActivityType.SYMMETRY_DRAWING:
            case ActivityType.MATCHSTICK_SYMMETRY:
                return [
                    itemCountField(2, 1, 4, 'Çizim Sayısı'),
                    gridSizeField(8, 5, 12),
                ];
            case ActivityType.SHAPE_MATCHING:
            case ActivityType.SYMBOL_CIPHER:
            case ActivityType.COORDINATE_CIPHER:
            case ActivityType.ABC_CONNECT:
            case ActivityType.WORD_CONNECT:
            case ActivityType.ROMAN_NUMERAL_CONNECT:
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT:
            case ActivityType.WEIGHT_CONNECT:
            case ActivityType.LENGTH_CONNECT:
            case ActivityType.STAR_HUNT:
                return [
                    itemCountField(8, 4, 12),
                    gridSizeField(10, 6, 15)
                ];
            case ActivityType.PUNCTUATION_COLORING:
            case ActivityType.SYNONYM_ANTONYM_COLORING:
            case ActivityType.DOT_PAINTING:
                return [ ...commonFields ];
            
            // --- DISLEKSI DESTEK (NEW FIELDS) ---
            case ActivityType.READING_FLOW:
                return [
                    { key: 'topic', label: 'Metin Konusu', type: 'text', defaultValue: 'Rastgele' }
                ];
            case ActivityType.LETTER_DISCRIMINATION:
                return []; // Automatically handled by level
            case ActivityType.RAPID_NAMING:
                return [
                    { key: 'type', label: 'RAN Türü', type: 'select', defaultValue: 'object', options: [{label: 'Nesneler', value: 'object'}, {label: 'Renkler', value: 'color'}, {label: 'Sayılar', value: 'number'}] }
                ];
            case ActivityType.PHONOLOGICAL_AWARENESS:
                return [];
            case ActivityType.SYLLABLE_TRAIN:
                return [ ...commonFields ];
            case ActivityType.MIRROR_LETTERS:
                return [];
            case ActivityType.VISUAL_TRACKING_LINES:
                return [];

            // --- DEFAULT FALLBACK ---
            default:
                // Generic settings for unconfigured activities to prevent empty states
                return [
                    ...commonFields,
                    itemCountField(10, 5, 20)
                ];
        }
    };

    // Initialize default values when activity changes
    useEffect(() => {
        const fields = getConfigFields(activity.id);
        const initialValues: Record<string, any> = {};
        fields.forEach(field => {
            initialValues[field.key] = field.defaultValue;
        });
        setSpecificOptions(initialValues);
        setDifficulty('Orta');
        setWorksheetCount(1);
    }, [activity.id]);

    // Trigger animation when difficulty changes
    useEffect(() => {
        setAnimateMeter(true);
        const timer = setTimeout(() => setAnimateMeter(false), 500);
        return () => clearTimeout(timer);
    }, [difficulty]);

    const handleOptionChange = (key: string, value: any) => {
        setSpecificOptions(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({
            mode,
            difficulty,
            worksheetCount,
            timestamp: Date.now(),
            ...specificOptions // Spread dynamic options
        });
    };

    const renderField = (field: ConfigField) => {
        if (field.condition && !field.condition(specificOptions)) return null;

        return (
            <div key={field.key} className="mb-4">
                <label htmlFor={field.key} className="block text-sm font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                    {field.label}
                </label>
                
                {field.type === 'text' && (
                    <input
                        type="text"
                        id={field.key}
                        value={specificOptions[field.key] || ''}
                        onChange={(e) => handleOptionChange(field.key, e.target.value)}
                        className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder={field.description}
                    />
                )}

                {field.type === 'number' && (
                    <div className="flex items-center">
                        <input
                            type="number"
                            id={field.key}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            value={specificOptions[field.key] || 0}
                            onChange={(e) => handleOptionChange(field.key, Number(e.target.value))}
                            className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                )}

                {field.type === 'select' && (
                    <div className="relative">
                        <select
                            id={field.key}
                            value={specificOptions[field.key] || ''}
                            onChange={(e) => handleOptionChange(field.key, e.target.value)}
                            className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                        >
                            {field.options?.map((opt: any, idx: number) => {
                                const val = typeof opt === 'object' ? opt.value : opt;
                                const lbl = typeof opt === 'object' ? opt.label : opt;
                                return <option key={idx} value={val}>{lbl}</option>
                            })}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-zinc-500">
                            <i className="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                    </div>
                )}

                {field.type === 'checkbox' && (
                    <div className="flex items-center mt-1">
                        <input
                            type="checkbox"
                            id={field.key}
                            checked={!!specificOptions[field.key]}
                            onChange={(e) => handleOptionChange(field.key, e.target.checked)}
                            className="w-5 h-5 text-indigo-600 bg-zinc-100 border-zinc-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-zinc-800 focus:ring-2 dark:bg-zinc-700 dark:border-zinc-600"
                        />
                        <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">{field.description || 'Evet'}</span>
                    </div>
                )}

                 {field.type === 'range' && (
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            id={field.key}
                            min={field.min}
                            max={field.max}
                            value={specificOptions[field.key] || field.min}
                            onChange={(e) => handleOptionChange(field.key, Number(e.target.value))}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-sm font-mono w-8 text-center">{specificOptions[field.key]}</span>
                    </div>
                )}

                {field.description && field.type !== 'text' && field.type !== 'checkbox' && (
                    <p className="text-xs text-zinc-500 mt-1">{field.description}</p>
                )}
            </div>
        );
    };

    const configFields = useMemo(() => getConfigFields(activity.id), [activity.id]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b dark:border-zinc-700">
                <button onClick={onBack} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-arrow-left"></i> Etkinlik Listesine Dön
                </button>
                <h3 className="font-bold text-lg">{activity.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* GENEL AYARLAR KARTI */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center">
                        <i className="fa-solid fa-sliders mr-2"></i> Genel Ayarlar
                    </h4>

                    {/* Üretim Modu */}
                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2 bg-zinc-200 dark:bg-zinc-700 p-1 rounded-lg">
                            <button type="button" onClick={() => setMode('ai')} className={`p-2 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'ai' ? 'bg-white dark:bg-zinc-600 shadow-sm font-bold text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Yapay Zeka
                            </button>
                            <button type="button" onClick={() => setMode('fast')} className={`p-2 text-sm rounded-md transition-all flex items-center justify-center gap-2 ${mode === 'fast' ? 'bg-white dark:bg-zinc-600 shadow-sm font-bold text-emerald-600 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                <i className="fa-solid fa-bolt"></i> Hızlı Mod
                            </button>
                        </div>
                    </div>

                    {/* Zorluk Seviyesi */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1 flex justify-between">
                            <span>Zorluk</span>
                            <span className={`text-xs font-normal transition-colors duration-300 ${difficulty === 'Uzman' ? 'text-red-600 font-bold animate-pulse' : 'text-zinc-500'}`}>
                                {currentConfig.text}
                            </span>
                        </label>
                         <div className="relative">
                            <select 
                                value={difficulty} 
                                onChange={e => setDifficulty(e.target.value as any)} 
                                className="w-full p-2 border border-zinc-300 rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none z-10 relative"
                            >
                                <option value="Başlangıç">Başlangıç (Kolay)</option>
                                <option value="Orta">Orta (Standart)</option>
                                <option value="Zor">Zor (İleri)</option>
                                <option value="Uzman">Uzman (Profesyonel)</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none z-10 text-zinc-500">
                                <i className="fa-solid fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                        <div className="mt-2 h-1.5 w-full bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-500 ease-out ${currentConfig.color} ${animateMeter && difficulty === 'Uzman' ? 'animate-pulse' : ''}`} 
                                style={{ width: currentConfig.width }}
                            ></div>
                        </div>
                    </div>

                    {/* Sayfa Sayısı */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Çeşitlilik (Sayfa)</label>
                        <div className="flex items-center gap-3">
                            <input 
                                type="range" 
                                min="1" 
                                max="5" 
                                step="1"
                                value={worksheetCount} 
                                onChange={e => setWorksheetCount(Number(e.target.value))} 
                                className="w-full h-2 bg-zinc-300 dark:bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                            />
                            <span className="font-mono font-bold text-lg w-6 text-center">{worksheetCount}</span>
                        </div>
                    </div>
                </div>

                {/* ÖZEL AYARLAR KARTI - Dynamic Fields */}
                <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-4 flex items-center">
                        <i className="fa-solid fa-gear mr-2"></i> Etkinlik Ayarları
                    </h4>
                    
                    <div className="space-y-4">
                        {configFields.length > 0 ? configFields.map(renderField) : (
                            <p className="text-sm text-zinc-500 text-center p-4 bg-zinc-50 dark:bg-zinc-800 rounded-md">Bu etkinlik için özel bir ayar bulunmuyor.</p>
                        )}
                    </div>
                </div>

            </form>

            <div className="p-4 border-t dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
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
                            <span>Hazırlanıyor...</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>Etkinliği Oluştur</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
