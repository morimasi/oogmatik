import React from 'react';
import { usePremiumStudioStore } from '../../store/usePremiumStudioStore';

export const TargetScopePanel: React.FC = () => {
  const { gradeLevel, subject, topic, bloomLevel, studentProfile, setTargetScope } =
    usePremiumStudioStore();

  return (
    <div className="bg-[#050505] border-b border-zinc-800 p-4 flex items-center justify-between shadow-xl z-20 relative font-lexend">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <i className="fa-solid fa-dna text-amber-500 text-lg"></i>
          </div>
          <div>
            <h1 className="text-zinc-100 font-bold text-sm tracking-wide">Premium Studio</h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
              Ontolojik Müfredat Motoru
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
              onChange={(e) => setTargetScope({ gradeLevel: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-medium appearance-none min-w-[100px]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                <option key={g} value={String(g)}>
                  {g}. Sınıf
                </option>
              ))}
            </select>
          </div>

          {/* Ders */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Ders & Ünite (Scope)
            </span>
            <select
              value={subject}
              onChange={(e) => setTargetScope({ subject: e.target.value })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-amber-500 font-medium min-w-[150px]"
            >
              <option value="Türkçe">Türkçe</option>
              <option value="Hayat Bilgisi">Hayat Bilgisi</option>
              <option value="Matematik">Matematik</option>
              <option value="Fen Bilimleri">Fen Bilimleri</option>
            </select>
          </div>

          {/* Taksonomi */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Bilişsel Yük (Bloom)
            </span>
            <select
              value={bloomLevel}
              onChange={(e) => setTargetScope({ bloomLevel: e.target.value as any })}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-sky-500 font-medium min-w-[130px]"
            >
              <option value="remember">Hatırlama (Basit)</option>
              <option value="understand">Kavrama (Normal)</option>
              <option value="apply">Uygulama (Orta)</option>
              <option value="analyze">Analiz (Zor)</option>
              <option value="evaluate">Değerlendirme (LGS)</option>
              <option value="create">Sentezleme (Üst)</option>
            </select>
          </div>

          {/* Öğrenci Profili */}
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1 ml-1">
              Nöro-Kısıt (Profile)
            </span>
            <select
              value={studentProfile}
              onChange={(e) => setTargetScope({ studentProfile: e.target.value })}
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
        <button className="h-9 px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold text-zinc-300 transition-colors flex items-center gap-2">
          <i className="fa-solid fa-folder-open"></i> Yükle
        </button>
        <button className="h-9 px-4 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-black text-black transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <i className="fa-solid fa-floppy-disk"></i> Şablonu Kaydet
        </button>
      </div>
    </div>
  );
};
