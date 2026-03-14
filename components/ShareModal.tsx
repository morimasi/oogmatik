
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShare: (receiverIds: string[]) => void;
    worksheetId: string;
    worksheetTitle?: string;
    isSending?: boolean;
}

const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [activeTab, setActiveTab] = useState<'direct' | 'link' | 'qr'>('direct');
const [copySuccess, setCopySuccess] = useState(false);

useEffect(() => {
    if (user && isOpen) {
        authService.getContacts(user.id).then(setContacts);
        setSelectedIds([]); // Reset on open
    }
}, [user, isOpen]);

const filteredContacts = contacts.filter((c: User) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
};

const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}?share=${worksheetId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
};

if (!isOpen) return null;

return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[85vh]">

            {/* Header */}
            <div className="bg-zinc-900 dark:bg-black p-5 flex justify-between items-center text-white">
                <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <i className="fa-solid fa-share-nodes"></i> Paylaş
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 truncate max-w-[250px]">{worksheetTitle || 'Etkinlik'}</p>
                </div>
                <button onClick={onClose} disabled={isSending} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                <button
                    onClick={() => setActiveTab('direct')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'direct' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                    Kişiler
                </button>
                <button
                    onClick={() => setActiveTab('link')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'link' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                    Bağlantı
                </button>
                <button
                    onClick={() => setActiveTab('qr')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'qr' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                    QR Kod
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-zinc-800 relative">

                {activeTab === 'direct' && (
                    <div className="flex flex-col h-full">
                        <div className="space-y-4">
                            <div className="relative">
                                <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                                <input
                                    type="text"
                                    placeholder="Kişi ara..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                    className="w-full p-2 pl-9 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                />
                            </div>

                            {filteredContacts.length === 0 ? (
                                <div className="text-center py-8 text-zinc-400">
                                    <i className="fa-regular fa-user text-3xl mb-2"></i>
                                    <p>Kişi bulunamadı.</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                                    {filteredContacts.map((contact: User) => {
                                        const isSelected = selectedIds.includes(contact.id);
                                        return (
                                            <button
                                                key={contact.id}
                                                onClick={() => toggleSelect(contact.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left border ${isSelected ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'hover:bg-zinc-50 dark:hover:bg-zinc-700/30 border-transparent'}`}
                                            >
                                                <div className="relative">
                                                    <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600 bg-white" />
                                                    {isSelected && (
                                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white border-2 border-white dark:border-zinc-800">
                                                            <i className="fa-solid fa-check"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm truncate">{contact.name}</p>
                                                    <p className="text-xs text-zinc-500 truncate">{contact.email}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedIds.length > 0 && (
                            <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-700/50 flex flex-col gap-3">
                                <p className="text-xs text-zinc-500 font-medium">{selectedIds.length} kişi seçildi</p>
                                <button
                                    onClick={() => onShare(selectedIds)}
                                    disabled={isSending}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane text-xs"></i>}
                                    Paylaşımı Gönder
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'link' && (
                    <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-2 rotate-12">
                            <i className="fa-solid fa-link"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Güvenli Bağlantı</h4>
                            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">Bu bağlantıya sahip olan herkes etkinliği görüntüleyebilir.</p>
                        </div>

                        <div className="w-full bg-zinc-100 dark:bg-zinc-900/50 p-2 rounded-xl flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                            <span className="flex-1 text-xs text-zinc-500 truncate px-2 font-mono">{window.location.origin}?share={worksheetId}</span>
                            <button
                                onClick={handleCopyLink}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-zinc-800 dark:bg-zinc-700 text-white hover:bg-black'}`}
                            >
                                {copySuccess ? <><i className="fa-solid fa-check mr-1"></i> Kopyalandı</> : 'Kopyala'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'qr' && (
                    <div className="flex flex-col items-center justify-center h-full py-4 text-center space-y-5">
                        <div className="p-5 bg-white rounded-3xl shadow-xl border-4 border-zinc-50 relative group">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.origin + '?share=' + worksheetId)}`}
                                alt="QR Code"
                                className="w-44 h-44 mix-blend-multiply"
                            />
                            <div className="absolute inset-0 bg-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Akıllı QR Kod</h4>
                            <p className="text-sm text-zinc-500 mt-1">Mobil cihazın kamerasından okutarak doğrudan açın.</p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-2 bg-zinc-100 dark:bg-zinc-700/50 rounded-full text-zinc-600 dark:text-zinc-300 text-sm font-bold hover:bg-zinc-200 transition-all">
                            <i className="fa-solid fa-download"></i> Kaydet
                        </button>
                    </div>
                )}

            </div>
        </div>
    </div>
);
};
