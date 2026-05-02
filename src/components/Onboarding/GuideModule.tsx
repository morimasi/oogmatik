import React, { useState } from 'react';
import { X, ChevronRight, BookOpen, Lightbulb, Target, Zap } from 'lucide-react';

export const GuideModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      icon: BookOpen,
      title: 'Başlangıç Rehberi',
      description: 'Platformu hızlıca öğrenin',
      items: [
        'Dashboard navigasyonu',
        'İlk etkinliği oluşturma',
        'Öğrenci profilleri',
        'Temel özellikler'
      ]
    },
    {
      icon: Lightbulb,
      title: 'İpuçları & Püf Noktaları',
      description: 'Verimliliği artırın',
      items: [
        'Kısayollar ve hızlı erişim',
        'AI asistan kullanımı',
        'Şablonlar ve kütüphane',
        'En iyi uygulamalar'
      ]
    },
    {
      icon: Target,
      title: 'Hedef Belirleme',
      description: 'Öğrenme hedefleri oluşturun',
      items: [
        'Kişiselleştirilmiş planlar',
        'İlerleme takibi',
        'Başarı metrikleri',
        'Raporlama'
      ]
    },
    {
      icon: Zap,
      title: 'Hızlı Başlangıç',
      description: '5 dakikada hazır olun',
      items: [
        'Hızlı kurulum',
        'Demo etkinlikler',
        'Test modu',
        'Yayına alım'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-zinc-200">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Rehber</h2>
              <p className="text-xs text-zinc-500">Platform kullanım kılavuzu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Content - Compact Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const isActive = activeSection === index;
              
              return (
                <div
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-blue-200 shadow-md' 
                      : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-blue-600' : 'bg-zinc-100'
                    }`}>
                      <Icon className={`w-3 h-3 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900">{section.title}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">{section.description}</p>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="text-xs text-zinc-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Minimal */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              {activeSection + 1} / {sections.length} bölüm
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Rehberi Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
