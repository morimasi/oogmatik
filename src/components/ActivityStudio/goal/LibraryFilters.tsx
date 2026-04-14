import React from 'react';
import type { AgeGroup, Difficulty, LearningDisabilityProfile } from '@/types/creativeStudio';
import type { ActivityLibraryCategory, ActivityLibraryQuery } from '@/types/activityStudio';

const PROFILE_OPTIONS: LearningDisabilityProfile[] = ['dyslexia', 'dyscalculia', 'adhd', 'mixed'];
const AGE_GROUP_OPTIONS: AgeGroup[] = ['5-7', '8-10', '11-13', '14+'];
const DIFFICULTY_OPTIONS: Difficulty[] = ['Kolay', 'Orta', 'Zor'];
const CATEGORY_OPTIONS: ActivityLibraryCategory[] = [
  'fonolojik-farkindalik',
  'okuma-akiciligi',
  'matematik-mantigi',
  'dikkat-yurutucu',
  'gorsel-algi',
  'yazili-anlatim',
];

export const LibraryFilters: React.FC<{
  query: ActivityLibraryQuery;
  onQueryChange: (query: ActivityLibraryQuery) => void;
}> = ({ query, onQueryChange }) => {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 backdrop-blur-md">
      <input
        type="text"
        placeholder="Etkinlik ara..."
        value={query.search ?? ''}
        onChange={(event) =>
          onQueryChange({
            ...query,
            search: event.target.value || undefined,
          })
        }
        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <select
          value={query.profile ?? ''}
          onChange={(event) =>
            onQueryChange({
              ...query,
              profile: (event.target.value as LearningDisabilityProfile) || undefined,
            })
          }
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer"
        >
          <option value="" className="bg-zinc-900">Tüm Profiller</option>
          {PROFILE_OPTIONS.map((p) => (
            <option key={p} value={p} className="bg-zinc-900">
              {p}
            </option>
          ))}
        </select>

        <select
          value={query.ageGroup ?? ''}
          onChange={(event) =>
            onQueryChange({
              ...query,
              ageGroup: (event.target.value as AgeGroup) || undefined,
            })
          }
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer"
        >
          <option value="" className="bg-zinc-900">Tüm Yaş Grupları</option>
          {AGE_GROUP_OPTIONS.map((ag) => (
            <option key={ag} value={ag} className="bg-zinc-900">
              {ag}
            </option>
          ))}
        </select>

        <select
          value={query.difficulty ?? ''}
          onChange={(event) =>
            onQueryChange({
              ...query,
              difficulty: (event.target.value as Difficulty) || undefined,
            })
          }
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer"
        >
          <option value="" className="bg-zinc-900">Tüm Zorluk Seviyeleri</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d} className="bg-zinc-900">
              {d}
            </option>
          ))}
        </select>

        <select
          value={query.category ?? ''}
          onChange={(event) =>
            onQueryChange({
              ...query,
              category: (event.target.value as ActivityLibraryCategory) || undefined,
            })
          }
          className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all cursor-pointer"
        >
          <option value="" className="bg-zinc-900">Tüm Kategoriler</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c} className="bg-zinc-900">
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
