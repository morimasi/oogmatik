import { Brain, Activity } from 'lucide-react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { ScreeningType } from '../types';

export const NewScreeningPanel: React.FC = () => {
  const {
    selectedStudentName,
    selectedScreeningType,
    setSelectedStudentName,
    setSelectedScreeningType,
    handleStartScreening,
    setActiveView,
  } = useScreeningAssessment();

  const types: Array<{
    id: ScreeningType;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    desc: string;
  }> = [
    {
      id: 'cognitive',
      icon: Brain,
      title: 'Bilişsel Tarama',
      desc: 'Disleksi, DEHB, öğrenme güçlüğü risk analizi.',
    },
    {
      id: 'developmental',
      icon: Activity,
      title: 'Gelişimsel Tarama',
      desc: 'Motor, sosyal ve duygusal beceri takibi.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6">
        <h3 className="text-lg font-black italic uppercase tracking-tighter text-[var(--text-primary)] mb-6">
          Yeni Tarama Başlat
        </h3>

        <div className="mb-6">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">
            Öğrenci Adı
          </label>
          <input
            type="text"
            value={selectedStudentName}
            onChange={(e) => setSelectedStudentName(e.target.value)}
            placeholder="Örn: Ahmet Yılmaz"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend focus:ring-2 focus:ring-[var(--accent-color)] outline-none text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="block text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Tarama Türü
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {types.map(({ id, icon: Icon, title, desc }) => (
              <button
                key={id}
                onClick={() => setSelectedScreeningType(id)}
                className={`p-5 border-2 rounded-2xl text-left group relative overflow-hidden transition-all ${
                  selectedScreeningType === id
                    ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--accent-color)]/50'
                }`}
              >
                <Icon
                  className={`w-6 h-6 mb-3 ${
                    selectedScreeningType === id
                      ? 'text-[var(--accent-color)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                />
                <p className="text-sm font-black uppercase tracking-tight italic text-[var(--text-primary)]">
                  {title}
                </p>
                <p className="text-[10px] font-medium text-[var(--text-secondary)] mt-1 opacity-70">
                  {desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <button
            onClick={() => setActiveView('dashboard')}
            className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Vazgeç
          </button>
          <button
            onClick={handleStartScreening}
            className="px-8 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-[var(--accent-muted)] transition-all active:scale-95"
          >
            Değerlendirmeyi Başlat
          </button>
        </div>
      </div>
    </div>
  );
};
