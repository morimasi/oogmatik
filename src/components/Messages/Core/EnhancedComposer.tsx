import React, { useState, useRef } from 'react';
import { useMessageStore } from '../../../store/useMessageStore';
import { Paperclip, Send, X, File, Image as ImageIcon } from 'lucide-react';
import { fileSharingService } from '../../../services/messaging/fileSharingService';

export const EnhancedComposer: React.FC = () => {
    const { quotingMessage, editingMessage, clearComposerState } = useMessageStore();
    const [text, setText] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Editing mode ise text'i doldur (Gerçekte effect ile yapılır ama UI mockupı için basit tutuyoruz)
    React.useEffect(() => {
        if (editingMessage) {
            setText(editingMessage.text || '');
        } else if (!quotingMessage) {
            setText('');
        }
    }, [editingMessage, quotingMessage]);

    const handleSend = () => {
        if (!text.trim() && !isUploading) return;
        
        // messageService.sendMessage(..) çağrılacak. Mock:
        console.log("Gönderiliyor:", {
            text,
            isEdit: !!editingMessage,
            isQuote: !!quotingMessage
        });

        setText('');
        clearComposerState();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const uploadResult = await fileSharingService.uploadFile(file);
            console.log("Dosya yüklendi:", uploadResult);
            // State'e eklenecek
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 border-t border-white/5 bg-[#0f1115]/50 backdrop-blur-md">
            {/* Alıntı / Düzenleme Üst Barı */}
            {(quotingMessage || editingMessage) && (
                <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="text-xs font-semibold text-accent-primary mb-1">
                            {editingMessage ? 'Mesajı Düzenle' : `Alıntılanıyor: ${quotingMessage?.senderId === 'Me' ? 'Siz' : 'Karşı Taraf'}`}
                        </div>
                        <div className="text-sm text-white/70 truncate line-clamp-1 font-lexend">
                            {editingMessage ? editingMessage.text : quotingMessage?.text}
                        </div>
                    </div>
                    <button 
                        onClick={clearComposerState}
                        className="p-1 rounded-full hover:bg-white/10 text-white/50 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex items-end gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.mp3,.mp4"
                />
                
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !!editingMessage}
                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors disabled:opacity-50"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl relative focus-within:ring-2 focus-within:ring-accent-primary focus-within:border-transparent transition-all">
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Bir mesaj yazın..."
                        rows={1}
                        className="w-full bg-transparent text-white placeholder-white/40 p-3 max-h-32 min-h-[44px] resize-none focus:outline-none custom-scrollbar font-lexend text-sm"
                    />
                </div>

                <button 
                    onClick={handleSend}
                    disabled={(!text.trim() && !isUploading) || isUploading}
                    className="p-3 rounded-xl bg-accent-primary hover:bg-accent-secondary text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </div>
    );
};
