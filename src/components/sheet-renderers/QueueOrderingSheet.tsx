/**
 * Queue Ordering (Sıralama) Activity Sheet Component
 * Ultra-professional compact minimal spacing A4 worksheet
 */

import React from 'react';
import { PedagogicalHeader } from './shared/PedagogicalHeader';
import { PedagogicalFooter } from './shared/PedagogicalFooter';

interface QueueOrderingSheetProps {
  data: any;
  settings: any;
}

export const QueueOrderingSheet: React.FC<QueueOrderingSheetProps> = ({ data, settings }) => {
  const { problems, title, instruction, locationType, difficulty } = data;

  if (!problems || problems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>İçerik bulunamadı. Lütfen farklı bir aktivite seçin.</p>
      </div>
    );
  }

  return (
    <div className="queue-ordering-sheet font-['Lexend']">
      {/* Header */}
      <PedagogicalHeader
        title={title || 'Sıra Alma Becerisi'}
        activityType="queue-ordering"
        studentProfile={settings?.studentProfile}
        data={data}
      />

      {/* Instructions */}
      <div className="mb-4 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-sm font-bold text-blue-900">
          <i className="fa-solid fa-lightbulb mr-2"></i>
          {instruction || 'Sıralama ipuçlarını kullanarak soruları cevaplayın.'}
        </p>
      </div>

      {/* Difficulty Badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
          difficulty === 'easy' ? 'bg-green-100 text-green-700' :
          difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          difficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        }`}>
          {difficulty === 'easy' ? 'Kolay' :
           difficulty === 'medium' ? 'Orta' :
           difficulty === 'hard' ? 'Zor' :
           'Uzman'}
        </span>
        <span className="text-xs font-bold text-gray-500">
          {problems.length} Soru
        </span>
      </div>

      {/* Problems */}
      <div className="space-y-6">
        {problems.map((problem: any, idx: number) => (
          <div key={problem.id || idx} className="problem-card border-2 border-gray-200 rounded-2xl p-5 bg-white shadow-sm">
            {/* Problem Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-black">
                {idx + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-tight">
                  {problem.locationName}
                </h3>
                <p className="text-xs font-medium text-gray-500">
                  {problem.totalPeople} kişi • {problem.difficulty === 'easy' ? 'Kolay' : problem.difficulty === 'medium' ? 'Orta' : problem.difficulty === 'hard' ? 'Zor' : 'Uzman'}
                </p>
              </div>
            </div>

            {/* Scenario */}
            <div className="mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-800 leading-relaxed">
                {problem.scenario}
              </p>
            </div>

            {/* People Grid */}
            {data.showVisualClues !== false && problem.people && problem.people.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-black text-gray-600 uppercase mb-2 tracking-wider">
                  <i className="fa-solid fa-users mr-1"></i> Bilinen Kişiler
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {problem.people.map((person: any, pIdx: number) => (
                    <div key={person.id || pIdx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <span className="text-lg">{person.icon || '👤'}</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-900">{person.name}</p>
                        {data.showPositionNumbers !== false && (
                          <p className="text-[10px] font-medium text-blue-600">
                            {person.clue || `${person.position}. sıra`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
              <p className="text-sm font-black text-amber-900">
                <i className="fa-solid fa-circle-question mr-2"></i>
                SORU: {problem.questionText}
              </p>
            </div>

            {/* Answer Box (Optional - for teachers) */}
            {settings?.showAnswers && (
              <div className="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-xs font-bold text-green-800">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  CEVAP: {problem.answer}. sıra
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <PedagogicalFooter
        activityType="queue-ordering"
        data={data}
        studentProfile={settings?.studentProfile}
      />
    </div>
  );
};
