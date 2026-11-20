import React, { useState } from 'react';
import { AdOutput, AD_TARGET_LABELS } from '../../../types/adStudio';

interface AdVisualMockupRendererProps {
  output: AdOutput;
  screenshot?: string;
}

type MockupType = 'instagram' | 'reels' | 'linkedin' | 'google' | 'brochure' | 'landing' | 'email';

export const AdVisualMockupRenderer: React.FC<AdVisualMockupRendererProps> = ({ output, screenshot }) => {
  const [activeMockup, setActiveMockup] = useState<MockupType>(() => {
    if (output.format === 'email') return 'email';
    if (output.format === 'brochure') return 'brochure';
    if (output.format === 'web_copy') return 'landing';
    if (output.format === 'google_ads') return 'google';
    if (output.format === 'video_script') return 'reels';
    return 'instagram';
  });

  const targetLabel = AD_TARGET_LABELS[output.target] || output.target;
  const firstSceneSvg = output.scenes[0]?.sceneVisual;

  const mockups: { id: MockupType; label: string; icon: string }[] = [
    { id: 'instagram', label: 'Instagram', icon: 'fa-instagram' },
    { id: 'reels', label: 'Reels / TikTok', icon: 'fa-tiktok' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'fa-linkedin' },
    { id: 'google', label: 'Google Arama', icon: 'fa-google' },
    { id: 'brochure', label: 'Broşür A4', icon: 'fa-book-open' },
    { id: 'landing', label: 'Web Hero', icon: 'fa-globe' },
    { id: 'email', label: 'E-posta', icon: 'fa-envelope' },
  ];

  return (
    <div className="space-y-4">
      {/* Mockup Selector Tabs */}
      <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
        {mockups.map(m => (
          <button
            key={m.id}
            onClick={() => setActiveMockup(m.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeMockup === m.id
                ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <i className={`fa-brands ${m.icon} ${m.icon.startsWith('fa-') ? '' : 'fa-solid'}`} />
            {m.label}
          </button>
        ))}
      </div>

      {/* 1. INSTAGRAM POST MOCKUP */}
      {activeMockup === 'instagram' && (
        <div className="mx-auto max-w-sm rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-sans">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-[10px] text-white">
                  O
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white tracking-tight">bdmind_edtech</span>
                  <i className="fa-solid fa-circle-check text-sky-400 text-[10px]" />
                </div>
                <span className="text-[9px] text-zinc-400 block leading-tight">Sponsorlu · Özel Eğitim Çözümleri</span>
              </div>
            </div>
            <i className="fa-solid fa-ellipsis text-zinc-400 text-xs" />
          </div>

          {/* Visual Canvas Area */}
          <div className="relative aspect-square w-full bg-slate-900 overflow-hidden flex items-center justify-center">
            {screenshot ? (
              <img src={screenshot} alt="Reklam" className="w-full h-full object-cover" />
            ) : firstSceneSvg && firstSceneSvg.startsWith('<svg') ? (
              <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: firstSceneSvg }} />
            ) : (
              <div className="p-6 text-center text-zinc-400">
                <i className="fa-solid fa-wand-magic-sparkles text-3xl mb-2 text-indigo-400" />
                <p className="text-xs font-bold text-white">{output.title}</p>
                <p className="text-[10px] text-zinc-400 mt-1">{targetLabel}</p>
              </div>
            )}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[8px] font-bold text-white">
              1/5
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-950/80 border-y border-indigo-900/50">
            <span className="text-[10px] font-bold text-indigo-200">Hemen Bilgi Al ve Keşfet</span>
            <i className="fa-solid fa-chevron-right text-indigo-300 text-[9px]" />
          </div>

          {/* Interaction Bar */}
          <div className="p-3 bg-zinc-950 space-y-2">
            <div className="flex items-center justify-between text-white text-base">
              <div className="flex items-center gap-3">
                <i className="fa-regular fa-heart hover:text-red-500 cursor-pointer" />
                <i className="fa-regular fa-comment hover:text-indigo-400 cursor-pointer" />
                <i className="fa-regular fa-paper-plane hover:text-indigo-400 cursor-pointer" />
              </div>
              <i className="fa-regular fa-bookmark hover:text-indigo-400 cursor-pointer" />
            </div>

            <div className="text-[11px] font-bold text-white">1.482 beğenme</div>

            <div className="text-[11px] text-zinc-200 leading-snug line-clamp-3">
              <span className="font-bold text-white mr-1.5">bdmind_edtech</span>
              {output.socialCopy}
            </div>

            <div className="text-[9px] text-indigo-400">
              #bdmind #disleksi #özeleğitim #bep #lgsmatematik
            </div>
          </div>
        </div>
      )}

      {/* 2. REELS / TIKTOK 9:16 MOCKUP */}
      {activeMockup === 'reels' && (
        <div className="mx-auto max-w-[280px] aspect-[9/16] rounded-[2.5rem] bg-black border-4 border-zinc-800 shadow-2xl overflow-hidden relative flex flex-col justify-between p-4 font-sans text-white">
          {/* Top Indicators */}
          <div className="flex items-center justify-between text-[10px] z-10 pt-1">
            <span className="font-bold tracking-wider text-xs">Reels</span>
            <i className="fa-solid fa-camera text-sm" />
          </div>

          {/* Background Visual */}
          <div className="absolute inset-0 z-0">
            {screenshot ? (
              <img src={screenshot} alt="Reels" className="w-full h-full object-cover opacity-60" />
            ) : firstSceneSvg && firstSceneSvg.startsWith('<svg') ? (
              <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full opacity-70" dangerouslySetInnerHTML={{ __html: firstSceneSvg }} />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          </div>

          {/* Right Floating Actions */}
          <div className="absolute right-3 bottom-16 flex flex-col items-center gap-4 z-10 text-white">
            <div className="flex flex-col items-center">
              <i className="fa-solid fa-heart text-xl text-red-500" />
              <span className="text-[9px] font-bold mt-0.5">8.4K</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fa-solid fa-comment-dots text-xl" />
              <span className="text-[9px] font-bold mt-0.5">342</span>
            </div>
            <div className="flex flex-col items-center">
              <i className="fa-solid fa-share text-xl" />
              <span className="text-[9px] font-bold mt-0.5">Paylaş</span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="z-10 space-y-2 pr-12 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">O</div>
              <span className="text-xs font-bold">bdmind.edtech</span>
              <button className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-bold">Takip Et</button>
            </div>
            <p className="text-[10px] text-zinc-200 line-clamp-3 leading-snug">
              {output.scenes[0]?.voiceover || output.socialCopy}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
              <i className="fa-solid fa-music text-[8px]" />
              <span className="truncate">Orijinal Ses - bdmind Özel Eğitim Koçu</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. LINKEDIN B2B POST MOCKUP */}
      {activeMockup === 'linkedin' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl p-4 font-sans space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-white font-black text-sm">
                bd
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">bdmind EdTech Platformu</span>
                  <span className="text-[10px] text-zinc-400">· 1.</span>
                </div>
                <p className="text-[9px] text-zinc-400">14.280 takipçi · Özel Eğitimde AI & Nöro-Pedagoji</p>
                <p className="text-[8px] text-zinc-500">1 gün önce · Düzenlendi · 🌐</p>
              </div>
            </div>
            <button className="flex items-center gap-1 px-3 py-1 rounded-full border border-blue-500/50 text-blue-400 text-[10px] font-bold hover:bg-blue-500/10">
              <i className="fa-solid fa-plus text-[8px]" /> Takip Et
            </button>
          </div>

          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {output.socialVariations?.linkedin?.body || output.socialCopy}
          </p>

          <div className="rounded-xl overflow-hidden bg-black/40 border border-zinc-800 aspect-video flex items-center justify-center">
            {screenshot ? (
              <img src={screenshot} alt="LinkedIn" className="w-full h-full object-cover" />
            ) : firstSceneSvg && firstSceneSvg.startsWith('<svg') ? (
              <div className="w-full h-full [&_svg]:w-full [&_svg]:h-full" dangerouslySetInnerHTML={{ __html: firstSceneSvg }} />
            ) : (
              <div className="p-4 text-center">
                <h4 className="text-sm font-bold text-white">{output.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">{targetLabel}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 font-bold">
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <i className="fa-regular fa-thumbs-up" /> Beğen
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <i className="fa-regular fa-comment" /> Yorum Yap
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <i className="fa-solid fa-repeat" /> Yeniden Yayınla
            </span>
            <span className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer">
              <i className="fa-regular fa-paper-plane" /> Gönder
            </span>
          </div>
        </div>
      )}

      {/* 4. GOOGLE SEARCH ADS MOCKUP */}
      {activeMockup === 'google' && (
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-5 font-sans space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase text-white bg-zinc-800 px-2 py-0.5 rounded">Sponsorlu</span>
            <span className="text-xs text-zinc-400">https://www.bdmind.com › ozel-egitim</span>
          </div>

          <h3 className="text-base font-medium text-blue-400 hover:underline cursor-pointer leading-snug">
            {output.googleData?.headlines?.[0] || output.title} | bdmind
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {output.googleData?.descriptions?.[0] || output.socialCopy.slice(0, 160)}
          </p>

          {/* Sitelinks */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-blue-400 font-medium hover:underline cursor-pointer">Ücretsiz Çalışma Kâğıtları</div>
              <div className="text-[10px] text-zinc-400">A4 disleksi dostu kâğıtlar indir.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
              <div className="text-xs text-blue-400 font-medium hover:underline cursor-pointer">Sarı Kitap 6 Hızlı Okuma</div>
              <div className="text-[10px] text-zinc-400">Bilimsel nöro-bilişsel teknikler.</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. A4 / A5 BROŞÜR MOCKUP */}
      {activeMockup === 'brochure' && (
        <div className="rounded-2xl bg-slate-900 border border-zinc-700 p-6 shadow-2xl text-slate-100 font-lexend space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">bdmind EdTech Tanıtım Broşürü</span>
              <h2 className="text-base font-black text-white">{output.title}</h2>
            </div>
            <span className="text-[10px] px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-mono">A4 / Katlamalı</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(output.brochureData || [
              { title: 'Sıfır Bilişsel Yük', points: ['Lexend disleksi fontu', 'Pastel kontrast paletleri', 'Görsel parazitsiz A4'] },
              { title: 'MEB & BEP Uyumlu', points: [targetLabel, '2024-2026 Müfredatı', 'Kişiselleştirilmiş plan'] },
              { title: 'İletişim & Erişim', points: ['bdmind.com', 'Online Deneme', 'Öğretmen Desteği'] },
            ]).map((panel, idx) => (
              <div key={idx} className="rounded-xl bg-slate-800/60 border border-slate-700/60 p-3 space-y-2">
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block">Bölüm {idx + 1}</span>
                <h4 className="text-[11px] font-bold text-white">{panel.title}</h4>
                <ul className="text-[9px] text-slate-300 space-y-1">
                  {panel.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1">
                      <span className="text-emerald-400">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                {panel.callout && (
                  <div className="text-[8px] font-bold text-amber-300 bg-amber-500/10 p-1.5 rounded mt-2">
                    {panel.callout}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Özel Öğrenme Güçlüğü & Nöro-Pedagojik Eğitim Standartları</span>
            <span className="font-bold text-indigo-300">bdmind.com</span>
          </div>
        </div>
      )}

      {/* 6. WEB LANDING HERO MOCKUP */}
      {activeMockup === 'landing' && (
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden font-sans">
          {/* Browser Bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex-1 mx-4 py-1 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono text-center truncate">
              https://bdmind.com/{output.target}
            </div>
          </div>

          {/* Hero Section */}
          <div className="p-6 bg-gradient-to-b from-indigo-950/40 to-zinc-950 text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold uppercase tracking-widest inline-block">
              Yeni Nesil Eğitim Teknolojisi
            </span>
            <h1 className="text-xl font-black text-white tracking-tight leading-tight max-w-lg mx-auto">
              {output.webData?.heroTitle || output.title}
            </h1>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              {output.webData?.heroSubtitle || output.socialCopy.slice(0, 180)}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold hover:from-indigo-500 hover:to-purple-500 shadow-lg">
                {output.webData?.ctaPrimary || 'Ücretsiz Dene'}
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/15">
                {output.webData?.ctaSecondary || 'Demo İncele'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODERN EMAIL CLIENT MOCKUP */}
      {activeMockup === 'email' && (
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl overflow-hidden font-sans">
          <div className="p-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-bold text-white">Gelen Kutusu</span>
            <div className="flex gap-2">
              <i className="fa-solid fa-star hover:text-amber-400 cursor-pointer" />
              <i className="fa-solid fa-reply hover:text-white cursor-pointer" />
            </div>
          </div>

          <div className="p-4 border-b border-zinc-800 bg-zinc-900/60">
            <h3 className="text-sm font-bold text-white mb-2">{output.emailSubject}</h3>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">O</div>
              <div>
                <div className="text-xs font-bold text-zinc-200">bdmind Pedagoji Ekibi &lt;destek@bdmind.com&gt;</div>
                <div className="text-[10px] text-zinc-500">Alıcı: Değerli Eğitimcimiz / Velimiz</div>
              </div>
            </div>
          </div>

          <div className="p-5 text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-950/40">
            {output.emailBody}
          </div>
        </div>
      )}
    </div>
  );
};
