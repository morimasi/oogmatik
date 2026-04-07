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
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 font-['Lexend']">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white">
              {initialData ? 'Öğrenci Düzenle' : 'Yeni Öğrenci'}
            </h1>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <i className="fa-solid fa-times mr-2"></i>
              İptal
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step >= 1 ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            ></div>
            <div
              className={`flex-1 h-2 rounded-full transition-colors ${
                step >= 2 ? 'bg-indigo-500' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium">
            <span className={step >= 1 ? 'text-indigo-500' : 'text-zinc-400'}>
              1. Temel Bilgiler
            </span>
            <span className={step >= 2 ? 'text-indigo-500' : 'text-zinc-400'}>
              2. Tamamlandı
            </span>
          </div>
        </div>

        {/* Step 1: Required Fields */}
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border-2 border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6">
              Temel Bilgiler (Zorunlu)
            </h2>

            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Öğrenci Adı *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ali Yılmaz"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.name
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-zinc-200 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-lg`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Sınıf *
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Örn: 4. Sınıf"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.grade
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-zinc-200 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-lg`}
                />
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.grade}</p>
                )}
              </div>

              {/* Parent Name */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Veli Adı *
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Örn: Mehmet Yılmaz"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.parentName
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-zinc-200 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-lg`}
                />
                {errors.parentName && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.parentName}</p>
                )}
              </div>

              {/* Parent Phone */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  Veli Telefon *
                </label>
                <input
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="Örn: 0555 123 4567"
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.parentPhone
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                      : 'border-zinc-200 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-lg`}
                />
                {errors.parentPhone && (
                  <p className="mt-1 text-sm text-red-500 font-medium">{errors.parentPhone}</p>
                )}
              </div>

              {/* Diagnosis */}
              <div>
                <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
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
                    className={`flex-1 px-4 py-3 rounded-xl border-2 ${
                      errors.diagnosis
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                        : 'border-zinc-200 dark:border-zinc-700'
                    } bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors text-lg`}
                  />
                  <button
                    type="button"
                    onClick={handleAddDiagnosis}
                    className="px-6 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveDiagnosis(item)}
                          className="hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
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

                <p className="mt-2 text-xs text-zinc-500">
                  Öğrencinin destek ihtiyacı olan alanları ekleyin (disleksi, DEHB, diskalkuli vb.)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 px-6 py-4 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors shadow-lg"
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
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border-2 border-zinc-100 dark:border-zinc-800">
              <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-6">
                Kayıt Özeti
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-500">Öğrenci Adı</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{name}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-500">Sınıf</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{grade}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-500">Veli</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{parentName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-medium text-zinc-500">Telefon</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{parentPhone}</span>
                </div>
                <div className="py-3">
                  <span className="text-sm font-medium text-zinc-500 block mb-2">Tanı</span>
                  <div className="flex flex-wrap gap-2">
                    {diagnosis.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Fields (Progressive Disclosure) */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border-2 border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between text-left mb-4"
              >
                <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                  Ek Bilgiler (İsteğe Bağlı)
                </h3>
                <i
                  className={`fa-solid fa-chevron-${showAdvanced ? 'up' : 'down'} text-zinc-400 transition-transform`}
                ></i>
              </button>

              {showAdvanced && (
                <div className="space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Yaş
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      min={4}
                      max={18}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Parent Email */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Veli E-posta
                    </label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Learning Style */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Öğrenme Stili
                    </label>
                    <select
                      value={learningStyle}
                      onChange={(e) =>
                        setLearningStyle(
                          e.target.value as 'Görsel' | 'İşitsel' | 'Kinestetik' | 'Karma'
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Karma">Karma</option>
                      <option value="Görsel">Görsel</option>
                      <option value="İşitsel">İşitsel</option>
                      <option value="Kinestetik">Kinestetik</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Öğrenci hakkında not ekleyin..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white outline-none focus:border-indigo-500 transition-colors resize-none"
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
                className="px-6 py-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                <i className="fa-solid fa-arrow-left mr-2"></i>
                Geri
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 px-6 py-4 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 transition-colors shadow-lg"
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
