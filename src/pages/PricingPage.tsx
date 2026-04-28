import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Zap } from 'lucide-react';

const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
    viewport: { once: true },
  };

  const plans = [
    {
      name: 'Freemium',
      description: 'Ücretsiz başlamak isteyenler için',
      price: 0,
      currency: '₺',
      period: '/ay',
      cta: 'Ücretsiz Başla',
      highlight: false,
      features: [
        { name: '10 Materyal/Ay', included: true },
        { name: 'Temel Şablonlar', included: true },
        { name: 'Türkçe Stüdyosu', included: true },
        { name: '5 Öğrenci Profili', included: true },
        { name: 'PDF Export', included: true },
        { name: '5 Öğrenci Profili', included: false },
        { name: 'Öncelikli Destek', included: false },
        { name: 'BEP Modülü', included: false },
      ],
    },
    {
      name: 'Öğretmen',
      description: 'Bireysel öğretmenler için',
      price: billingCycle === 'monthly' ? 149 : 1490,
      currency: '₺',
      period: billingCycle === 'monthly' ? '/ay' : '/yıl',
      cta: 'Şimdi Başla',
      highlight: true,
      features: [
        { name: 'Sınırsız Materyal', included: true },
        { name: 'Tüm Şablonlar', included: true },
        { name: 'Tüm Stüdyolar', included: true },
        { name: '50 Öğrenci Profili', included: true },
        { name: 'PDF + A4 Export', included: true },
        { name: 'Premium Temalar', included: true },
        { name: 'Standart Destek', included: true },
        { name: 'BEP Modülü (Beta)', included: true },
      ],
    },
    {
      name: 'Kurum',
      description: 'Okullar ve merkezler için',
      price: billingCycle === 'monthly' ? 999 : 9990,
      currency: '₺',
      period: billingCycle === 'monthly' ? '/ay' : '/yıl',
      cta: 'Teklif Iste',
      highlight: false,
      features: [
        { name: 'Sınırsız Materyal', included: true },
        { name: 'Tüm Şablonlar', included: true },
        { name: 'Tüm Stüdyolar', included: true },
        { name: '10 Kullanıcı Hesabı', included: true },
        { name: 'PDF + A4 Export', included: true },
        { name: 'Premium Temalar', included: true },
        { name: 'Öncelikli Destek', included: true },
        { name: 'BEP Modülü (Full)', included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg">Oogmatik</span>
            </div>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition">
              Şimdi Başla
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            Basit, Saydaş
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
              Fiyatlandırma
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-12">
            Tüm paketlerde AI destekli materyal üretimi ve 4 uzman doğrulama vardır.
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-md font-medium transition ${
                  billingCycle === 'monthly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Aylık
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-md font-medium transition relative ${
                  billingCycle === 'yearly'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Yıllık
                {billingCycle === 'yearly' && (
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    % 20 İndirim
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl border transition ${
                  plan.highlight
                    ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-500/10 to-slate-800/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-700/50 bg-slate-800/50'
                } p-8`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      En Popüler
                    </span>
                  </div>
                )}

                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition flex items-center justify-center gap-2 ${
                    plan.highlight
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'border border-slate-600 hover:border-slate-500 text-white'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeInUp} className="text-4xl font-bold text-center mb-12">
            Sık Sorulan Sorular
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                q: 'İlk ay ücretsiz mi?',
                a: 'Freemium paketinde ücretsiz olarak başlayabilirsiniz. Öğretmen ve Kurum paketleri için 14 günlük ücretsiz deneme sunuyoruz.',
              },
              {
                q: 'Aboneliğimi istediğim zaman iptal edebilir miyim?',
                a: 'Evet, herhangi bir ek ücret ödemeden istediğiniz zaman iptal edebilirsiniz.',
              },
              {
                q: 'Birden fazla öğretmen için toplu satın alma yapabilir miyim?',
                a: 'Evet, kurum paketimiz 10+ kullanıcı için tasarlanmıştır. Toplu satın almalar için sales@oogmatik.com ile iletişime geçebilirsiniz.',
              },
              {
                q: 'Tüm öğrenci sayılarının materyali üretebilir miyim?',
                a: 'Freemium paketinde 10 materyal/ay sınırı vardır. Öğretmen paketinde sınırsız materyal üretebilirsiniz.',
              },
            ].map((faq, i) => (
              <motion.div key={i} {...fadeInUp} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-6">
                <h4 className="font-semibold text-lg mb-3">{faq.q}</h4>
                <p className="text-slate-300">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Başlamaya hazır mısınız?</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Kredi kartı gerekmeden ücretsiz olarak başlayın. Dilediğiniz zaman yükseltme yapabilirsiniz.
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
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 Oogmatik. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
