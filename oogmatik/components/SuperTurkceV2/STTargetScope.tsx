import React from 'react';
import { useSuperTurkceV2Store } from '../../store/useSuperTurkceV2Store';

export const STTargetScope: React.FC = () => {
  const { gradeLevel, unit, bloomLevel, studentProfile, setScope, applyFastMode, isGenerating } =
    useSuperTurkceV2Store();

  return (
    <div className="bg-[#050505] border-b border-zinc-800 p-4 flex items-center justify-between shadow-xl z-20 relative font-lexend">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <i className="fa-solid fa-graduation-cap text-indigo-500 text-lg"></i>
          </div>
          <div>
            <h1 className="text-zinc-100 font-bold text-sm tracking-wide">Süper Türkçe V2</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
              Klinik Okuma Anlama Motoru
            </p>
          </div>
        </div>

        <div className="w-px h-8 bg-zinc-800 mx-2"></div>

        <div className="flex gap-4">
          {/* Sınıf Seviyesi */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Sınıf (Grade)
            </span>
            <select
              value={gradeLevel}
              onChange={(e) => setScope({ gradeLevel: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-medium appearance-none min-w-[100px]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={String(g)}>
                  {g}. Sınıf
                </option>
              ))}
            </select>
          </div>

          {/* Ünite */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Ünite / Konu
            </span>
            <input
              type="text"
              value={unit}
              onChange={(e) => setScope({ unit: e.target.value })}
              placeholder="Örn: Okuma Anlama"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-medium min-w-[150px]"
            />
          </div>

          {/* Taksonomi */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Bilişsel Yük (Bloom)
            </span>
            <select
              value={bloomLevel}
              onChange={(e) => setScope({ bloomLevel: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500 font-medium min-w-[130px]"
            >
              <option value="remember">Hatırlama (Basit)</option>
              <option value="understand">Kavrama (Normal)</option>
              <option value="apply">Uygulama (Orta)</option>
              <option value="analyze">Analiz (Zor)</option>
              <option value="evaluate">Değerlendirme (LGS)</option>
            </select>
          </div>

          {/* Öğrenci Profili */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Nöro-Kısıt (Profile)
            </span>
            <select
              value={studentProfile}
              onChange={(e) => setScope({ studentProfile: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500 font-medium min-w-[150px]"
            >
              <option value="standard">Standart Eğitim</option>
              <option value="dyslexia_mild">Hafif Disleksi (Kısa Cümle)</option>
              <option value="dyslexia_deep">Derin Disleksi (Aşırı Somut)</option>
              <option value="adhd">DEHB (Görsel Odaklı)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={isGenerating}
          onClick={applyFastMode}
          className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-emerald-400 transition-colors flex items-center gap-2 border border-emerald-500/20"
        >
          <i className="fa-solid fa-bolt"></i> Hızlı Mod (Oto-Seç)
        </button>
      </div>
    </div>
  );
};
