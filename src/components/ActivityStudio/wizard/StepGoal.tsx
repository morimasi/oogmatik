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
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Hedef ve Kapsam</h3>

      <LibraryExplorer onSelectItem={handleSelectLibraryItem} />

      {selectedItem && (
        <div className="rounded-lg border border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5 p-4">
          <h4 className="font-semibold text-[var(--text-primary)]">{selectedItem.title}</h4>
          <p className="text-xs text-[var(--text-secondary)]">{selectedItem.pedagogicalNote}</p>
        </div>
      )}

      <AIEnhanceEntryPanel selectedItemId={selectedLibraryItemId} onRequestEnhancement={handleRequestEnhancement} />

      <div className="space-y-2">
        <label className="text-sm font-medium">Ozel Konu</label>
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Konu girin"
          className="w-full rounded-xl border border-[var(--border-color)] p-3 text-sm"
        />
      </div>

      <button type="button" onClick={submit} className="w-full rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white">
        Devam Et
      </button>
    </div>
  );
};
