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
    toast('Şablon içerikleri henüz hazır değil. Çok yakında eklenecek.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-[var(--radius-premium)] w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>

        {/* Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-paper)]/50">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Fasikül Şablonları</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">Önceden tasarlanmış hazır uzman paketleri ile tek tıkla fasikül oluşturun.</p>
          </div>
          <button
            onClick={onClose}
            className="studio-icon-btn p-2 rounded-xl"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map(template => (
              <div
                key={template.id}
                onClick={() => handleApplyTemplate(template.id)}
                className="card-glow group p-6 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[var(--radius-premium)] cursor-pointer transition-all flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border" style={{ backgroundColor: 'var(--surface-glass)', color: 'var(--text-muted)', borderColor: 'var(--border-color)' }}>
                  {template.badge}
                </div>
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {template.icon}
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{template.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{template.description}</p>
                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex justify-between items-center text-xs text-[var(--text-muted)] font-medium">
                  <span>5 Sayfa</span>
                  <span className="px-3 py-1 rounded-full transition-colors" style={{ color: 'var(--accent-color)' }}>Yükle &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
