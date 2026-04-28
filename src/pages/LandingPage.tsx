import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Zap, BookOpen, Users, Shield, Sparkles, ArrowRight, CheckCircle2, Star } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teachers' | 'therapists' | 'parents'>('teachers');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    viewport: { once: true },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">Oogmatik</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">Özellikler</a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition">Nasıl Çalışır</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Fiyatlandırma</a>
              <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
                Şimdi Başla
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeInUp} className="space-y-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full"
              >
                <Zap className="w-4 h-4 text-indigo-400" />
                <span className="text-sm text-indigo-300">AI Destekli Özel Eğitim Materyalleri</span>
              </motion.div>

              <h1 className="text-5xl sm:text-7xl font-bold leading-tight">
                Disleksi Dostu
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  Eğitim Materyalleri
                </span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed">
                Yapay zeka ile 5 saniyede MEB uyumlu, kişiselleştirilmiş eğitim materyalleri oluşturun. 
                Türkiye'nin ilk ve tek AI destekli özel eğitim platformu.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                Ücretsiz Başla <ArrowRight className="w-5 h-5" />
              </motion.button>
              <button className="px-8 py-4 border border-slate-600 hover:border-slate-500 rounded-lg font-semibold text-lg transition">
                Demo Videosu İzle
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-400">100+</div>
                <div className="text-slate-400">Aktivite Türü</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">∞</div>
                <div className="text-slate-400">Sınırsız Materyal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">4 Uzman</div>
                <div className="text-slate-400">Doğrulama</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-2xl" />
            <div className="relative bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
              <div className="aspect-square bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
                  <p className="text-slate-300">AI Destekli Platform</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem & Solution */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Öğretmenlerin Karşı Karşıya Olduğu Sorunlar
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Disleksi ve özel eğitim gerektiren öğrenciler için uygun materyal hazırlamak saat süren bir işlem.
              Oogmatik bunu 5 saniyeye düşürüyor.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: BookOpen, title: 'Zaman Kaybı', desc: 'Her öğrenci için özel materyal hazırlamak saatler sürüyor' },
              { icon: Users, title: 'Kişiselleştirme', desc: 'Her öğrencinin farklı ihtiyaçları var, standart materyaller yetmiyor' },
              { icon: Shield, title: 'Kalite Kontrol', desc: 'Hazırlanan materyallerin pedagojik açıdan doğru olup olmadığını kontrol etmek zor' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
                <item.icon className="w-12 h-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Neden Oogmatik?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Türkiye'nin ilk ve en kapsamlı AI destekli özel eğitim platformu
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                title: 'MEB Uyumlu',
                desc: '2024-2025 müfredat kazanımlarıyla %100 uyumlu materyaller',
                icon: CheckCircle2,
              },
              {
                title: '4 Uzman Doğrulama',
                desc: 'Pedagoji, klinik, teknik ve AI uzmanları her içeriği kontrol eder',
                icon: Shield,
              },
              {
                title: 'Disleksi Dostu Tasarım',
                desc: 'Lexend font, geniş satır aralığı, WCAG AAA kontrast oranları',
                icon: Sparkles,
              },
              {
                title: '100+ Aktivite',
                desc: 'Türkçe, Matematik, BEP, Activity Studio vb. tüm modüller',
                icon: Zap,
              },
              {
                title: 'Kişiselleştirilmiş İçerik',
                desc: 'Öğrenci profiline göre otomatik olarak uyarlanan materyaller',
                icon: Users,
              },
              {
                title: 'Premium A4 Çıktı',
                desc: 'Kurumsal filigran, tema koruması, print-optimized dosyalar',
                icon: BookOpen,
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 hover:border-indigo-500/50 transition">
                <feature.icon className="w-12 h-12 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Nasıl Çalışır?
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { num: 1, title: 'Öğrenci Profili', desc: 'Öğrenci bilgilerini girin' },
              { num: 2, title: 'Konuyu Seçin', desc: 'MEB müfredatından konuyu seçin' },
              { num: 3, title: 'AI Üretimi', desc: 'AI 4 uzman tarafından doğrulansın' },
              { num: 4, title: 'Kullanın', desc: 'Hazır materyalleri indirin ve kullanın' },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeInUp} className="relative">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 text-center">
                  <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-slate-600"><ArrowRight /></div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Hazır mısınız?</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Şu anda 10 öğrenci profili ve sınırsız materyal üretimi ile ücretsiz başlayın.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-slate-100 transition text-lg"
          >
            Ücretsiz Hesap Oluştur
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-12 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Özellikler</a></li>
                <li><a href="#" className="hover:text-white transition">Fiyatlandırma</a></li>
                <li><a href="#" className="hover:text-white transition">İçerik</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Hakkında</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Gizlilik</a></li>
                <li><a href="#" className="hover:text-white transition">Şartlar</a></li>
                <li><a href="#" className="hover:text-white transition">KVKK</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sosyal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                <li><a href="#" className="hover:text-white transition">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex items-center justify-between text-slate-400">
            <p>&copy; 2026 Oogmatik. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Türkiye'nin #1 AI Özel Eğitim Platformu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
