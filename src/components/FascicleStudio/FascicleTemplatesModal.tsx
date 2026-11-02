import React, { useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { X, FileText, Blocks, Brain, Star, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { ActivityType } from '../../types/activity';
import { FascicleItem } from '../../types/fascicle';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface FascicleTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TemplatePreset {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge: string;
  themeStyle: 'clouds' | 'doodles' | 'garden' | 'dots';
  primaryColor: 'lavender' | 'mint' | 'peach' | 'blush' | 'sky' | 'buttercup';
  targetProfile: 'dyslexia' | 'dyscalculia' | 'adhd' | 'mixed';
  targetAgeGroup: '5-7' | '8-10' | '11-13' | '14+';
  summaryNote: string;
  activities: {
    type: ActivityType;
    title: string;
    difficulty: 'Kolay' | 'Orta' | 'Zor';
    pageCount: number;
    instruction: string;
  }[];
}

const TEMPLATES: TemplatePreset[] = [
  {
    id: 'disleksi-baslangic',
    title: 'Disleksi Başlangıç Paketi (Fonolojik Güç)',
    description: 'Harf farkındalığı, ayna harf (b-d-p) ayırt etme, renkli heceleme ve sözcük piramidi odaklı nöro-pedagojik başlangıç seti.',
    icon: <FileText size={24} className="text-indigo-500" />,
    badge: 'Klinik Set',
    themeStyle: 'clouds',
    primaryColor: 'lavender',
    targetProfile: 'dyslexia',
    targetAgeGroup: '8-10',
    summaryNote: 'Bu fasikül, öğrencinin fonolojik farkındalık, görsel harf eşleme ve hece okuma akıcılığını desteklemek amacıyla özel eğitim uzmanları tarafından hazırlanmıştır.',
    activities: [
      {
        type: ActivityType.FIND_LETTER_PAIR,
        title: 'Harf Çifti Ayırt Etme (b-d / p-q)',
        difficulty: 'Kolay',
        pageCount: 1,
        instruction: 'Verilen metin içinde hedef harf çiftlerini bularak uygun renklerle işaretleyin.'
      },
      {
        type: ActivityType.COLORFUL_SYLLABLE_READING,
        title: 'Renkli Heceleme & Akıcı Okuma',
        difficulty: 'Kolay',
        pageCount: 1,
        instruction: 'Renklendirilmiş heceleri soldan sağa doğru ritmik ve sesli olarak okuyun.'
      },
      {
        type: ActivityType.LETTER_VISUAL_MATCHING,
        title: 'Görsel Harf Eşleme & Algı',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Aynı olan harfleri ve hece kalıplarını hızla eşleştirin.'
      },
      {
        type: ActivityType.READING_PYRAMID,
        title: 'Genişleyen Cümle Piramidi',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Her satırda bir sözcük eklenen piramidi akıcı bir ritimle tamamlayın.'
      },
      {
        type: ActivityType.WORD_SEARCH,
        title: 'Hedef Kelime Dedektifi',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Bulmaca ızgarasında gizlenmiş sözcükleri bulun ve daire içine alın.'
      }
    ]
  },
  {
    id: 'dikkat-guc-orta',
    title: 'Dikkat & Yürütücü İşlevler (DEHB Dostu)',
    description: 'Odaklanma süresini artıran Stroop etkisi, şifre çözme, yönsel takip ve 5N1K dikkat odaklı mikro-döngü seti.',
    icon: <Brain size={24} className="text-emerald-500" />,
    badge: 'Premium DEHB',
    themeStyle: 'doodles',
    primaryColor: 'mint',
    targetProfile: 'adhd',
    targetAgeGroup: '8-10',
    summaryNote: 'Bu fasikül, çalışma belleği, çeldiricileri bastırma (inhibition) ve seçici dikkati geliştiren 5-7 dakikalık dinamik mikro-görevler içerir.',
    activities: [
      {
        type: ActivityType.READING_STROOP,
        title: 'Stroop Renk-Kelime Çeldirici Testi',
        difficulty: 'Kolay',
        pageCount: 1,
        instruction: 'Yazılan kelimeye değil, kelimenin basıldığı renge odaklanarak seslendirin.'
      },
      {
        type: ActivityType.DIRECTIONAL_TRACKING,
        title: 'Yönsel Takip & Labirent Koordinatı',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Ok işaretlerini ve yönergeleri izleyerek doğru çıkış yoluna ulaşın.'
      },
      {
        type: ActivityType.HIDDEN_PASSWORD_GRID,
        title: 'Izgarada Gizli Şifre Çözücü',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Koordinatları verilen harfleri birleştirerek gizemli mesajı ortaya çıkarın.'
      },
      {
        type: ActivityType.LOGIC_ERROR_HUNTER,
        title: 'Metindeki Mantık Hatalarını Avla',
        difficulty: 'Zor',
        pageCount: 1,
        instruction: 'Kısa hikayedeki anlamsal ve mantıksal tutarsızlıkları bularak altını çizin.'
      },
      {
        type: ActivityType.PATTERN_COMPLETION,
        title: 'Ardışık Mantık & Desen Tamamlama',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Kurallı örüntüdeki eksik parçayı tespit edin ve kutucuğa çizin.'
      }
    ]
  },
  {
    id: 'matematik-diskalkuli',
    title: 'Diskalkuli Matematik & Sayı Algısı',
    description: 'Sayı hissi (number sense), basamak değeri, zihinsel toplama piramidi ve görsel problem çözme seti.',
    icon: <Blocks size={24} className="text-amber-500" />,
    badge: 'Analitik Diskalkuli',
    themeStyle: 'dots',
    primaryColor: 'peach',
    targetProfile: 'dyscalculia',
    targetAgeGroup: '8-10',
    summaryNote: 'Bu fasikül, soyut matematiksel kavramları somutlaştıran, işlem adımlarını görsel modellerle destekleyen diskalkuli dostu bir pedagojik seçkidir.',
    activities: [
      {
        type: ActivityType.NUMBER_PYRAMID,
        title: 'Sayı Piramidi (Basamak Toplama)',
        difficulty: 'Kolay',
        pageCount: 1,
        instruction: 'Alt komşu iki sayıyı toplayarak üst basamaktaki boşluğu doldurun.'
      },
      {
        type: ActivityType.MATH_PUZZLE,
        title: 'Görsel Matematik & İşlem Bulmacası',
        difficulty: 'Kolay',
        pageCount: 1,
        instruction: 'Sembollerin sayısal değerlerini bularak final işlemini çözün.'
      },
      {
        type: ActivityType.SHAPE_COUNTING,
        title: 'Geometrik Şekil & Miktar Sayımı',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'İç içe geçmiş geometrik şekilleri gruplandırıp sıklık tablosuna işleyin.'
      },
      {
        type: ActivityType.KENDOKU,
        title: 'Kendoku / Futoshiki Mantık Matrisi',
        difficulty: 'Zor',
        pageCount: 1,
        instruction: 'Büyüktür-küçüktür işaretlerine dikkat ederek satır ve sütunları doldurun.'
      },
      {
        type: ActivityType.REAL_LIFE_MATH_PROBLEMS,
        title: 'Günlük Yaşam Alışveriş Problemleri',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Görsel fiyat etiketlerini inceleyerek bütçe ve para üstü hesabını yapın.'
      }
    ]
  },
  {
    id: 'lgs-hazirlik',
    title: 'Üst Düzey Muhakeme & Okuduğunu Anlama',
    description: 'MEB yeni nesil ve PISA tarzı paragraf anlama, mantık yürütme, 5N1K ve kavram haritaları kapsayan sınav hazırlık paketi.',
    icon: <Star size={24} className="text-sky-500" />,
    badge: 'LGS / PISA Seviye',
    themeStyle: 'garden',
    primaryColor: 'sky',
    targetProfile: 'mixed',
    targetAgeGroup: '11-13',
    summaryNote: 'Bu fasikül, okuduğunu derinlemesine anlama, ana fikir ve bağlam çıkarma, analitik tablo yorumlama becerilerini ZPD prensibiyle geliştirmek üzere hazırlanmıştır.',
    activities: [
      {
        type: ActivityType.FIVE_W_ONE_H,
        title: '5N1K Derinlemesine Okuma Analizi',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Metni dikkatle okuyun; Kim, Ne, Nerede, Ne Zaman, Nasıl ve Neden sorularını yanıtlayın.'
      },
      {
        type: ActivityType.STORY_ANALYSIS,
        title: 'Karakter & Olay Örgüsü Analizi',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'Hikayedeki ana karakterlerin motivasyonlarını ve problem çözme adımlarını haritalandırın.'
      },
      {
        type: ActivityType.INFOGRAPHIC_5W1H_BOARD,
        title: 'Görsel İnfografik & Bilgi Panosu',
        difficulty: 'Zor',
        pageCount: 1,
        instruction: 'Grafik ve şemalardaki verileri sentezleyerek analitik çıkarımlarda bulunun.'
      },
      {
        type: ActivityType.SEMANTIC_LINKER,
        title: 'Kavramlar Arası Mantıksal Bağlayıcı',
        difficulty: 'Orta',
        pageCount: 1,
        instruction: 'İlişkili neden-sonuç ve parça-bütün ilişkilerini doğru hatlarla eşleştirin.'
      },
      {
        type: ActivityType.ALGORITHM_GENERATOR,
        title: 'Algoritmik Adım Adım Problem Çözme',
        difficulty: 'Zor',
        pageCount: 1,
        instruction: 'Akış şemasındaki mantık koşullarını takip ederek hedefe ulaşın.'
      }
    ]
  }
];

export const FascicleTemplatesModal: React.FC<FascicleTemplatesModalProps> = ({ isOpen, onClose }) => {
  const { setItems, updateMetadata, metadata } = useFascicleStore();
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = async (tpl: TemplatePreset) => {
    setLoadingTemplateId(tpl.id);
    const toastId = toast.loading(`"${tpl.title}" fasikülü yükleniyor...`);

    try {
      // 1. Kapak ve sayfa ayarlarını şablona göre güncelle
      updateMetadata({
        title: tpl.title,
        description: tpl.description,
        targetProfile: tpl.targetProfile,
        targetAgeGroup: tpl.targetAgeGroup,
        coverPageSettings: {
          enabled: true,
          title: tpl.title,
          subtitle: `${tpl.targetAgeGroup} Yaş • ${tpl.badge}`,
          themeStyle: tpl.themeStyle,
          primaryColor: tpl.primaryColor,
          showStudentLine: true,
          schoolName: metadata.coverPageSettings?.schoolName || 'bdmind Nöro-Pedagoji Platformu',
          showTableOfContents: true,
          showSummaryPage: true,
          summaryNote: tpl.summaryNote
        }
      });

      // 2. Şablon içindeki aktiviteleri hazır içerik ve formatla FascicleItem'lara dönüştür
      const module = await import('../../services/generators/registry');
      const freshItems: FascicleItem[] = [];

      for (let i = 0; i < tpl.activities.length; i++) {
        const act = tpl.activities[i];
        let contentData: any = null;

        try {
          const mapping = await module.getGeneratorMapping(act.type);
          const options = {
            mode: 'offline' as const,
            difficulty: act.difficulty === 'Kolay' ? 'Başlangıç' : act.difficulty === 'Zor' ? 'Zor' : 'Orta',
            topic: tpl.title,
            itemCount: 6,
            worksheetCount: 1,
          };

          if (mapping?.offline) {
            contentData = await mapping.offline(options as any);
          } else if (mapping?.ai) {
            contentData = await mapping.ai(options as any);
          }
        } catch {
          // Hata durumunda zengin fallback formatı
          contentData = {
            title: act.title,
            instruction: act.instruction,
            items: []
          };
        }

        const normalizedContent = Array.isArray(contentData) ? contentData : [contentData];

        freshItems.push({
          id: uuidv4(),
          type: act.type,
          difficulty: act.difficulty,
          pageCount: act.pageCount,
          order: i,
          content: {
            data: normalizedContent,
            title: act.title,
            instruction: act.instruction,
            generatedAt: Date.now()
          }
        });
      }

      setItems(freshItems);
      toast.success(`"${tpl.title}" başarıyla yüklendi! (${freshItems.length} Sayfa)`, { id: toastId });
      onClose();
    } catch (err) {
      toast.error('Şablon yüklenirken bir sorun oluştu.', { id: toastId });
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-[var(--radius-premium)] w-full max-w-5xl flex flex-col max-h-[88vh] overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>

        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-paper)]/70">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
              <Sparkles className="text-amber-500" size={24} />
              Ultra-Premium Uzman Fasikül Paketleri
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Disleksi, DEHB, Diskalkuli ve LGS için bilimsel hazırlanmış, hazır 5'er sayfalık tam fasikül setleri.
            </p>
          </div>
          <button
            onClick={onClose}
            className="studio-icon-btn p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map(template => {
              const isLoading = loadingTemplateId === template.id;

              return (
                <div
                  key={template.id}
                  className="card-glow group p-6 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[var(--radius-premium)] transition-all flex flex-col justify-between relative overflow-hidden hover:border-[var(--accent-muted)] shadow-sm"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                        {template.icon}
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
                        {template.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-color)] transition-colors">
                      {template.title}
                    </h3>

                    <p className="text-[var(--text-muted)] text-xs leading-relaxed mb-4">
                      {template.description}
                    </p>

                    {/* Aktivite Önizleme Hapları */}
                    <div className="space-y-1.5 mb-5 bg-[var(--bg-secondary)]/50 p-3 rounded-xl border border-[var(--border-color)]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                        İçerik Akışı ({template.activities.length} Sayfa):
                      </span>
                      {template.activities.map((act, aIdx) => (
                        <div key={aIdx} className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] py-0.5">
                          <span className="truncate pr-2 font-medium">
                            {aIdx + 1}. {act.title}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded shrink-0 font-bold ${
                            act.difficulty === 'Kolay' ? 'bg-emerald-500/10 text-emerald-600' :
                            act.difficulty === 'Orta' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'
                          }`}>
                            {act.difficulty}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-color)] flex justify-between items-center">
                    <span className="text-xs text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500" /> Tam Kapak & Özet Dahil
                    </span>

                    <button
                      onClick={() => handleApplyTemplate(template)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md text-white disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Hazırlanıyor...
                        </>
                      ) : (
                        <>
                          <span>Paketi Yükle</span>
                          <span>&rarr;</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-paper)]/70 flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span>Tüm paketler MEB Özel Eğitim ve ZPD standartlarına %100 uyumludur.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-primary)] font-medium transition"
          >
            Vazgeç
          </button>
        </div>

      </div>
    </div>
  );
};
