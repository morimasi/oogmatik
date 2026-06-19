import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  ActivityType, 
  CollectionItem, 
  WorkbookSettings, 
  WorksheetData, 
  AssessmentReport, 
  StudentProfile, 
  StyleSettings, 
  User,
  View,
  WorkbookPageContract,
  SingleWorksheetData
} from '../types';
import { ACTIVITIES } from '../constants';
import { autoGenerateService } from '../services/autoGenerateService';
import { paginationService } from '../services/paginationService';

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
    pageSize: 'A4',
    orientation: 'portrait',
    margin: 15,
    layoutDensity: 'comfortable',
    fontFamily: 'Lexend',
    lineHeight: 1.6,
    wordSpacing: 2,
    dyslexiaMode: false,
    highlightSyllables: false,
  } as WorkbookSettings);

  // ═══════════════════════════════════════════════════════════════
  // YENİ CORE KONTRAK: addToWorkbook
  // ═══════════════════════════════════════════════════════════════
  const addToWorkbook = (contract: WorkbookPageContract) => {
    const newItem: CollectionItem = {
      id: uuidv4(),
      activityType: contract.activityType,
      data: contract, // Doğrudan sözleşmeyi data olarak kaydediyoruz
      settings: { ...styleSettings },
      title: contract.title || 'Etkinlik',
    };

    setWorkbookItems((prev: CollectionItem[]) => [...prev, newItem]);

    const btn = document.getElementById('add-to-wb-btn');
    if (btn) {
      btn.classList.add('scale-125', 'bg-green-500', 'text-white');
      setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
    }

    toast.success(`${contract.pages.length} sayfa kitapçığa başarıyla eklendi!`);
  };

  // ═══════════════════════════════════════════════════════════════
  // GERİYE UYUMLULUK: handleAddToWorkbookGeneral
  // ═══════════════════════════════════════════════════════════════
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

    if (!finalType || !finalData || (Array.isArray(finalData) && finalData.length === 0)) return;

    const titleStr = (Array.isArray(finalData) ? finalData[0]?.title : finalData?.title) 
      || finalData?.baslik 
      || ACTIVITIES.find((a) => a.id === finalType)?.title 
      || 'Global Etkinlik';

    // Eğer veri zaten WorkbookPageContract formatındaysa (veya pages dizisi varsa)
    if (finalData.pages && Array.isArray(finalData.pages)) {
      const contract: WorkbookPageContract = {
        activityType: finalType,
        title: titleStr as string,
        pages: finalData.pages.map((p: any, i: number) => ({
          pageIndex: i,
          pageTitle: `${titleStr} - Sayfa ${i + 1}`,
          data: p.data || p
        }))
      };
      addToWorkbook(contract);
      return;
    }

    if (Array.isArray(finalData)) {
      // Eğer array'in elemanları "contentChunks" gibi önceden sayfalara bölünmüşse (örn: KelimeCumleStudio)
      // veya MathStudio gibi exports'lardan geliyorsa
      // Gelen array elemanlarında zaten sayfalama ile ilgili bir özellik var mı diye bakalım
      const firstElem = finalData[0];
      const isPreChunked = firstElem && (firstElem.itemsPerPage || firstElem.isAlreadyChunked || firstElem._currentPage !== undefined);

      let pagedData: any = finalData;
      if (!isPreChunked) {
        pagedData = paginationService.process(finalData as SingleWorksheetData[], finalType, styleSettings);
      }
      
      const contract: WorkbookPageContract = {
        activityType: finalType,
        title: titleStr as string,
        pages: pagedData.map((pageData: any, index: number) => ({
          pageIndex: index,
          pageTitle: `${titleStr} - Sayfa ${index + 1}`,
          data: pageData
        }))
      };
      
      addToWorkbook(contract);
    } else {
      // It's a single object without contract format, fallback as a single page
      const contract: WorkbookPageContract = {
        activityType: finalType,
        title: titleStr as string,
        pages: [{
          pageIndex: 0,
          pageTitle: titleStr as string,
          data: finalData
        }]
      };
      
      addToWorkbook(contract);
    }
  };

  const handleAddToWorkbook = () => {
    if (selectedActivity && worksheetData && (!Array.isArray(worksheetData) || worksheetData.length > 0)) {
      handleAddToWorkbookGeneral(selectedActivity, worksheetData);
    }
  };

  const handleAddDirectToWorkbook = (item: CollectionItem) => {
    // If it's old structure, convert it to a contract if possible
    const raw = item.data;
    let contract: WorkbookPageContract;
    
    if (raw && typeof raw === 'object' && 'pages' in raw && Array.isArray((raw as any).pages)) {
      if ((raw as any).pages[0] && 'pageIndex' in (raw as any).pages[0]) {
         contract = raw as WorkbookPageContract; 
      } else {
         contract = {
           activityType: item.activityType,
           title: item.title,
           pages: (raw as any).pages.map((p: any, i: number) => ({
             pageIndex: i,
             pageTitle: `${item.title} - Sayfa ${i + 1}`,
             data: p
           }))
         };
      }
    } else {
       contract = {
        activityType: item.activityType,
        title: item.title,
        pages: [{
          pageIndex: 0,
          pageTitle: item.title,
          data: raw as Record<string, unknown> | SingleWorksheetData
        }]
       }
    }
    addToWorkbook(contract);
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
    addToWorkbook // YENİ EKLENDİ
  };
};
