import React, { useState } from 'react';
import { AdvancedStudent, IEPGoal } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const IEPModule: React.FC<{ student: AdvancedStudent; onUpdate: (iep: any) => void }> = ({
  student,
  onUpdate,
}) => {
  const toast = useToastStore();
  const [goals, setGoals] = useState<IEPGoal[]>(
    student.iep?.goals || [
      {
        id: '1',
        title: 'Okuma Akıcılığı',
        description: 'Dakikada 60 kelime doğru okuma hedefine ulaşılacak.',
        status: 'in_progress',
        category: 'academic',
        targetDate: '2026-06-01',
        progress: 40,
        priority: 'high',
        strategies: [],
        resources: [],
        evaluationMethod: 'test',
        reviews: [],
      },
    ]
  );
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const goal: IEPGoal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: 'Yeni eklenen hedef',
      status: 'not_started',
      category: 'academic',
      targetDate: new Date().toISOString(),
      progress: 0,
      priority: 'medium',
      strategies: [],
      resources: [],
      evaluationMethod: 'observation',
      reviews: [],
    };

    const updated = [...goals, goal];
    setGoals(updated);
    setNewGoalTitle('');
    onUpdate({
      goals: updated,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: '',
      diagnosis: [],
      strengths: [],
      needs: [],
      accommodations: [],
      teamMembers: [],
      lastUpdated: new Date().toISOString(),
    });
    toast.success('Yeni BEP hedefi eklendi.');
  };

  const toggleGoalStatus = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        return {
          ...g,
          status: g.status === 'achieved' ? 'in_progress' : 'achieved',
          progress: g.status === 'achieved' ? 50 : 100,
        } as IEPGoal;
      }
      return g;
    });
    setGoals(updated);
    onUpdate({
      goals: updated,
      status: 'active',
      startDate: '',
      endDate: '',
      diagnosis: [],
      strengths: [],
      needs: [],
      accommodations: [],
      teamMembers: [],
      lastUpdated: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleAddGoal}
        className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex gap-4"
      >
        <input
          type="text"
          value={newGoalTitle}
          onChange={(e) => setNewGoalTitle(e.target.value)}
          placeholder="Yeni BEP Hedefi (Örn: Çarpım tablosunu ezbere sayar)"
          className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 font-bold outline-none focus:border-indigo-500 text-sm dark:text-white"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors shrink-0"
        >
          <i className="fa-solid fa-plus mr-2"></i> Hedef Ekle
        </button>
      </form>

      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`p-6 rounded-2xl border transition-all ${goal.status === 'achieved' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleGoalStatus(goal.id)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${goal.status === 'achieved' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-500'}`}
                >
                  <i className="fa-solid fa-check text-xs"></i>
                </button>
                <div>
                  <h4
                    className={`font-bold text-lg ${goal.status === 'achieved' ? 'text-emerald-900 dark:text-emerald-400 line-through opacity-70' : 'text-zinc-900 dark:text-white'}`}
                  >
                    {goal.title}
                  </h4>
                  <p className="text-zinc-500 text-xs mt-1">{goal.description}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">
                {goal.category}
              </span>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-3xl border-zinc-200 dark:border-zinc-800">
            Henüz hedef eklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
};
