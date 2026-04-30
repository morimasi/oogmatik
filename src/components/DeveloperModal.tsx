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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 overflow-hidden font-['Lexend']">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        className="relative bg-[var(--bg-paper)] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border-color)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Hero Section */}
                        <div className="relative h-64 shrink-0 overflow-hidden bg-[#0A0A0B]">
                             <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(var(--accent-color) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-paper)]"></div>
                             
                             {/* Animated Tech Circles */}
                             <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--accent-color)]/10 rounded-full blur-[100px] animate-pulse"></div>
                             
                             {/* Close Button */}
                             <button
                                onClick={onClose}
                                className="absolute top-8 right-8 w-14 h-14 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-white/50 flex items-center justify-center backdrop-blur-xl border border-white/10 transition-all z-20 active:scale-90 group"
                             >
                                <i className="fa-solid fa-times text-xl group-hover:rotate-90 transition-transform duration-500"></i>
                             </button>

                             <div className="absolute bottom-10 left-12 flex items-end gap-8 z-10">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[var(--accent-color)] to-purple-600 p-1 shadow-2xl"
                                >
                                    <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-[#0A0A0B] flex items-center justify-center text-white text-5xl">
                                        <i className="fa-solid fa-brain-circuit"></i>
                                    </div>
                                </motion.div>
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] text-[9px] font-black uppercase tracking-widest border border-[var(--accent-color)]/30">Stable Build</span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/30">v1.2.4 Premium</span>
                                    </div>
                                    <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-2">OOGMATİK <span className="text-[var(--accent-color)]">AI</span></h2>
                                    <p className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] opacity-60">Architected by Bursa Disleksi Labs</p>
                                </div>
                             </div>
                        </div>

                        {/* Bento Grid Content */}
                        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                
                                {/* Core Mission - Large Card */}
                                <div className="lg:col-span-8 bg-[var(--bg-secondary)] p-10 rounded-[3rem] border border-[var(--border-color)] relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-color)]/5 rounded-bl-[10rem] transition-all group-hover:scale-110"></div>
                                    <h3 className="text-xs font-black text-[var(--accent-color)] uppercase tracking-wider mb-6 flex items-center gap-3">
                                        <i className="fa-solid fa-microchip-ai"></i> Mühendislik Felsefesi
                                    </h3>
                                    <p className="text-2xl font-medium text-[var(--text-primary)] leading-tight tracking-tight opacity-90">
                                        "Oogmatik, sadece bir yazılım değil; özel eğitimde <span className="font-black border-b-4 border-[var(--accent-color)]/30">veriye dayalı empati</span> kuran bir yapay zeka ekosistemidir. 
                                        Geliştirdiğimiz her satır kod, bir çocuğun öğrenme bariyerini yıkmak için tasarlandı."
                                    </p>
                                    
                                    <div className="mt-10 grid grid-cols-3 gap-6 border-t border-[var(--border-color)] pt-10">
                                        <div>
                                            <div className="text-3xl font-black text-[var(--accent-color)] mb-1 tracking-tighter">40+</div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">AI Üretici</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-[var(--accent-color)] mb-1 tracking-tighter">128ms</div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Yanıt Süresi</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-black text-[var(--accent-color)] mb-1 tracking-tighter">99.9%</div>
                                            <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Ulaşılabilirlik</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tech Stack - Vertical Card */}
                                <div className="lg:col-span-4 bg-[var(--bg-paper)] p-8 rounded-[3rem] border border-[var(--border-color)] flex flex-col items-center">
                                    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-8">Teknoloji Yığını</h3>
                                    <div className="flex flex-col gap-4 w-full">
                                        {[
                                            { name: 'Gemini 2.5 Flash', icon: 'fa-sparkles', color: 'text-indigo-400' },
                                            { name: 'React 18 + TS', icon: 'fa-cube', color: 'text-blue-400' },
                                            { name: 'Framer Motion', icon: 'fa-film', color: 'text-rose-400' },
                                            { name: 'Firebase Cloud', icon: 'fa-fire', color: 'text-orange-400' },
                                            { name: 'Vercel Edge', icon: 'fa-bolt', color: 'text-emerald-400' },
                                        ].map(tech => (
                                            <div key={tech.name} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-all group">
                                                <div className={`w-10 h-10 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center ${tech.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                                                    <i className={`fa-solid ${tech.icon}`}></i>
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-tight text-[var(--text-primary)]">{tech.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact & Location - Horizontal Spanning */}
                                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
                                    <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-[var(--accent-color)] transition-all duration-500 shadow-xl">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-paper)] flex items-center justify-center text-[var(--accent-color)] mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                            <i className="fa-solid fa-envelope text-xl"></i>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-white/60 text-[var(--text-muted)]">İletişim</h4>
                                        <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-white transition-colors">iletisim@bursadisleksi.com</p>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-slate-900 transition-all duration-500 shadow-xl">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-paper)] flex items-center justify-center text-slate-500 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                            <i className="fa-brands fa-linkedin-in text-xl"></i>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-white/60 text-[var(--text-muted)]">Profesyonel Ağ</h4>
                                        <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-white transition-colors">Linkedin: Bursa Disleksi</p>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-indigo-900 transition-all duration-500 shadow-xl">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-paper)] flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform shadow-lg">
                                            <i className="fa-solid fa-map-marker-alt text-xl"></i>
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-white/60 text-[var(--text-muted)]">Laboratuvar</h4>
                                        <p className="text-sm font-black text-[var(--text-primary)] group-hover:text-white transition-colors">Bursa, Türkiye</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Logos */}
                            <div className="mt-20 pt-10 border-t border-[var(--border-color)] flex flex-col items-center">
                                <div className="flex items-center gap-12 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                                    <i className="fa-brands fa-react text-2xl"></i>
                                    <i className="fa-brands fa-google text-2xl"></i>
                                    <i className="fa-brands fa-node-js text-2xl"></i>
                                    <i className="fa-brands fa-git-alt text-2xl"></i>
                                    <i className="fa-solid fa-cloud text-2xl"></i>
                                </div>
                                <p className="mt-12 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.6em] opacity-40">
                                    &copy; {new Date().getFullYear()} BURSA DİSLEKSİ &middot; EDU-TECH ENGINEERING SOLUTIONS
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
