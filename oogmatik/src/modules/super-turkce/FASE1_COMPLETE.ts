/**
 * Süper Türkçe - Ultra Premium Geliştirme Faz 1 Tamamlandı ✅
 * 
 * Bu dosya, FAZ 1'de tamamlanan özellikleri ve kullanım örneklerini gösterir.
 * 
 * TAMAMLANAN ÖZELLİKLER:
 * ✅ 1.1 Merkezi Tasarım Store'u (useSuperTurkceStore)
 * ✅ 1.2 MEB Müfredat Ontolojisi (Tier-2/3 Kelimeleri)
 * ✅ 1.3 Bileşen Kayıt Sistemi (ComponentRegistry)
 */

import {
  registerFormat,
  getFormatsByCategory,
  getAllFormats,
  getFormatById,
  getTotalFormatCount,
  getCategoryStats
} from './core/registry';

import {
  MEB_CURRICULUM,
  getTier2Words,
  getTier3Words,
  getVocabularyStats
} from './core/ontology';

import { useSuperTurkceStore } from './core/store';

// ============================================
// ÖRNEK 1: Component Registry Kullanımı
// ============================================

console.log('📦 COMPONENT REGISTRY SİSTEMİ');
console.log('================================');

// Örnek format tanımı oluşturma (gelecekte activity-formats'ten yüklenecek)
const sampleFormat: any = {
  id: 'SAMPLE_FORMAT',
  category: 'okuma_anlama',
  icon: 'fa-book',
  label: 'Örnek Format',
  description: 'Bu bir örnek format tanımlamasıdır',
  difficulty: 'all',
  settings: [
    {
      key: 'questionCount',
      label: 'Soru Sayısı',
      type: 'number' as any,
      defaultValue: 5,
      min: 3,
      max: 10
    }
  ],
  fastGenerate: (settings: any, grade: number | null, topic: string) => {
    return {
      title: `${topic} - ${grade}. Sınıf`,
      questions: Array(settings.questionCount).fill(null).map((_, i) => ({
        id: i,
        question: `Soru ${i + 1}`
      }))
    };
  },
  buildAiPrompt: (settings: any, grade: number | null, topic: string) => {
    return `${grade}. sınıf için "${topic}" konusunda ${settings.questionCount} soruluk etkinlik oluştur.`;
  }
};

// Formatı registry'ye kaydetme
registerFormat(sampleFormat);

// Kategori bazlı formatları getirme
const okumaAnlamaFormats = getFormatsByCategory('okuma_anlama');
console.log(`\n✅ Okuma Anlama Kategorisi: ${okumaAnlamaFormats.length} format`);

// Tüm formatları getirme
const allFormats = getAllFormats();
console.log(`✅ Toplam Format Sayısı: ${getTotalFormatCount()}`);

// ID ile format arama
const foundFormat = getFormatById('SAMPLE_FORMAT');
console.log(`✅ Bulunan Format: ${foundFormat?.label || 'Bulunamadı'}`);

// Kategori istatistikleri
const stats = getCategoryStats();
console.log('\n📊 KATEGORİ İSTATİSTİKLERİ:');
console.log(stats);

// ============================================
// ÖRNEK 2: MEB Müfredat Ontolojisi
// ============================================

console.log('\n\n📚 MEB MÜFREDAT ONTOLOJİSİ');
console.log('================================');

// 8. Sınıf müfredatını inceleme
const grade8Curriculum = MEB_CURRICULUM[8];
console.log(`\n✅ 8. Sınıf Üniteleri: ${grade8Curriculum.units.length}`);

grade8Curriculum.units.forEach((unit: any) => {
  console.log(`\n📖 Ünite: ${unit.title}`);
  console.log(`   Kazanımlar: ${unit.objectives.length}`);
  
  unit.objectives.forEach((obj: any) => {
    console.log(`   - ${obj.id}: ${obj.title}`);
    if (obj.tier2Words?.length) {
      console.log(`     Tier-2 Kelimeler: ${obj.tier2Words.join(', ')}`);
    }
    if (obj.tier3Words?.length) {
      console.log(`     Tier-3 Kelimeler: ${obj.tier3Words.join(', ')}`);
    }
  });
});

// Tier-2/3 Kelime Listeleri
console.log('\n\n🔤 KELİME DAĞARCIĞI');
console.log('================================');

const grade5Tier2 = getTier2Words(5);
const grade5Tier3 = getTier3Words(5);

console.log(`\n✅ 5. Sınıf Tier-2 Kelimeler: ${grade5Tier2.length} adet`);
grade5Tier2.slice(0, 3).forEach((word: any) => {
  console.log(`   • ${word.word} (${word.partOfSpeech}): ${word.definition}`);
});

console.log(`\n✅ 5. Sınıf Tier-3 Kelimeler: ${grade5Tier3.length} adet`);
grade5Tier3.slice(0, 3).forEach((word: any) => {
  console.log(`   • ${word.word} (${word.partOfSpeech}): ${word.definition}`);
});

// Tüm sınıf seviyeleri için kelime istatistikleri
const vocabStats = getVocabularyStats();
console.log('\n📊 TÜM SINIFLAR KELİME İSTATİSTİKLERİ:');
Object.entries(vocabStats).forEach(([grade, stats]: any) => {
  console.log(`   ${grade}. Sınıf: Tier-2: ${stats.tier2Count}, Tier-3: ${stats.tier3Count}`);
});

// ============================================
// ÖRNEK 3: Zustand Store Kullanımı
// ============================================

console.log('\n\n🏪 ZUSTAND STORE DEMOSU');
console.log('================================');

// Store'dan state ve aksiyonları alma
const {
  selectedGrade,
  setGrade,
  selectedObjective,
  setObjective,
  engineMode,
  setEngineMode,
  draftComponents,
  setDraftComponents,
  saveToArchive,
  archiveHistory
} = useSuperTurkceStore.getState();

// Sınıf seviyesi belirleme
setGrade(6);
console.log(`\n✅ Seçilen Sınıf: ${useSuperTurkceStore.getState().selectedGrade}`);

// Kazanım seçme
const grade6Objectives = MEB_CURRICULUM[6].units[0].objectives;
setObjective(grade6Objectives[0]);
console.log(`✅ Seçilen Kazanım: ${useSuperTurkceStore.getState().selectedObjective?.title}`);

// Engine modunu değiştirme
setEngineMode('ai');
console.log(`✅ Aktif Motor: ${useSuperTurkceStore.getState().engineMode}`);

// Taslak bileşen ekleme
setDraftComponents([
  {
    id: 'component_1',
    type: 'FILL_IN_THE_BLANKS',
    settings: { difficulty: 'orta', wordCount: 100 },
    data: null
  },
  {
    id: 'component_2',
    type: 'MULTIPLE_CHOICE',
    settings: { questionCount: 5, choices: 4 },
    data: null
  }
]);

console.log(`✅ Taslak Bileşenler: ${useSuperTurkceStore.getState().draftComponents.length}`);

// Arşive kaydetme (simülasyon)
const currentGrade = useSuperTurkceStore.getState().selectedGrade!;
const currentObjective = useSuperTurkceStore.getState().selectedObjective!;
saveToArchive(currentGrade, currentObjective.title, 'ai', draftComponents);

console.log(`✅ Arşivlenen Üretimler: ${useSuperTurkceStore.getState().archiveHistory.length}`);

// ============================================
// ÖZET
// ============================================

console.log('\n\n✅ FAZ 1 TAMAMLANDI!');
console.log('================================');
console.log('Merkezi Tasarım Store\'u: ✅ Aktif');
console.log('MEB Müfredat Ontolojisi: ✅ Aktif (Tier-2/3 kelimeleriyle)');
console.log('Bileşen Kayıt Sistemi: ✅ Aktif');
console.log('\n🎯 Bir Sonraki Faz: FAZ 2 - Akıllı Kokpit (UI/UX)');
console.log('   • Bileşen Havuzu Arayüzü');
console.log('   • Şartlı Ayarlar Paneli');
console.log('   • Sayfa İskeleti (Skeleton View)');
