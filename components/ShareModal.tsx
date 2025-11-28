
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

    useEffect(() => {
        if (user && isOpen) {
            authService.getContacts(user.id).then(setContacts);
        }
    }, [user, isOpen]);
    
    const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md flex flex-col border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[80vh]">
              <div className="bg-indigo-600 p-4 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <i className="fa-solid fa-share-nodes"></i> Paylaş
                  </h3>
                  <button onClick={onClose} disabled={isSending} className="text-white/80 hover:text-white transition-colors disabled:opacity-50">
                      <i className="fa-solid fa-times text-xl"></i>
                  </button>
              </div>
              
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                  <input 
                      type="text" 
                      placeholder="Kişi ara..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>

              <div className="overflow-y-auto flex-1 p-2">
                  {filteredContacts.length === 0 ? (
                      <p className="text-center text-zinc-500 p-4">Kişi bulunamadı.</p>
                  ) : (
                      <div className="space-y-2">
                          {filteredContacts.map(contact => (
                              <button 
                                  key={contact.id}
                                  onClick={() => onShare(contact.id)}
                                  disabled={isSending}
                                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-left disabled:opacity-50 group"
                              >
                                  <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-600" />
                                  <div>
                                      <p className="font-bold text-zinc-800 dark:text-zinc-100">{contact.name}</p>
                                      <p className="text-xs text-zinc-500">{contact.email}</p>
                                  </div>
                                  <div className="ml-auto text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {isSending ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                                  </div>
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      </div>
    );
};
