import { SingleWorksheetData, WorksheetBlock } from '../../types';

export const generateHeceParkuru = async (options: unknown): Promise<SingleWorksheetData[]> => {
  // Görsel İşitsel Eşleme ve Hece Parkuru mantığı

  const blocks: WorksheetBlock[] = [
    {
      type: 'text',
      content: 'Eksik heceleri bularak parkuru tamamla:',
      style: { fontWeight: 'bold', fontSize: 18 },
    },
    {
      type: 'grid',
      content: [
        ['KA', '___', 'M', '=> KALEM'],
        ['MA', '___', 'A', '=> MASA'],
        ['Kİ', '___', 'P', '=> KİTAP'],
        ['ÇO', '___', 'K', '=> ÇOCUK'],
      ],
      style: {
        textAlign: 'center',
      },
    },
  ];

  const worksheet: SingleWorksheetData = {
    title: 'Hece Parkuru',
    instruction: 'Kelimeleri tamamlamak için boş bırakılan yerlere uygun hece veya harfleri yaz.',
    pedagogicalNote:
      'Görsel-işitsel eşleme ve fonolojik farkındalık becerilerini destekler. Heceleri bütünleştirme hızını artırır.',
    blocks: blocks,
  };

  return [worksheet];
};
