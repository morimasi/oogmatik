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
    <div className="space-y-3 rounded-lg border border-[var(--border-color)] p-4">
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
        className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
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
          className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="">Tüm Profiller</option>
          {PROFILE_OPTIONS.map((p) => (
            <option key={p} value={p}>
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
          className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="">Tüm Yaş Grupları</option>
          {AGE_GROUP_OPTIONS.map((ag) => (
            <option key={ag} value={ag}>
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
          className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="">Tüm Zorluk Seviyeleri</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
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
          className="rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          <option value="">Tüm Kategoriler</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
