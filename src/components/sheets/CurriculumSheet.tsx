import React from 'react';
import { Curriculum, CurriculumActivity } from '../../types';

interface CurriculumSheetProps {
    data: Curriculum | { curriculum: Curriculum };
}

export const CurriculumSheet: React.FC<CurriculumSheetProps> = ({ data }) => {
    const curriculum: Curriculum = (data && 'curriculum' in data && data.curriculum)
        ? data.curriculum
        : (data as Curriculum);

    if (!curriculum || !curriculum.schedule) {
        return (
            <div className="p-8 text-center text-zinc-400 font-lexend">
                <p className="font-bold">Görüntülenecek müfredat planı verisi bulunamadı.</p>
            </div>
        );
    }

    const completedCount = curriculum.schedule.filter(d =>
        d.isCompleted || (d.activities && d.activities.length > 0 && d.activities.every((a: CurriculumActivity) => a.status === 'completed'))
    ).length;
    const progress = curriculum.schedule.length > 0
        ? Math.round((completedCount / curriculum.schedule.length) * 100)
        : 0;

    return (
        <div className="w-full max-w-[210mm] mx-auto bg-white text-zinc-900 font-lexend p-8 space-y-6 print:p-4 print:space-y-4 print:max-w-none print:w-full">
            {/* Header banner */}
            <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-start">
                <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider">
                        MEB & BİREYSEL EĞİTİM PLANI (BEP) MÜFREDAT ROTASI
                    </span>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                        {curriculum.studentName} — Akıllı Gelişim Planı
                    </h1>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                        {curriculum.grade || '2. Sınıf'} • {curriculum.durationDays} Günlük Akış • Başlangıç: {new Date(curriculum.startDate || Date.now()).toLocaleDateString('tr-TR')}
                    </p>
                </div>
                <div className="text-right shrink-0">
                    <div className="inline-block px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-center">
                        <span className="block text-[8px] font-black uppercase text-zinc-400">Tamamlanma</span>
                        <span className="text-lg font-black text-indigo-600">%{progress}</span>
                    </div>
                </div>
            </div>

            {/* Goals & Pedagogical Note */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Goals */}
                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <h3 className="font-black text-[10px] uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-bullseye text-indigo-600"></i> Plan Hedefleri (SMART)
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-zinc-700 font-medium">
                        {(curriculum.goals || ['Bilişsel Becerileri Güçlendirme']).map((goal, idx) => (
                            <li key={idx} className="leading-snug">
                                <span className="font-semibold">{goal}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pedagogical Note */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <h3 className="font-black text-[10px] uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                        <i className="fa-solid fa-chalkboard-user text-amber-600"></i> Pedagojik Strateji & Öğretmen Notu
                    </h3>
                    <p className="text-zinc-700 italic leading-relaxed text-[11px]">
                        {curriculum.note || 'Öğrencinin dikkat ve öğrenme hızına göre 15 dakikalık periyotlarla yapılandırılmıştır.'}
                    </p>
                </div>
            </div>

            {/* Schedule Table */}
            <div className="space-y-2">
                <h3 className="font-black text-xs uppercase text-zinc-700 tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-calendar-days text-indigo-600"></i> Günlük Uygulama Takvimi
                </h3>
                <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-zinc-100 text-[10px] font-black uppercase text-zinc-600 tracking-wider border-b border-zinc-200">
                            <tr>
                                <th className="p-2.5 w-16">Gün</th>
                                <th className="p-2.5">Odak Konu</th>
                                <th className="p-2.5">Aktivite</th>
                                <th className="p-2.5 w-16 text-center">Süre</th>
                                <th className="p-2.5 w-16 text-center">Zorluk</th>
                                <th className="p-2.5 w-24">Kazanım</th>
                                <th className="p-2.5 w-20 text-center">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 text-[11px]">
                            {curriculum.schedule.flatMap((day) =>
                                (day.activities || []).map((act: CurriculumActivity) => (
                                    <tr key={act.id} className="hover:bg-zinc-50">
                                        <td className="p-2.5 font-black text-indigo-600">
                                            {day.day}. Gün
                                        </td>
                                        <td className="p-2.5 font-bold text-zinc-800">
                                            {day.focus}
                                        </td>
                                        <td className="p-2.5 font-medium text-zinc-700">
                                            {act.title}
                                        </td>
                                        <td className="p-2.5 text-center font-mono text-zinc-500">
                                            {act.duration || 15} dk
                                        </td>
                                        <td className="p-2.5 text-center font-bold">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] ${
                                                act.difficultyLevel === 'Zor'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : act.difficultyLevel === 'Orta'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                                {act.difficultyLevel || 'Orta'}
                                            </span>
                                        </td>
                                        <td className="p-2.5 font-mono text-[10px] font-bold text-amber-700">
                                            {act.kazanimKod || day.kazanimKod || '-'}
                                        </td>
                                        <td className="p-2.5 text-center font-bold">
                                            {act.status === 'completed' ? (
                                                <span className="text-emerald-600 text-[10px]">Tamam</span>
                                            ) : (
                                                <span className="text-zinc-400 text-[10px]">Bekliyor</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Official Signature and Approval Block */}
            <div className="pt-6 border-t-2 border-zinc-200 flex justify-between items-start text-xs text-zinc-600">
                <div className="space-y-1">
                    <p className="font-bold text-zinc-800">Uygulayıcı Özel Eğitim Öğretmeni / Uzman:</p>
                    <p className="text-[10px] text-zinc-500">Ad Soyad / İmza:</p>
                    <div className="h-10 border-b border-dashed border-zinc-300 w-48"></div>
                </div>
                <div className="space-y-1 text-right">
                    <p className="font-bold text-zinc-800">MEB BEP Geliştirme Birimi Onayı:</p>
                    <p className="text-[10px] text-zinc-500">Tarih / Mühür / İmza:</p>
                    <div className="h-10 border-b border-dashed border-zinc-300 w-48 ml-auto"></div>
                </div>
            </div>
        </div>
    );
};
