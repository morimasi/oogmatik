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
      // Stüdyolar veriyi [ {...} ] içinde gönderebilir (Sınav, Sarı Kitap vb.)
      // Eğer tek elemanlı bir array ise ve o eleman bir objeyse, unwrap et.
      finalData = Array.isArray(data) && data.length === 1 && typeof data[0] === 'object' 
        ? data[0] 
        : data;
    }

    if (finalType && finalData && !(Array.isArray(finalData) && finalData.length === 0)) {
      let dataArray: Record<string, unknown>[] = [];

      // ═══════════════════════════════════════════════════════════════
      // ÇOK SAYFALI VERİ ALGILAMA VE OTOMATİK BÖLME (CHUNK ENGINE v3)
      // ═══════════════════════════════════════════════════════════════

      const PAGINATION_CONFIG: Record<string, number> = {
        sorular: 4,        // Sınav soruları (ideal yoğunluk)
        questions: 4,      
        items: 6,          
        activities: 4,     
        exercises: 5,      
        problems: 4,       
        words: 15,         
        drills: 8,         
        paragraphs: 2,     
        sections: 3,       
        blocks: 4,         
        data: 10,
        content: 1,        // Bazı stüdyolarda content tek sayfaya sığmalı
      };

      // 1. DERİN VERİ ÇÖZÜMLEME (Recursive Unwrapping)
      let deepUnwrappedData = finalData;
      
      // Bazı stüdyolar veriyi 'content' veya 'data' içine hapseder.
      if (deepUnwrappedData.content && typeof deepUnwrappedData.content === 'object' && !Array.isArray(deepUnwrappedData.content)) {
          deepUnwrappedData = {
              ...deepUnwrappedData,
              ...deepUnwrappedData.content,
              _originalContent: deepUnwrappedData.content // Yedekle
          };
      } else if (Array.isArray(deepUnwrappedData.data) && deepUnwrappedData.data.length === 1) {
          // data: [ {...} ] formatını da çöz
          deepUnwrappedData = {
              ...deepUnwrappedData,
              ...deepUnwrappedData.data[0],
              _originalData: deepUnwrappedData.data
          };
      }

      // 2. OTOMATİK LİSTE TESPİTİ
      let foundListKey: string | undefined = undefined;
      let maxLen = 0;

      // Hem ana seviyede hem de deepUnwrappedData seviyesinde array ara
      for (const key of Object.keys(deepUnwrappedData)) {
        if (Array.isArray(deepUnwrappedData[key]) && deepUnwrappedData[key].length > 0) {
          // Eğer bu anahtar PAGINATION_CONFIG içindeyse veya 'data'/'items' gibi jenerikse
          if (PAGINATION_CONFIG[key] || ['data', 'items', 'list', 'elements', 'sorular', 'questions'].includes(key)) {
            if (deepUnwrappedData[key].length > maxLen) {
              maxLen = deepUnwrappedData[key].length;
              foundListKey = key;
            }
          }
        }
      }

      // 3. SAYFALANDIRMA KARARI
      const itemsPerPage = foundListKey ? (PAGINATION_CONFIG[foundListKey] || 6) : 1;

      if (foundListKey && maxLen > itemsPerPage) {
        // ÇOK SAYFALI YAPI
        const allItems = deepUnwrappedData[foundListKey] as any[];
        const chunks: Record<string, unknown>[] = [];
        const totalPages = Math.ceil(allItems.length / itemsPerPage);

        for (let i = 0; i < allItems.length; i += itemsPerPage) {
          const chunk = allItems.slice(i, i + itemsPerPage);
          const pageNum = Math.floor(i / itemsPerPage) + 1;
          
          const pageObj = {
            ...deepUnwrappedData,
            [foundListKey]: chunk, // Sadece o sayfanın elemanlarını koy
            _isPage: true,
            pageIndex: pageNum - 1,
            _totalPages: totalPages,
            title: `${deepUnwrappedData.title || deepUnwrappedData.baslik || 'Etkinlik'} - Sayfa ${pageNum}/${totalPages}`
          };

          // KRİTİK: Renderer Uyumluluğu İçin 'content' Anahtarını Korumalıyız
          // Eğer renderer 'item.content' bekliyorsa, pageObj'in kendisini content olarak da sunalım.
          (pageObj as any).content = { ...pageObj };
          
          chunks.push(pageObj);
        }
        
        dataArray = [{
          ...deepUnwrappedData,
          title: deepUnwrappedData.title || deepUnwrappedData.baslik || 'Etkinlik',
          pages: chunks, // Workbook.tsx'in beklediği ana format
          _isMultiPage: true
        }];

      } else if (deepUnwrappedData.pages && Array.isArray(deepUnwrappedData.pages)) {
        // Zaten pages var
        dataArray = [{
          ...deepUnwrappedData,
          pages: deepUnwrappedData.pages.map((p: any, i: number) => {
            const pageObj = {
                ...deepUnwrappedData,
                ...p,
                pageIndex: i,
              };
            (pageObj as any).content = { ...pageObj };
            return pageObj;
          })
        }];
      } else if (deepUnwrappedData.sheets && Array.isArray(deepUnwrappedData.sheets)) {
        // sheets -> pages
        dataArray = [{
          ...deepUnwrappedData,
          pages: deepUnwrappedData.sheets.map((s: any, i: number) => {
            const pageObj = {
                ...deepUnwrappedData,
                ...s,
                pageIndex: i,
              };
            (pageObj as any).content = { ...pageObj };
            return pageObj;
          })
        }];
      } else {
        // TEK SAYFALIK YAPI
        dataArray = [deepUnwrappedData];
      }

      // 4. COLLECTION ITEM OLUŞTURMA
      const newItems: CollectionItem[] = dataArray
        .filter(item => item !== null)
        .map((item: any) => ({
          id: uuidv4(),
          activityType: finalType,
          data: item,
          settings: { ...styleSettings },
          title: item.title || item.baslik || ACTIVITIES.find(a => a.id === finalType)?.title || 'Etkinlik',
        }));

      setWorkbookItems((prev: CollectionItem[]) => [...prev, ...newItems]);

      // Görsel geri bildirim
      const btn = document.getElementById('add-to-wb-btn');
      if (btn) {
        btn.classList.add('scale-125', 'bg-green-500', 'text-white');
        setTimeout(() => btn.classList.remove('scale-125', 'bg-green-500', 'text-white'), 300);
      }

      const totalCreatedPages = (dataArray[0]?.pages as any[])?.length || 1;
      toast.success(`${totalCreatedPages} sayfa kitapçığa eklendi!`);
    }
  };

  const handleAddToWorkbook = () => {
    if (selectedActivity && worksheetData && (!Array.isArray(worksheetData) || worksheetData.length > 0)) {
      handleAddToWorkbookGeneral(selectedActivity, worksheetData);
    }
  };

  const handleAddDirectToWorkbook = (item: CollectionItem) => {
    // Çok sayfalı veriyi algıla ve normalize et
    const raw = item.data;
    let normalizedData: unknown = raw;

    if (Array.isArray(raw) && raw.length === 0) return;

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
        id: uuidv4(),
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
