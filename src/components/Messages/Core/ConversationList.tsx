import React, { useState } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { IConversation } from '../../../types/messaging';
import { Search, MessageSquare, Users, BellOff } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { Timestamp } from 'firebase/firestore';

// Mock datalar gerçek servisten çekilecek şekilde güncellenecektir.
const mockConversations: IConversation[] = [
  {
    id: "conv-1",
    type: "direct",
    participants: [],
    lastMessage: {
      id: "msg-12",
      text: "Merhaba, ödevleri kontrol edebildiniz mi?",
      senderId: "user-veli-1",
      createdAt: Timestamp.now()
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

export const ConversationList: React.FC = () => {
    const { activeConversationId, setActiveConversationId } = useMessageStore();
    const [searchTerm, setSearchTerm] = useState('');
    // Gerçekte useQuery veya firebase onSnapshot ile güncellenmiş olacak
    const conversations = mockConversations; 

    return (
        <div className="flex flex-col h-full w-80 backdrop-blur-xl bg-[#0f1115]/80 border-r border-white/5 font-inter">
            {/* Header */}
            <div className="p-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white mb-4">Mesajlar</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input 
                        type="text" 
                        placeholder="Öğrenci, veli veya öğretmen ara..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-2 space-y-1">
                {conversations.map((conv) => {
                    const isActive = activeConversationId === conv.id;
                    const isGroup = conv.type !== "direct";
                    
                    return (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-start gap-3 group
                                ${isActive 
                                    ? 'bg-accent-primary/20 border-accent-primary/30' 
                                    : 'hover:bg-white/5 border-transparent'
                                } border
                            `}
                        >
                            <div className="relative flex-shrink-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center 
                                    ${isGroup ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}
                                `}>
                                    {isGroup ? <Users className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                </div>
                                {/* Online Status Mock */}
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0f1115] rounded-full"></div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-medium text-sm text-white truncate">
                                        {isGroup ? conv.title : 'Veli (Ahmet)'}
                                    </h3>
                                    <span className="text-[10px] text-white/40">10:42</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-white/50'} font-lexend`}>
                                        {conv.lastMessage?.text || 'Yeni mesaj yok'}
                                    </p>
                                    {/* Mute Icon */}
                                    <BellOff className="w-3 h-3 text-white/20 hidden group-hover:block" />
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
