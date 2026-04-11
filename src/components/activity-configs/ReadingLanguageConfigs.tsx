import React from 'react';

interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}

export const SynonymAntonymConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['synonymAntonym'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Eş/Zıt Anlamlı</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Sayısı</label>
        <input
          type="number"
          value={(o.wordCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, synonymAntonym: { ...o, wordCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const LetterVisualMatchingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['letterVisualMatching'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Harf Eşleştirme</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Harfler</label>
        <input
          value={(o.letters as string) || 'ABC'}
          onChange={(e) =>
            onChange({ ...options, letterVisualMatching: { ...o, letters: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        />
      </div>
    </div>
  );
};

export const SyllableWordBuilderConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['syllableWordBuilder'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">HECE + KELİME</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Hece Sayısı</label>
        <input
          type="number"
          value={(o.syllableCount as number) || 3}
          onChange={(e) =>
            onChange({
              ...options,
              syllableWordBuilder: { ...o, syllableCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={2}
          max={5}
        />
      </div>
    </div>
  );
};

export const ReadingFlowConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['readingFlow'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Okuma Akışı</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, readingFlow: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const PhonologicalAwarenessConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['phonologicalAwareness'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Fonolojik Farkındalık</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Etkinlik Türü</label>
        <select
          value={(o.activityType as string) || 'rhyme'}
          onChange={(e) =>
            onChange({ ...options, phonologicalAwareness: { ...o, activityType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="rhyme">Kafiye</option>
          <option value="alliteration">Aliterasyon</option>
          <option value="segmentation">Seslendirme</option>
        </select>
      </div>
    </div>
  );
};

export const RapidNamingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['rapidNaming'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hızlı Adlandırma</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Öğe Sayısı</label>
        <input
          type="number"
          value={(o.itemCount as number) || 20}
          onChange={(e) =>
            onChange({ ...options, rapidNaming: { ...o, itemCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={10}
          max={50}
        />
      </div>
    </div>
  );
};

export const LetterDiscriminationConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['letterDiscrimination'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Harf Ayrımı</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Harf Çifti</label>
        <input
          value={(o.letterPair as string) || 'bd'}
          onChange={(e) =>
            onChange({ ...options, letterDiscrimination: { ...o, letterPair: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        />
      </div>
    </div>
  );
};

export const MirrorLettersConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['mirrorLetters'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Ayna Harfleri</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Harfler</label>
        <input
          value={(o.letters as string) || 'bdpq'}
          onChange={(e) =>
            onChange({ ...options, mirrorLetters: { ...o, letters: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        />
      </div>
    </div>
  );
};

export const SyllableTrainConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['syllableTrain'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">HECE TRENİ</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Hece Uzunluğu</label>
        <input
          type="number"
          value={(o.syllableLength as number) || 3}
          onChange={(e) =>
            onChange({
              ...options,
              syllableTrain: { ...o, syllableLength: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={2}
          max={5}
        />
      </div>
    </div>
  );
};

export const BackwardSpellingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['backwardSpelling'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Ters Yazım</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Sayısı</label>
        <input
          type="number"
          value={(o.wordCount as number) || 5}
          onChange={(e) =>
            onChange({ ...options, backwardSpelling: { ...o, wordCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const CodeReadingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['codeReading'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Kod Okuma</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, codeReading: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const HandwritingPracticeConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['handwritingPractice'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">El Yazısı</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Satır Sayısı</label>
        <input
          type="number"
          value={(o.lineCount as number) || 5}
          onChange={(e) =>
            onChange({
              ...options,
              handwritingPractice: { ...o, lineCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={10}
        />
      </div>
    </div>
  );
};

export const MissingPartsConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['missingParts'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Eksik Parçalar</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Parça Sayısı</label>
        <input
          type="number"
          value={(o.partCount as number) || 3}
          onChange={(e) =>
            onChange({ ...options, missingParts: { ...o, partCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={1}
          max={5}
        />
      </div>
    </div>
  );
};

export const StoryComprehensionConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['storyComprehension'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hikaye Anlama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Parça Uzunluğu</label>
        <select
          value={(o.length as string) || 'orta'}
          onChange={(e) =>
            onChange({ ...options, storyComprehension: { ...o, length: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="kısa">Kısa</option>
          <option value="orta">Orta</option>
          <option value="uzun">Uzun</option>
        </select>
      </div>
    </div>
  );
};

export const StoryAnalysisConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['storyAnalysis'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hikaye Analizi</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Analiz Alanı</label>
        <select
          value={(o.analysisType as string) || 'character'}
          onChange={(e) =>
            onChange({ ...options, storyAnalysis: { ...o, analysisType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="character">Karakter</option>
          <option value="setting">Mekan</option>
          <option value="plot">Olay</option>
        </select>
      </div>
    </div>
  );
};

export const StoryCreationConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['storyCreation'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hikaye Oluşturma</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Zorluk</label>
        <select
          value={(o.difficulty as string) || 'Orta'}
          onChange={(e) =>
            onChange({ ...options, storyCreation: { ...o, difficulty: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="Başlangıç">Başlangıç</option>
          <option value="Orta">Orta</option>
          <option value="Zor">Zor</option>
        </select>
      </div>
    </div>
  );
};

export const WordsInStoryConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['wordsInStory'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Hikayedeki Kelimeler</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Kelime Türü</label>
        <select
          value={(o.wordType as string) || 'noun'}
          onChange={(e) =>
            onChange({ ...options, wordsInStory: { ...o, wordType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="noun">İsim</option>
          <option value="verb">Fiil</option>
          <option value="adjective">Sıfat</option>
        </select>
      </div>
    </div>
  );
};

export const StorySequencingConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['storySequencing'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Olay Sıralama</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Olay Sayısı</label>
        <input
          type="number"
          value={(o.eventCount as number) || 4}
          onChange={(e) =>
            onChange({ ...options, storySequencing: { ...o, eventCount: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 rounded-lg"
          min={3}
          max={6}
        />
      </div>
    </div>
  );
};

export const ProverbConfig: React.FC<Props> = ({ options, onChange }) => {
  const o = (options?.['proverb'] || {}) as Record<string, unknown>;
  return (
    <div className="space-y-4 p-4">
      <div className="pb-2 border-b border-zinc-200">
        <h4 className="font-bold">Atasözü</h4>
      </div>
      <div>
        <label className="block text-xs font-bold mb-2">Etkinlik Türü</label>
        <select
          value={(o.activityType as string) || 'sort'}
          onChange={(e) =>
            onChange({ ...options, proverb: { ...o, activityType: e.target.value } })
          }
          className="w-full p-2 border-2 rounded-lg"
        >
          <option value="sort">Sıralama</option>
          <option value="chain">Zincir</option>
          <option value="fill">Doldurma</option>
          <option value="search">Arama</option>
        </select>
      </div>
    </div>
  );
};
