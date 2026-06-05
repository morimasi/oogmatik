import { TourStep } from '../components/TourGuide';

export const tourSteps: TourStep[] = [
  {
    targetId: 'tour-logo',
    title: 'Hoş Geldiniz',
    content: 'Bursa Disleksi EduMind platformuna hoş geldiniz. Hızlı bir tura başlayalım mı?',
    position: 'bottom',
  },
  {
    targetId: 'tour-search',
    title: 'Etkinlik Arama',
    content: 'İstediğiniz etkinliği veya konuyu buradan hızla bulabilirsiniz.',
    position: 'bottom',
  },
  {
    targetId: 'tour-sidebar',
    title: 'Kategoriler',
    content: 'Sol menüden etkinlik kategorilerine ulaşabilirsiniz.',
    position: 'right',
  },
  {
    targetId: 'tour-workbook-btn',
    title: 'Çalışma Kitapçığı',
    content: 'Seçtiğiniz etkinlikleri buraya ekleyerek tek bir PDF kitapçık oluşturabilirsiniz.',
    position: 'bottom',
  },
  {
    targetId: 'tour-ocr-btn',
    title: 'Akıllı Tarayıcı (OCR)',
    content: 'Fiziksel kağıtları tarayıp dijitalleştirmek için bu ikonu kullanın.',
    position: 'right',
  },
  {
    targetId: 'tour-history-btn',
    title: 'Geçmiş',
    content: 'Daha önce oluşturduğunuz etkinliklere buradan ulaşabilirsiniz.',
    position: 'bottom',
  },
];
