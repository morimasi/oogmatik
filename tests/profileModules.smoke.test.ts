import { describe, expect, it } from 'vitest';
import {
  PROFILE_EXPORT_FIELDS,
  buildProfileExport,
  filterStudents,
  parseSavedViews,
  serializeSavedViews,
} from '../src/components/Profile/utils/profileUtils';
import type { Student } from '../src/types/student';

const student = (overrides: Partial<Student>): Student =>
  ({
    id: 's1',
    teacherId: 't1',
    name: 'Ada Yılmaz',
    age: 9,
    grade: '3',
    avatar: '',
    diagnosis: ['disleksi desteğine ihtiyaç duyuyor'],
    interests: [],
    strengths: [],
    weaknesses: [],
    learningStyle: 'Görsel',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }) as Student;

describe('profileUtils.filterStudents', () => {
  it('isim, sınıf ve tanı alanlarında arama yapar', () => {
    const list = [
      student({ id: 'a', name: 'Ada Yılmaz', grade: '3' }),
      student({ id: 'b', name: 'Mert Kaya', grade: '5', diagnosis: ['DEHB desteği'] }),
    ];

    expect(filterStudents(list, 'ada', 'all').map((s) => s.id)).toEqual(['a']);
    expect(filterStudents(list, '5', 'all').map((s) => s.id)).toEqual(['b']);
    expect(filterStudents(list, 'dehb', 'all').map((s) => s.id)).toEqual(['b']);
  });

  it('tanı rozeti filtresini uygular ve eşleşmeyeni eler', () => {
    const list = [
      student({ id: 'a', diagnosis: ['disleksi desteğine ihtiyaç duyuyor'] }),
      student({ id: 'b', diagnosis: ['DEHB desteği'] }),
    ];

    expect(filterStudents(list, '', 'dyslexia').length).toBe(0);
    expect(filterStudents(list, '', 'disleksi').map((s) => s.id)).toEqual(['a']);
    expect(filterStudents(list, '', 'dehb').map((s) => s.id)).toEqual(['b']);
  });

  it('eksik name/grade/diagnosis alanlarında çökmez', () => {
    const broken = [
      { id: 'x', teacherId: 't1' } as unknown as Student,
      student({ id: 'y', name: '' as string, grade: undefined as unknown as string }),
    ];

    expect(() => filterStudents(broken, 'ada', 'all')).not.toThrow();
    expect(filterStudents(broken, '', 'all')).toHaveLength(2);
  });

  it('learningProfile alanını da filtreye dahil eder', () => {
    const withProfile = {
      id: 'p',
      teacherId: 't1',
      name: 'Ela',
      grade: '2',
      learningProfile: 'diskalkuli destek profili',
    } as unknown as Student;

    expect(filterStudents([withProfile], '', 'diskalkuli')).toHaveLength(1);
  });
});

describe('profileUtils saved views', () => {
  it('görünümleri yazıp geri okur', () => {
    const views = [
      { name: 'Dikkat düşük', sortBy: 'score' as const, filterStudent: 'ada' },
      { name: 'Son 5', sortBy: 'date' as const, filterStudent: '' },
    ];
    expect(parseSavedViews(serializeSavedViews(views))).toEqual(views);
  });

  it('bozuk JSON ve geçersiz kayıtları güvenle eler', () => {
    expect(parseSavedViews('{bozuk')).toEqual([]);
    expect(parseSavedViews(null)).toEqual([]);
    expect(parseSavedViews(JSON.stringify([{ name: '  ' }, { name: 'Geçerli', sortBy: 'saçma' }]))).toEqual([
      { name: 'Geçerli', sortBy: 'date', filterStudent: '' },
    ]);
  });
});

describe('profileUtils.buildProfileExport', () => {
  it('izin listesindeki alanları alır, bilinmeyen alanları dışarıda bırakır', () => {
    const user = {
      id: 'u1',
      name: 'Öğretmen',
      email: 'ogretmen@example.com',
      role: 'teacher',
      phone: '555',
      pedagogySettings: { zpdStrategy: 'optimal' },
      passwordHash: 'gizli',
      refreshToken: 'gizli-jeton',
    };

    const payload = buildProfileExport({
      user,
      assessments: [{}],
      worksheets: [{}, {}],
      curriculums: [],
      generatedAt: '2026-10-31T00:00:00.000Z',
    });

    expect(Object.keys(payload.user).sort()).toEqual(
      PROFILE_EXPORT_FIELDS.filter((field) => field in user).sort()
    );
    expect(payload.user.passwordHash).toBeUndefined();
    expect(payload.user.refreshToken).toBeUndefined();
    expect(payload.counts).toEqual({ assessments: 1, worksheets: 2, curriculums: 0 });
    expect(payload.generatedAt).toBe('2026-10-31T00:00:00.000Z');
    expect(payload.note).toContain('KVKK');
  });

  it('veri yoksa sıfır sayımlarla geçerli paket üretir', () => {
    const payload = buildProfileExport({ user: {}, assessments: [], worksheets: [], curriculums: [] });
    expect(payload.counts).toEqual({ assessments: 0, worksheets: 0, curriculums: 0 });
    expect(payload.user).toEqual({});
    expect(payload.schemaVersion).toBe('1.0');
  });
});
