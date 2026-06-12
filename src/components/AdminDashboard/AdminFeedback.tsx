import React, { useState, useEffect, useMemo } from 'react';
import { FeedbackItem, FeedbackStatus, FeedbackCategory } from '../../types';
import { feedbackService } from '../../services/feedbackService';
import { motion, AnimatePresence } from 'framer-motion';
import { logError } from '../../utils/logger';

export const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | FeedbackStatus>('all');
    const [filterCategory, setFilterCategory] = useState<'all' | FeedbackCategory>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const { feedbacks: data } = await feedbackService.getAllFeedbacks(0, 100);
            setFeedbacks(data);
        } catch (error) {
            logError("Feedbacks load failed", { error });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
        if (selectedFeedback && selectedFeedback.id === id) {
            setSelectedFeedback({ ...selectedFeedback, status });
        }
        await feedbackService.updateFeedbackStatus(id, status);
    };

    const handleReply = async (resolve: boolean = false) => {
        if (!selectedFeedback || !replyText.trim()) return;
        setIsSubmittingReply(true);
        try {
            await feedbackService.submitReply(selectedFeedback.id, replyText, resolve);
            const updatedStatus: FeedbackStatus = resolve ? 'resolved' : 'replied';
            
            setFeedbacks(prev => prev.map(f => f.id === selectedFeedback.id 
                ? { ...f, adminReply: replyText, status: updatedStatus } 
                : f
            ));
            setSelectedFeedback(prev => prev ? { ...prev, adminReply: replyText, status: updatedStatus } : null);
            setReplyText('');
        } catch (error) {
            logError("Reply failed", { error });
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu bildirimi kalıcı olarak silmek istediğinize emin misiniz?')) return;
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        if (selectedFeedback?.id === id) setSelectedFeedback(null);
        await feedbackService.deleteFeedback(id);
    };

    const stats = useMemo(() => {
        return {
            total: feedbacks.length,
            new: feedbacks.filter(f => f.status === 'new').length,
            bug: feedbacks.filter(f => f.category === 'bug').length,
            resolved: feedbacks.filter(f => f.status === 'resolved').length
        };
    }, [feedbacks]);

    const filtered = useMemo(() => {
        return feedbacks.filter(f => {
            const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
            const matchesCategory = filterCategory === 'all' || f.category === filterCategory;
            const matchesSearch = !searchQuery || 
                f.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.activityTitle?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesCategory && matchesSearch;
        });
    }, [feedbacks, filterStatus, filterCategory, searchQuery]);

    const getStatusStyles = (status: FeedbackStatus) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'read': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            case 'in-progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'replied': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
            case 'resolved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            default: return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        }
    };

    const getCategoryIcon = (cat: FeedbackCategory) => {
        switch (cat) {
            case 'bug': return 'fa-bug text-rose-500';
            case 'feature': return 'fa-lightbulb text-amber-500';
            case 'content': return 'fa-file-lines text-sky-500';
            case 'general': return 'fa-comment-dots text-indigo-500';
            default: return 'fa-comment text-zinc-500';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6 font-['Inter']">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Toplam', value: stats.total, icon: 'fa-envelope', color: 'indigo' },
                    { label: 'Yeni', value: stats.new, icon: 'fa-bell', color: 'blue' },
                    { label: 'Hatalar', value: stats.bug, icon: 'fa-bug', color: 'rose' },
                    { label: 'Çözüldü', value: stats.resolved, icon: 'fa-check-double', color: 'emerald' }
                ].map((stat, i) => (
                    <div key={i} className="bg-black/20 backdrop-blur-xl border border-white/5 p-4 rounded-2xl flex items-center gap-4 group hover:border-white/10 transition-all">
                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                            <i className={`fa-solid ${stat.icon} text-lg`}></i>
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                            <p className="text-xl font-black text-white leading-none">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 flex bg-black/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                {/* Sidebar List */}
                <div className="w-[380px] border-r border-white/5 flex flex-col bg-black/10">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">BİLDİRİM LİSTESİ</h3>
                            <button onClick={loadData} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 transition-all flex items-center justify-center">
                                <i className={`fa-solid fa-sync-alt text-xs ${loading ? 'fa-spin' : ''}`}></i>
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs"></i>
                            <input 
                                type="text"
                                placeholder="Mesaj, kullanıcı veya konu ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:ring-1 focus:ring-indigo-500 focus:bg-white/10 outline-none transition-all"
                            />
                        </div>

                        {/* Quick Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'new', 'in-progress', 'resolved'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s as any)}
                                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all border ${filterStatus === s ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-zinc-500 border-transparent hover:border-white/10'}`}
                                >
                                    {s === 'all' ? 'Tümü' : s === 'in-progress' ? 'İşlemde' : s === 'resolved' ? 'Çözüldü' : 'Yeni'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-30">
                                <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Yükleniyor...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-10 text-center">
                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Sonuç Bulunamadı</p>
                            </div>
                        ) : (
                            filtered.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => { 
                                        setSelectedFeedback(item); 
                                        if (item.status === 'new') handleStatusUpdate(item.id, 'read'); 
                                    }}
                                    className={`p-5 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 group relative
                                        ${selectedFeedback?.id === item.id ? 'bg-indigo-500/5' : ''}`}
                                >
                                    {selectedFeedback?.id === item.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <i className={`fa-solid ${getCategoryIcon(item.category)} text-xs`}></i>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${getStatusStyles(item.status)}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-zinc-600">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className={`text-xs font-black mb-1 truncate tracking-tight ${item.status === 'new' ? 'text-white' : 'text-zinc-400'}`}>
                                        {item.userName}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 font-bold leading-normal line-clamp-2 uppercase tracking-tight">
                                        {item.activityTitle || 'GENEL BİLDİRİM'}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 italic line-clamp-1 mt-2">"{item.message}"</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 flex flex-col bg-black/20">
                    {selectedFeedback ? (
                        <div className="flex-1 flex flex-col h-full font-['Lexend']">
                            {/* Detail Header */}
                            <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-start shrink-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                            <i className={`fa-solid ${getCategoryIcon(selectedFeedback.category)} text-lg`}></i>
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-black text-white uppercase tracking-wider leading-none mb-2">
                                                {selectedFeedback.activityTitle || 'Genel Bildirim'}
                                            </h2>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><i className="fa-regular fa-user text-indigo-400"></i> {selectedFeedback.userName}</span>
                                                <span className="flex items-center gap-1.5"><i className="fa-regular fa-envelope text-indigo-400"></i> {selectedFeedback.userEmail || 'Bilinmiyor'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleDelete(selectedFeedback.id)} 
                                        className="w-10 h-10 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all flex items-center justify-center" 
                                        title="Sil"
                                    >
                                        <i className="fa-solid fa-trash-alt text-sm"></i>
                                    </button>
                                    <select
                                        value={selectedFeedback.status}
                                        onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value as any)}
                                        className="bg-black/40 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest px-4 py-2.5 outline-none focus:ring-1 focus:ring-indigo-500 text-white cursor-pointer"
                                    >
                                        <option value="new">Yeni</option>
                                        <option value="read">İncelendi</option>
                                        <option value="in-progress">İşlemde</option>
                                        <option value="resolved">Çözüldü</option>
                                    </select>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
                                <div className="max-w-3xl">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-4">GÖNDERİLEN MESAJ</span>
                                    <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 relative group">
                                        <i className="fa-solid fa-quote-left absolute -top-3 -left-3 text-3xl text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors"></i>
                                        <p className="text-sm font-medium text-zinc-100 leading-relaxed whitespace-pre-wrap tracking-tight">
                                            {selectedFeedback.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 max-w-3xl">
                                    {selectedFeedback.rating > 0 && (
                                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4 underline decoration-indigo-500/30 underline-offset-4">KULLANICI PUANLAMASI</span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i key={star} className={`fa-solid fa-star text-lg ${star <= selectedFeedback.rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]' : 'text-white/5'}`}></i>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedFeedback.activityType && (
                                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-4 underline decoration-indigo-500/30 underline-offset-4">SİSTEM BAĞLAMI</span>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                    <i className="fa-solid fa-code text-xs"></i>
                                                </div>
                                                <span className="text-[11px] font-mono font-bold text-indigo-300/80 bg-indigo-500/5 px-3 py-1 rounded-md border border-indigo-500/10">
                                                    {selectedFeedback.activityType}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {selectedFeedback.adminReply && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="max-w-3xl"
                                    >
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] block mb-4 flex items-center gap-2">
                                            <i className="fa-solid fa-reply-all"></i> YÖNETİCİ YANITI
                                        </span>
                                        <div className="bg-emerald-500/5 backdrop-blur-xl p-8 rounded-[2rem] border border-emerald-500/10">
                                            <p className="text-sm font-medium text-emerald-100 leading-relaxed whitespace-pre-wrap tracking-tight">
                                                {selectedFeedback.adminReply}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Reply Box */}
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10 shrink-0">
                                <div className="max-w-3xl relative group/reply">
                                    <textarea
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-6 text-white text-sm font-medium placeholder-zinc-500 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white/[0.05] transition-all resize-none h-32 mb-4 custom-scrollbar"
                                        placeholder="Kullanıcıya yanıt yaz veya süreçle ilgili not al..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                    ></textarea>
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            onClick={() => handleReply(false)}
                                            disabled={!replyText.trim() || isSubmittingReply}
                                            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 disabled:opacity-20 active:scale-95"
                                        >
                                            Sadece Yanıtla
                                        </button>
                                        <button 
                                            onClick={() => handleReply(true)}
                                            disabled={!replyText.trim() || isSubmittingReply}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 transition-all border border-indigo-400/20 disabled:opacity-20 active:scale-95 flex items-center gap-2"
                                        >
                                            {isSubmittingReply ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-check-circle"></i>}
                                            Yanıtla & Çözüldü Olarak İşaretle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/5 opacity-50 rotate-3">
                                <i className="fa-solid fa-envelope-open text-4xl"></i>
                            </div>
                            <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-2">Gelen Kutusu Beklemede</h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest tracking-tight">Detayları görmek için sol listeden bir bildirim seçin</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

