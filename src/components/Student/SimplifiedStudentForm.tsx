/**
 * OOGMATIK - Simplified Student Form (Sprint 2)
 * 5 zorunlu alan + progressive disclosure UI
 */

import React, { useState } from 'react';
import type { Student } from '../../types/student';

interface SimplifiedStudentFormProps {
  onSave: (student: Partial<Student>) => void;
  onCancel: () => void;
  initialData?: Partial<Student>;
}

export const SimplifiedStudentForm: React.FC<SimplifiedStudentFormProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 1: 5 Zorunlu Alan
  const [name, setName] = useState(initialData?.name || '');
  const [grade, setGrade] = useState(initialData?.grade || '');
  const [parentName, setParentName] = useState(initialData?.parentName || '');
  const [parentPhone, setParentPhone] = useState(initialData?.contactPhone || '');
  const [diagnosis, setDiagnosis] = useState<string[]>(initialData?.diagnosis || []);

  // Step 2: İsteğe Bağlı Alanlar (Progressive Disclosure)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [age, setAge] = useState<number>(initialData?.age || 7);
  const [parentEmail, setParentEmail] = useState(initialData?.contactEmail || '');
  const [interests, setInterests] = useState<string[]>(initialData?.interests || []);
  const [strengths, setStrengths] = useState<string[]>(initialData?.strengths || []);
  const [weaknesses, setWeaknesses] = useState<string[]>(initialData?.weaknesses || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [learningStyle, setLearningStyle] = useState<'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma'>(
    initialData?.learningStyle || 'Karma'
  );

  // Diagnosis input helper
  const [diagnosisInput, setDiagnosisInput] = useState('');

  /**
   * Validate Step 1 (Required Fields)
   */
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'İsim en az 2 karakter olmalı';
    }

    if (!grade.trim()) {
      newErrors.grade = 'Sınıf gereklidir';
    }

    if (!parentName.trim()) {
      newErrors.parentName = 'Veli adı gereklidir';
    }

    if (!parentPhone.trim()) {
      newErrors.parentPhone = 'Veli telefonu gereklidir';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(parentPhone)) {
      newErrors.parentPhone = 'Geçerli bir telefon numarası girin';
    }

    if (diagnosis.length === 0) {
      newErrors.diagnosis = 'En az bir tanı seçiniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle Step 1 → Step 2
   */
  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  /**
   * Handle Final Submit
   */
  const handleSubmit = () => {
    if (!validateStep1()) {
      setStep(1);
      return;
    }

    const studentData: Partial<Student> = {
      name: name.trim(),
      grade: grade.trim(),
      parentName: parentName.trim(),
      contactPhone: parentPhone.trim(),
      diagnosis,
      age,
      contactEmail: parentEmail.trim() || undefined,
      interests,
      strengths,
      weaknesses,
      notes: notes.trim() || undefined,
      learningStyle,
      avatar: initialData?.avatar || '',
    };

    onSave(studentData);
  };

  /**
   * Add Diagnosis
   */
  const handleAddDiagnosis = () => {
    if (diagnosisInput.trim() && !diagnosis.includes(diagnosisInput.trim())) {
      setDiagnosis([...diagnosis, diagnosisInput.trim()]);
      setDiagnosisInput('');
      // Clear error if exists
      if (errors.diagnosis) {
        setErrors({ ...errors, diagnosis: '' });
      }
    }
  };

  /**
   * Remove Diagnosis
   */
  const handleRemoveDiagnosis = (item: string) => {
    setDiagnosis(diagnosis.filter((d) => d !== item));
  };

  return (
    <div className="min-h-screen p-6 font-['Lexend']" style={{ backgroundColor: 'var(--bg-default)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              {initialData ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'}
            </h1>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl font-bold transition-colors hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
            >
              <i className="fa-solid fa-times mr-2"></i>
              İptal
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-2 rounded-full transition-colors`}
              style={{ backgroundColor: step >= 1 ? 'var(--accent-color)' : 'var(--bg-inset)' }}
            ></div>
            <div
              className={`flex-1 h-2 rounded-full transition-colors`}
              style={{ backgroundColor: step >= 2 ? 'var(--accent-color)' : 'var(--bg-inset)' }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium">
            <span style={{ color: step >= 1 ? 'var(--accent-color)' : 'var(--text-muted)' }}>
              1. Temel Bilgiler
            </span>
            <span style={{ color: step >= 2 ? 'var(--accent-color)' : 'var(--text-muted)' }}>
              2. Tamamlandı
            </span>
          </div>
        </div>

        {/* Step 1: Required Fields */}
        {step === 1 && (
          <div className="rounded-3xl p-8 shadow-xl border-2" style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
              Temel Bilgiler (Zorunlu)
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Öğrenci Adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ali Yılmaz"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors text-lg ${errors.name ? 'border-red-500 bg-red-50/10' : ''}`}
                  style={!errors.name ? { backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : { color: 'var(--text-primary)' }}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Sınıf *
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Örn: 4. Sınıf"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors text-lg ${errors.grade ? 'border-red-500 bg-red-50/10' : ''}`}
                  style={!errors.grade ? { backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : { color: 'var(--text-primary)' }}
                />
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.grade}</p>
                )}
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Veli Adı *
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Örn: Mehmet Yılmaz"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors text-lg ${errors.parentName ? 'border-red-500 bg-red-50/10' : ''}`}
                  style={!errors.parentName ? { backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : { color: 'var(--text-primary)' }}
                />
                {errors.parentName && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.parentName}</p>
                )}
              </div>

              {/* Parent Phone */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Veli Telefon *
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Örn: 0555 123 4567"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors text-lg ${errors.parentPhone ? 'border-red-500 bg-red-50/10' : ''}`}
                  style={!errors.parentPhone ? { backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : { color: 'var(--text-primary)' }}
                />
                {errors.parentPhone && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.parentPhone}</p>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Tanı / Destek İhtiyacı *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDiagnosis();
                      }
                    }}
                    placeholder="Örn: Disleksi, DEHB"
                    className={`flex-1 px-4 py-3 rounded-xl border-2 outline-none transition-colors text-lg ${errors.diagnosis ? 'border-red-500 bg-red-50/10' : ''}`}
                    style={!errors.diagnosis ? { backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' } : { color: 'var(--text-primary)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    className="px-6 py-3 rounded-xl text-white font-bold transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>

                {/* Diagnosis Tags */}
                {diagnosis.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {diagnosis.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold"
                        style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(item)}
                          className="hover:opacity-70 transition-colors"
                        >
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {errors.diagnosis && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.diagnosis}</p>
                )}

                <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Öğrencinin destek ihtiyacı olan alanları ekleyin (disleksi, DEHB, diskalkuli vb.)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-xl font-bold transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-4 rounded-xl text-white font-bold transition-colors shadow-lg hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                İleri
                <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation + Optional Fields */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>
                Kayıt Özeti
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Öğrenci Adı</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Sınıf</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{grade}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Veli</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{parentName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Telefon</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{parentPhone}</span>
                </div>
                <div className="py-3">
                  <span className="text-sm font-medium block mb-2" style={{ color: 'var(--text-muted)' }}>Tanı</span>
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-lg text-sm font-bold"
                        style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Fields (Progressive Disclosure) */}
            <div className="rounded-3xl p-8 shadow-xl border-2" style={{ backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h3 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                  Ek Bilgiler (İsteğe Bağlı)
                </h3>
                <i
                  className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'} transition-transform`}
                  style={{ color: 'var(--text-muted)' }}
                ></i>
              </button>

              {showAdvanced && (
                <div className="space-y-6 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Yaş
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      min={4}
                      max={18}
                      className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors"
                      style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Parent Email */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Veli E-posta
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors"
                      style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Learning Style */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Öğrenme Stili
                    </label>
                    <select
                      value={learningStyle}
                      onChange={(e) =>
                        setLearningStyle(
                          e.target.value as 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors"
                      style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="Karma">Karma</option>
                      <option value="Görsel">Görsel</option>
                      <option value="İşitsel">İşitsel</option>
                      <option value="Kinestetik">Kinestetik</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Notlar
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Öğrenci hakkında not ekleyin..."
                      className="w-full px-4 py-3 rounded-xl border-2 outline-none transition-colors resize-none"
                      style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-4 rounded-xl font-bold transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-inset)', color: 'var(--text-secondary)' }}
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Geri
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-6 py-4 rounded-xl text-white font-bold transition-colors shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#22c55e' }}
              >
                <i className="fa-solid fa-check mr-2"></i>
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
