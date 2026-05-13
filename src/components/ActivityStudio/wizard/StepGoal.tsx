import React, { useState, useMemo } from 'react';
import { DEFAULT_TARGET_SKILLS } from '../constants';
import { useActivityStudioStore } from '../../../store/useActivityStudioStore';
import type { StudioGoalConfig } from '../../../types/activityStudio';
import { LibraryExplorer } from '../goal/LibraryExplorer';

interface StepGoalProps {
  onNext: () => void;
}

const SAMPLE_ITEMS = [
  {
    id: 'sample-1',
    title: 'Okuma Anlama Etkinliği',
    shortDescription: 'Kısa metin okuyup soruları cevaplama',
    category: 'okuma',
    profiles: ['dyslexia', 'adhd'],
    suggestedDuration: 15,
    featured: true,
    topicTemplate: 'Hayvanlar Alemi',
    activityType: 'readingComprehension',
    ageGroups: ['8-10', '11-13']
  },
  {
    id: 'sample-2',
    title: 'Kelime Oyunu',
    shortDescription: 'Eş anlamlı kelimeleri bulma',
    category: 'kelime',
    profiles: ['dyslexia'],
    suggestedDuration: 20,
    featured: false,
    topicTemplate: 'Mevsimler',
    activityType: 'wordGames',
    ageGroups: ['5-7', '8-10']
  },
  {
    id: 'sample-3',
    title: 'Matematik Problemleri',
    shortDescription: 'Toplama ve çıkarma işlemleri',
    category: 'matematik',
    profiles: ['dyscalculia', 'adhd'],
    suggestedDuration: 25,
    featured: true,
    topicTemplate: 'Meyveler',
    activityType: 'mathProblems',
    ageGroups: ['8-10']
  }
];

const defaultGoal: StudioGoalConfig = {
  ageGroup: '8-10',
  profile: 'dyslexia',
  difficulty: 'Kolay',
  internalLevel: 2,
  activityType: 'readingComprehension',
  topic: '',
  targetSkills: DEFAULT_TARGET_SKILLS,
  gradeLevel: 3,
  duration: 20,
  format: 'yuz-yuze',
  participantRange: { min: 1, max: 4 },
};

export const StepGoal: React.FC<StepGoalProps> = ({ onNext }) => {
  const { wizardData, updateGoal, setError, selectedLibraryItemId, setSelectedLibraryItem } = useActivityStudioStore();
  const [topic, setTopic] = useState(wizardData.goal?.topic ?? '');

  const selectedItem = useMemo(() => 
    SAMPLE_ITEMS.find(item => item.id === selectedLibraryItemId), 
    [selectedLibraryItemId]
  );

  const mergedGoal = { ...defaultGoal, ...(wizardData.goal ?? {}) };

  const handleSelectLibraryItem = (id: string) => {
    const item = SAMPLE_ITEMS.find(i => i.id === id);
    if (item) {
      setSelectedLibraryItem(id, item.topicTemplate);
      setTopic(item.topicTemplate);
      updateGoal({ 
        ...mergedGoal, 
        topic: item.topicTemplate,
        activityType: item.activityType,
        ageGroup: item.ageGroups[0],
        duration: item.suggestedDuration,
        profile: item.profiles[0]
      });
    }
  };

  const submit = () => {
    if (topic.trim().length < 3) {
      setError('Konu en az 3 karakter olmalidir.');
      return;
    }

    updateGoal({ ...mergedGoal, topic: topic.trim() });
    setError(null);
    onNext();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold font-['Lexend'] text-amber-400">Hedef ve Kapsam</h3>

      <div className="space-y-2">
        <label className="block text-sm font-semibold mb-2 font-['Lexend'] text-zinc-300">
          Etkinlik Konusu
        </label>
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Örn: Hayvanlar, Renkler, Mevsimler..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 text-sm font-['Lexend'] text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block">Yaş Grubu</label>
          <select
            value={mergedGoal.ageGroup}
            onChange={(e) => updateGoal({ ...mergedGoal, ageGroup: e.target.value as any })}
            className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-bold"
          >
            <option value="5-7">5-7 Yaş</option>
            <option value="8-10">8-10 Yaş</option>
            <option value="11-13">11-13 Yaş</option>
            <option value="14+">14+ Yaş</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk</label>
          <select
            value={mergedGoal.difficulty}
            onChange={(e) => updateGoal({ ...mergedGoal, difficulty: e.target.value as any })}
            className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-bold"
          >
            <option value="Kolay">Kolay</option>
            <option value="Orta">Orta</option>
            <option value="Zor">Zor</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-zinc-500 uppercase block">Sınıf</label>
          <select
            value={mergedGoal.gradeLevel}
            onChange={(e) => updateGoal({ ...mergedGoal, gradeLevel: parseInt(e.target.value) as any })}
            className="w-full p-2.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-sm font-bold"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(grade => (
              <option key={grade} value={grade}>{grade}. Sınıf</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800/50">
        <LibraryExplorer onSelectItem={handleSelectLibraryItem} />
      </div>

      <button type="button" onClick={submit} className="w-full rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10">
        Devam Et
      </button>
    </div>
  );
};
