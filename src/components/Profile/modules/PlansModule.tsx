import React from 'react';
import { ProfileData } from '../../types/profile';

interface PlansModuleProps {
  data: ProfileData;
}

export const PlansModule: React.FC<PlansModuleProps> = ({ data }) => {
  const { curriculums, loading } = data;

  if (loading) {
    return <div className="animate-pulse bg-[var(--bg-secondary)] rounded-3xl h-96"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Planlar & Müfredat</h2>
        <button className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors">
          <i className="fa-solid fa-plus mr-2"></i>
          Yeni Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {curriculums.map((plan: any) => (
          <div
            key={plan.id}
            className="bg-[var(--bg-paper)] rounded-3xl border border-[var(--border-color)] p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-white">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="text-xs text-[var(--text-muted)] font-medium">
                {plan.status || 'Aktif'}
              </div>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              {plan.name || 'Müfredat Planı'}
            </h3>

            <p className="text-sm text-[var(--text-muted)] mb-4">
              {plan.description || 'Plan açıklaması bulunmuyor.'}
            </p>

            {/* Progress */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-muted)]">İLERLEME</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {plan.progress || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent-color)] transition-all duration-1000"
                  style={{ width: `${plan.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* BEP Goals */}
            {plan.bepGoals && plan.bepGoals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-[var(--text-primary)]">BEP Hedefleri</h4>
                {plan.bepGoals.slice(0, 2).map((goal: any, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      goal.progress === 'achieved' ? 'bg-green-500' :
                      goal.progress === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <span className="text-xs text-[var(--text-muted)] truncate">
                      {goal.objective}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg text-sm font-medium hover:bg-[var(--bg-hover)] transition-colors">
                Düzenle
              </button>
              <button className="px-3 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
                <i className="fa-solid fa-play"></i>
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {curriculums.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-4">
              <i className="fa-solid fa-graduation-cap text-2xl text-[var(--text-muted)]"></i>
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Henüz plan oluşturulmamış
            </h3>
            <p className="text-[var(--text-muted)] mb-6 max-w-md">
              Öğrencileriniz için kişiselleştirilmiş müfredat planları oluşturun ve BEP hedeflerini takip edin.
            </p>
            <button className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-medium hover:bg-[var(--accent-hover)] transition-colors">
              İlk Planı Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  );
};