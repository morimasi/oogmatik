import React, { useState } from 'react';
import { AdvancedStudent, PortfolioItem } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const PortfolioModule: React.FC<{
  student: AdvancedStudent;
  onUpdate: (data: any) => void;
}> = ({ student, onUpdate }) => {
  const toast = useToastStore();
  const [items, setItems] = useState<PortfolioItem[]>(student.portfolio || []);
  const [isUploading, setIsUploading] = useState(false);

  const handleFakeUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        title: `Taranmış Belge ${items.length + 1}`,
        description: 'Sınıf içi çalışma kağıdı.',
        date: new Date().toISOString(),
        type: 'image',
        url: 'https://placehold.co/600x400/png',
        tags: ['çalışma', 'sınıfiçi'],
        skillsDemonstrated: [],
        isPublic: false,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      onUpdate({ portfolio: updated });
      setIsUploading(false);
      toast.success('Belge portfolyoya eklendi.');
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if (confirm('Belgeyi silmek istediğinize emin misiniz?')) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      onUpdate({ portfolio: updated });
      toast.success('Belge silindi.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/20 transition-colors hover:border-indigo-400">
        <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-700">
          <i className="fa-solid fa-cloud-arrow-up text-3xl text-indigo-400"></i>
        </div>
        <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
          Yeni Materyal Yükle
        </h3>
        <p className="text-zinc-500 mb-6 text-sm max-w-md leading-relaxed">
          Öğrencinin fiziksel çalışmalarını fotoğraflayarak veya PDF raporlarını yükleyerek dijital
          portfolyo oluşturun.
        </p>
        <button
          onClick={handleFakeUpload}
          disabled={isUploading}
          className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {isUploading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> Yükleniyor...
            </>
          ) : (
            'Dosya Seç (Önizleme)'
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 text-4xl">
              {item.type === 'image' ? (
                <i className="fa-regular fa-image"></i>
              ) : (
                <i className="fa-solid fa-file-pdf"></i>
              )}
            </div>
            <div className="p-4">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">
                {item.title}
              </h4>
              <p className="text-[10px] font-bold text-zinc-500 mt-1">
                {new Date(item.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
            >
              <i className="fa-solid fa-trash-can text-xs"></i>
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-400 font-medium">
            Henüz materyal yüklenmemiş.
          </div>
        )}
      </div>
    </div>
  );
};
