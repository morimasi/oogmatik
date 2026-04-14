import React, { useMemo, useState } from 'react';
import { DEFAULT_TARGET_SKILLS } from '@/components/ActivityStudio/constants';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
import { getLibraryActivityById } from '@/services/activityStudioLibraryService';
import { LibraryExplorer } from '@/components/ActivityStudio/goal/LibraryExplorer';
import { AIEnhanceEntryPanel } from '@/components/ActivityStudio/goal/AIEnhanceEntryPanel';
import type { StudioGoalConfig } from '@/types/activityStudio';

interface StepGoalProps {
  onNext: () => void;
}

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

  const selectedItem = useMemo(() => (selectedLibraryItemId ? getLibraryActivityById(selectedLibraryItemId) : null), [selectedLibraryItemId]);

  const mergedGoal = useMemo(() => ({ ...defaultGoal, ...(wizardData.goal ?? {}) }), [wizardData.goal]);

  const handleSelectLibraryItem = (id: string) => {
    const item = getLibraryActivityById(id);
    if (item) {
      setSelectedLibraryItem(id, item.topicTemplate);
      setTopic(item.topicTemplate);
      updateGoal({
        ...mergedGoal,
        activityType: item.activityType,
        topic: item.topicTemplate,
        ageGroup: item.ageGroups[0],
        profile: item.profiles[0],
        duration: item.suggestedDuration,
      });
    }
  };

  const handleRequestEnhancement = (enhancementText: string) => {
    if (topic.trim().length > 2) {
      const enhanced = `${topic} - AI ile: ${enhancementText}`;
      updateGoal({ ...mergedGoal, topic: enhanced });
      setError(null);
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

      <LibraryExplorer onSelectItem={handleSelectLibraryItem} />

      {selectedItem && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h4 className="font-semibold text-amber-300">{selectedItem.title}</h4>
          <p className="text-xs mt-1 text-zinc-400">{selectedItem.pedagogicalNote}</p>
        </div>
      )}

      <AIEnhanceEntryPanel selectedItemId={selectedLibraryItemId} onRequestEnhancement={handleRequestEnhancement} />

      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-300 font-['Lexend']">Özel Konu</label>
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Konu girin..."
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 p-3 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <button type="button" onClick={submit} className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 px-4 py-3 text-sm font-bold text-zinc-950 transition-colors">
        Devam Et
      </button>
    </div>
  );
};
