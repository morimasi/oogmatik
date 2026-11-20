import React from 'react';
import { AdPresetTemplate, AdStudioSettings } from '../../../types/adStudio';

interface PresetCampaignsProps {
  onSelectPreset: (settings: AdStudioSettings) => void;
}

const PRESET_CAMPAIGNS: AdPresetTemplate[] = [
  {
    id: 'preset_school_opening',
    name: 'Yeni Eğitim Yılı & Okul Kayıt Dönemi',
    category: 'B2B Kurumsal',
    badge: 'Yüksek Dönüşüm',
    description: 'Okul yöneticileri ve kolejler için bdmind kurumsal lisans ve MEB uyumlu BEP tanıtımı.',
    settings: {
      target: 'all_modules',
      audience: ['school_admin', 'teachers'],
      tone: 'corporate',
      toneMix: { corporate: 70, scientific: 20, emotional: 10, playful: 0, urgent: 0 },
      format: 'storyboard',
      duration: 30,
      language: 'tr',
      urgency: 'medium',
      callToAction: 'Kurumsal Okul Demosu Talep Edin',
      season: 'Güz 2026',
      brandKitId: 'default',
      tags: ['okulyılı', 'b2b', 'kurumsal', 'meb'],
    },
  },
  {
    id: 'preset_dyslexia_week',
    name: 'Disleksi Farkındalık Haftası Özel',
    category: 'Toplumsal Farkındalık',
    badge: 'En Popüler',
    description: 'Velilere ve topluma yönelik şefkatli, bilimsel ve umut aşılayan başarı hikayeleri.',
    settings: {
      target: 'reading_studio',
      audience: ['parents'],
      tone: 'emotional',
      toneMix: { corporate: 10, emotional: 60, scientific: 20, playful: 10, urgent: 0 },
      format: 'social_media',
      duration: 30,
      language: 'tr',
      urgency: 'low',
      callToAction: 'Farkındalık Rehberini Ücretsiz İndirin',
      season: 'Ekim',
      brandKitId: 'default',
      tags: ['farkındalık', 'veli', 'disleksi', 'umut'],
    },
  },
  {
    id: 'preset_math_anxiety',
    name: 'LGS & Matematik Kaygısına Son',
    category: 'Akademik Başarı',
    badge: 'Bilimsel',
    description: 'Diskalkuli ve soyut işlem kaygısını 33 tip HD grafik ve Futoshiki modelleriyle aşma kampanyası.',
    settings: {
      target: 'math_studio',
      audience: ['parents', 'teachers'],
      tone: 'scientific',
      toneMix: { corporate: 20, scientific: 50, emotional: 20, playful: 10, urgent: 0 },
      format: 'video_script',
      duration: 45,
      language: 'tr',
      urgency: 'medium',
      callToAction: 'Görsel Matematik Çalışma Kâğıtlarını Keşfet',
      season: 'Genel',
      brandKitId: 'default',
      tags: ['lgs', 'matematik', 'diskalkuli', 'grafikler'],
    },
  },
  {
    id: 'preset_bep_teacher',
    name: 'Öğretmenler İçin 1 Tıkla Hazır BEP',
    category: 'Öğretmen Verimliliği',
    badge: '%85 Zaman Tasarrufu',
    description: 'Özel eğitim öğretmenlerine haftada 8+ saat kazandıran MEB 573 KHK BEP ve çalışma kâğıdı şablonu.',
    settings: {
      target: 'activities',
      audience: ['teachers'],
      tone: 'corporate',
      toneMix: { corporate: 50, scientific: 30, emotional: 10, playful: 10, urgent: 0 },
      format: 'email',
      duration: 30,
      language: 'tr',
      urgency: 'high',
      callToAction: 'Öğretmen Hesabınızı Ücretsiz Başlatın',
      season: 'Dönem Başı',
      brandKitId: 'default',
      tags: ['öğretmen', 'bep', 'zaman-tasarrufu', 'meb'],
    },
  },
  {
    id: 'preset_sari_kitap',
    name: 'Sarı Kitap 6 Hızlı Okuma Lansmanı',
    category: 'Nöro-Teknikler',
    badge: 'Klinik Metodoloji',
    description: 'Pencere, Nokta, Köprü ve Çift Metin ile satır atlamayan, yormayan okuma terbiyesi.',
    settings: {
      target: 'sari_kitap',
      audience: ['parents', 'therapists'],
      tone: 'scientific',
      toneMix: { corporate: 20, scientific: 60, emotional: 20, playful: 0, urgent: 0 },
      format: 'brochure',
      duration: 30,
      language: 'tr',
      urgency: 'medium',
      callToAction: 'Sarı Kitap Fasikülünü İnceleyin',
      season: 'Genel',
      brandKitId: 'default',
      tags: ['sarikitap', 'hızlıokuma', 'nöroteknik', 'disleksi'],
    },
  },
  {
    id: 'preset_cognitive_screening',
    name: 'Bilişsel Değerlendirme & Tarama Bataryası',
    category: 'Ölçme & Değerlendirme',
    badge: 'SMART Radarlar',
    description: 'Okullar ve klinikler için erken farkındalık ve güçlü yön odaklı tarama bataryası.',
    settings: {
      target: 'screening_assessment',
      audience: ['school_admin', 'therapists'],
      tone: 'corporate',
      toneMix: { corporate: 60, scientific: 30, emotional: 10, playful: 0, urgent: 0 },
      format: 'pitch_deck',
      duration: 60,
      language: 'tr',
      urgency: 'low',
      callToAction: 'Tarama Bataryasını Okulunuzda Uygulayın',
      season: 'Güz',
      brandKitId: 'default',
      tags: ['tarama', 'değerlendirme', 'bilişsel', 'radar'],
    },
  },
];

export const PresetCampaigns: React.FC<PresetCampaignsProps> = ({ onSelectPreset }) => {
  return (
    <div className="space-y-3 font-lexend">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <i className="fa-solid fa-sparkles text-amber-400" />
          Hazır Yüksek Dönüşümlü Kampanya Şablonları
        </p>
        <span className="text-[9px] text-zinc-500 font-mono">6 Hazır Paket</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESET_CAMPAIGNS.map(preset => (
          <div
            key={preset.id}
            onClick={() => onSelectPreset(preset.settings)}
            className="group relative p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all cursor-pointer space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-wider text-indigo-400">
                {preset.category}
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[8px] font-bold">
                {preset.badge}
              </span>
            </div>

            <h4 className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors">
              {preset.name}
            </h4>

            <p className="text-[9px] text-zinc-400 leading-snug line-clamp-2">
              {preset.description}
            </p>

            <div className="flex items-center justify-between pt-1 text-[8px] text-zinc-500">
              <span>{preset.settings.format} · {preset.settings.duration}s</span>
              <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform font-bold">
                Uygula <i className="fa-solid fa-arrow-right text-[7px]" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
