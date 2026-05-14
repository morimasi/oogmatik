import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';
import { IMessage } from '../../../types/messaging';
import { Trash2, Shield, Calendar, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface ArchivePanelProps {
    onClose: () => void;
}

export const ArchivePanel: React.FC<ArchivePanelProps> = ({ onClose }) => {
    const [deletedMessages, setDeletedMessages] = useState<IMessage[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Sistem genelindeki tüm silinmiş mesajları getirir (Admin/Öğretmen yetkisiyle)
        const q = query(
            collection(db, 'conversations'), // Bu kısım normalde bir Cloud Function veya özel bir view gerektirir
            // Firestore hiyerarşisi nedeniyle koleksiyon grubu sorgusu (collectionGroup) idealdir
            // Şimdilik basitleştirilmiş mock bir mantık kuruyoruz
        );

        // Not: Gerçekte collectionGroup("messages") sorgusu where("isDeleted", "==", true) ile yapılır.
        // Ancak bu index gerektirir. Şimdilik UI iskeletini kuruyoruz.
        setIsLoading(false);
    }, []);

    const formatTime = (ts: Timestamp) => {
        if (!ts) return '';
        return new Date(ts.seconds * 1000).toLocaleString('tr-TR');
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] font-lexend">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Güvenli Mesaj Arşivi</h2>
                        <p className="text-xs text-white/40">Silinen mesajlar ve iletişim kayıtları (Denetim Modu)</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Sub-header / Search */}
            <div className="p-4 bg-white/5 border-b border-white/5">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Arşivde ara (İçerik, kullanıcı)..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-white/20">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p>Arşiv kayıtları taranıyor...</p>
                    </div>
                ) : (
                    <>
                        {/* Mock Data for UI review */}
                        {[1, 2, 3].map((_, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500/30 transition-all group"
                            >
                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center text-[10px] text-accent-primary font-bold">
                                            ÖG
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-white">Öğretmen (Mert)</span>
                                            <span className="mx-2 text-white/20">→</span>
                                            <span className="text-sm text-white/60">Veli (Ahmet)</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                                        <Calendar className="w-3 h-3" />
                                        14.05.2026 14:22
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <div className="text-sm text-white/80 italic line-through decoration-red-500/50">
                                        "Öğrencinin ödevleri hakkında bir sorum olacaktı..."
                                    </div>
                                    <div className="mt-2 text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded inline-flex items-center gap-1">
                                        <Trash2 className="w-3 h-3" /> Silinmiş Veri (Arşivlenmiş)
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="p-8 text-center border-2 border-border-dashed border-white/5 rounded-3xl opacity-20">
                            <Shield className="w-12 h-12 mx-auto mb-4" />
                            <p>Tüm geçmiş kayıtlar 256-bit şifreleme ile korunmaktadır.</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
