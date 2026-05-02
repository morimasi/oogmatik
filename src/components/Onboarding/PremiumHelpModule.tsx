import React, { useState } from 'react';
import { X, Search, MessageCircle, Phone, Mail, Star, Clock, CheckCircle, ExternalLink } from 'lucide-react';

export const PremiumHelpModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');

  const quickActions = [
    { icon: MessageCircle, label: 'Canlı Destek', color: 'blue', description: 'Anında yanıt' },
    { icon: Mail, label: 'E-posta', color: 'green', description: '24 saat içinde' },
    { icon: Phone, label: 'Telefon', color: 'purple', description: 'İş saatleri içinde' },
    { icon: Star, label: 'Premium Destek', color: 'yellow', description: 'Öncelikli hizmet' }
  ];

  const faqCategories = [
    {
      title: 'Genel Sorular',
      items: [
        'Nasıl başlanır?',
        'Fiyatlandırma',
        'Özellikler',
        'Sistem gereksinimleri'
      ]
    },
    {
      title: 'Teknik Destek',
      items: [
        'Giriş sorunları',
        'Etkinlik oluşturma',
        'AI asistan',
        'Export işlemleri'
      ]
    },
    {
      title: 'Eğitim',
      items: [
        'Video tutorial',
        'Dokümantasyon',
        'Webinar',
        'Workshop'
      ]
    }
  ];

  const recentTickets = [
    { id: '#12345', title: 'AI asistan kullanımı', status: 'resolved', time: '2 saat önce' },
    { id: '#12344', title: 'Export sorunu', status: 'pending', time: '5 saat önce' },
    { id: '#12343', title: 'Öğrenci ekleme', status: 'resolved', time: '1 gün önce' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-zinc-200">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Premium Yardım Masası</h2>
              <p className="text-xs text-zinc-500">7/24 destek hizmeti</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Search Bar - Compact */}
        <div className="p-4 border-b border-zinc-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Yardım merkezi içinde ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-zinc-100">
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className="p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:shadow-sm transition-all group"
                >
                  <div className={`w-8 h-8 bg-${action.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 text-${action.color}-600`} />
                  </div>
                  <p className="text-xs font-medium text-zinc-900">{action.label}</p>
                  <p className="text-xs text-zinc-500">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-64 border-r border-zinc-200 p-4">
            <div className="space-y-1">
              {[
                { id: 'chat', label: 'Canlı Destek', icon: MessageCircle },
                { id: 'faq', label: 'Sıkça Sorulanlar', icon: Search },
                { id: 'tickets', label: 'Destek Talepleri', icon: Mail },
                { id: 'docs', label: 'Dokümantasyon', icon: ExternalLink }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Canlı Destek</h3>
                  <p className="text-sm text-zinc-600 mb-4">Premium üyeler için anında yanıt</p>
                  <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Sohbeti Başlat
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">Sıkça Sorulanlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {faqCategories.map((category, index) => (
                    <div key={index} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                      <h4 className="text-sm font-bold text-zinc-900 mb-3">{category.title}</h4>
                      <ul className="space-y-2">
                        {category.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-xs text-zinc-600 hover:text-purple-600 cursor-pointer transition-colors">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-zinc-900">Destek Talepleri</h3>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors">
                    Yeni Talep
                  </button>
                </div>
                <div className="space-y-2">
                  {recentTickets.map((ticket) => (
                    <div key={ticket.id} className="p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-zinc-500">{ticket.id}</span>
                          <span className="text-sm font-medium text-zinc-900">{ticket.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            ticket.status === 'resolved' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-xs text-zinc-500">{ticket.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">Dokümantasyon</h3>
                  <p className="text-sm text-zinc-600 mb-4">Kapsamlı kullanım rehberleri</p>
                  <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Dokümantasyonu Aç
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Status */}
        <div className="p-3 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-zinc-600">Destek ekibi çevrimiçi</span>
            </div>
            <span className="text-xs text-zinc-500">Ortalama yanıt süresi: 2 dakika</span>
          </div>
        </div>
      </div>
    </div>
  );
};
