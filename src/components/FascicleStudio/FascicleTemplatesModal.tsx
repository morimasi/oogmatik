import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { X, FileText, Blocks, Brain, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface FascicleTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    id: 'disleksi-baslangic',
    title: 'Disleksi Başlangıç Paketi',
    description: 'Harf farkındalığı ve okuma hatalarını gidermeye odaklı 5 sayfalık temel set.',
    icon: <FileText size={24} className="text-blue-500" />,
    badge: 'Klinik Set'
  },
  {
    id: 'dikkat-guc-orta',
    title: 'Dikkat Güçlendirici Set (Orta)',
    description: 'DEHB profili için optimize edilmiş labirent ve gizli şifre bulmacaları.',
    icon: <Brain size={24} className="text-emerald-500" />,
    badge: 'Premium'
  },
  {
    id: 'matematik-diskalkuli',
    title: 'Diskalkuli Matematik Temeli',
    description: 'Sayısal miktarları görselleştiren ardışık işlem etkinlikleri.',
    icon: <Blocks size={24} className="text-indigo-500" />,
    badge: 'Analitik'
  },
  {
    id: 'lgs-hazirlik',
    title: 'LGS / PISA Mantık Taraması',
    description: 'Paragraf anlama ve mantık yürütme testlerinden oluşan sınav hazırlık fasikülü.',
    icon: <Star size={24} className="text-amber-500" />,
    badge: 'Sınav'
  }
];

export const FascicleTemplatesModal: React.FC<FascicleTemplatesModalProps> = ({ isOpen, onClose }) => {
  const { setItems } = useFascicleStore();

  if (!isOpen) return null;

  const handleApplyTemplate = (templateId: string) => {
    // Burada ileride template servisinden çekilen sayfalar setItems içerisine gömülecek.
    toast.success('Şablon seçici başarıyla entegre edildi. İçerik veritabanı bağlanıyor...');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-bold text-white">Fasikül Şablonları</h2>
            <p className="text-sm text-slate-400 mt-1">Önceden tasarlanmış hazır uzman paketleri ile tek tıkla fasikül oluşturun.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map(template => (
              <div 
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="group p-6 bg-slate-900 border border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer transition-all flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 px-2 py-1 bg-white/5 rounded text-[10px] font-black text-slate-300 uppercase tracking-widest border border-white/5">
                  {template.badge}
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {template.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{template.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{template.description}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-medium">
                  <span>5 Sayfa</span>
                  <span className="text-blue-400 group-hover:bg-blue-600 group-hover:text-white px-3 py-1 rounded-full transition-colors">Yükle &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
