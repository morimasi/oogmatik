
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (receiverId: string) => void;
  worksheetTitle?: string;
  isSending?: boolean;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, onShare, worksheetTitle, isSending }) => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'direct' | 'link' | 'qr'>('direct');
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (user && isOpen) {
            authService.getContacts(user.id).then(setContacts);
        }
    }, [user, isOpen]);
    
    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleCopyLink = () => {
        // Mock link generation - in real app would be dynamic route
        const mockLink = `https://bursadisleksi.com/share/${Math.random().toString(36).substr(2, 9)}`;
        navigator.clipboard.writeText(mockLink);
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
                      <div className="space-y-4">
                          <div className="relative">
                            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"></i>
                            <input 
                                type="text" 
                                placeholder="Kişi ara..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 pl-9 border border-zinc-300 dark:border-zinc-600 rounded-xl bg-zinc-50 dark:bg-zinc-700/50 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                            />
                          </div>

                          {filteredContacts.length === 0 ? (
                              <div className="text-center py-8 text-zinc-400">
                                  <i className="fa-regular fa-user text-3xl mb-2"></i>
                                  <p>Kişi bulunamadı.</p>
                              </div>
                          ) : (
                              <div className="space-y-2">
                                  {filteredContacts.map(contact => (
                                      <button 
                                          key={contact.id}
                                          onClick={() => onShare(contact.id)}
                                          disabled={isSending}
                                          className="w-full flex items-center gap-3 p-3 hover:bg-indigo-50 dark:hover:bg-zinc-700/50 rounded-xl transition-all text-left disabled:opacity-50 group border border-transparent hover:border-indigo-100"
                                      >
                                          <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600 bg-white" />
                                          <div className="flex-1 min-w-0">
                                              <p className="font-bold text-zinc-800 dark:text-zinc-100 text-sm truncate">{contact.name}</p>
                                              <p className="text-xs text-zinc-500 truncate">{contact.email}</p>
                                          </div>
                                          <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 shadow-sm transition-all transform group-hover:scale-110">
                                              {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                          </div>
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}

                  {activeTab === 'link' && (
                      <div className="flex flex-col items-center justify-center h-full py-8 text-center space-y-6">
                           <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-2">
                               <i className="fa-solid fa-link"></i>
                           </div>
                           <div>
                               <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Paylaşım Bağlantısı</h4>
                               <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">Bu bağlantıya sahip olan herkes etkinliği görüntüleyebilir.</p>
                           </div>
                           
                           <div className="w-full bg-zinc-100 dark:bg-zinc-900 p-2 rounded-xl flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                               <span className="flex-1 text-xs text-zinc-500 truncate px-2 font-mono">https://bursadisleksi.com/share/...</span>
                               <button 
                                   onClick={handleCopyLink}
                                   className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-zinc-800 text-white hover:bg-black'}`}
                               >
                                   {copySuccess ? <><i className="fa-solid fa-check mr-1"></i> Kopyalandı</> : 'Kopyala'}
                               </button>
                           </div>
                      </div>
                  )}

                  {activeTab === 'qr' && (
                      <div className="flex flex-col items-center justify-center h-full py-4 text-center space-y-4">
                           <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-zinc-100">
                               <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://bursadisleksi.com/share/${Math.random()}`} 
                                    alt="QR Code" 
                                    className="w-40 h-40 mix-blend-multiply" 
                               />
                           </div>
                           <div>
                               <h4 className="font-bold text-zinc-800 dark:text-zinc-100">Mobil Cihazla Tara</h4>
                               <p className="text-sm text-zinc-500 mt-1">Etkinliği telefonda açmak için okutun.</p>
                           </div>
                           <button className="text-indigo-600 text-xs font-bold hover:underline flex items-center gap-1">
                               <i className="fa-solid fa-download"></i> QR Kodunu İndir
                           </button>
                      </div>
                  )}

              </div>
          </div>
      </div>
    );
};
