import React from 'react';
import {
  SuperTurkceModuleSettings,
  STFluencyPyramidData,
  STScaffoldedReadingData,
  STSemanticMappingData,
  STGuidedClozeData,
  STDualCodingMatchData,
  STStorySequencingData,
  STCauseEffectAnalysisData,
  STRadarTrueFalseData,
  STSpotHighlightData,
  STScaffoldedOpenData,
} from '../../../types/superTurkceModules';

interface Props {
  moduleConfig: SuperTurkceModuleSettings;
  data: any;
}

export const STRenderer: React.FC<Props> = ({ moduleConfig, data }) => {
  switch (moduleConfig.type) {
    case 'st_fluency_pyramid': {
      const d = data as STFluencyPyramidData;
      return (
        <div className="flex flex-col items-center gap-2 font-lexend py-4">
          <div className="px-4 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
            Odak Kelime: {d.targetWord}
          </div>
          {d.pyramidLines?.map((line, i) => (
            <div key={i} className="text-xl font-medium text-zinc-800 tracking-wide text-center">
              {line}
            </div>
          ))}
        </div>
      );
    }

    case 'st_scaffolded_reading': {
      const d = data as STScaffoldedReadingData;
      return (
        <div className="space-y-4 font-lexend relative">
          <h3 className="text-xl font-bold text-center text-teal-800 uppercase tracking-widest">
            {d.title}
          </h3>
          <div
            className={`text-base leading-10 font-medium text-zinc-800 p-8 rounded-2xl border-2 border-teal-100 text-justify relative bg-[repeating-linear-gradient(transparent,transparent_39px,#f0fdfa_39px,#f0fdfa_40px)] bg-local`}
          >
            {d.text}
          </div>
        </div>
      );
    }

    case 'st_semantic_mapping': {
      const d = data as STSemanticMappingData;
      return (
        <div className="flex flex-col items-center gap-6 py-6 font-lexend">
          {/* Central Node */}
          <div className="px-8 py-4 bg-indigo-100 border-2 border-indigo-300 text-indigo-900 font-black text-lg rounded-full shadow-md z-10 text-center max-w-sm">
            {d.centralEvent}
          </div>
          {/* Map Nodes */}
          <div className="flex gap-4 flex-wrap justify-center w-full mt-4">
            {d.nodes?.map((node, i) => (
              <div
                key={i}
                className="flex flex-col items-center p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm w-40 relative group"
              >
                {/* Connecting line */}
                <div className="absolute -top-10 left-1/2 w-0.5 h-10 bg-indigo-200 -z-10"></div>
                <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center text-xl mb-3">
                  <i className={`fa-solid ${node.icon}`}></i>
                </div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                  {node.question}
                </span>
                <span className="text-sm font-bold text-zinc-700 text-center">{node.answer}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'st_guided_cloze': {
      const d = data as STGuidedClozeData;
      return (
        <div className="space-y-8 py-4 font-lexend">
          <div className="flex gap-4 justify-center flex-wrap">
            {d.wordPool
              ?.sort(() => Math.random() - 0.5)
              .map((word, i) => (
                <div
                  key={i}
                  className="px-5 py-2 bg-sky-50 text-sky-700 border-2 border-sky-200 rounded-xl font-bold shadow-sm"
                >
                  {word}
                </div>
              ))}
          </div>
          <div className="text-lg text-center font-medium leading-[3rem] text-zinc-700 px-8">
            {d.sentence.split('[BLANK]').map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i !== arr.length - 1 && (
                  <span className="inline-flex mx-2">
                    {/* Elkonin boxes mock up: creating small boxes based on word length */}
                    {d.correctWord.split('').map((_, idx) => (
                      <span
                        key={idx}
                        className="w-8 h-10 border-2 border-sky-300 rounded-md mx-0.5 inline-block bg-sky-50/30"
                      ></span>
                    ))}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    }

    case 'st_dual_coding_match': {
      const d = data as STDualCodingMatchData;
      const items = [...d.pairs].sort(() => Math.random() - 0.5);
      return (
        <div className="flex justify-between items-center px-12 py-4 font-lexend">
          <div className="space-y-6 w-1/3">
            {d.pairs.map((p, i) => (
              <div
                key={`l-${i}`}
                className="px-6 py-4 bg-white border-2 border-zinc-200 rounded-xl shadow-sm font-bold text-sm text-zinc-700 text-center"
              >
                {p.left}
              </div>
            ))}
          </div>
          <div className="w-0.5 bg-zinc-200 h-full mx-8 border-r-2 border-dashed"></div>
          <div className="space-y-6 w-1/3 flex flex-col items-end">
            {items.map((item, i) => (
              <div
                key={`r-${i}`}
                className="flex items-center gap-4 p-3 bg-white border-2 border-zinc-200 rounded-xl shadow-sm w-full justify-between"
              >
                {item.rightText && (
                  <span className="text-xs font-bold text-zinc-600 flex-1 text-center">
                    {item.rightText}
                  </span>
                )}
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-xl shrink-0">
                  <i className={`fa-solid ${item.rightIcon}`}></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'st_story_sequencing': {
      const d = data as STStorySequencingData;
      return (
        <div className="space-y-4 font-lexend py-2">
          {d.steps?.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-6 p-4 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm"
            >
              <div className="w-12 h-12 rounded-full border-4 border-amber-200 flex items-center justify-center text-zinc-300 font-black text-xl bg-amber-50/50">
                {/* Boşluk - Öğrenci buraya numara yazacak */}
              </div>
              <p className="text-sm font-bold text-zinc-700 flex-1 leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'st_cause_effect_analysis': {
      const d = data as STCauseEffectAnalysisData;
      return (
        <div className="space-y-6 font-lexend py-2">
          <div className="p-6 bg-zinc-50 border-2 border-zinc-200 rounded-2xl text-center">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
              Olay / Senaryo
            </span>
            <p className="text-sm font-bold text-zinc-800">{d.scenario}</p>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-6 bg-white border-2 border-rose-200 rounded-2xl relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-widest rounded-full border border-rose-200">
                Neden?
              </div>
              <p className="text-sm text-center text-zinc-700 font-medium">{d.cause}</p>
            </div>
            <div className="flex items-center text-zinc-300 text-xl">
              <i className="fa-solid fa-arrow-right"></i>
            </div>
            <div className="flex-1 p-6 bg-white border-2 border-emerald-200 rounded-2xl relative pt-8">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-emerald-100 text-emerald-700 font-black text-[10px] uppercase tracking-widest rounded-full border border-emerald-200">
                Sonuç!
              </div>
              <p className="text-sm text-center text-zinc-700 font-medium">{d.effect}</p>
            </div>
          </div>
          <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl mt-4">
            <p className="text-sm font-bold text-indigo-900 mb-4">
              <i className="fa-solid fa-brain mr-2"></i> {d.inferenceQuestion}
            </p>
            <div className="border-b-2 border-dashed border-indigo-300 w-full mt-8"></div>
            <div className="border-b-2 border-dashed border-indigo-300 w-full mt-8"></div>
          </div>
        </div>
      );
    }

    case 'st_radar_true_false': {
      const d = data as STRadarTrueFalseData;
      return (
        <div className="space-y-4 font-lexend py-2">
          {d.statements?.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-6 p-5 bg-white border-2 border-zinc-200 rounded-2xl shadow-sm hover:border-fuchsia-300 transition-colors group"
            >
              <div className="flex gap-3 shrink-0">
                <div className="w-12 h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center text-zinc-300 group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors cursor-pointer text-2xl">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div className="w-12 h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center text-zinc-300 group-hover:border-rose-500 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors cursor-pointer text-2xl">
                  <i className="fa-solid fa-xmark"></i>
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-700">{s.text}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'st_spot_highlight': {
      const d = data as STSpotHighlightData;
      return (
        <div className="space-y-6 text-center font-lexend py-4">
          <p className="text-sm font-bold text-zinc-800">{d.instruction}</p>
          <div className="inline-flex items-center gap-3 px-8 py-3 bg-purple-50 text-purple-700 font-black border-2 border-purple-200 rounded-full shadow-sm uppercase tracking-widest text-[11px]">
            <i className="fa-solid fa-magnifying-glass"></i> Hedef: {d.target}
          </div>
          <div className="text-xl leading-[3.5rem] tracking-widest font-mono font-medium text-zinc-700 p-10 bg-white border-2 border-zinc-200 rounded-3xl shadow-sm break-all text-justify">
            {d.content}
          </div>
        </div>
      );
    }

    case 'st_scaffolded_open': {
      const d = data as STScaffoldedOpenData;
      return (
        <div className="space-y-6 font-lexend py-4">
          <p className="text-base font-bold text-zinc-800 flex items-start gap-3">
            <i className="fa-solid fa-circle-question text-zinc-400 mt-1"></i> {d.question}
          </p>
          <div className="p-8 bg-zinc-50 border-2 border-zinc-200 rounded-2xl space-y-10">
            {d.sentenceStarter && (
              <p className="text-sm font-bold text-zinc-500 italic flex items-center gap-2">
                <i className="fa-solid fa-pen-fancy text-zinc-300"></i> {d.sentenceStarter}
              </p>
            )}
            <div className="border-b-2 border-zinc-300 w-full"></div>
            <div className="border-b-2 border-zinc-300 border-dashed w-full"></div>
            <div className="border-b-2 border-zinc-300 border-dashed w-full"></div>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="p-4 bg-red-50 text-red-500 rounded-xl">
          Bilinmeyen Modül: {moduleConfig.type}
        </div>
      );
  }
};
