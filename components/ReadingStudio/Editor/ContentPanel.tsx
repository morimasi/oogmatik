import React from 'react';
import { useReadingStudio } from '../../../context/ReadingStudioContext';

export const ContentPanel = () => {
    const { layout, selectedId, updateComponent } = useReadingStudio();

    const selectedItem = layout.find((item: any) => item.instanceId === selectedId);

    if (!selectedItem) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-4 border border-zinc-800">
                    <i className="fa-solid fa-align-left text-2xl"></i>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Bileşen Seçilmedi</p>
                <p className="text-[10px] text-zinc-600 mt-2 italic">İçeriğini düzenlemek istediğiniz bloğa tıklayın.</p>
            </div>
        );
    }

    const data = selectedItem.specificData || {};

    const updateData = (updates: any) => {
        updateComponent(selectedItem.instanceId, {
            specificData: { ...data, ...updates }
        }, true);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                    <i className="fa-solid fa-pen-to-square text-xs"></i>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">İçerik Düzenleme</h3>
            </div>

            {selectedItem.id === 'header' && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Başlık</label>
                        <input
                            type="text"
                            value={data.title || ''}
                            onChange={(e) => updateData({ title: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Alt Başlık</label>
                        <input
                            type="text"
                            value={data.subtitle || ''}
                            onChange={(e) => updateData({ subtitle: e.target.value })}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white"
                        />
                    </div>
                </div>
            )}

            {selectedItem.id === 'story_block' && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Hikaye Metni</label>
                        <textarea
                            value={data.text || ''}
                            onChange={(e) => updateData({ text: e.target.value })}
                            rows={15}
                            className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white resize-none custom-scrollbar"
                        />
                    </div>
                </div>
            )}

            {selectedItem.id === 'vocabulary' && (
                <div className="space-y-4">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Kelimeler</label>
                    {(data.words || []).map((v: any, i: number) => (
                        <div key={i} className="flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-700/50 rounded-xl">
                            <input
                                type="text"
                                value={v.word}
                                onChange={(e) => {
                                    const newWords = [...data.words];
                                    newWords[i] = { ...newWords[i], word: e.target.value };
                                    updateData({ words: newWords });
                                }}
                                className="bg-black/50 border border-transparent rounded-lg p-2 text-xs text-white"
                                placeholder="Kelime"
                            />
                            <textarea
                                value={v.definition}
                                onChange={(e) => {
                                    const newWords = [...data.words];
                                    newWords[i] = { ...newWords[i], definition: e.target.value };
                                    updateData({ words: newWords });
                                }}
                                className="bg-black/50 border border-transparent rounded-lg p-2 text-xs text-zinc-300 resize-none h-16"
                                placeholder="Anlamı"
                            />
                        </div>
                    ))}
                </div>
            )}

            {(selectedItem.id === '5n1k' || selectedItem.id === 'questions' || selectedItem.id === 'questions_test') && (
                <div className="space-y-4">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Sorular</label>
                    {(data.questions || []).map((q: any, i: number) => (
                        <div key={i} className="flex flex-col gap-2 p-3 bg-zinc-900 border border-zinc-700/50 rounded-xl">
                            {selectedItem.id === '5n1k' && (
                                <select
                                    value={q.type}
                                    onChange={(e) => {
                                        const newQ = [...data.questions];
                                        newQ[i] = { ...newQ[i], type: e.target.value };
                                        updateData({ questions: newQ });
                                    }}
                                    className="bg-black/50 border border-transparent rounded-lg p-1.5 text-xs text-white mb-1"
                                >
                                    <option value="who">KİM?</option>
                                    <option value="where">NEREDE?</option>
                                    <option value="when">NE ZAMAN?</option>
                                    <option value="what">NE?</option>
                                    <option value="why">NEDEN?</option>
                                    <option value="how">NASIL?</option>
                                </select>
                            )}
                            <textarea
                                value={q.question || q.text || ''}
                                onChange={(e) => {
                                    const newQ = [...data.questions];
                                    newQ[i] = { ...newQ[i], question: e.target.value, text: e.target.value };
                                    updateData({ questions: newQ });
                                }}
                                className="bg-black/50 border border-transparent rounded-lg p-2 text-xs text-zinc-300 resize-none h-16"
                                placeholder="Soru metni"
                            />
                        </div>
                    ))}
                </div>
            )}

            {selectedItem.id === 'logic_problem' && (
                <div className="space-y-4">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Mantık Sorusu</label>
                    <textarea
                        value={data.puzzle?.question || data.puzzle?.text || ''}
                        onChange={(e) => {
                            updateData({ puzzle: { ...data.puzzle, question: e.target.value, text: e.target.value } });
                        }}
                        className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 text-xs text-white resize-none custom-scrollbar h-24"
                        placeholder="Soru metni"
                    />
                    <input
                        type="text"
                        value={data.puzzle?.hint || ''}
                        onChange={(e) => {
                            updateData({ puzzle: { ...data.puzzle, hint: e.target.value } });
                        }}
                        className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-2.5 text-xs text-white w-full"
                        placeholder="İpucu"
                    />
                </div>
            )}

            {/* Default basic editor for unsupported types or adding a simple text prop */}
            {!['header', 'story_block', 'vocabulary', '5n1k', 'questions', 'questions_test', 'logic_problem'].includes(selectedItem.id) && (
                <div className="p-4 bg-zinc-900 border border-zinc-700/50 rounded-xl">
                    <p className="text-xs text-zinc-400 italic">Bu bileşen için özel içerik editörü bulunmuyor veya içerik metni yok.</p>
                </div>
            )}
        </div>
    );
};