import React, { useMemo, useState } from 'react';
import { DEFAULT_TARGET_SKILLS } from '@/components/ActivityStudio/constants';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';
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
  const { wizardData, updateGoal, setError } = useActivityStudioStore();
  const [topic, setTopic] = useState(wizardData.goal?.topic ?? '');

  const mergedGoal = useMemo(() => ({ ...defaultGoal, ...(wizardData.goal ?? {}) }), [wizardData.goal]);

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
      <input
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        placeholder="Konu girin"
        className="w-full rounded-xl border border-[var(--border-color)] p-3 text-sm"
      />
      <button type="button" onClick={submit} className="rounded-xl bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-white">
        Devam Et
      </button>
    </div>
  );
}
