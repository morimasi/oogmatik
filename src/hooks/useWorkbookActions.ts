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

      // ÇOK SAYFALI VERİ ALGILAMA, BÖLME VE AÇMA (ADVANCED FLATTENING)
      const listKeys = ['sorular', 'questions', 'items', 'activities'];
      const foundListKey = listKeys.find(key => finalData[key] && Array.isArray(finalData[key]));

      if (Array.isArray(finalData)) {
        dataArray = finalData;
      } else if (finalData.pages && Array.isArray(finalData.pages)) {
        dataArray = (finalData.pages as Record<string, unknown>[]).map((p, i: number) => ({
          ...finalData,
          pages: undefined,
          ...p,
          title: p.title || `${finalData.title || 'Etkinlik'} - Sayfa ${i + 1}`,
          pageIndex: i
        }));
      } else if (foundListKey && finalData[foundListKey].length > 6) {
        // OTOMATİK SAYFALANDIRMA (AUTO-PAGINATION)
        const itemsPerPage = 6;
        const items = finalData[foundListKey];
        for (let i = 0; i < items.length; i += itemsPerPage) {
          const chunk = items.slice(i, i + itemsPerPage);
          dataArray.push({
            ...finalData,
            [foundListKey]: chunk,
            title: `${finalData.title || 'Etkinlik'} - Sayfa ${Math.floor(i / itemsPerPage) + 1}`,
            pageIndex: Math.floor(i / itemsPerPage)
          });
        }
      } else {
        dataArray = [finalData];
      }

      const newItems: CollectionItem[] = dataArray.map((sheet: Record<string, unknown>) => ({
        id: crypto.randomUUID(),
        activityType: finalType,
        data: sheet,
        settings: { ...styleSettings },
        title: (typeof sheet.title === 'string' ? sheet.title : '') || ACTIVITIES.find((a) => a.id === finalType)?.title || 'Etkinlik',
      }));

      setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);

      const btn = document.getElementById('add-to-wb-btn');
      if (btn) {
        btn.classList.add('scale-125', 'bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
      }

      toast.success(`${dataArray.length} sayfa kitapçığa başarıyla eklendi!`);
    }
  };

  const handleAddToWorkbook = () => {
    if (selectedActivity && worksheetData) {
      handleAddToWorkbookGeneral(selectedActivity, worksheetData);
    }
  };

  const handleAddDirectToWorkbook = (item: CollectionItem) => {
    const newItems: CollectionItem[] = [
      {
        id: crypto.randomUUID(),
        activityType: item.activityType,
        data: item.data,
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
    } catch (_e) {
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
