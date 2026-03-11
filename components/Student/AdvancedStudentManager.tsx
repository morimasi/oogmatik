
import React, { useState, useMemo } from 'react';
import { useStudent } from '../../context/StudentContext';
import { AdvancedStudent } from '../../types/student-advanced';
import { Student } from '../../types';

// Icons mapping for sub-modules
const MODULE_ICONS = {
    overview: 'fa-chart-pie',
    iep: 'fa-hands-holding-child',
    financial: 'fa-wallet',
    attendance: 'fa-calendar-days',
    grades: 'fa-graduation-cap',
    portfolio: 'fa-briefcase',
    behavior: 'fa-scale-balanced',
    settings: 'fa-sliders'
};

// Sidebar Navigation Component
const ManagerSidebar: React.FC<{
    activeModule: string;
    onSelectModule: (m: string) => void;
    student: AdvancedStudent;
}> = ({ activeModule, onSelectModule, student }) => (
    <div className="w-64 bg-zinc-900 text-zinc-400 flex flex-col h-full border-r border-zinc-800">
        <div className="p-6 flex flex-col items-center border-b border-zinc-800/50">
            <div className="relative group cursor-pointer">
                <img src={student.avatar} alt={student.name} className="w-20 h-20 rounded-2xl object-cover border-4 border-zinc-800 group-hover:border-zinc-700 transition-colors" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs border-4 border-zinc-900">
                    <i className="fa-solid fa-check"></i>
                </div>
            </div>
            <h3 className="mt-4 font-black text-white text-lg text-center leading-tight">{student.name}</h3>
            <p className="text-xs font-bold uppercase tracking-widest mt-1 text-zinc-500">{student.grade}</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {Object.entries(MODULE_ICONS).map(([key, icon]) => (
                <button
                    key={key}
                    onClick={() => onSelectModule(key)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                        activeModule === key 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                        : 'hover:bg-zinc-800 hover:text-zinc-200'
                    }`}
                >
                    <i className={`fa-solid ${icon} w-5 text-center text-sm`}></i>
                    <span>{key === 'iep' ? 'BEP / IEP' : key === 'financial' ? 'Finans' : key === 'attendance' ? 'Yoklama' : key === 'grades' ? 'Akademik' : key === 'behavior' ? 'Davranış' : key === 'overview' ? 'Özet' : key === 'portfolio' ? 'Portfolyo' : 'Ayarlar'}</span>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
            <div className="bg-zinc-800/50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest">BEP İlerlemesi</span>
                    <span className="text-xs font-black text-emerald-400">%65</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]"></div>
                </div>
            </div>
        </div>
    </div>
);

// Content Wrapper with Bento Grid Layout Support
const ContentWrapper: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }> = ({ title, subtitle, children, actions }) => (
    <div className="flex-1 h-full flex flex-col bg-zinc-50 dark:bg-black overflow-hidden">
        <div className="shrink-0 px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-md flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-zinc-500 font-medium mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
        </div>
    </div>
);

// Placeholder Sub-Components (We will expand these later)
const IEPModule = ({ student }: { student: AdvancedStudent }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="font-bold text-lg mb-4">Aktif Hedefler</h3>
                {/* Mock Goals */}
                {[1, 2, 3].map(i => (
                    <div key={i} className="mb-4 last:mb-0 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">{i}</div>
                        <div>
                            <h4 className="font-bold text-sm">Okuma Hızı ve Akıcılık</h4>
                            <p className="text-xs text-zinc-500 mt-1">Dakikada 60 kelime okuma hedefine ulaşılacak.</p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[45%]"></div>
                                </div>
                                <span className="text-[10px] font-bold">%45</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/30">
                <h3 className="font-bold text-lg text-amber-800 dark:text-amber-100 mb-4">Son Değerlendirme</h3>
                <p className="text-sm text-amber-900 dark:text-amber-200 italic">"Öğrenci görsel materyallere olumlu tepki veriyor, ancak işitsel yönergelerde zorlanıyor."</p>
                <div className="mt-4 text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-widest">12 Mart 2026 • Dr. Ayşe Y.</div>
            </div>
        </div>
    </div>
);

const FinancialModule = ({ student }: { student: AdvancedStudent }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100">
            <div className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">Toplam Bakiye</div>
            <div className="text-4xl font-black">₺ 12,500</div>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-800 text-blue-800 dark:text-blue-100">
            <div className="text-sm font-bold uppercase tracking-widest opacity-60 mb-1">Son Ödeme</div>
            <div className="text-4xl font-black">15 ŞUB</div>
        </div>
        <div className="md:col-span-4 bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg mb-6">İşlem Geçmişi</h3>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-widest">
                        <th className="pb-4">Tarih</th>
                        <th className="pb-4">Açıklama</th>
                        <th className="pb-4">Kategori</th>
                        <th className="pb-4 text-right">Tutar</th>
                        <th className="pb-4 text-right">Durum</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50 font-medium">
                    <tr>
                        <td className="py-4">01 Mar 2026</td>
                        <td>Eğitim Materyalleri</td>
                        <td>Materyal</td>
                        <td className="text-right text-zinc-900 dark:text-white">₺ 450.00</td>
                        <td className="text-right"><span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-black uppercase">Ödendi</span></td>
                    </tr>
                    <tr>
                        <td className="py-4">15 Şub 2026</td>
                        <td>Yıllık Eğitim Ücreti (Taksit 2)</td>
                        <td>Eğitim</td>
                        <td className="text-right text-zinc-900 dark:text-white">₺ 12,500.00</td>
                        <td className="text-right"><span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-black uppercase">Bekliyor</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

// Main Manager Component
export const AdvancedStudentManager: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { activeStudent, students } = useStudent();
    const [selectedModule, setSelectedModule] = useState('overview');
    
    // Fallback if no student is active (should handle better in real app)
    const currentStudent = activeStudent ? (activeStudent as unknown as AdvancedStudent) : (students[0] as unknown as AdvancedStudent);

    if (!currentStudent) return (
        <div className="flex h-full items-center justify-center bg-zinc-950 text-white">
            <div className="text-center">
                <i className="fa-solid fa-users-slash text-4xl mb-4 text-zinc-600"></i>
                <p>Öğrenci bulunamadı.</p>
                <button onClick={onBack} className="mt-4 text-sm text-indigo-400 underline">Geri Dön</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex bg-black font-['Lexend']">
            {/* 1. Global Navigation Rail (Mini) */}
            <div className="w-20 bg-black border-r border-zinc-800 flex flex-col items-center py-8 gap-8 shrink-0">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">O</div>
                <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all" title="Ana Menü">
                    <i className="fa-solid fa-grid-2"></i>
                </button>
                <button className="w-12 h-12 rounded-2xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center justify-center transition-all" title="Bildirimler">
                    <div className="relative">
                        <i className="fa-solid fa-bell"></i>
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></div>
                    </div>
                </button>
            </div>

            {/* 2. Context Sidebar (Student & Modules) */}
            <ManagerSidebar 
                activeModule={selectedModule} 
                onSelectModule={setSelectedModule} 
                student={currentStudent} 
            />

            {/* 3. Main Content Area */}
            <div className="flex-1 min-w-0">
                {selectedModule === 'overview' && (
                    <ContentWrapper 
                        title="Genel Bakış" 
                        subtitle="Öğrencinin son durum özeti ve kritik metrikler."
                        actions={<button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 hover:scale-105 transition-transform">Rapor Al</button>}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Summary Cards */}
                            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] text-white shadow-xl shadow-indigo-900/20">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl"><i className="fa-solid fa-star"></i></div>
                                    <span className="px-3 py-1 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest">Haftalık</span>
                                </div>
                                <div className="text-5xl font-black mb-1">8.4</div>
                                <div className="text-sm font-bold opacity-80 uppercase tracking-wide">Ortalama Performans</div>
                            </div>

                            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Devamsızlık</h4>
                                    <span className="text-emerald-500 font-black text-sm">%92 Katılım</span>
                                </div>
                                <div className="flex gap-1 mt-4">
                                    {[1,1,1,1,0,1,1,1,1,1].map((s, i) => (
                                        <div key={i} className={`flex-1 h-12 rounded-lg ${s ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}></div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-zinc-500 uppercase text-xs tracking-widest">Son Aktiviteler</h4>
                                    <button className="text-indigo-500 text-xs font-bold">Tümü</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-puzzle-piece"></i></div>
                                        <div>
                                            <h5 className="font-bold text-sm dark:text-white">Görsel Dikkat</h5>
                                            <p className="text-[10px] text-zinc-400">2 saat önce • %85 Başarı</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><i className="fa-solid fa-book"></i></div>
                                        <div>
                                            <h5 className="font-bold text-sm dark:text-white">Okuma Akıcılığı</h5>
                                            <p className="text-[10px] text-zinc-400">Dün • %72 Başarı</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ContentWrapper>
                )}

                {selectedModule === 'iep' && (
                    <ContentWrapper 
                        title="Bireyselleştirilmiş Eğitim Programı" 
                        subtitle="Özel öğrenme hedefleri ve ilerleme takibi."
                        actions={<button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/20"><i className="fa-solid fa-plus mr-2"></i>Yeni Hedef</button>}
                    >
                        <IEPModule student={currentStudent} />
                    </ContentWrapper>
                )}

                {selectedModule === 'financial' && (
                    <ContentWrapper 
                        title="Finansal Durum" 
                        subtitle="Ödemeler, burslar ve harcamalar."
                        actions={<button className="bg-zinc-900 text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-xl text-sm font-bold"><i className="fa-solid fa-receipt mr-2"></i>Tahsilat Ekle</button>}
                    >
                        <FinancialModule student={currentStudent} />
                    </ContentWrapper>
                )}
                
                {/* Other modules placeholders can be added here */}
                {['attendance', 'grades', 'portfolio', 'behavior', 'settings'].includes(selectedModule) && (
                    <ContentWrapper title={selectedModule.charAt(0).toUpperCase() + selectedModule.slice(1)} subtitle="Bu modül geliştirme aşamasındadır.">
                        <div className="flex flex-col items-center justify-center h-96 text-zinc-400 border-4 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[3rem]">
                            <i className="fa-solid fa-code-branch text-6xl mb-4 opacity-20"></i>
                            <p className="font-bold">Geliştirme Aşamasında</p>
                            <p className="text-xs mt-2">Ultra-profesyonel özellikler yükleniyor...</p>
                        </div>
                    </ContentWrapper>
                )}
            </div>
        </div>
    );
};
