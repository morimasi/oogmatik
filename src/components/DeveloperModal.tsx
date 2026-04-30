import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeveloperModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden font-['Lexend']">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="relative bg-[var(--bg-paper)] rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Section - Glassmorphic Hero */}
                        <div className="relative h-48 shrink-0 overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-900">
                             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                             <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-paper)] to-transparent"></div>
                             
                             {/* Close Button */}
                             <button
                                onClick={onClose}
                                className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-black/20 hover:bg-black/40 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 group"
                             >
                                <i className="fa-solid fa-times group-hover:rotate-90 transition-transform"></i>
                             </button>

                             <div className="absolute bottom-4 left-10 flex items-end gap-6 z-10">
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="w-24 h-24 rounded-[2rem] bg-white p-1 shadow-2xl"
                                >
                                    <div className="w-full h-full rounded-[1.8rem] overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl">
                                        <i className="fa-solid fa-code"></i>
                                    </div>
                                </motion.div>
                                <div className="mb-2">
                                    <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-2">BURSA DİSLEKSİ</h2>
                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-60">Mühendislik & AI Laboratuvarı</p>
                                </div>
                             </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Core Info - Bento Card */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] border border-[var(--border-color)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-bl-[5rem] transition-all group-hover:scale-125"></div>
                                        <h3 className="text-xs font-black text-[var(--accent-color)] uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-rocket-launch"></i> PLATFORM MİSYONU
                                        </h3>
                                        <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed opacity-90 italic">
                                            "Teknolojiyi bir engel değil, bir köprü olarak görüyoruz. Oogmatik, özel öğrenme güçlüğü olan her çocuğun hayallerine ulaşması için tasarlanmış en gelişmiş AI ekosistemidir."
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-[var(--bg-paper)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-sm">
                                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-4 tracking-widest">İLETİŞİM</h4>
                                            <div className="space-y-3">
                                                <a href="mailto:iletisim@bursadisleksi.com" className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center"><i className="fa-solid fa-envelope"></i></div>
                                                    iletisim@bursadisleksi.com
                                                </a>
                                                <a href="#" className="flex items-center gap-3 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center"><i className="fa-brands fa-linkedin"></i></div>
                                                    Bursa Disleksi LinkedIn
                                                </a>
                                            </div>
                                        </div>
                                        <div className="bg-[var(--bg-paper)] p-6 rounded-[2rem] border border-[var(--border-color)] shadow-sm">
                                            <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-4 tracking-widest">GELİŞTİRME OFİSİ</h4>
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center shrink-0"><i className="fa-solid fa-location-dot"></i></div>
                                                <p className="text-xs font-bold text-[var(--text-primary)] leading-snug">Bursa, Türkiye<br/><span className="text-[10px] opacity-50 uppercase">AR-GE MERKEZİ</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Stats - Bento Card */}
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-br from-slate-900 to-black p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
                                            <i className="fa-solid fa-microchip text-2xl text-indigo-400"></i>
                                        </div>
                                        <div className="text-4xl font-black tracking-tighter mb-1">1.0.8</div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">ULTRA PRO SÜRÜM</p>
                                    </div>

                                    <div className="bg-[var(--bg-secondary)] p-6 rounded-[2rem] border border-[var(--border-color)]">
                                      <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase mb-4 tracking-widest text-center">TEKNOLOJİ STACK</h4>
                                      <div className="flex flex-wrap justify-center gap-2">
                                          {['React 18', 'TS Strict', 'Gemini AI', 'Tailwind', 'Firebase', 'Vite'].map(tech => (
                                              <span key={tech} className="px-3 py-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-full text-[9px] font-black text-[var(--text-primary)] uppercase tracking-tighter">{tech}</span>
                                          ))}
                                      </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tech Badges Section */}
                            <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
                                <div className="flex flex-wrap justify-center items-center gap-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                                    <i className="fa-brands fa-react text-2xl"></i>
                                    <i className="fa-brands fa-google text-2xl"></i>
                                    <i className="fa-brands fa-js text-2xl"></i>
                                    <i className="fa-solid fa-fire-flame-curved text-2xl"></i>
                                    <i className="fa-solid fa-wind text-2xl"></i>
                                    <i className="fa-solid fa-database text-2xl"></i>
                                </div>
                                <p className="text-center mt-12 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] opacity-30">
                                    &copy; {new Date().getFullYear()} BURSA DİSLEKSİ EDU-TECH SOLUTIONS
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
