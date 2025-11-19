import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData,
    ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData,
    MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, ProverbSearchData
} from '../../types';
import { ImageDisplay } from './common';

export const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div>
    <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="md:col-span-2">
            <ImageDisplay base64={data.imageBase64} description="Hikaye ile ilgili görsel" className="w-full h-auto aspect-[4/3] object-cover rounded-lg" />
        </div>
        <div className="md:col-span-3 bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-l-4 border-indigo-400">
            <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">Ana Fikir</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.mainIdea}</p>
        </div>
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-l-4 border-emerald-400">
            <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">Karakterler</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{(data.characters || []).join(', ')}</p>
        </div>
        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-400">
            <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">Mekan</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.setting}</p>
        </div>
    </div>
    
    <h4 className="text-xl font-semibold mb-4 text-center">Sorular</h4>
    <div className="space-y-6">
        {(data.questions || []).map((q, index) => {
            switch (q.type) {
                case 'multiple-choice':
                    const mcq = q as MultipleChoiceStoryQuestion;
                    return (
                        <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg">
                            <p className="font-semibold mb-2">{index + 1}. {mcq.question}</p>
                            <div className="space-y-2">
                                {(mcq.options || []).map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center">
                                        <div className="w-5 h-5 border-2 border-zinc-400 rounded-full mr-3"></div>
                                        <label>{option}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case 'open-ended':
                    const oeq = q as OpenEndedStoryQuestion;
                    return (
                         <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg">
                            <p className="font-semibold mb-2">{index + 1}. {oeq.question}</p>
                            <div className="w-full h-16 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                        </div>
                    );
                default:
                    return null;
            }
        })}
    </div>
  </div>
);

export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center mb-6 text-zinc-600 dark:text-zinc-400">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
                <h4 className="font-semibold mb-2 text-center">Görsel İlham</h4>
                <ImageDisplay base64={data.imageBase64} description="Hikayen için ilham alabileceğin bir görsel" className="w-full h-auto aspect-square object-cover rounded-lg" />
            </div>
            <div>
                <h4 className="font-semibold mb-2 text-center">Anahtar Kelimeler:</h4>
                <div className="flex justify-center flex-wrap gap-3 mb-6">
                    {(data.keywords || []).map((word, index) => (
                        <span key={index} className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 rounded-full font-medium">{word}</span>
                    ))}
                </div>
                <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-center mb-2">Hikayen</h4>
                    <div className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
                </div>
            </div>
        </div>
    </div>
);

export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner mb-8">
            <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Kelime Çalışması</h4>
        <div className="space-y-6">
            {(data.questions || []).map((item, index) => (
                 <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <p className="mb-2"><span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg mr-2">{item.word}</span> - {item.question}</p>
                    <div className="w-full h-12 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="md:col-span-2">
                <ImageDisplay base64={data.imageBase64} description="Hikaye ile ilgili görsel" className="w-full h-auto aspect-[4/3] object-cover rounded-lg" />
            </div>
            <div className="md:col-span-3 bg-white dark:bg-zinc-700/30 p-6 rounded-lg shadow-inner">
                <p className="text-base leading-relaxed whitespace-pre-line">{data.story}</p>
            </div>
        </div>
        <h4 className="text-xl font-semibold mb-4 text-center">Analiz Soruları</h4>
        <div className="space-y-6">
            {(data.analysisQuestions || []).map((q, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border-l-4" style={{borderColor: q.type === 'tema' ? '#6366F1' : q.type === 'karakter' ? '#10B981' : q.type === 'sebep-sonuç' ? '#F59E0B' : '#EF4444'}}>
                    <p className="font-semibold mb-2">{index + 1}. ({q.type.charAt(0).toUpperCase() + q.type.slice(1)}) {q.question}</p>
                    <div className="w-full h-16 mt-2 border-b-2 border-dotted border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

export const ProverbFillSheet: React.FC<{ data: ProverbFillData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki atasözlerinde boş bırakılan yerleri doğru kelimelerle doldurun.</p>
        <div className="space-y-6 max-w-2xl mx-auto mb-8">
            {(data.proverbs || []).map((proverb, index) => (
                <div key={index} className="flex items-center text-lg">
                    <span>{index + 1}.</span>
                    <p className="ml-2">{proverb.start}</p>
                    <div className="w-32 h-8 mx-2 border-b-2 border-dotted border-zinc-500"></div>
                    <p>{proverb.end}</p>
                </div>
            ))}
        </div>
         <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-l-4 border-indigo-400 mb-6">
            <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">Anlamı</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.meaning}</p>
        </div>
        <div className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg">
            <p className="font-semibold mb-2">{data.usagePrompt}</p>
            <div className="w-full h-24 mt-2 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md"></div>
        </div>
    </div>
);

export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div>
      <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
      <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
      <div className="grid grid-cols-2 gap-4">
        {(data.panels || []).map((panel) => (
          <div key={panel.id} className="p-4 border-2 border-dashed rounded-lg flex flex-col items-center text-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div className="w-12 h-12 border-2 rounded-full flex items-center justify-center font-bold text-2xl mb-4">{panel.id}</div>
             <ImageDisplay base64={panel.imageBase64} description={panel.description} className="w-full h-40 object-cover rounded-md" />
             <p className="text-sm mt-2">{panel.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-center mb-4">Doğru Sıralama:</h4>
        <div className="flex justify-center gap-4">
          {Array.from({ length: (data.panels || []).length || 0 }).map((_, index) => (
            <div key={index} className="w-16 h-16 border-2 border-zinc-400 rounded-lg flex items-center justify-center text-xl font-bold">{index + 1}.</div>
          ))}
        </div>
      </div>
    </div>
);

export const ProverbSayingSortSheet: React.FC<{ data: ProverbSayingSortData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-amber-100 dark:bg-amber-900/50 border-2 border-dashed border-amber-400 rounded-lg mb-8">
            {(data.items || []).map((item, index) => <p key={index} className="p-1">{index+1}. {item.text}</p>)}
        </div>
        <div className="grid grid-cols-2 gap-8">
            <div className="p-4 border-2 rounded-lg border-sky-400">
                <h4 className="font-bold text-center text-lg text-sky-600 dark:text-sky-300 mb-2">Atasözleri</h4>
                <div className="h-48 space-y-2"></div>
            </div>
            <div className="p-4 border-2 rounded-lg border-rose-400">
                <h4 className="font-bold text-center text-lg text-rose-600 dark:text-rose-300 mb-2">Özdeyişler</h4>
                <div className="h-48 space-y-2"></div>
            </div>
        </div>
    </div>
);

export const ProverbWordChainSheet: React.FC<{ data: ProverbWordChainData | ProverbSentenceFinderData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center flex-wrap gap-4 p-4 mb-8 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {(data.wordCloud || []).map((item, index) => (
                <span key={index} className="px-3 py-1.5 rounded-md text-lg" style={{backgroundColor: item.color, color: '#fff'}}>{item.word}</span>
            ))}
        </div>
        <div className="space-y-4">
             {(data.solutions || []).map((_, index) => (
                <div key={index} className="w-full h-10 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg border-b-2 border-zinc-400"></div>
            ))}
        </div>
    </div>
);

// This component uses WordSearchData but it's part of Reading Comprehension
import { WordSearchSheet } from './WordGameSheets'; 

export const ProverbSearchSheet: React.FC<{ data: ProverbSearchData }> = ({ data }) => (
    <div>
        <WordSearchSheet data={{...data, words: data.proverb.split(' ')}} />
        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-l-4 border-indigo-400">
            <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">Atasözünün Anlamı</h4>
            <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.meaning}</p>
        </div>
    </div>
);