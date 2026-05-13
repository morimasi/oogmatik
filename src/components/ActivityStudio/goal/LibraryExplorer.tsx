import React from 'react';

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

export const LibraryExplorer: React.FC<{
  onSelectItem: (id: string) => void;
}> = ({ onSelectItem }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-zinc-200 mb-2">Örnek Etkinlikler</h4>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {SAMPLE_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectItem(item.id)}
            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-left transition-all hover:border-amber-500/50 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-amber-500/10 active:scale-[0.98]"
          >
            <div className="space-y-2">
              {item.featured && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-lg">
                  Öne Çıkan
                </div>
              )}

              <h4 className="text-lg font-bold text-zinc-100 font-['Lexend'] group-hover:text-amber-400 transition-colors">{item.title}</h4>
              <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">{item.shortDescription}</p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-block rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-semibold text-amber-500">
                  {item.category}
                </span>
                <span className="inline-block rounded-lg bg-zinc-800 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
                  {item.profiles.join(', ')}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3 mt-2">
                <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-500/50"></span>
                  {item.suggestedDuration} dk
                </span>
                <span className="text-xs font-black text-amber-500 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all uppercase tracking-tighter">Seç +</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
