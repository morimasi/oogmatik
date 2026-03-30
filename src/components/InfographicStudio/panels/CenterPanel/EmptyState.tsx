import React from 'react';
import { LayoutTemplate } from 'lucide-react';

export const EmptyState: React.FC = () => {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/50 h-full">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">
                İnfografik Üretimine Başlayın
            </h3>
            <p className="text-sm max-w-sm">
                Sol panelden bir kategori ve şablon seçerek infografik oluşturabilirsiniz.
                Klinik içerikler için Dr. Ahmet Kaya'nın onayladığı onaylı havuz kullanılmaktadır.
            </p>
        </div>
    );
};
