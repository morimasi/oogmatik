import { useState } from 'react';
import { 
  ActivityType, 
  CollectionItem, 
  WorkbookSettings, 
  WorksheetData, 
  AssessmentReport, 
  StudentProfile, 
  StyleSettings, 
  User,
  View
} from '../types';
import { ACTIVITIES } from '../constants';
import { autoGenerateService } from '../services/autoGenerateService';

export const useWorkbookActions = (
  styleSettings: StyleSettings,
  selectedActivity: ActivityType | null,
  worksheetData: WorksheetData | null,
  user: User | null,
  studentProfile: StudentProfile | null,
  toast: any,
  setIsLoading: (loading: boolean) => void,
  navigateTo: (view: View) => void
) => {
  const [workbookItems, setWorkbookItems] = useState([] as CollectionItem[]);
  const [workbookSettings, setWorkbookSettings] = useState({
    title: 'Çalışma Kitapçığı',
    studentName: '',
    schoolName: '',
    year: new Date().getFullYear().toString(),
    teacherNote: '',
    theme: 'modern',
    accentColor: '#4f46e5',
    coverStyle: 'centered',
    showTOC: true,
    showPageNumbers: true,
    showWatermark: false,
    watermarkOpacity: 0.05,
    showBackCover: true,
  } as WorkbookSettings);

  const handleAddToWorkbookGeneral = (
    activityTypeOrData: ActivityType | Record<string, unknown>, 
    data?: Record<string, unknown> | WorksheetData
  ) => {
    let finalType: ActivityType;
    let finalData: any;

    if (data === undefined) {
      finalData = activityTypeOrData;
      finalType = finalData?.activityType || finalData?.type || selectedActivity;
    } else {
      finalType = activityTypeOrData as ActivityType;
      finalData = data;
    }

    if (finalType && finalData) {
      let dataArray: Record<string, unknown>[] = [];

      // ═══════════════════════════════════════════════════════════════
      // ÇOK SAYFALI VERİ ALGILAMA, BÖLME VE AÇMA (ADVANCED FLATTENING v2)
      // Her stüdyonun farklı veri yapısını doğru sayfalandırır.
      // ═══════════════════════════════════════════════════════════════

      // Sayfalanabilir liste anahtarları ve her biri için ideal sayfa başına öğe sayısı  
      const PAGINATION_CONFIG: Record<string, number> = {
        sorular: 4,        // Sınav soruları — A4'te max 4 uzun soru sığar
        questions: 4,      // İngilizce eşdeğeri
        items: 6,          // Genel aktivite öğeleri
        activities: 4,     // Alt aktiviteler
        exercises: 5,      // Egzersizler
        problems: 4,       // Matematik problemleri
        words: 15,         // Kelime listeleri
        drills: 8,         // Matematik drilleri
        paragraphs: 2,     // Paragraf bazlı içerikler
        sections: 3,       // Bölümler
      };

      const listKeys = Object.keys(PAGINATION_CONFIG);

      // 1. DOĞRUDAN LİSTE ANAHTARI BULMAYA ÇALIŞ
      let foundListKey = listKeys.find(key => finalData[key] && Array.isArray(finalData[key]) && finalData[key].length > 0);

      // 2. DERİN İÇ İÇE YAPI TESPİTİ: data: [sinavObj] kalıbı (Sınav Stüdyoları)
      //    MatSinavStudyosu: { title, data: [aktifSinav], printConfig }
      //    Bu kalıpta gerçek soru listesi data[0].sorular'dadır
      let deepUnwrappedData = finalData;
      if (!foundListKey && finalData.data && Array.isArray(finalData.data) && finalData.data.length === 1) {
        const innerObj = finalData.data[0];
        if (innerObj && typeof innerObj === 'object') {
          const innerListKey = listKeys.find(key => innerObj[key] && Array.isArray(innerObj[key]) && innerObj[key].length > 0);
          if (innerListKey) {
            // İç objeyi düzleştir: dış envelope bilgilerini koru, iç objeyi yaygınlaştır
            deepUnwrappedData = {
              ...finalData,
              data: undefined, // wrapper array'i kaldır
              ...innerObj,
              title: finalData.title || innerObj.title || innerObj.baslik,
              printConfig: finalData.printConfig || innerObj.printConfig,
            };
            foundListKey = innerListKey;
          }
        }
      }

      // 3. SAYFALANDIRMA KARARI — Tüm çok sayfalı veriler TEK bir CollectionItem
      //    altında data.pages dizisi olarak gruplanır. Workbook.tsx pages dizisini
      //    algılar ve her sayfayı ayrı ayrı render eder.
      // =========================================================================
      
      // Yardımcı: her sayfaya parent özellikleri ve pageIndex ekler
      const mergePageData = (pages: Record<string, unknown>[], base: Record<string, unknown>, mergeParentProps = true) =>
        pages.map((p, i) => ({
          ...(mergeParentProps ? base : {}),
          ...p,
          pageIndex: i,
          title: p.title || `${(base.title || base.baslik || 'Etkinlik')} - Sayfa ${i + 1}`,
        }));

      if (Array.isArray(finalData)) {
        // Doğrudan array olarak gelen veri → tek item'da pages dizisi
        const mergedPages = mergePageData(finalData, {}, false);
        dataArray = [{
          title: (finalData[0] as any)?.title || 'Etkinlik',
          pages: mergedPages,
        }];

      } else if (deepUnwrappedData.pages && Array.isArray(deepUnwrappedData.pages)) {
        // pages anahtarı olan yapı → parent props her sayfaya merge edilir
        const mergedPages = mergePageData(
          deepUnwrappedData.pages as Record<string, unknown>[],
          deepUnwrappedData,
          true
        );
        dataArray = [{
          ...deepUnwrappedData,
          title: deepUnwrappedData.title || (mergedPages[0] as any)?.title || 'Etkinlik',
          pages: mergedPages,
        }];

      } else if (deepUnwrappedData.sheets && Array.isArray(deepUnwrappedData.sheets)) {
        // sheets anahtarı olan yapı → pages'e dönüştür
        const mergedSheets = mergePageData(
          deepUnwrappedData.sheets as Record<string, unknown>[],
          deepUnwrappedData,
          true
        );
        dataArray = [{
          ...deepUnwrappedData,
          title: deepUnwrappedData.title || (mergedSheets[0] as any)?.title || 'Etkinlik',
          pages: mergedSheets,
        }];

      } else if (foundListKey) {
        // Listeli veri: itemsPerPage'e göre otomatik sayfalandır, TEK item'da grupla
        const sourceData = deepUnwrappedData;
        const itemsPerPage = PAGINATION_CONFIG[foundListKey] || 6;
        const allItems = sourceData[foundListKey] as unknown[];
        
        if (allItems.length > itemsPerPage) {
          const chunks: Record<string, unknown>[] = [];
          for (let i = 0; i < allItems.length; i += itemsPerPage) {
            const chunk = allItems.slice(i, i + itemsPerPage);
            const pageNum = Math.floor(i / itemsPerPage) + 1;
            const totalPages = Math.ceil(allItems.length / itemsPerPage);
            chunks.push({
              ...sourceData,
              [foundListKey]: chunk,
              title: `${sourceData.title || sourceData.baslik || 'Etkinlik'} - Sayfa ${pageNum}/${totalPages}`,
              pageIndex: pageNum - 1,
              _totalPages: totalPages,
            });
          }
          dataArray = [{
            ...sourceData,
            title: sourceData.title || sourceData.baslik || 'Etkinlik',
            pages: chunks,
          }];
        } else {
          dataArray = [sourceData];
        }

      } else if (deepUnwrappedData.layout && Array.isArray(deepUnwrappedData.layout)) {
        // ReadingStudio: layout öğelerini pageIndex'e göre grupla
        const layoutItems = deepUnwrappedData.layout as Array<{ pageIndex?: number; [key: string]: unknown }>;
        const pageGroups = new Map<number, typeof layoutItems>();
        
        layoutItems.forEach(item => {
          const pageIdx = item.pageIndex ?? 0;
          if (!pageGroups.has(pageIdx)) pageGroups.set(pageIdx, []);
          pageGroups.get(pageIdx)!.push(item);
        });

        if (pageGroups.size > 1) {
          const sortedPages = [...pageGroups.entries()].sort((a, b) => a[0] - b[0]);
          const layoutPages = sortedPages.map(([, items], i) => ({
            ...deepUnwrappedData,
            layout: items,
            pageIndex: i,
            title: `${deepUnwrappedData.title || 'Okuma Etkinliği'} - Sayfa ${i + 1}`,
          }));
          dataArray = [{
            ...deepUnwrappedData,
            title: deepUnwrappedData.title || 'Okuma Etkinliği',
            pages: layoutPages,
          }];
        } else {
          dataArray = [deepUnwrappedData];
        }

      } else {
        // Tek sayfa — hiçbir çok sayfalı kalıp algılanmadı
        dataArray = [deepUnwrappedData];
      }

      // Boş array koruması
      if (dataArray.length === 0) {
        dataArray = [finalData];
      }

      const newItems: CollectionItem[] = dataArray.map((sheet: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        activityType: finalType,
        data: sheet,
        settings: { ...styleSettings },
        title: (typeof sheet.title === 'string' ? sheet.title : '') 
          || (typeof sheet.baslik === 'string' ? sheet.baslik : '')
          || ACTIVITIES.find((a) => a.id === finalType)?.title 
          || 'Etkinlik',
      }));

      setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);

      const btn = document.getElementById('add-to-wb-btn');
      if (btn) {
        btn.classList.add('scale-125', 'bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
      }

      const totalPages = dataArray.length === 1 && Array.isArray(dataArray[0]?.pages)
        ? dataArray[0]!.pages!.length
        : dataArray.length;
      toast.success(`${totalPages} sayfa kitapçığa başarıyla eklendi!`);
    }
  };

  const handleAddToWorkbook = () => {
    if (selectedActivity && worksheetData) {
      handleAddToWorkbookGeneral(selectedActivity, worksheetData);
    }
  };

  const handleAddDirectToWorkbook = (item: CollectionItem) => {
    // Çok sayfalı veriyi algıla ve normalize et
    const raw = item.data;
    let normalizedData: unknown = raw;

    if (raw && typeof raw === 'object') {
      if (Array.isArray(raw)) {
        // Doğrudan array → pages dizisi olarak grupla
        normalizedData = { pages: raw };
      } else if (Array.isArray((raw as Record<string, unknown>).pages)) {
        // Zaten pages var → dokunma
      } else if (Array.isArray((raw as Record<string, unknown>).sheets)) {
        // sheets → pages'e dönüştür
        normalizedData = { ...raw, pages: (raw as Record<string, unknown>).sheets };
      }
    }

    const newItems: CollectionItem[] = [
      {
        id: crypto.randomUUID(),
        activityType: item.activityType,
        data: normalizedData as CollectionItem['data'],
        settings: { ...styleSettings, ...item.settings },
        title: item.title,
      },
    ];
    setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);
  };

  const handleAutoGenerateWorkbook = async (report: AssessmentReport) => {
    setIsLoading(true);
    navigateTo('workbook');

    try {
      const items = await autoGenerateService.generateWorkbookFromReport(report, user, studentProfile, styleSettings);
      setWorkbookItems(items);
      setWorkbookSettings((prev: WorkbookSettings) => ({
        ...prev,
        title: `Kişisel Gelişim Planı`,
        studentName: studentProfile?.name || '',
        teacherNote: 'Bu kitapçık, yapılan değerlendirme sonucunda belirlenen ihtiyaçlara yönelik olarak yapay zeka tarafından otomatik oluşturulmuştur.',
      }));
    } catch {
      toast.error('Otomatik kitapçık oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workbookItems,
    setWorkbookItems,
    workbookSettings,
    setWorkbookSettings,
    handleAddToWorkbookGeneral,
    handleAddToWorkbook,
    handleAddDirectToWorkbook,
    handleAutoGenerateWorkbook,
  };
};
