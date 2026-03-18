import React from 'react';

interface DeveloperModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300"
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
        >
            <div
                className="bg-[var(--bg-primary)] rounded-[2.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border border-[var(--border-color)]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Background */}
                <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] rounded-t-[2.5rem] overflow-hidden opacity-90">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '24px 24px',
                        }}
                    ></div>
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--bg-primary)] to-transparent"></div>
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10 backdrop-blur-md"
                >
                    <i className="fa-solid fa-times text-lg"></i>
                </button>

                <div className="relative pt-12 px-6 sm:px-12 pb-12">
                    {/* Developer Avatar & Intro */}
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12 relative z-10">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-[#09090b] shadow-xl shrink-0 bg-white">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=developer"
                                alt="Developer"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">
                                Bursa Disleksi Geliştirici Ekibi
                            </h2>
                            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                                <i className="fa-solid fa-code text-indigo-500"></i> AI & Eğitim Teknolojileri
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 hover:border-indigo-200 transition-all hover:-translate-y-1"
                            >
                                <i className="fa-brands fa-github text-xl"></i>
                            </a>
                            <a
                                href="#"
                                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:-translate-y-1"
                            >
                                <i className="fa-brands fa-linkedin text-xl"></i>
                            </a>
                            <a
                                href="mailto:iletisim@bursadisleksi.com"
                                className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-rose-600 hover:border-rose-200 transition-all hover:-translate-y-1"
                            >
                                <i className="fa-solid fa-envelope text-xl"></i>
                            </a>
                        </div>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Mission */}
                        <div className="md:col-span-2 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
                            <div className="flex items-center gap-4 mb-6 relative">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center text-xl">
                                    <i className="fa-solid fa-rocket"></i>
                                </div>
                                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                                    Vizyonumuz
                                </h3>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed relative">
                                Amacımız, özel eğitim ihtiyacı olan bireyler için{' '}
                                <strong>yapay zeka destekli</strong>, kişiselleştirilmiş ve bilimsel temellere
                                dayanan araçlar üreterek öğrenme süreçlerini hızlandırmak ve eğitimcilerin yükünü
                                hafifletmektir. Teknoloji ve pedagojiyi harmanlayarak fırsat eşitliği sunmayı
                                hedefliyoruz.
                            </p>
                        </div>

                        {/* Version Info */}
                        <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm flex flex-col justify-center items-center text-center group">
                            <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 border-4 border-white dark:border-zinc-800 shadow-inner flex items-center justify-center mb-4 group-hover:rotate-180 transition-transform duration-700">
                                <i className="fa-solid fa-microchip text-3xl text-zinc-400"></i>
                            </div>
                            <div className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter mb-1">
                                {(import.meta as any).env?.VITE_APP_VERSION || '1.0.3'}
                            </div>
                            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                                Güncel Sürüm
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div className="md:col-span-3 bg-white dark:bg-zinc-800 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl">
                                    <i className="fa-solid fa-layer-group"></i>
                                </div>
                                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                                    Kullanılan Teknolojiler
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                                {[
                                    { name: 'React', icon: 'fa-brands fa-react text-blue-500' },
                                    { name: 'TypeScript', icon: 'fa-brands fa-js text-blue-600' },
                                    { name: 'Tailwind', icon: 'fa-solid fa-wind text-cyan-500' },
                                    { name: 'Firebase', icon: 'fa-solid fa-fire text-yellow-500' },
                                    { name: 'Gemini AI', icon: 'fa-solid fa-brain text-emerald-500' },
                                    { name: 'Vite', icon: 'fa-solid fa-bolt text-purple-500' },
                                ].map((tech) => (
                                    <div
                                        key={tech.name}
                                        className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-colors"
                                    >
                                        <i className={`${tech.icon} text-3xl mb-3`}></i>
                                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                                            {tech.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 text-center border-t border-zinc-200 dark:border-zinc-800 pt-8">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} Bursa Disleksi. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
