import React, { useState, useEffect } from 'react';
import { AdvancedStudent, StudentPrivacySettings, createDefaultPrivacySettings } from '../../../types/student-advanced';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';
import { dlpService } from '../../../services/privacyService';
import { logInfo, logError } from '../../../utils/logger';

interface PrivacyModuleProps {
  student: AdvancedStudent;
  onUpdate?: (updates: Partial<AdvancedStudent>) => void;
}

export const PrivacyModule: React.FC<PrivacyModuleProps> = ({ student, onUpdate }) => {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<StudentPrivacySettings>(
    student.privacySettings || createDefaultPrivacySettings(user?.id || 'system')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'data' | 'ai' | 'requests' | 'audit'>('profile');

  useEffect(() => {
    if (student.privacySettings) {
      setSettings(student.privacySettings);
    }
  }, [student.privacySettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedSettings: StudentPrivacySettings = {
        ...settings,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: user?.id || 'system'
      };

      // Update Firestore
      const docRef = doc(db, 'students', student.id);
      await updateDoc(docRef, { privacySettings: updatedSettings });

      // Update local state
      if (onUpdate) {
        onUpdate({ privacySettings: updatedSettings });
      }
      
      useToastStore.getState().success('Gizlilik ayarları kaydedildi!', 3000);
      logInfo('Gizlilik ayarları güncellendi', { studentId: student.id });
    } catch (error) {
      logError('Gizlilik ayarları kaydedilemedi', { 
        error: error instanceof Error ? error.message : String(error), 
        context: 'PrivacyModule-save' 
      });
      useToastStore.getState().error('Kaydedilemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = (section: keyof StudentPrivacySettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value
      }
    }));
  };

  const handleToggleDataClassification = (
    key: keyof StudentPrivacySettings['sensitiveDataHandling'],
    value: 'encrypted' | 'local_only' | 'standard'
  ) => {
    setSettings(prev => ({
      ...prev,
      sensitiveDataHandling: {
        ...prev.sensitiveDataHandling,
        [key]: value
      }
    }));
  };

  const checkDataSafety = (text: string) => {
    return dlpService.checkAnonymization(text);
  };

  const renderProfileVisibility = () => (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight">Profil Görünürlüğü</h4>
      
      <div className="grid gap-3">
        {[
          { key: 'private', label: 'Özel', desc: 'Sadece siz ve atanan öğretmenler' },
          { key: 'teachers_only', label: 'Sadece Öğretmenler', desc: 'Tüm kayıtlı öğretmenler' },
          { key: 'institution', label: 'Kurum İçi', desc: 'Kurumunuzdaki tüm yetkililer' },
          { key: 'shared', label: 'Paylaşıma Açık', desc: 'Onay verdiğiniz kişiler' }
        ].map(opt => (
          <label
            key={opt.key}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
              settings.profileVisibility === opt.key
                ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                : 'border-[var(--border-color)] bg-[var(--bg-paper)]'
            }`}
          >
            <input
              type="radio"
              name="profileVisibility"
              value={opt.key}
              checked={settings.profileVisibility === opt.key}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profileVisibility: e.target.value as any
              }))}
              className="mt-1"
            />
            <div>
              <span className="font-bold text-sm text-[var(--text-primary)]">{opt.label}</span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{opt.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const renderDataHandling = () => (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight">Hassas Veri İşleme</h4>
      <p className="text-[11px] text-[var(--text-muted)]">KVKK Madde 6 uyarınca her veri türü için ayrı güvenlik seviyesi seçin.</p>

      <div className="space-y-3">
        {[
          { key: 'diagnosisInfo', label: 'Tanı Bilgileri', desc: 'Klinik tanı ve değerlendirme raporları' },
          { key: 'assessmentResults', label: 'Değerlendirme Sonuçları', desc: 'Test ve analiz sonuçları' },
          { key: 'behavioralNotes', label: 'Davranış Notları', desc: 'Gözlem ve davranış kayıtları' },
          { key: 'medicalInfo', label: 'Sağlık Bilgileri', desc: 'Tıbbi geçmiş ve sağlık kayıtları' },
          { key: 'iepDocuments', label: 'BEP Belgeleri', desc: 'Bireyselleştirilmiş eğitim planları' },
          { key: 'academicRecords', label: 'Akademik Kayıtlar', desc: 'Notlar ve akademik geçmiş' },
          { key: 'familyContactInfo', label: 'Aile İletişim Bilgileri', desc: 'Veli iletişim ve adres bilgileri' }
        ].map(item => (
          <div key={item.key} className="p-4 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="font-bold text-sm text-[var(--text-primary)]">{item.label}</span>
                <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {[
                { value: 'local_only', label: 'Sadece Yerel', color: 'bg-emerald-500' },
                { value: 'encrypted', label: 'Şifreli', color: 'bg-blue-500' },
                { value: 'standard', label: 'Standart', color: 'bg-gray-400' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleToggleDataClassification(item.key as any, opt.value as any)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                    settings.sensitiveDataHandling[item.key as keyof typeof settings.sensitiveDataHandling] === opt.value
                      ? `${opt.color} text-white`
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-4">
      <h4 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight">Yapay Zeka İşleme İzinleri</h4>

      <div className="grid gap-3">
        {[
          { key: 'allowPersonalization', label: 'Kişiselleştirilmiş İçerik', desc: 'Öğrenci profiline özel etkinlik üretimi' },
          { key: 'allowLearningAnalysis', label: 'Öğrenme Analizi', desc: 'Gelişim takibi ve analiz raporları' },
          { key: 'allowAnonymizedTraining', label: 'Anonim Model Eğitimi', desc: 'Verileriniz model eğitimi için kullanılsın' },
          { key: 'allowDiagnosisBasedRecommendations', label: 'Tanı Bazlı Öneriler', desc: 'Klinik bilgilerine göre kişiselleştirme' },
          { key: 'allowPredictiveAnalysis', label: 'Tahmine Dayalı Analiz', desc: 'Gelecek performans tahminleri' }
        ].map(item => (
          <label
            key={item.key}
            className="p-4 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl cursor-pointer transition-all hover:border-[var(--accent-color)]/30 flex items-center justify-between"
          >
            <div>
              <span className="font-bold text-sm text-[var(--text-primary)]">{item.label}</span>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{item.desc}</p>
            </div>
            <div
              onClick={(e) => {
                e.preventDefault();
                handleToggleSetting('aiProcessing', item.key, !settings.aiProcessing[item.key as keyof typeof settings.aiProcessing]);
              }}
              className={`w-12 h-6 rounded-full transition-all cursor-pointer ${
                settings.aiProcessing[item.key as keyof typeof settings.aiProcessing] ? 'bg-[var(--accent-color)]' : 'bg-[var(--bg-secondary)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-all ${
                  settings.aiProcessing[item.key as keyof typeof settings.aiProcessing] ? 'ml-6' : 'ml-0.5'
                }`}
              />
            </div>
          </label>
        ))}
      </div>

      <div className="p-4 bg-[var(--accent-muted)] border border-[var(--accent-color)]/20 rounded-2xl">
        <h5 className="font-bold text-xs text-[var(--accent-color)] uppercase mb-2">Veri Hariç Tutma Listesi</h5>
        <div className="flex flex-wrap gap-2">
          {settings.aiProcessing.excludedDataTypes.map(type => (
            <span key={type} className="px-2 py-1 bg-[var(--bg-paper)] text-[10px] font-bold rounded-full text-[var(--text-muted)] border border-[var(--border-color)]">
              {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-tight">Gizlilik & KVKK</h3>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Kişisel verilerin korunması ayarları</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          <i className={`fa-solid ${isSaving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
        {[
          { id: 'profile', icon: 'fa-user-shield', label: 'Profil' },
          { id: 'data', icon: 'fa-database', label: 'Veriler' },
          { id: 'ai', icon: 'fa-brain', label: 'AI' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[var(--accent-color)] text-white shadow-lg'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        {activeTab === 'profile' && renderProfileVisibility()}
        {activeTab === 'data' && renderDataHandling()}
        {activeTab === 'ai' && renderAISettings()}
      </div>

      {/* KVKK Footer Banner */}
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-shield-halved text-sm"></i>
          </div>
          <div>
            <h5 className="font-bold text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wider">KVKK Uyumluluğu</h5>
            <p className="text-[10px] text-amber-600/80 dark:text-amber-300/70 mt-1">
              6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca tüm verileriniz güvenli şekilde saklanmaktadır. 
              İstediğiniz zaman verilerinize erişim, düzeltme veya silme talebinde bulunabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
