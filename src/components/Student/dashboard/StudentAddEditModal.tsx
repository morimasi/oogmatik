import React, { useState } from 'react';
import { Student } from '../../../types';

export const GRADES = [
  'Okul Öncesi',
  '1. Sınıf',
  '2. Sınıf',
  '3. Sınıf',
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  'Lise Hazırlık',
  '9. Sınıf',
];

export const DIAGNOSIS_OPTIONS = [
  'Disleksi (Okuma Güçlüğü)',
  'Diskalkuli (Matematik Güçlüğü)',
  'DEHB (Dikkat Eksikliği)',
  'Disgrafi (Yazma Güçlüğü)',
  'Genel Öğrenme Güçlüğü',
  'Otizm Spektrum Bozukluğu',
  'Üstün Yetenekli',
  'Dil ve Konuşma Güçlüğü',
];

export type FormTab = 'identity' | 'academic' | 'parent';

interface StudentAddEditModalProps {
  initialData?: Partial<Student>;
  onClose: () => void;
  onSave: (data: Partial<Student>) => Promise<void>;
}

export const StudentAddEditModal: React.FC<StudentAddEditModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const [formTab, setFormTab] = useState<FormTab>('identity');
  const [formData, setFormData] = useState<Partial<Student>>(() => ({
    name: '',
    age: 8,
    grade: '2. Sınıf',
    diagnosis: [],
    interests: [],
    notes: '',
    learningStyle: 'Görsel',
    strengths: [],
    weaknesses: [],
    parentName: '',
    contactPhone: '',
    contactEmail: '',
    ...initialData,
  }));

  const [tempInterest, setTempInterest] = useState('');
  const [tempStrength, setTempStrength] = useState('');
  const [tempWeakness, setTempWeakness] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTag = (
    field: 'interests' | 'strengths' | 'weaknesses',
    value: string,
    setter: (val: string) => void
  ) => {
    if (!value.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()],
    }));
    setter('');
  };

  const handleRemoveTag = (
    field: 'interests' | 'strengths' | 'weaknesses',
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Lütfen öğrenci adını giriniz.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(formData);
      onClose();
    } catch (err: unknown) {
      alert(`Kayıt hatası: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[var(--bg-paper)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]">
          <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
            {formData.id ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Kaydı'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-paper)]">
          <button
            type="button"
            onClick={() => setFormTab('identity')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              formTab === 'identity'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="fa-solid fa-id-card"></i> Temel Bilgiler
          </button>
          <button
            type="button"
            onClick={() => setFormTab('academic')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              formTab === 'academic'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="fa-solid fa-brain"></i> Akademik Profil
          </button>
          <button
            type="button"
            onClick={() => setFormTab('parent')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              formTab === 'parent'
                ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-muted)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className="fa-solid fa-users"></i> Veli & İletişim
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="student-modal-form" onSubmit={handleSubmit} className="space-y-6">
            {/* TAB 1: IDENTITY */}
            {formTab === 'identity' && (
              <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] outline-none font-bold text-[var(--text-primary)]"
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Yaş
                    </label>
                    <input
                      type="number"
                      value={formData.age || 8}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Sınıf
                    </label>
                    <select
                      value={formData.grade || '2. Sınıf'}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none cursor-pointer text-[var(--text-primary)]"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Öğrenme Stili
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['Görsel', 'İşitsel', 'Kinestetik', 'Karma'] as const).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setFormData({ ...formData, learningStyle: style })}
                        className={`p-3 rounded-xl border-2 text-[10px] font-bold transition-all ${
                          formData.learningStyle === style
                            ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]'
                            : 'border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--accent-color)]'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ACADEMIC */}
            {formTab === 'academic' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Tanı / Özel Durum
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.diagnosis?.map((d, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[var(--accent-muted)] text-[var(--accent-color)] rounded-full text-xs font-bold flex items-center gap-2"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              diagnosis: formData.diagnosis?.filter((_, idx) => idx !== i),
                            })
                          }
                          className="hover:opacity-70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value && !formData.diagnosis?.includes(e.target.value)) {
                        setFormData({
                          ...formData,
                          diagnosis: [...(formData.diagnosis || []), e.target.value],
                        });
                      }
                    }}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                    value=""
                  >
                    <option value="">Tanı Seçin...</option>
                    {DIAGNOSIS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      İlgi Alanları
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempInterest}
                        onChange={(e) => setTempInterest(e.target.value)}
                        className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        placeholder="Örn: Uzay"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag('interests', tempInterest, setTempInterest);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('interests', tempInterest, setTempInterest)}
                        className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.interests?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag('interests', i)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                      Güçlü Yönler
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempStrength}
                        onChange={(e) => setTempStrength(e.target.value)}
                        className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        placeholder="Örn: Görsel hafıza"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag('strengths', tempStrength, setTempStrength);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag('strengths', tempStrength, setTempStrength)}
                        className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.strengths?.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag('strengths', i)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Destek İhtiyaçları (Zayıf Yönler)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempWeakness}
                      onChange={(e) => setTempWeakness(e.target.value)}
                      className="flex-1 p-2 border border-[var(--border-color)] rounded-lg text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                      placeholder="Örn: b/d harfleri"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag('weaknesses', tempWeakness, setTempWeakness);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTag('weaknesses', tempWeakness, setTempWeakness)}
                      className="px-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.weaknesses?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-rose-100 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded text-xs flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag('weaknesses', i)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PARENT */}
            {formTab === 'parent' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Veli Adı Soyadı
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="text"
                      value={formData.parentName || ''}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="Veli Adı"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    İletişim Telefonu
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="tel"
                      value={formData.contactPhone || ''}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"></i>
                    <input
                      type="email"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full pl-9 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none text-[var(--text-primary)]"
                      placeholder="veli@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">
                    Özel Notlar
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl outline-none h-24 resize-none text-[var(--text-primary)]"
                    placeholder="Eklemek istedikleriniz..."
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex justify-between items-center">
          <div className="text-xs text-[var(--text-muted)] font-medium">
            {formTab === 'identity' ? '1/3' : formTab === 'academic' ? '2/3' : '3/3'} Adım
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-[var(--text-muted)] font-bold hover:bg-[var(--bg-secondary)] rounded-xl transition-colors disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              form="student-modal-form"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
