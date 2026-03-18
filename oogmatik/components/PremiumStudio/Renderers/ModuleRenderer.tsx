import React from 'react';
import {
  PremiumModuleSettings,
  ScaffoldedReadingData,
  ConceptMatchingData,
  GuidedClozeData,
  TrueFalseLogicData,
  StepSequencingData,
  ScaffoldedOpenEndedData,
  VisualMultipleChoiceData,
  SpotAndHighlightData,
  MiniMindMapData,
  ExitTicketData,
} from '../../../types/premiumModules';

interface Props {
  moduleConfig: PremiumModuleSettings;
  data: any;
}

export const ModuleRenderer: React.FC<Props> = ({ moduleConfig, data }) => {
  switch (moduleConfig.type) {
    case 'scaffolded_reading': {
      const d = data as ScaffoldedReadingData;
      return (
        <div className="space-y-4 font-lexend">
          <h3 className="text-xl font-bold text-center text-zinc-800">{d.title}</h3>
          <div className="text-sm leading-8 text-zinc-700 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl shadow-sm text-justify">
            {d.text.split(' ').map((word, i) => {
              const isKeyword = d.keywords?.some((k) =>
                word.toLowerCase().includes(k.toLowerCase())
              );
              return (
                <span
                  key={i}
                  className={`mr-2 ${isKeyword ? 'font-black text-indigo-700 bg-indigo-50 px-1 rounded' : ''}`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      );
    }

    case 'concept_matching': {
      const d = data as ConceptMatchingData;
      const items = [...(d.pairs || []), ...(d.distractors || [])].sort(() => Math.random() - 0.5);

      return (
        <div className="flex justify-between items-center px-12 py-4">
          <div className="space-y-6">
            {d.pairs.map((p, i) => (
              <div
                key={`l-${i}`}
                className="px-6 py-3 bg-white border-2 border-zinc-200 rounded-xl shadow-sm font-bold text-sm text-zinc-700"
              >
                {p.left}
              </div>
            ))}
          </div>
          <div className="w-1 border-r-2 border-dashed border-zinc-300 h-full mx-8"></div>
          <div className="space-y-6">
            {items.map(
              (item, i) =>
                item.rightIcon && (
                  <div
                    key={`r-${i}`}
                    className="w-16 h-16 bg-white border-2 border-zinc-200 rounded-xl shadow-sm flex items-center justify-center text-2xl text-zinc-500"
                  >
                    <i className={`fa-solid ${item.rightIcon}`}></i>
                  </div>
                )
            )}
          </div>
        </div>
      );
    }

    case 'guided_cloze': {
      const d = data as GuidedClozeData;
      return (
        <div className="space-y-6">
          <div className="flex gap-4 justify-center mb-6">
            {d.wordPool?.map((word, i) => (
              <div
                key={i}
                className="px-4 py-2 bg-sky-50 text-sky-700 border-2 border-sky-200 rounded-lg font-bold text-sm shadow-sm"
              >
                {word}
              </div>
            ))}
          </div>
          <div className="text-lg text-center font-medium leading-loose text-zinc-700">
            {d.sentence.split('[BLANK]').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i !== arr.length - 1 && (
                  <span className="inline-block border-b-2 border-zinc-400 w-24 mx-2"></span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    case 'true_false_logic': {
      const d = data as TrueFalseLogicData;
      return (
        <div className="space-y-4">
          {d.statements?.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-6 p-4 bg-zinc-50 border border-zinc-200 rounded-xl"
            >
              <div className="flex gap-2 shrink-0">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-300 flex items-center justify-center text-zinc-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors cursor-pointer">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-zinc-300 flex items-center justify-center text-zinc-300 hover:border-rose-500 hover:text-rose-500 transition-colors cursor-pointer">
                  <i className="fa-solid fa-xmark"></i>
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-700">{s.text}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'step_sequencing': {
      const d = data as StepSequencingData;
      return (
        <div className="space-y-4">
          {d.steps?.map((s, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 font-black text-xl flex items-center justify-center border-2 border-amber-200 shrink-0">
                {s.order}
              </div>
              <div className="flex-1 p-4 bg-white border-2 border-zinc-200 rounded-xl flex items-center gap-4 shadow-sm">
                {s.iconHint && (
                  <i className={`fa-solid ${s.iconHint} text-2xl text-zinc-400 shrink-0`}></i>
                )}
                <p className="text-sm font-bold text-zinc-700">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'scaffolded_open_ended': {
      const d = data as ScaffoldedOpenEndedData;
      return (
        <div className="space-y-6">
          <p className="text-base font-bold text-zinc-800">{d.question}</p>
          <div className="p-6 bg-zinc-50 border-2 border-zinc-200 rounded-xl space-y-8">
            {d.sentenceStarter && (
              <p className="text-sm font-medium text-zinc-500 italic">{d.sentenceStarter}</p>
            )}
            <div className="border-b-2 border-zinc-300 border-dashed w-full"></div>
            <div className="border-b-2 border-zinc-300 border-dashed w-full"></div>
            <div className="border-b-2 border-zinc-300 border-dashed w-full"></div>
          </div>
        </div>
      );
    }

    case 'visual_multiple_choice': {
      const d = data as VisualMultipleChoiceData;
      return (
        <div className="space-y-6">
          <p className="text-base font-bold text-zinc-800 text-center">{d.question}</p>
          <div className="grid grid-cols-2 gap-4">
            {d.options?.map((opt, i) => (
              <div
                key={i}
                className="p-4 bg-white border-2 border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-4 shadow-sm hover:border-blue-400 transition-colors cursor-pointer group"
              >
                {opt.icon && (
                  <i
                    className={`fa-solid ${opt.icon} text-4xl text-zinc-400 group-hover:text-blue-500 transition-colors`}
                  ></i>
                )}
                <p className="text-sm font-bold text-zinc-700 text-center">{opt.text}</p>
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-zinc-300 flex items-center justify-center text-[10px] font-black text-zinc-400">
                  {['A', 'B', 'C', 'D'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'spot_and_highlight': {
      const d = data as SpotAndHighlightData;
      return (
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-teal-50 text-teal-700 font-bold border-2 border-teal-200 rounded-full">
            <i className="fa-solid fa-magnifying-glass"></i> Hedef: "{d.target}"
          </div>
          <div className="text-xl leading-[3rem] tracking-widest font-mono font-medium text-zinc-700 p-8 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm break-all">
            {d.content}
          </div>
        </div>
      );
    }

    case 'mini_mind_map': {
      const d = data as MiniMindMapData;
      return (
        <div className="flex flex-col items-center gap-8 py-4">
          <div className="px-8 py-4 bg-violet-100 text-violet-800 font-black text-lg border-2 border-violet-300 rounded-2xl shadow-sm z-10">
            {d.centralTopic}
          </div>
          <div className="flex gap-4 flex-wrap justify-center w-full">
            {d.branches?.map((b, i) => (
              <div
                key={i}
                className="px-6 py-3 bg-white border-2 border-zinc-200 rounded-xl shadow-sm min-w-[150px] text-center font-bold text-sm text-zinc-700 relative"
              >
                <div className="absolute -top-6 left-1/2 w-0.5 h-6 bg-zinc-300"></div>
                {b.isFilledByAI ? (
                  b.text
                ) : (
                  <span className="text-zinc-300 italic">Sen doldur...</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'exit_ticket': {
      const d = data as ExitTicketData;
      return (
        <div className="mt-12 p-6 bg-zinc-100 border-2 border-zinc-200 rounded-2xl flex flex-col items-center gap-6 break-inside-avoid">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest">
            Çıkış Bileti (Öz-Değerlendirme)
          </h3>
          {d?.reflectionQuestion && (
            <p className="text-sm font-bold text-zinc-700 text-center">{d.reflectionQuestion}</p>
          )}
          <div className="flex gap-8">
            <button className="text-5xl opacity-50 hover:opacity-100 hover:scale-110 transition-all grayscale hover:grayscale-0">
              <i className="fa-solid fa-face-smile text-emerald-500"></i>
            </button>
            <button className="text-5xl opacity-50 hover:opacity-100 hover:scale-110 transition-all grayscale hover:grayscale-0">
              <i className="fa-solid fa-face-meh text-amber-500"></i>
            </button>
            <button className="text-5xl opacity-50 hover:opacity-100 hover:scale-110 transition-all grayscale hover:grayscale-0">
              <i className="fa-solid fa-face-frown text-rose-500"></i>
            </button>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="p-4 bg-red-50 text-red-500 rounded-xl">
          Renderer bulunamadı: {moduleConfig.type}
        </div>
      );
  }
};
