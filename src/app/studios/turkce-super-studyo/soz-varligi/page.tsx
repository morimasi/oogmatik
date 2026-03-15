'use client';
import React, { useState, useEffect } from 'react';
import {
    FlipCardGame,
    CardItem,
} from '../../../../modules/turkce-super-studyo/components/organisms/vocabulary/FlipCardGame';
import { Library, Sparkles, RefreshCw, BookHeart, Plus, Trash2, Archive } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VAULT_KEY = 'turkce_studyo_kelime_kumbarasi';

interface VaultWord {
    word: string;
    meaning: string;
    addedAt: string;
}

const mockCards: CardItem[] = [
    { id: 'v1', type: 'word', content: 'Yanıt', matchId: 'v2' },
    { id: 'v2', type: 'meaning', content: 'Cevap', matchId: 'v1' },
    { id: 'v3', type: 'word', content: 'Siyah', matchId: 'v4' },
    { id: 'v4', type: 'meaning', content: 'Beyaz', matchId: 'v3' },
    { id: 'v5', type: 'word', content: 'Mektep', matchId: 'v6' },
    { id: 'v6', type: 'meaning', content: 'Okul', matchId: 'v5' },
    { id: 'v7', type: 'word', content: 'Hediye', matchId: 'v8' },
    { id: 'v8', type: 'meaning', content: 'Armağan', matchId: 'v7' },
    { id: 'v9', type: 'word', content: 'Şan', matchId: 'v10' },
    { id: 'v10', type: 'meaning', content: 'Ün', matchId: 'v9' },
    { id: 'v11', type: 'word', content: 'Mutsuz', matchId: 'v12' },
    { id: 'v12', type: 'meaning', content: 'Kederli', matchId: 'v11' },
];

export default function SozVarligiPage() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [vaultWords, setVaultWords] = useState<VaultWord[]>([]);
    const [showVault, setShowVault] = useState(false);
    const [newWord, setNewWord] = useState('');
    const [newMeaning, setNewMeaning] = useState('');
    const [addedWords, setAddedWords] = useState<Set<string>>(new Set());

    // Load vault from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(VAULT_KEY);
            if (stored) setVaultWords(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    const saveVault = (words: VaultWord[]) => {
        setVaultWords(words);
        try {
            localStorage.setItem(VAULT_KEY, JSON.stringify(words));
        } catch { /* storage full */ }
    };

    const addToVault = (word: string, meaning: string) => {
        if (!word.trim() || !meaning.trim()) return;
        const newEntry: VaultWord = {
            word: word.trim(),
            meaning: meaning.trim(),
            addedAt: new Date().toLocaleDateString('tr-TR'),
        };
        const updated = [newEntry, ...vaultWords.filter((v) => v.word !== word.trim())];
        saveVault(updated);
        setAddedWords((prev) => new Set(prev).add(word));
        setTimeout(() => setAddedWords((prev) => { const next = new Set(prev); next.delete(word); return next; }), 2000);
    };

    const removeFromVault = (word: string) => {
        saveVault(vaultWords.filter((v) => v.word !== word));
    };

    const handleManualAdd = () => {
        if (!newWord.trim() || !newMeaning.trim()) return;
        addToVault(newWord, newMeaning);
        setNewWord('');
        setNewMeaning('');
    };

    // Auto-add matched pairs to vault after game completes
    const handleGameComplete = (moves: number) => {
        console.log(`Kelime oyunu tamamlandı! Hamle sayısı: ${moves}`);
        // Add all current card pairs to vault automatically
        const pairs: Record<string, string> = {};
        mockCards.forEach((card) => {
            if (card.type === 'word') {
                const match = mockCards.find((c) => c.id === card.matchId);
                if (match) pairs[card.content] = match.content;
            }
        });
        Object.entries(pairs).forEach(([word, meaning]) => addToVault(word, meaning));
    };

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <Library className="text-emerald-500" />
                        Söz Varlığı & Kelime Fabrikası
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Eş/Zıt anlam, deyimler ve kelime oyunları ile kelime hazinesini geliştirme.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Kelime Kumbarası Toggle */}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setShowVault(!showVault)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all ${showVault ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'}`}
                    >
                        <BookHeart size={18} />
                        Kelime Kumbarası
                        {vaultWords.length > 0 && (
                            <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                {vaultWords.length}
                            </span>
                        )}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setIsGenerating(true); setTimeout(() => setIsGenerating(false), 1500); }}
                        disabled={isGenerating}
                        className="px-5 py-2.5 bg-emerald-500 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50"
                    >
                        {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                        Yeni Kartlar
                    </motion.button>
                </div>
            </div>

            {/* Kelime Kumbarası Panel */}
            <AnimatePresence>
                {showVault && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border-2 border-amber-200 shadow-sm space-y-5">
                            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
                                <Archive size={20} />
                                Kelime Kumbarası{' '}
                                <span className="text-sm font-medium text-amber-600 bg-amber-100 px-2.5 py-0.5 rounded-full ml-1">
                                    {vaultWords.length} kelime
                                </span>
                            </h2>

                            {/* Manuel ekleme */}
                            <div className="flex gap-3 flex-wrap">
                                <input
                                    type="text"
                                    value={newWord}
                                    onChange={(e) => setNewWord(e.target.value)}
                                    placeholder="Kelime..."
                                    className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-amber-400 font-bold text-gray-800"
                                />
                                <input
                                    type="text"
                                    value={newMeaning}
                                    onChange={(e) => setNewMeaning(e.target.value)}
                                    placeholder="Anlamı / Eş anlamlısı..."
                                    className="flex-1 min-w-[160px] px-4 py-2.5 rounded-xl border-2 border-amber-200 bg-white focus:outline-none focus:border-amber-400 font-medium text-gray-700"
                                />
                                <button
                                    onClick={handleManualAdd}
                                    disabled={!newWord.trim() || !newMeaning.trim()}
                                    className="px-4 py-2.5 bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                    <Plus size={16} /> Ekle
                                </button>
                            </div>

                            {/* Kelime listesi */}
                            {vaultWords.length === 0 ? (
                                <p className="text-center text-amber-700 font-medium py-4 opacity-60">
                                    Henüz kelime eklenmedi. Oyunu tamamlayın veya manuel ekleyin.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                                    {vaultWords.map((v) => (
                                        <motion.div
                                            key={v.word}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="bg-white rounded-2xl p-3 border-2 border-amber-100 shadow-sm group relative"
                                        >
                                            <p className="font-bold text-gray-900 text-sm">{v.word}</p>
                                            <p className="text-xs text-amber-700 font-medium mt-0.5">{v.meaning}</p>
                                            <p className="text-xs text-gray-400 mt-1">{v.addedAt}</p>
                                            <button
                                                onClick={() => removeFromVault(v.word)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500 text-gray-400"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Flip Card Game */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border-2 border-emerald-50">
                <FlipCardGame
                    instruction="Birbirinin eş anlamlısı olan kelime kartlarını eşleştir. Oyunu tamamlayınca öğrendiğin kelimeler Kumbaraya eklenir!"
                    cards={mockCards}
                    onComplete={handleGameComplete}
                />
            </div>
        </div>
    );
}
