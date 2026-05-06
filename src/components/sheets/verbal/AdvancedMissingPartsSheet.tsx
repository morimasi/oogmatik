import React, { useState, useEffect } from 'react';
import { MissingPartsData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';
import { 
  Clock, 
  Target, 
  Eye, 
  Lightbulb, 
  CheckCircle, 
  Star,
  Timer,
  Award,
  BookOpen,
  Zap,
  Brain,
  Heart,
  Trophy
} from 'lucide-react';

export const AdvancedMissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
  const { content, settings } = data;
  const [completedBlanks, setCompletedBlanks] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    if (settings?.includeTimer) {
      const interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [settings?.includeTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getBlankStyle = () => {
    const baseStyle = "relative inline-block transition-all duration-200 ";
    const sizeStyles = {
      small: "min-w-[60px] mx-0.5",
      medium: "min-w-[100px] mx-1",
      large: "min-w-[140px] mx-1.5"
    };
    const borderStyles = {
      underline: "border-b-2 border-zinc-800",
      dashed: "border-b-2 border-dashed border-zinc-600",
      solid: "border-b-4 border-zinc-900",
      dotted: "border-b-2 border-dotted border-zinc-500"
    };
    
    return baseStyle + (sizeStyles[settings?.blankSize || 'medium']) + " " + 
           (borderStyles[settings?.blankStyle || 'underline']);
  };

  const handleBlankClick = (blankIndex: number, word: string) => {
    if (selectedWord === word) {
      setCompletedBlanks(prev => new Set(prev).add(blankIndex));
      setSelectedWord(null);
    } else {
      setSelectedWord(word);
    }
  };

  const getProgressPercentage = () => {
    const totalBlanks = content?.paragraphs?.flatMap(p => p.parts)?.filter(part => part.isBlank).length || 0;
    if (totalBlanks === 0) return 0;
    return (completedBlanks.size / totalBlanks) * 100;
  };

  const getFontSize = () => {
    const sizes = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    return sizes[settings?.fontSize || 'medium'];
  };

  const getLineHeight = () => {
    const heights = {
      tight: 'leading-tight',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed'
    };
    return heights[settings?.lineHeight || 'normal'];
  };

  return (
    <div className={`flex flex-col h-full bg-white relative font-lexend ${
      settings?.compactLayout ? 'p-3' : 'p-6'
    }`}>
      <ReadingRuler />
      
      {/* Premium Header */}
      <div className="mb-6">
        <PedagogicalHeader 
          title={content.title} 
          instruction={content.instruction || "Metindeki boşlukları uygun kelimelerle doldurun."} 
          note={data.pedagogicalNote} 
        />
        
        {/* Progress Bar & Timer */}
        {(settings?.showProgress || settings?.includeTimer) && (
          <div className="mt-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            {settings?.showProgress && (
              <div className="flex items-center gap-3 flex-1">
                <Target className="w-4 h-4 text-blue-600" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
                    <span>İlerleme</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="w-full bg-zinc-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {settings?.includeTimer && (
              <div className="flex items-center gap-2 ml-4">
                <Timer className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-bold text-indigo-900">{formatTime(timer)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Examples Section */}
      {settings?.showExamples && content.pedagogicalSupport?.examples && (
        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold text-amber-900">Örnekler</h4>
          </div>
          <div className="space-y-2">
            {content.pedagogicalSupport.examples.slice(0, 2).map((example, idx) => (
              <div key={idx} className="text-xs text-zinc-700">
                <span className="font-medium">Örnek {idx + 1}:</span> {example.sentence} 
                <span className="text-amber-600 font-bold"> → {example.answer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Word Bank */}
      {settings?.showWordBank && content.wordBank && content.wordBank.words.length > 0 && (
        <div className={`mb-6 p-4 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl border-2 border-zinc-300 shadow-xl relative overflow-hidden ${
          settings?.compactLayout ? 'p-3' : 'p-6'
        }`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 p-3 opacity-20 rotate-12">
              <i className="fas fa-puzzle-piece text-[80px] text-white"></i>
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-layer-group text-emerald-400"></i>
                Kelime Havuzu
                {content.wordBank.showCategories && (
                  <span className="text-zinc-500 font-normal">({content.wordBank.words.length} kelime)</span>
                )}
              </h4>
              {settings?.showVisualHints && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="px-2 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs rounded-lg transition-colors"
                >
                  <Eye className="w-3 h-3" />
                </button>
              )}
            </div>
            
            <div className={`flex flex-wrap gap-2 ${
              settings?.compactLayout ? 'gap-1' : 'gap-3'
            }`}>
              {content.wordBank.words.map((word, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWord(word)}
                  className={`px-3 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105 ${
                    selectedWord === word
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg scale-105'
                      : showHints && word.includes(' ') 
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {settings?.syllableColoring && word.length > 4 ? (
                    <span>{word.slice(0, Math.ceil(word.length/2))}<span className="text-blue-300">{word.slice(Math.ceil(word.length/2))}</span></span>
                  ) : (
                    word
                  )}
                  {showHints && word.includes(' ') && (
                    <span className="block text-xs opacity-70">İki heceli</span>
                  )}
                </button>
              ))}
            </div>
            
            {selectedWord && (
              <div className="mt-3 p-2 bg-zinc-700 rounded-lg">
                <p className="text-xs text-zinc-300">
                  <i className="fas fa-hand-pointer mr-1"></i>
                  Seçili: <span className="font-bold text-emerald-400">{selectedWord}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Ultra Compact A4 Layout */}
      <div className={`flex-1 ${
        settings?.columnLayout === 'two-column' ? 'columns-2 gap-6' : ''
      }`}>
        <div className={`space-y-4 ${getFontSize()} ${getLineHeight()}`}>
          {content?.paragraphs?.map((paragraph, pIdx) => (
            <div 
              key={paragraph.id || pIdx} 
              className={`relative bg-zinc-50/30 rounded-2xl border border-zinc-100 p-4 hover:bg-zinc-50/50 transition-colors ${
                settings?.compactLayout ? 'p-3 rounded-xl' : 'p-6 rounded-2xl'
              }`}
            >
              {/* Paragraph Number */}
              {settings?.showParagraphNumbers && (
                <div className={`absolute -top-2 -left-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-[9px] font-black uppercase tracking-wider shadow-lg ${
                  settings?.compactLayout ? 'text-[8px] px-2 py-0.5' : ''
                }`}>
                  {pIdx + 1}. Paragraf
                </div>
              )}

              {/* Visual Elements */}
              {settings?.useIcons && content.visualElements?.icons && (
                <div className="absolute top-2 right-2 opacity-20">
                  {content.visualElements.icons
                    .filter(icon => icon.position === pIdx)
                    .map((icon, idx) => (
                      <i key={idx} className={`${icon.icon} ${icon.style}`} />
                    ))}
                </div>
              )}

              {/* Content with Blanks */}
              <div className={`text-justify text-zinc-800 ${
                settings?.compactLayout ? 'text-sm' : 'text-base'
              }`}>
                {paragraph?.parts?.map((part, iIdx) => {
                  const globalBlankIndex = content?.paragraphs
                    ?.slice(0, pIdx)
                    ?.reduce((acc, p) => acc + (p?.parts?.filter(part => part.isBlank).length || 0), 0) + 
                    (paragraph?.parts?.slice(0, iIdx).filter(part => part.isBlank).length || 0);
                  
                  const isCompleted = completedBlanks.has(globalBlankIndex);
                  const isSelected = selectedWord && (paragraph?.parts?.slice(0, iIdx + 1)?.filter(p => p.isBlank)?.length || 0) > 0;

                  return (
                    <React.Fragment key={iIdx}>
                      {part.isBlank ? (
                        <button
                          onClick={() => selectedWord && handleBlankClick(globalBlankIndex, selectedWord)}
                          className={`${getBlankStyle()} cursor-pointer hover:bg-zinc-100 ${
                            isCompleted ? 'bg-green-50 border-green-500' : 
                            isSelected ? 'bg-blue-50 border-blue-500' : ''
                          }`}
                          disabled={isCompleted}
                        >
                          {isCompleted ? (
                            <span className="text-green-700 font-bold">{part.answer}</span>
                          ) : (
                            <>
                              <span className="opacity-0">{part.answer}</span>
                              {showHints && part.hints && part.hints.length > 0 && (
                                <span className="absolute -top-6 left-0 text-xs text-blue-600 bg-blue-50 px-1 rounded">
                                  💡 {part.hints[0]}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      ) : (
                        <span className={settings?.syllableColoring && part.text.length > 6 ? 
                          `inline ${part.text.slice(0, Math.ceil(part.text.length/3))}<span class="text-blue-600">${part.text.slice(Math.ceil(part.text.length/3), Math.ceil(part.text.length*2/3))}</span><span class="text-green-600">${part.text.slice(Math.ceil(part.text.length*2/3))}</span>` : 
                          ''
                        }>
                          {part.text}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Line Numbers */}
              {settings?.showLineNumber && (
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center">
                  {Array.from({ length: Math.ceil(paragraph.parts.length / 10) }).map((_, i) => (
                    <span key={i} className="text-xs text-zinc-400 -ml-6">
                      {(pIdx * 10 + i + 1)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Ultra Compact */}
      <div className={`mt-6 grid grid-cols-2 gap-3 ${
        settings?.compactLayout ? 'mt-4 gap-2' : 'mt-6 gap-3'
      }`}>
        {/* Quick Tips */}
        <div className={`p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 ${
          settings?.compactLayout ? 'p-2 rounded-lg' : 'p-3 rounded-xl'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-emerald-600" />
            <h5 className={`font-black text-emerald-700 uppercase ${
              settings?.compactLayout ? 'text-[9px]' : 'text-[10px]'
            }`}>Stratejiler</h5>
          </div>
          <ul className={`text-zinc-600 space-y-1 ${
            settings?.compactLayout ? 'text-[8px]' : 'text-[9px]'
          }`}>
            {content.pedagogicalSupport?.strategies?.slice(0, 3).map((strategy, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <CheckCircle className="w-2 h-2 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{strategy}</span>
              </li>
            )) || (
              <>
                <li>• Cümlenin bağlamını düşün</li>
                <li>• Kelime havuzunu kullan</li>
                <li>• Anlam bütünlüğünü kontrol et</li>
              </>
            )}
          </ul>
        </div>

        {/* Score & Achievement */}
        <div className={`p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 ${
          settings?.compactLayout ? 'p-2 rounded-lg' : 'p-3 rounded-xl'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <h5 className={`font-black text-blue-700 uppercase ${
                settings?.compactLayout ? 'text-[9px]' : 'text-[10px]'
              }`}>Performans</h5>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i <= Math.floor(getProgressPercentage() / 20) 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-zinc-300'
                  }`} 
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-zinc-900 ${
              settings?.compactLayout ? 'text-lg' : 'text-2xl'
            }`}>
              {completedBlanks.size}/{content.paragraphs.flatMap(p => p.parts).filter(part => part.isBlank).length}
            </div>
            <div className={`text-zinc-600 ${
              settings?.compactLayout ? 'text-[8px]' : 'text-[9px]'
            }`}>
              Tamamlanan boşluk
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {getProgressPercentage() === 100 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border-2 border-yellow-300 text-center animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-900">Mükemmel! Tüm boşlukları doğru doldurdunuz!</span>
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          </div>
        </div>
      )}
    </div>
  );
};
