import React, { useState } from 'react';
import { AdvancedStudent, GradeEntry } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const AcademicModule: React.FC<{
  student: AdvancedStudent;
  onUpdate: (data: any) => void;
}> = ({ student, onUpdate }) => {
  const toast = useToastStore();
  const [grades, setGrades] = useState<GradeEntry[]>(student.academic?.grades || []);

  const [subject, setSubject] = useState('Türkçe');
  const [score, setScore] = useState('');

  const handleAddGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!score) return;

    const newGrade: GradeEntry = {
      id: Date.now().toString(),
      subject,
      score: Number(score),
      maxScore: 100,
      type: 'exam',
      date: new Date().toISOString(),
      weight: 1,
    };

    const updated = [newGrade, ...grades];
    setGrades(updated);
    onUpdate({ academic: { ...student.academic, grades: updated } });
    setScore('');
    toast.success('Not başarıyla eklendi.');
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-3xl p-6">
        <h3 className="font-black text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-star"></i> Yeni Not Girişi
        </h3>
        <form onSubmit={handleAddGrade} className="flex flex-col sm:flex-row gap-4">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold outline-none text-zinc-800 dark:text-zinc-200 text-sm min-w-[200px]"
          >
            <option>Türkçe</option>
            <option>Matematik</option>
            <option>Hayat Bilgisi</option>
            <option>Fen Bilimleri</option>
          </select>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="Puan (0-100)"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold outline-none text-zinc-800 dark:text-zinc-200 text-sm"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-colors shrink-0"
          >
            Kaydet
          </button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {grades.map((g) => (
          <div
            key={g.id}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center flex flex-col items-center justify-center"
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black mb-3 ${g.score >= 85 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : g.score >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'}`}
            >
              {g.score}
            </div>
            <h4 className="font-black text-zinc-800 dark:text-zinc-200">{g.subject}</h4>
            <p className="text-[10px] font-bold text-zinc-500 mt-1">
              {new Date(g.date).toLocaleDateString()}
            </p>
          </div>
        ))}
        {grades.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
            Not kaydı bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
};
