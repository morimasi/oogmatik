import React, { useState } from 'react';
import { Mail, AlertTriangle, Send as SendIcon, CheckCircle, Search } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

// Mock data (Firebase'den çekilecek)
const mockReports = [
    { id: 1, sender: "Veli (Ahmet)", reason: "Spam / Rahatsız Edici", messageId: "msg-99", date: "Bugün 10:45" },
    { id: 2, sender: "Öğrenci (Ali)", reason: "Uygunsuz Dil", messageId: "msg-101", date: "Dün 14:20" }
];

export const AdminCommunication: React.FC = () => {
    const [broadcastText, setBroadcastText] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleBroadcast = () => {
        if(!broadcastText) return;
        setIsSending(true);
        // messageService.createConversation & sendMessage çağrılır
        setTimeout(() => {
            setIsSending(false);
            setBroadcastText("");
            alert("Tüm kullanıcılara 'Sistem Duyurusu' başarıyla gönderildi!");
        }, 1000);
    };

    return (
        <div className="p-6 h-full flex flex-col font-inter">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Mail className="w-6 h-6 text-accent-primary" />
                İletişim ve Denetim Merkezi
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Broadcast Paneli */}
                <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 flex flex-col shadow-2xl">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <SendIcon className="w-5 h-5 text-blue-400" />
                        Genel Duyuru (Broadcast) Oluştur
                    </h3>
                    <p className="text-sm text-white/50 mb-4">
                        Bu alandan göndereceğiniz mesajlar sistemdeki tüm öğretmen, veli ve uygun yaştaki öğrencilere "Sistem Mesajı" olarak iletilecektir.
                    </p>
                    <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 h-32 resize-none custom-scrollbar font-lexend"
                        placeholder="Örn: Sistem saat 22:00'de bakıma alınacaktır..."
                        value={broadcastText}
                        onChange={(e) => setBroadcastText(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-auto">
                        <span className="text-xs text-white/30 truncate">
                            Gönderilecek kişi sayısı: ~450
                        </span>
                        <button 
                            disabled={!broadcastText || isSending}
                            onClick={handleBroadcast}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl flex items-center gap-2 transition-colors font-medium"
                        >
                            {isSending ? 'Gönderiliyor...' : 'Duyuruyu Yayınla'}
                            {!isSending && <SendIcon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Moderasyon Paneli */}
                <div className="bg-[#0f1115]/80 backdrop-blur-md rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                            Raporlanan Mesajlar
                        </h3>
                        <p className="text-sm text-white/50">Kullanıcılar tarafından moderasyon için işaretlenen iletişimler.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {mockReports.map(report => (
                            <div key={report.id} className="p-4 m-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                                        {report.reason}
                                    </span>
                                    <span className="text-[10px] text-white/40">{report.date}</span>
                                </div>
                                <div className="text-sm text-white/70 mb-3 ml-1">
                                    <span className="text-white font-medium">{report.sender}</span> tarafından gönderildi.
                                </div>
                                <div className="flex gap-2 justify-end opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
                                        Mesajı Sil
                                    </button>
                                    <button className="text-xs px-3 py-1.5 bg-white/5 text-white/80 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Yoksay
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
