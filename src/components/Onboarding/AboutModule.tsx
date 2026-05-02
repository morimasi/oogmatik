import React, { useState } from 'react';
import { X, Users, Target, Award, Globe, Heart, Mail, Twitter, Linkedin, Github, CheckCircle, TrendingUp } from 'lucide-react';

export const AboutModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('mission');

  const stats = [
    { label: 'Aktif Öğrenci', value: '50K+', icon: Users, color: 'blue' },
    { label: 'Oluşturulan Etkinlik', value: '1M+', icon: Target, color: 'green' },
    { label: 'Eğitim Kurumu', value: '500+', icon: Award, color: 'purple' },
    { label: 'Ülke', value: '25+', icon: Globe, color: 'orange' }
  ];

  const team = [
    { name: 'Dr. Elif Yıldız', role: 'Kurucu & Pedagoji Direktörü', avatar: '👩‍🏫' },
    { name: 'Ahmet Kaya', role: 'Teknoloji Direktörü', avatar: '👨‍💻' },
    { name: 'Selin Arslan', role: 'AI Direktörü', avatar: '👩‍🔬' },
    { name: 'Bora Demir', role: 'Ürün Direktörü', avatar: '👨‍🎨' }
  ];

  const values = [
    { icon: Heart, title: 'Erişilebilirlik', description: 'Eğitimi herkes için ulaşılabilir kılıyoruz' },
    { icon: Target, title: 'İnovasyon', description: 'AI ile öğrenme deneyimini yeniden tanımlıyoruz' },
    { icon: Users, title: 'Topluluk', description: 'Öğretmenler ve öğrenciler için güçlü bir topluluk oluşturuyoruz' },
    { icon: Award, title: 'Kalite', description: 'En yüksek pedagojik standartları koruyoruz' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-zinc-200">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Platform Hakkımızda</h2>
              <p className="text-xs text-zinc-500">Eğitimde geleceği birlikte inşa ediyoruz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-600" />
          </button>
        </div>

        {/* Stats - Compact Grid */}
        <div className="p-4 border-b border-zinc-100">
          <div className="grid grid-cols-4 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <p className="text-lg font-bold text-zinc-900">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-100">
          {[
            { id: 'mission', label: 'Misyonumuz' },
            { id: 'team', label: 'Ekibimiz' },
            { id: 'values', label: 'Değerlerimiz' },
            { id: 'contact', label: 'İletişim' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'mission' && (
            <div className="space-y-6">
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold text-zinc-900 mb-4">Eğitimde Fırsat Eşitliği İçin</h3>
                <p className="text-zinc-600 leading-relaxed mb-6">
                  Oogmatik, özel öğrenme güçlüğü yaşayan çocuklar için geliştirilmiş AI destekli eğitim platformudur. 
                  Disleksi, DEHB ve diğer öğrenme farklılıklarına sahip öğrencilerin potansiyellerini tam olarak ortaya çıkarmalarını sağlıyoruz.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
                    <h4 className="font-bold text-zinc-900 mb-1">Kişiselleştirme</h4>
                    <p className="text-sm text-zinc-600">Her öğrenciye özel öğrenme yolları</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
                    <h4 className="font-bold text-zinc-900 mb-1">İlerleme Takibi</h4>
                    <p className="text-sm text-zinc-600">Detaylı analiz ve raporlama</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Heart className="w-8 h-8 text-purple-600 mb-2" />
                    <h4 className="font-bold text-zinc-900 mb-1">Erişilebilirlik</h4>
                    <p className="text-sm text-zinc-600">Herkes için kullanılabilir platform</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-zinc-900 text-center mb-6">Kurucu Ekibimiz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {team.map((member, index) => (
                  <div key={index} className="text-center p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                      {member.avatar}
                    </div>
                    <h4 className="font-bold text-zinc-900">{member.name}</h4>
                    <p className="text-sm text-zinc-600">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-zinc-900 text-center mb-6">Temel Değerlerimiz</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-white border border-zinc-200 rounded-lg">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 mb-1">{value.title}</h4>
                        <p className="text-sm text-zinc-600">{value.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-zinc-900 mb-4">Bize Ulaşın</h3>
                <p className="text-zinc-600 mb-6">
                  Sorularınız, önerileriniz veya iş birliği talepleriniz için bizimle iletişime geçin.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <Mail className="w-8 h-8 text-zinc-600 mb-2 mx-auto" />
                    <p className="text-sm font-medium text-zinc-900">E-posta</p>
                    <p className="text-xs text-zinc-600">info@oogmatik.com</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <Phone className="w-8 h-8 text-zinc-600 mb-2 mx-auto" />
                    <p className="text-sm font-medium text-zinc-900">Telefon</p>
                    <p className="text-xs text-zinc-600">+90 212 555 0123</p>
                  </div>
                  <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <Globe className="w-8 h-8 text-zinc-600 mb-2 mx-auto" />
                    <p className="text-sm font-medium text-zinc-900">Adres</p>
                    <p className="text-xs text-zinc-600">İstanbul, Türkiye</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-lg flex items-center justify-center transition-colors">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center transition-colors">
                    <Github className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">© 2026 Oogmatik EdTech Solutions. Tüm hakları saklıdır.</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
