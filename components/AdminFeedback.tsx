
import React, { useState, useEffect } from 'react';
import { FeedbackItem, FeedbackStatus } from '../types';
import { messagingService } from '../services/messagingService';

export const AdminFeedback: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'read' | 'resolved'>('all');
    const [replyText, setReplyText] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { feedbacks: data } = await messagingService.getAllFeedbacks(0, 100);
        setFeedbacks(data);
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, status: FeedbackStatus) => {
        // Optimistic
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
        if (selectedFeedback && selectedFeedback.id === id) {
            setSelectedFeedback({ ...selectedFeedback, status });
        }
        await messagingService.updateFeedbackStatus(id, status);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        if (selectedFeedback?.id === id) setSelectedFeedback(null);
        await messagingService.deleteFeedback(id);
    };

    const filtered = feedbacks.filter(f => filterStatus === 'all' || f.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'read': return 'bg-zinc-100 text-zinc-700';
            case 'in-progress': return 'bg-amber-100 text-amber-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            default: return 'bg-zinc-100';
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'bug': return 'fa-bug text-red-500';
            case 'feature': return 'fa-lightbulb text-yellow-500';
            case 'content': return 'fa-file-lines text-blue-500';
            default: return 'fa-comment text-zinc-500';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            {/* Sidebar List */}
            <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-black/20">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-4">Gelen Kutusu</h3>
                    <div className="flex gap-2">
                        {['all', 'new', 'resolved'].map(s => (
                            <button 
                                key={s}
                                onClick={() => setFilterStatus(s as any)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${filterStatus === s ? 'bg-white dark:bg-zinc-700 shadow-sm text-black dark:text-white' : 'text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                            >
                                {s === 'all' ? 'Tümü' : s === 'new' ? 'Yeni' : 'Çözüldü'}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loading ? <div className="p-4 text-center text-zinc-400">Yükleniyor...</div> : (
                        filtered.map(item => (
                            <div 
                                key={item.id}
                                onClick={() => { setSelectedFeedback(item); if(item.status === 'new') handleStatusUpdate(item.id, 'read'); }}
                                className={`p-4 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition-colors hover:bg-white dark:hover:bg-zinc-800 group ${selectedFeedback?.id === item.id ? 'bg-white dark:bg-zinc-800 border-l-4 border-l-indigo-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${getStatusColor(item.status)}`}>{item.status}</span>
                                    <span className="text-[10px] text-zinc-400">{new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                                <h4 className={`text-sm font-bold mb-1 truncate ${item.status === 'new' ? 'text-black dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                                    <i className={`mr-2 fa-solid ${getCategoryIcon(item.category)}`}></i>
                                    {item.userName}
                                </h4>
                                <p className="text-xs text-zinc-500 truncate">{item.message}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
                {selectedFeedback ? (
                    <>
                        {/* Detail Header */}
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-900">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{selectedFeedback.activityTitle || 'Genel Bildirim'}</h2>
                                <div className="flex items-center gap-3 text-sm text-zinc-500">
                                    <span className="flex items-center gap-1"><i className="fa-regular fa-user"></i> {selectedFeedback.userName}</span>
                                    <span className="flex items-center gap-1"><i className="fa-regular fa-envelope"></i> {selectedFeedback.userEmail || 'Anonim'}</span>
                                    <span className="flex items-center gap-1"><i className="fa-regular fa-clock"></i> {new Date(selectedFeedback.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(selectedFeedback.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors" title="Sil"><i className="fa-solid fa-trash"></i></button>
                                <select 
                                    value={selectedFeedback.status}
                                    onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value as any)}
                                    className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-xs font-bold px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="new">Yeni</option>
                                    <option value="read">Okundu</option>
                                    <option value="in-progress">İşleniyor</option>
                                    <option value="resolved">Çözüldü</option>
                                </select>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700 mb-8">
                                <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{selectedFeedback.message}</p>
                            </div>

                            {selectedFeedback.rating > 0 && (
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Puanlama</span>
                                    <div className="flex gap-1">
                                        {Array.from({length: 5}).map((_, i) => (
                                            <i key={i} className={`fa-solid fa-star text-lg ${i < selectedFeedback.rating ? 'text-yellow-400' : 'text-zinc-200 dark:text-zinc-700'}`}></i>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Context Data if available */}
                            {selectedFeedback.activityType && (
                                <div className="mb-8">
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-2">Bağlam</span>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-mono rounded border border-indigo-100 dark:border-indigo-800">
                                        {selectedFeedback.activityType}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Reply Box (Mock for now) */}
                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black">
                            <textarea 
                                className="w-full p-4 border border-zinc-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-zinc-900 text-sm resize-none h-24 mb-3"
                                placeholder="Yanıt yaz..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end">
                                <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">
                                    Yanıtla & Çözüldü İşaretle
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
                        <i className="fa-regular fa-envelope-open text-6xl mb-4 opacity-20"></i>
                        <p>Görüntülemek için bir geri bildirim seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
