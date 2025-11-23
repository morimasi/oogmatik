
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
         const itemCountField = (defaultValue = 10, min = 4, max = 50, label = "Soru Sayısı"): ConfigField => ({
            key: 'itemCount', label, type: 'number', defaultValue, min, max, width: 'half'
        });
        const gridSizeField = (defaultValue = 12, min = 8, max = 20): ConfigField => ({
            key: 'gridSize', label: 'Tablo', type: 'number', defaultValue, min, max, width: 'half'
        });

        switch (actId) {
            // --- Dyscalculia ---
            case ActivityType.NUMBER_SENSE:
                return [
                    { key: 'range', label: 'Sayı Aralığı', type: 'select', defaultValue: '1-10', width: 'full', options: [{label: '1-10', value: '1-10'}, {label: '1-20', value: '1-20'}, {label: '1-100', value: '1-100'}] },
                    { key: 'visualType', label: 'Görsel Destek', type: 'select', defaultValue: 'objects', width: 'half', options: [{label: 'Nesneler', value: 'objects'}, {label: 'Noktalar', value: 'dots'}, {label: 'Parmaklar', value: 'fingers'}] },
                    itemCountField(5, 3, 10, 'Soru Sayısı')
                ];
            case ActivityType.ARITHMETIC_FLUENCY:
            case ActivityType.VISUAL_ARITHMETIC:
                return [
                    { key: 'operation', label: 'İşlem', type: 'select', defaultValue: 'addition', width: 'half', options: [{label: 'Toplama', value: 'addition'}, {label: 'Çıkarma', value: 'subtraction'}, {label: 'Karışık', value: 'mixed'}] },
                    { key: 'maxSum', label: 'Max Toplam', type: 'number', defaultValue: 10, min: 5, max: 20, width: 'half' },
                    itemCountField(6, 4, 12, 'İşlem Sayısı')
                ];
            case ActivityType.NUMBER_GROUPING:
                return [
                    { key: 'groupSize', label: 'Grup Boyutu', type: 'select', defaultValue: '10', width: 'half', options: [{label: '5\'li', value: '5'}, {label: '10\'lu', value: '10'}] },
                    itemCountField(4, 2, 8, 'Grup Sayısı')
                ];
            case ActivityType.FRACTIONS_DECIMALS:
                return [
                    { key: 'visualStyle', label: 'Görsel Stil', type: 'select', defaultValue: 'pie', width: 'full', options: [{label: 'Pasta Dilimi', value: 'pie'}, {label: 'Çubuk', value: 'bar'}] },
                    itemCountField(6, 4, 12)
                ];
            case ActivityType.SPATIAL_REASONING:
            case ActivityType.SPATIAL_AWARENESS_DISCOVERY:
            case ActivityType.POSITIONAL_CONCEPTS:
            case ActivityType.DIRECTIONAL_CONCEPTS:
                return [
                    gridSizeField(4, 3, 6),
                    { key: 'concept', label: 'Kavram', type: 'select', defaultValue: 'position', width: 'full', options: [{label: 'Konum (Alt/Üst)', value: 'position'}, {label: 'Yön (Sağ/Sol)', value: 'direction'}, {label: 'Yol Takibi', value: 'path'}] },
                    itemCountField(4, 2, 8)
                ];
            case ActivityType.ESTIMATION_SKILLS:
                return [
                    { key: 'range', label: 'Tahmin Aralığı', type: 'select', defaultValue: '10-50', width: 'full', options: [{label: '10-50', value: '10-50'}, {label: '50-100', value: '50-100'}] },
                    itemCountField(4, 2, 8)
                ];
            case ActivityType.MATH_LANGUAGE:
                return [
                    itemCountField(8, 4, 12, 'Sembol Sayısı')
                ];
            case ActivityType.TIME_MEASUREMENT_GEOMETRY:
                return [
                    { key: 'subType', label: 'Alt Tür', type: 'select', defaultValue: 'clock', width: 'full', options: [{label: 'Saat Okuma', value: 'clock'}, {label: 'Geometrik Şekiller', value: 'geometry'}, {label: 'Ölçü Birimleri', value: 'measurement'}] },
                    itemCountField(6, 4, 12)
                ];
            case ActivityType.VISUAL_DISCRIMINATION_MATH:
                return [
                    { key: 'targetType', label: 'Hedef', type: 'select', defaultValue: 'number', width: 'full', options: [{label: 'Sayılar (6 vs 9)', value: 'number'}, {label: 'Şekiller', value: 'shape'}] },
                    itemCountField(5, 3, 10, 'Satır Sayısı')
                ];
            case ActivityType.PROBLEM_SOLVING_STRATEGIES:
            case ActivityType.APPLIED_MATH_STORY:
                return [
                    { key: 'storyTheme', label: 'Hikaye Teması', type: 'text', defaultValue: 'Uzay Macerası', width: 'full' },
                    itemCountField(3, 1, 5, 'Problem Sayısı')
                ];
            case ActivityType.VISUAL_NUMBER_REPRESENTATION:
                return [
                    { key: 'maxNumber', label: 'Maksimum Sayı', type: 'number', defaultValue: 10, min: 5, max: 20, width: 'half' },
                    itemCountField(6, 4, 12)
                ];

            // --- Existing Activities ---
            case ActivityType.WORD_SEARCH:
            case ActivityType.THEMATIC_WORD_SEARCH_COLOR:
            case ActivityType.WORD_SEARCH_WITH_PASSWORD:
            case ActivityType.SYNONYM_WORD_SEARCH:
            case ActivityType.LETTER_GRID_WORD_FIND:
            case ActivityType.SYLLABLE_WORD_SEARCH:
                return [
                    ...commonFields,
                    itemCountField(10, 5, 25, 'Kelime Sayısı'),
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
                    itemCountField(8, 4, 16, 'Kelime'),
                    { key: 'showImages', label: 'Görsel İpucu', type: 'checkbox', defaultValue: true, width: 'half' }
                ];
            case ActivityType.CROSSWORD:
            case ActivityType.SPIRAL_PUZZLE:
            case ActivityType.PUNCTUATION_SPIRAL_PUZZLE:
                 return [
                    ...commonFields,
                    gridSizeField(10, 8, 15),
                    itemCountField(8, 5, 15, 'Kelime'),
                    { key: 'passwordLength', label: 'Şifre Uz.', type: 'number', defaultValue: 5, min: 3, max: 10, width: 'half' },
                    { key: 'clueType', label: 'İpucu', type: 'select', defaultValue: 'def', width: 'half', options: [{label: 'Tanım', value: 'def'}, {label: 'Eş Anlam', value: 'syn'}, {label: 'Zıt Anlam', value: 'ant'}] }
                ];
            case ActivityType.WORD_LADDER:
                return [
                     { key: 'steps', label: 'Basamak', type: 'number', defaultValue: 4, min: 3, max: 6, width: 'half' },
                     itemCountField(2, 1, 6, 'Adet')
                ];
            case ActivityType.SPELLING_CHECK:
            case ActivityType.REVERSE_WORD:
            case ActivityType.LETTER_BRIDGE:
            case ActivityType.WORD_FORMATION:
            case ActivityType.JUMBLED_WORD_STORY:
            case ActivityType.HOMONYM_SENTENCE_WRITING:
            case ActivityType.MISSING_PARTS:
            case ActivityType.SYLLABLE_COMPLETION:
            case ActivityType.BACKWARD_SPELLING:
            case ActivityType.PROVERB_FILL_IN_THE_BLANK:
            case ActivityType.PROVERB_SAYING_SORT:
            case ActivityType.PROVERB_WORD_CHAIN:
                return [ ...commonFields, itemCountField(8, 4, 20) ];
            case ActivityType.WORD_GROUPING:
                 return [
                     itemCountField(12, 6, 24, 'Toplam Kelime'),
                     { key: 'categoryCount', label: 'Kategori', type: 'number', defaultValue: 3, min: 2, max: 4, width: 'half'},
                 ];
            case ActivityType.WORD_WEB:
            case ActivityType.WORD_WEB_WITH_PASSWORD:
            case ActivityType.WORD_PLACEMENT_PUZZLE:
            case ActivityType.WORD_GRID_PUZZLE:
                return [ ...commonFields, itemCountField(10, 6, 20, 'Kelime'), gridSizeField(15, 10, 20) ];

            // Math & Logic Consolidated
            case ActivityType.NUMBER_PYRAMID:
                return [
                    { key: 'pyramidType', label: 'İşlem Türü', type: 'select', defaultValue: 'addition', width: 'full', options: [{label: 'Toplama (+)', value: 'addition'}, {label: 'Çarpma (x)', value: 'multiplication'}, {label: 'Bölme (÷)', value: 'division'}] },
                    itemCountField(2, 1, 10, 'Piramit Sayısı')
                ];
            case ActivityType.OPERATION_SQUARE_FILL_IN:
                return [
                    { key: 'operationType', label: 'İşlem Grubu', type: 'select', defaultValue: 'mixed', width: 'full', options: [{label: 'Karışık (+, -, x)', value: 'mixed'}, {label: 'Toplama/Çıkarma', value: 'addsub'}, {label: 'Çarpma/Bölme', value: 'multdiv'}] },
                    itemCountField(2, 1, 10, 'Kare Sayısı')
                ];
            case ActivityType.ODD_EVEN_SUDOKU:
                return [
                    { key: 'variant', label: 'Varyasyon', type: 'select', defaultValue: 'odd_even', width: 'full', options: [{label: 'Tek-Çift Kuralı', value: 'odd_even'}, {label: 'Gölgeli Alan Kuralı', value: 'shaded'}] },
                    itemCountField(1, 1, 6, 'Sudoku Sayısı')
                ];
            case ActivityType.FUTOSHIKI:
                return [
                    { key: 'contentType', label: 'İçerik', type: 'select', defaultValue: 'numbers', width: 'full', options: [{label: 'Sayılar', value: 'numbers'}, {label: 'Uzunluklar (cm, m)', value: 'length'}] },
                    itemCountField(2, 1, 10, 'Bulmaca Sayısı')
                ];

            // Math
            case ActivityType.MATH_PUZZLE:
            case ActivityType.TARGET_NUMBER:
            case ActivityType.KENDOKU:
            case ActivityType.MULTIPLICATION_WHEEL:
            case ActivityType.ROMAN_NUMERAL_MULTIPLICATION:
                return [
                    { key: 'operations', label: 'İşlemler', type: 'select', defaultValue: 'addsub', width: 'full', options: [{label: 'Toplama (+)', value: 'add'}, {label: 'Topla & Çıkar', value: 'addsub'}, {label: 'Çarpma (+ - x)', value: 'mult'}, {label: 'Dört İşlem', value: 'all'}]},
                    { key: 'numberRange', label: 'Aralık', type: 'select', defaultValue: '1-20', width: 'half', options: ['1-10', '1-20', '1-50', '1-100', '100-1000'] },
                    itemCountField(6, 4, 20)
                ];
            case ActivityType.BASIC_OPERATIONS:
                return [
                    { 
                        key: 'selectedOperations', 
                        label: 'İşlem Türleri', 
                        type: 'multiselect', 
                        defaultValue: ['addition'], 
                        width: 'full', 
                        options: [
                            {label: 'Toplama (+)', value: 'addition'}, 
                            {label: 'Çıkarma (-)', value: 'subtraction'}, 
                            {label: 'Çarpma (x)', value: 'multiplication'}, 
                            {label: 'Bölme (÷)', value: 'division'}
                        ]
                    },
                    { key: 'num1Digits', label: '1. Sayı Basamak', type: 'range', defaultValue: 2, min: 1, max: 6, width: 'half' },
                    { key: 'num2Digits', label: '2. Sayı Basamak', type: 'range', defaultValue: 1, min: 1, max: 6, width: 'half' },
                    
                    itemCountField(12, 4, 24, 'İşlem Sayısı'),
                    
                    // Conditional Fields - Updated logic for multi-select
                    { key: 'allowCarry', label: 'Eldeli Olsun', type: 'checkbox', defaultValue: false, width: 'half', condition: (vals) => vals.selectedOperations?.includes('addition') },
                    { key: 'allowBorrow', label: 'Onluk Bozmalı', type: 'checkbox', defaultValue: false, width: 'half', condition: (vals) => vals.selectedOperations?.includes('subtraction') },
                    { key: 'allowRemainder', label: 'Kalanlı Bölme', type: 'checkbox', defaultValue: false, width: 'half', condition: (vals) => vals.selectedOperations?.includes('division') },
                    { key: 'useThirdNumber', label: '3. Sayı Ekle', type: 'checkbox', defaultValue: false, width: 'half', condition: (vals) => vals.selectedOperations?.includes('addition') }
                ];
            case ActivityType.REAL_LIFE_MATH_PROBLEMS:
                return [
                    ...commonFields,
                    { key: 'operationType', label: 'Odak İşlem', type: 'select', defaultValue: 'mixed', width: 'half', options: [
                        {label: 'Toplama', value: 'addition'}, 
                        {label: 'Çıkarma', value: 'subtraction'}, 
                        {label: 'Çarpma', value: 'multiplication'}, 
                        {label: 'Bölme', value: 'division'},
                        {label: 'Karışık', value: 'mixed'}
                    ]},
                    itemCountField(4, 2, 8, 'Problem Sayısı')
                ];
            case ActivityType.NUMBER_PATTERN:
            case ActivityType.SHAPE_NUMBER_PATTERN:
            case ActivityType.VISUAL_NUMBER_PATTERN:
                 return [
                    { key: 'patternType', label: 'Örüntü', type: 'select', defaultValue: 'arithmetic', width: 'full', options: [{label: 'Aritmetik', value: 'arithmetic'}, {label: 'Geometrik', value: 'geometric'}, {label: 'Karmaşık', value: 'complex'}]},
                    itemCountField(8, 4, 20)
                 ];
            case ActivityType.SHAPE_SUDOKU:
            case ActivityType.LOGIC_GRID_PUZZLE:
            case ActivityType.ROMAN_NUMERAL_STAR_HUNT:
            case ActivityType.NUMBER_CAPSULE:
                return [ itemCountField(2, 1, 20, 'Adet') ];

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
            case ActivityType.THEMATIC_ODD_ONE_OUT:
            case ActivityType.THEMATIC_ODD_ONE_OUT_SENTENCE:
            case ActivityType.COLUMN_ODD_ONE_OUT_SENTENCE:
                 return [
                    ...commonFields,
                    itemCountField(8, 5, 20),
                    { key: 'similarity', label: 'Benzerlik', type: 'select', defaultValue: 'high', width: 'half', options: [{label: 'Düşük', value: 'low'}, {label: 'Yüksek', value: 'high'}]}
                 ];
            case ActivityType.LETTER_GRID_TEST:
            case ActivityType.BURDON_TEST:
                return [
                    gridSizeField(15, 10, 25),
                    { key: 'targetLetters', label: 'Hedef Harfler', type: 'text', defaultValue: 'b,d,p', width: 'full', description: 'Örn: b,d veya m,n (Virgülle ayırın)' }
                ];
            case ActivityType.TARGET_SEARCH:
                 return [
                    gridSizeField(20, 10, 30),
                    { key: 'targetChar', label: 'Hedef', type: 'text', defaultValue: 'd', width: 'half', description: 'Aranan harf'},
                    { key: 'distractorChar', label: 'Çeldirici', type: 'text', defaultValue: 'b', width: 'half', description: 'Karıştıran harf'},
                    itemCountField(20, 10, 50, 'Hedef Sayısı')
                 ];
            case ActivityType.FIND_LETTER_PAIR:
                 return [
                    gridSizeField(15, 10, 25),
                    { key: 'targetPair', label: 'Hedef İkili', type: 'text', defaultValue: 'bd', width: 'full', description: 'Örn: bd, mn, ft'},
                    itemCountField(8, 4, 20, 'Gizli Çift')
                 ];
            case ActivityType.FIND_THE_DUPLICATE_IN_ROW:
                 return [
                    itemCountField(10, 5, 20, 'Satır'),
                    { key: 'cols', label: 'Sütun', type: 'number', defaultValue: 15, min: 10, max: 25, width: 'half'}
                 ]
            case ActivityType.STROOP_TEST:
            case ActivityType.CHAOTIC_NUMBER_SEARCH:
                 return [itemCountField(20, 10, 50)];

            // Visual
            case ActivityType.GRID_DRAWING:
            case ActivityType.SYMMETRY_DRAWING:
            case ActivityType.MATCHSTICK_SYMMETRY:
            case ActivityType.SHAPE_COUNTING:
                return [
                    itemCountField(2, 1, 6, 'Adet'),
                    gridSizeField(8, 5, 12),
                ];
            case ActivityType.SHAPE_MATCHING:
            case ActivityType.SYMBOL_CIPHER:
            case ActivityType.COORDINATE_CIPHER:
            case ActivityType.WORD_CONNECT:
            case ActivityType.ROMAN_NUMERAL_CONNECT:
            case ActivityType.ROMAN_ARABIC_MATCH_CONNECT:
            case ActivityType.WEIGHT_CONNECT:
            case ActivityType.LENGTH_CONNECT:
            case ActivityType.STAR_HUNT:
            case ActivityType.ROUNDING_CONNECT:
            case ActivityType.ARITHMETIC_CONNECT:
            case ActivityType.PROFESSION_CONNECT:
                return [
                    itemCountField(8, 4, 20),
                    gridSizeField(10, 6, 15)
                ];
            case ActivityType.ABC_CONNECT:
                return [
                    itemCountField(2, 1, 6, 'Adet'),
                    gridSizeField(6, 4, 10),
                    { key: 'targetLetters', label: 'Özel Harfler', type: 'text', defaultValue: '', width: 'full', description: 'Örn: A,B,C veya K,L,M (Boş bırakılırsa A-Z kullanılır)' }
                ];
            case ActivityType.PUNCTUATION_COLORING:
            case ActivityType.SYNONYM_ANTONYM_COLORING:
                return [ ...commonFields, itemCountField(4, 2, 10, 'Cümle/Öğe') ];
            case ActivityType.DOT_PAINTING:
                return [ ...commonFields, itemCountField(1, 1, 1, 'Resim Sayısı') ];
            case ActivityType.SYLLABLE_TRAIN:
                return [ ...commonFields, itemCountField(5, 3, 10, 'Kelime Sayısı') ];
            
            // Dyslexia Support & Others
            case ActivityType.READING_FLOW:
                return [{ key: 'topic', label: 'Konu', type: 'text', defaultValue: 'Rastgele', width: 'full' }, itemCountField(5, 3, 15, 'Cümle Sayısı')];
            case ActivityType.RAPID_NAMING:
                return [
                    { key: 'type', label: 'RAN Türü', type: 'select', defaultValue: 'object', width: 'full', options: [{label: 'Nesneler', value: 'object'}, {label: 'Renkler', value: 'color'}, {label: 'Sayılar', value: 'number'}, {label: 'Harfler', value: 'letter'}] },
                    { key: 'targetLetters', label: 'Hedef Harfler', type: 'text', defaultValue: 'a,e,o,u', width: 'full', description: 'Virgülle ayırın (Sadece Harf türü için)', condition: (vals) => vals.type === 'letter' },
                    itemCountField(20, 10, 50, 'Sembol Sayısı')
                ];
            case ActivityType.LETTER_DISCRIMINATION:
                return [ 
                    { key: 'targetLetters', label: 'Karışan Harfler', type: 'text', defaultValue: 'b,d', width: 'full', description: 'Örn: b,d veya m,n' },
                    itemCountField(6, 4, 12, 'Satır Sayısı') 
                ];
            case ActivityType.MIRROR_LETTERS:
                return [ 
                    { key: 'targetPair', label: 'Hedef Çift', type: 'text', defaultValue: 'b,d', width: 'full', description: 'Örn: b,d veya p,q' },
                    itemCountField(5, 3, 10, 'Satır Sayısı') 
                ];
            case ActivityType.PHONOLOGICAL_AWARENESS:
                return [ itemCountField(4, 4, 12, 'Soru Sayısı') ];
            case ActivityType.VISUAL_TRACKING_LINES:
                return [ itemCountField(4, 3, 8, 'Yol Sayısı') ];
            case ActivityType.PUNCTUATION_MAZE:
            case ActivityType.PUNCTUATION_PHONE_NUMBER:
                return [ ...commonFields, itemCountField(1, 1, 5, 'Adet') ];

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
            gridSize: prev.hasOwnProperty('gridSize') ? newGridSize : prev.gridSize,
            itemCount: prev.hasOwnProperty('itemCount') ? newItemCount : prev.itemCount,
            directions: prev.hasOwnProperty('directions') ? newDirections : prev.directions
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

                {field.type === 'multiselect' && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        {field.options?.map((opt: any, idx: number) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            const isSelected = (specificOptions[field.key] || []).includes(val);
                            
                            return (
                                <button
                                    type="button"
                                    key={idx}
                                    onClick={() => {
                                        const current = specificOptions[field.key] || [];
                                        const updated = isSelected 
                                            ? current.filter((i: any) => i !== val) 
                                            : [...current, val];
                                        handleOptionChange(field.key, updated);
                                    }}
                                    className={`text-xs py-1.5 px-2 rounded border transition-colors ${isSelected ? 'bg-indigo-100 border-indigo-500 text-indigo-700 font-bold' : 'bg-white border-zinc-300 text-zinc-600 hover:bg-zinc-50'}`}
                                >
                                    {isSelected && <i className="fa-solid fa-check mr-1 text-[10px]"></i>}
                                    {lbl}
                                </button>
                            );
                        })}
                    </div>
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
                        <span className="ml-2 text-sm text-zinc-700 dark:text-zinc-300">{field.description || 'Evet'}</span>
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
                        <span className="text-xs font-mono w-6 text-right">{specificOptions[field.key]}</span>
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
