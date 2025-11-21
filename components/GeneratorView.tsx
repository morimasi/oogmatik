
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
    options?: string[] | { label: string; value: any }[]; 
    min?: number;
    max?: number;
    step?: number;
    description?: string;
    condition?: (currentValues: any) => boolean;
    width?: 'full' | 'half' | 'third'; // Layout Hint
}

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading }) => {
    const [mode, setMode] = useState<'ai' | 'fast'>('ai');
    const [difficulty, setDifficulty] = useState<'Başlangıç' | 'Orta' | 'Zor' | 'Uzman'>('Orta');
    const [worksheetCount, setWorksheetCount] = useState(1);
    const [specificOptions, setSpecificOptions] = useState<Record<string, any>>({});

    // Difficulty Colors for minimalist dot
    const difficultyColor = {
        'Başlangıç': 'bg-emerald-500',
        'Orta': 'bg-yellow-500',
        'Zor': 'bg-orange-500',
        'Uzman': 'bg-red-600'
    };

    // --- CONFIGURATION DEFINITIONS ---
    const getConfigFields = (actId: ActivityType): ConfigField[] => {
        const commonFields: ConfigField[] = [
             { key: 'topic', label: 'Konu / Tema', type: 'text', defaultValue: 'Rastgele', width: 'full', description: 'Örn: Uzay' }
        ];
         const itemCountField = (defaultValue = 10, min = 4, max = 20, label = "Soru Sayısı"): ConfigField => ({
            key: 'itemCount', label, type: 'number', defaultValue, min, max, width: 'half'
        });
        const gridSizeField = (defaultValue = 12, min = 8, max = 20): ConfigField => ({
            key: 'gridSize', label: 'Tablo', type: 'number', defaultValue, min, max, width: 'half'
        });

        switch (actId) {
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
                    { key: 'case', label: 'Harf', type: 'select', defaultValue: 'upper', width: 'half', options: [{label: 'BÜYÜK', value: 'upper'}, {label: 'küçük', value: 'lower'}] },
                    { key: 'directions', label: 'Yönler', type: 'select', defaultValue: 'simple', width: 'half', options: [{label: 'Basit', value: 'simple'}, {label: 'Çapraz', value: 'diagonal'}, {label: 'Tümü', value: 'all'}] }
                ];
            case ActivityType.ANAGRAM:
            case ActivityType.IMAGE_ANAGRAM_SORT:
            case ActivityType.ANAGRAM_IMAGE_MATCH:
            case ActivityType.POSITIONAL_ANAGRAM:
                return [
                    ...commonFields,
                    itemCountField(8, 4, 15, 'Kelime'),
                    { key: 'showImages', label: 'Görsel İpucu', type: 'checkbox', defaultValue: true, width: 'half' }
                ];
            case ActivityType.CROSSWORD:
            case ActivityType.SPIRAL_PUZZLE:
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE:
                 return [
                    ...commonFields,
                    gridSizeField(10, 8, 15),
                    itemCountField(8, 5, 12, 'Kelime'),
                    { key: 'passwordLength', label: 'Şifre Uz.', type: 'number', defaultValue: 5, min: 3, max: 10, width: 'half' },
                    { key: 'clueType', label: 'İpucu', type: 'select', defaultValue: 'def', width: 'half', options: [{label: 'Tanım', value: 'def'}, {label: 'Eş Anlam', value: 'syn'}, {label: 'Zıt Anlam', value: 'ant'}] }
                ];
            case ActivityType.WORD_LADDER:
                return [
                     { key: 'steps', label: 'Basamak', type: 'number', defaultValue: 4, min: 3, max: 6, width: 'half' },
                     itemCountField(2, 1, 4, 'Adet')
                ];
            case ActivityType.SPELLING_CHECK:
            case ActivityType.REVERSE_WORD:
            case ActivityType.LETTER_BRIDGE:
            case ActivityType.WORD_FORMATION:
            case ActivityType.JUMBLED_WORD_STORY:
            case ActivityType.HOMONYM_SENTENCE_WRITING:
            case ActivityType.MISSING_PARTS:
            case ActivityType.SYLLABLE_COMPLETION:
                return [ ...commonFields, itemCountField(8, 4, 20) ];
            case ActivityType.WORD_GROUPING:
                 return [
                     itemCountField(12, 6, 20, 'Toplam'),
                     { key: 'categoryCount', label: 'Kategori', type: 'number', defaultValue: 3, min: 2, max: 4, width: 'half'},
                 ];
            case ActivityType.WORD_WEB:
            case ActivityType.WORD_WEB_WITH_PASSWORD:
            case ActivityType.WORD_PLACEMENT_PUZZLE:
            case ActivityType.WORD_GRID_PUZZLE:
                return [ ...commonFields, itemCountField(10, 6, 15, 'Kelime'), gridSizeField(15, 10, 20) ];

            // Math
            case ActivityType.MATH_PUZZLE:
            case ActivityType.TARGET_NUMBER:
            case ActivityType.KENDOKU:
            case ActivityType.OPERATION_SQUARE_FILL_IN:
            case ActivityType.OPERATION_SQUARE_SUBTRACTION:
            case ActivityType.OPERATION_SQUARE_MULT_DIV:
            case ActivityType.MULTIPLICATION_WHEEL:
                return [
                    { key: 'operations', label: 'İşlemler', type: 'select', defaultValue: 'addsub', width: 'full', options: [{label: 'Toplama (+)', value: 'add'}, {label: 'Topla & Çıkar', value: 'addsub'}, {label: 'Çarpma (+ - x)', value: 'mult'}, {label: 'Dört İşlem', value: 'all'}]},
                    { key: 'numberRange', label: 'Aralık', type: 'select', defaultValue: '1-20', width: 'half', options: ['1-10', '1-20', '1-50', '1-100', '100-1000'] },
                    itemCountField(6, 4, 12)
                ];
            case ActivityType.NUMBER_PATTERN:
            case ActivityType.SHAPE_NUMBER_PATTERN:
            case ActivityType.VISUAL_NUMBER_PATTERN:
                 return [
                    { key: 'patternType', label: 'Örüntü', type: 'select', defaultValue: 'arithmetic', width: 'full', options: [{label: 'Aritmetik', value: 'arithmetic'}, {label: 'Geometrik', value: 'geometric'}, {label: 'Karmaşık', value: 'complex'}]},
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
                return [ itemCountField(2, 1, 4, 'Adet') ];

            // Reading
            case ActivityType.STORY_COMPREHENSION:
            case ActivityType.STORY_ANALYSIS:
            case ActivityType.STORY_SEQUENCING:
            case ActivityType.WORDS_IN_STORY:
                return [
                    { key: 'topic', label: 'Konu', type: 'text', defaultValue: 'Rastgele', width: 'full' },
                    { key: 'characterName', label: 'Karakter', type: 'text', defaultValue: '', width: 'full', description: 'İsteğe bağlı' },
                    { key: 'storyLength', label: 'Uzunluk', type: 'select', defaultValue: 'medium', width: 'half', options: [{label: 'Kısa', value: 'short'}, {label: 'Orta', value: 'medium'}, {label: 'Uzun', value: 'long'}]},
                    { key: 'genre', label: 'Tür', type: 'select', defaultValue: 'adventure', width: 'half', options: [{label: 'Macera', value: 'adventure'}, {label: 'Komik', value: 'funny'}, {label: 'Öğretici', value: 'educational'}]}
                ];
            
            // Memory & Attention
            case ActivityType.WORD_MEMORY:
            case ActivityType.VISUAL_MEMORY:
            case ActivityType.CHARACTER_MEMORY:
            case ActivityType.COLOR_WHEEL_MEMORY:
                return [
                    ...commonFields,
                    itemCountField(12, 6, 24),
                    { key: 'memorizeRatio', label: 'Ezber %', type: 'range', defaultValue: 50, min: 20, max: 80, width: 'full' }
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
                    { key: 'similarity', label: 'Benzerlik', type: 'select', defaultValue: 'high', width: 'half', options: [{label: 'Düşük', value: 'low'}, {label: 'Yüksek', value: 'high'}]}
                 ];
            case ActivityType.LETTER_GRID_TEST:
            case ActivityType.BURDON_TEST:
                return [
                    gridSizeField(15, 10, 25),
                    { key: 'targetLetters', label: 'Hedefler', type: 'text', defaultValue: 'b,d,p', width: 'half' }
                ];
            case ActivityType.TARGET_SEARCH:
                 return [
                    gridSizeField(20, 10, 30),
                    { key: 'targetChar', label: 'Hedef', type: 'text', defaultValue: 'd', width: 'half'},
                    { key: 'distractorChar', label: 'Çeldirici', type: 'text', defaultValue: 'b', width: 'half'}
                 ];
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW:
                 return [
                    itemCountField(10, 5, 20, 'Satır'),
                    { key: 'cols', label: 'Sütun', type: 'number', defaultValue: 15, min: 10, max: 25, width: 'half'}
                 ]
            case ActivityType.STROOP_TEST:
            case ActivityType.CHAOTIC_NUMBER_SEARCH:
                 return [itemCountField(20, 10, 40)];

            // Visual
            case ActivityType.GRID_DRAWING:
            case ActivityType.SYMMETRY_DRAWING:
            case ActivityType.MATCHSTICK_SYMMETRY:
                return [
                    itemCountField(2, 1, 4, 'Adet'),
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
            case ActivityType.SYLLABLE_TRAIN:
                return [ ...commonFields ];
            
            case ActivityType.READING_FLOW:
                return [{ key: 'topic', label: 'Konu', type: 'text', defaultValue: 'Rastgele', width: 'full' }];
            case ActivityType.RAPID_NAMING:
                return [{ key: 'type', label: 'RAN Türü', type: 'select', defaultValue: 'object', width: 'full', options: [{label: 'Nesneler', value: 'object'}, {label: 'Renkler', value: 'color'}, {label: 'Sayılar', value: 'number'}] }];

            default:
                return [ ...commonFields, itemCountField(10, 5, 20) ];
        }
    };

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

    useEffect(() => {
        let newGridSize = 12;
        let newItemCount = 10;
        let newDirections = 'diagonal';

        if (difficulty === 'Başlangıç') { newGridSize = 8; newItemCount = 6; newDirections = 'simple'; } 
        else if (difficulty === 'Orta') { newGridSize = 12; newItemCount = 10; newDirections = 'diagonal'; } 
        else if (difficulty === 'Zor') { newGridSize = 15; newItemCount = 12; newDirections = 'all'; } 
        else if (difficulty === 'Uzman') { newGridSize = 18; newItemCount = 15; newDirections = 'all'; }

        setSpecificOptions(prev => ({
            ...prev,
            gridSize: prev.hasOwnProperty('gridSize') ? newGridSize : undefined,
            itemCount: prev.hasOwnProperty('itemCount') ? newItemCount : undefined,
            directions: prev.hasOwnProperty('directions') ? newDirections : undefined
        }));
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
            ...specificOptions
        });
    };

    const configFields = useMemo(() => getConfigFields(activity.id), [activity.id]);

    const renderField = (field: ConfigField) => {
        if (field.condition && !field.condition(specificOptions)) return null;
        
        const widthClass = field.width === 'full' ? 'col-span-2' : 'col-span-1';

        return (
            <div key={field.key} className={`${widthClass}`}>
                <label htmlFor={field.key} className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">
                    {field.label}
                </label>
                
                {field.type === 'text' && (
                    <input
                        type="text"
                        id={field.key}
                        value={specificOptions[field.key] || ''}
                        onChange={(e) => handleOptionChange(field.key, e.target.value)}
                        className="w-full py-1.5 px-2 text-sm border border-zinc-300 rounded bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-zinc-700 dark:border-zinc-600"
                        placeholder={field.description}
                    />
                )}

                {field.type === 'number' && (
                    <input
                        type="number"
                        id={field.key}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={specificOptions[field.key] || 0}
                        onChange={(e) => handleOptionChange(field.key, Number(e.target.value))}
                        className="w-full py-1.5 px-2 text-sm border border-zinc-300 rounded bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-zinc-700 dark:border-zinc-600"
                    />
                )}

                {field.type === 'select' && (
                    <select
                        id={field.key}
                        value={specificOptions[field.key] || ''}
                        onChange={(e) => handleOptionChange(field.key, e.target.value)}
                        className="w-full py-1.5 px-2 text-sm border border-zinc-300 rounded bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none dark:bg-zinc-700 dark:border-zinc-600"
                    >
                        {field.options?.map((opt: any, idx: number) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return <option key={idx} value={val}>{lbl}</option>
                        })}
                    </select>
                )}

                {field.type === 'checkbox' && (
                    <div className="flex items-center h-full pt-1">
                        <input
                            type="checkbox"
                            id={field.key}
                            checked={!!specificOptions[field.key]}
                            onChange={(e) => handleOptionChange(field.key, e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">{field.description || 'Aktif'}</span>
                    </div>
                )}

                 {field.type === 'range' && (
                    <div className="flex items-center gap-2 pt-1">
                        <input
                            type="range"
                            id={field.key}
                            min={field.min}
                            max={field.max}
                            value={specificOptions[field.key] || field.min}
                            onChange={(e) => handleOptionChange(field.key, Number(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs font-mono w-6 text-right">{specificOptions[field.key]}%</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900">
            <div className="px-4 py-3 border-b bg-white dark:bg-zinc-800 dark:border-zinc-700 shadow-sm z-10">
                <button onClick={onBack} className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 flex items-center gap-1 mb-1">
                    <i className="fa-solid fa-chevron-left"></i> Listeye Dön
                </button>
                <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100 truncate">{activity.title}</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="space-y-3">
                    
                    {/* COMPACT GENERAL SETTINGS CARD */}
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Mode Selection */}
                            <div className="col-span-2 bg-zinc-100 dark:bg-zinc-700/50 p-1 rounded-md flex">
                                <button type="button" onClick={() => setMode('ai')} className={`flex-1 py-1 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${mode === 'ai' ? 'bg-white dark:bg-zinc-600 text-indigo-600 shadow-sm' : 'text-zinc-500'}`}>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI
                                </button>
                                <button type="button" onClick={() => setMode('fast')} className={`flex-1 py-1 text-xs font-bold rounded transition-all flex items-center justify-center gap-1 ${mode === 'fast' ? 'bg-white dark:bg-zinc-600 text-emerald-600 shadow-sm' : 'text-zinc-500'}`}>
                                    <i className="fa-solid fa-bolt"></i> Hızlı
                                </button>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">Zorluk</label>
                                <div className="relative">
                                    <select 
                                        value={difficulty} 
                                        onChange={e => setDifficulty(e.target.value as any)} 
                                        className="w-full py-1.5 pl-2 pr-6 text-sm border border-zinc-300 rounded bg-white appearance-none outline-none focus:border-indigo-500 dark:bg-zinc-700 dark:border-zinc-600"
                                    >
                                        <option value="Başlangıç">Başlangıç</option>
                                        <option value="Orta">Orta</option>
                                        <option value="Zor">Zor</option>
                                        <option value="Uzman">Uzman</option>
                                    </select>
                                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${difficultyColor[difficulty]}`}></div>
                                </div>
                            </div>

                            {/* Page Count */}
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1 tracking-wider">Sayfa: <span className="text-zinc-800 dark:text-zinc-200">{worksheetCount}</span></label>
                                <input 
                                    type="range" min="1" max="5" step="1"
                                    value={worksheetCount} 
                                    onChange={e => setWorksheetCount(Number(e.target.value))} 
                                    className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-2" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC SPECIFIC SETTINGS */}
                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 border-b border-zinc-100 pb-1">Etkinlik Ayarları</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {configFields.length > 0 ? configFields.map(renderField) : (
                                <p className="col-span-2 text-xs text-zinc-400 italic text-center py-2">Özel ayar yok.</p>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            <div className="p-3 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {isLoading ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Hazırlanıyor...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-play"></i> Oluştur
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
