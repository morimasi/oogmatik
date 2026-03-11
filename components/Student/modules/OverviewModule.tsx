import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

interface OverviewModuleProps {
    student: AdvancedStudent;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({ student }) => {
    // Helper for status colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            case 'overdue': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
            default: return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* IEP Progress */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <i className="fa-solid fa-bullseye text-xl"></i>
                        </div>
                        <span className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                            {student.iep?.status === 'active' ? 'Aktif BEP' : 'BEP Yok'}
                        </span>
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">BEP İlerlemesi</h3>
                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                            %{Math.round(student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) / (student.iep?.goals?.length || 1)) || 0}
                        </span>
                        <span className="text-xs text-zinc-500 mb-1">tamamlandı</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-3 overflow-hidden">
                        <div 
                            className="h-full bg-indigo-500 rounded-full" 
                            style={{ width: `${Math.round(student.iep?.goals?.reduce((acc, g) => acc + g.progress, 0) / (student.iep?.goals?.length || 1)) || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Attendance */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <i className="fa-solid fa-calendar-check text-xl"></i>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full">
                            Son 30 Gün
                        </span>
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">Devam Durumu</h3>
                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                            %{student.attendance?.stats?.attendanceRate || 0}
                        </span>
                        <span className="text-xs text-zinc-500 mb-1">katılım</span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                        {student.attendance?.stats?.absent || 0} gün devamsızlık
                    </p>
                </div>

                {/* Academic/GPA */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <i className="fa-solid fa-graduation-cap text-xl"></i>
                        </div>
                        <div className="flex gap-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 2 ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-700'}`}></div>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">Genel Başarı</h3>
                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                            {student.academic?.metrics?.gpa || '-'}
                        </span>
                        <span className="text-xs text-zinc-500 mb-1">/ 100</span>
                    </div>
                    <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
                        <i className="fa-solid fa-arrow-trend-up"></i>
                        <span>Son dönem artışta</span>
                    </p>
                </div>

                {/* Finance/Balance */}
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-600 dark:text-rose-400">
                            <i className="fa-solid fa-wallet text-xl"></i>
                        </div>
                        {student.financial?.balance > 0 && (
                            <span className="text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-full animate-pulse">
                                Ödeme Bekliyor
                            </span>
                        )}
                    </div>
                    <h3 className="text-zinc-500 text-sm font-medium">Kalan Bakiye</h3>
                    <div className="mt-2 flex items-end gap-2">
                        <span className="text-2xl font-black text-zinc-900 dark:text-white">
                            {student.financial?.balance?.toLocaleString('tr-TR')} ₺
                        </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                        Son Ödeme: {new Date().toLocaleDateString('tr-TR')}
                    </p>
                </div>
            </div>

            {/* AI Insights & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <i className="fa-solid fa-robot text-sm"></i>
                            </div>
                            <h3 className="font-bold text-lg">Yapay Zeka Asistanı Analizi</h3>
                        </div>
                        <p className="text-indigo-100 leading-relaxed text-sm md:text-base mb-6">
                            {student.aiProfile?.strengthAnalysis || 
                            "Öğrencinin görsel hafıza performansı son 2 haftada %15 artış gösterdi. Özellikle desen eşleştirme aktivitelerinde üstün başarı sergiliyor. Okuma hızında ise kelime tekrarları azalmış durumda."}
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <button className="px-4 py-2 bg-white text-indigo-700 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                Yeni Öneri Oluştur
                            </button>
                            <button className="px-4 py-2 bg-indigo-800/50 text-white border border-indigo-400/30 rounded-xl text-sm font-bold hover:bg-indigo-800 transition-colors">
                                Detaylı Rapor
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-bell text-amber-500"></i>
                        Yaklaşan Hatırlatıcılar
                    </h3>
                    <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex gap-3 items-start p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-sm">
                                <i className="fa-solid fa-calendar-day"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">Veli Toplantısı</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Yarın, 14:00 - Zoom</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-sm">
                                <i className="fa-solid fa-file-contract"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">BEP Rapor Teslimi</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">3 gün kaldı</p>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 text-sm">
                                <i className="fa-solid fa-money-bill"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-200">Ödeme Hatırlatması</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">Otomatik SMS gönderildi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Activity & Weak Spots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Son Aktiviteler</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 relative">
                                {i !== 3 && <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-zinc-100 dark:bg-zinc-800 -mb-4"></div>}
                                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 z-10 border-4 border-white dark:border-zinc-900">
                                    <i className="fa-solid fa-check text-zinc-400 text-xs"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h4 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Okuma Egzersizi Tamamlandı</h4>
                                        <span className="text-[10px] text-zinc-400">2s önce</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">Başarı oranı: %85 - Süre: 15dk</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Gelişim Alanları</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-600 dark:text-zinc-400">Görsel Dikkat</span>
                                <span className="text-rose-500">%45</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-rose-500 w-[45%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-600 dark:text-zinc-400">İşitsel Ayırt Etme</span>
                                <span className="text-amber-500">%62</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 w-[62%] rounded-full"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-600 dark:text-zinc-400">El-Göz Koordinasyonu</span>
                                <span className="text-emerald-500">%78</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[78%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                        Tüm İstatistikleri Gör
                    </button>
                </div>
            </div>
        </div>
    );
};
