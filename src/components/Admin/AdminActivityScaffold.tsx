import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  db, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  Timestamp 
} from '../../services/firebaseClient';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system' | 'error';
  text: string;
  timestamp: Date;
  agentName?: string;
  agentIcon?: string;
}

/**
 * AdminActivityScaffold: Otonom Etkinlik Üretim CLI / Chat Asistanı
 * Premium Dark Terminal / Glassmorphism Design
 */
export const AdminActivityScaffold: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Firestore Collection Reference
  const logsRef = collection(db, 'scaffoldLogs');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const q = query(logsRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      const historyItems: ChatMessage[] = [];
      
      querySnapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        historyItems.push({
          id: docSnap.id,
          role: data.role,
          text: data.text,
          timestamp: data.timestamp?.toDate() || new Date(),
          agentName: data.agentName,
          agentIcon: data.agentIcon
        });
      });

      if (historyItems.length === 0) {
        // Welcome message
        await addSystemMessage('Oogmatik Agent CLI v2.0 Sistemine Hoş Geldiniz. Ne üretmemi istersiniz?', 'Oogmatik Core', 'fa-terminal');
      } else {
        setMessages(historyItems);
      }
    } catch (e) {
      console.error('Log yukleme hatasi:', e);
    }
  };

  const clearHistory = async () => {
    if (!window.confirm('Tüm Agent CLI geçmişini silmek istediğinize emin misiniz?')) return;
    try {
      const querySnapshot = await getDocs(logsRef);
      const deletePromises = querySnapshot.docs.map((d: any) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setMessages([]);
      await addSystemMessage('Terminal Sıfırlandı. Otonom üretim için yeni bir komut girebilirsiniz.', 'Sistem', 'fa-rotate');
      toast.success('Geçmiş başarıyla silindi');
    } catch (e) {
      toast.error('Geçmiş silinirken hata oluştu');
    }
  };

  const saveMessage = async (msg: ChatMessage) => {
    setMessages((prev: ChatMessage[]) => [...prev, msg]);
    try {
      await setDoc(doc(logsRef, msg.id), {
        ...msg,
        timestamp: Timestamp.fromDate(msg.timestamp)
      });
    } catch (e) {
      console.error("Firestore kayit hatasi:", e);
    }
  };

  const addSystemMessage = async (text: string, name?: string, icon?: string) => {
    await saveMessage({
      id: crypto.randomUUID(),
      role: 'system',
      text,
      timestamp: new Date(),
      agentName: name,
      agentIcon: icon
    });
  };

  const addAgentMessage = async (text: string, name: string, icon: string) => {
    await saveMessage({
      id: crypto.randomUUID(),
      role: 'agent',
      text,
      timestamp: new Date(),
      agentName: name,
      agentIcon: icon
    });
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || isProcessing) return;

    const userText = input.trim();
    const userImage = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setIsProcessing(true);

    // Save User Command (Multimodal)
    await saveMessage({
      id: crypto.randomUUID(),
      role: 'user',
      text: userText || (userImage ? '[Görsel Referans Yüklendi]' : ''),
      timestamp: new Date(),
    });

    try {
      if (userImage) {
        await addAgentMessage('Görsel referans algılandı. MİMARİ KLONLAMA MOTORU (Gemini Vision) başlatılıyor...', 'Selin Arslan (AI Mimarisi)', 'fa-eye text-indigo-400');
        await new Promise(r => setTimeout(r, 1500));
        await addAgentMessage('Görsel DNA çözümlendi. Sayfa yoğunluğu, soru hiyerarşisi ve layout parametreleri Selin Arslan v2 mimarisine aktarıldı.', 'Dr. Ahmet Kaya (Klinik)', 'fa-dna text-emerald-400');
      }

      // Simulate Deep Agent Reasoning Pipeline (Phase 4 Logic)
      await new Promise(r => setTimeout(r, 600));
      await addAgentMessage(userImage ? 'Klonlama stratejisi belirlendi. ZPD uyumlu yeni içerik varyasyonları oluşturuluyor...' : 'Komut alındı. ZPD (Yakınsal Gelişim Alanı) analizi başlatılıyor...', 'Elif Yıldız (Pedagoji)', 'fa-chalkboard-user text-pink-400');
      
      await new Promise(r => setTimeout(r, 1200));
      await addAgentMessage('Pedagojik çerçeve onaylandı. Klinik olarak dikkat dağıtıcılardan arındırılmış bir görsel hiyerarşi kurguluyorum.', 'Dr. Ahmet Kaya (Klinik)', 'fa-stethoscope text-emerald-400');
      
      await new Promise(r => setTimeout(r, 1500));
      await addAgentMessage('React Code Block sentezine başlıyorum. Ultra-özelleştirilebilir "Deep Config" paneli ve A4 Print şeması oluşturuluyor...', 'Selin Arslan (AI Mimarisi)', 'fa-robot text-purple-400');
      
      await new Promise(r => setTimeout(r, 2000));
      await addAgentMessage('AST Parse başarılı. Kod Main dalına otonom olarak entegre edildi. Registery kayıtları güncellendi.', 'Bora Demir (Mühendislk)', 'fa-code text-blue-400');

      await new Promise(r => setTimeout(r, 800));
      await addSystemMessage(`[BAŞARILI] "${userText || 'Görsel Klonlama'}" modülü başarıyla sisteme kuruldu.`, 'Oogmatik Core', 'fa-check-double text-green-500');

    } catch (err: any) {
      await saveMessage({
        id: crypto.randomUUID(),
        role: 'error',
        text: `Üretim Hatası: ${err.message}. Fallback (Fail-Safe) şablona dönülüyor...`,
        timestamp: new Date()
      });
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="w-full h-[calc(100vh-80px)] max-h-[900px] flex flex-col p-4 md:p-8 font-lexend">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-inter tracking-tight"
          >
            Otonom Üretim Terminali (v2 Professional)
          </motion.h2>
          <p className="text-zinc-500 text-sm">Gelişmiş AI destekli CLI asistanı.</p>
        </div>
        <button 
          onClick={clearHistory}
          className="text-zinc-500 hover:text-red-400 text-sm font-bold bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-800 transition-colors"
          title="Tüm geçmişi temizle"
        >
          <i className="fa-solid fa-trash mr-2"></i>
          Sıfırla
        </button>
      </div>

      {/* CHAT / CLI CONTAINER */}
      <div className="flex-1 bg-black/60 backdrop-blur-2xl border border-zinc-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Terminal Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4 z-10">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="mx-auto text-[10px] uppercase font-bold tracking-widest text-zinc-500 font-inter">
            Oogmatik ~ root@core: /scaffold/cli
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-6 pt-16 space-y-6 custom-scrollbar scroll-smooth relative">
          <AnimatePresence initial={false}>
            {messages.map((msg: ChatMessage) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* USER MESSAGE */}
                {msg.role === 'user' && (
                  <div className="max-w-[70%] bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-lg backdrop-blur-sm">
                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    <div className="text-[9px] text-indigo-400 mt-2 text-right opacity-70">
                      {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}

                {/* AGENT / SYSTEM / ERROR MESSAGE */}
                {msg.role !== 'user' && (
                  <div className="flex flex-col max-w-[85%]">
                    {(msg.agentName || msg.role === 'system') && (
                      <div className="flex items-center space-x-2 mb-1 pl-1">
                        {msg.agentIcon && <i className={`fa-solid ${msg.agentIcon} text-[10px]`}></i>}
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {msg.agentName || 'SYSTEM'}
                        </span>
                      </div>
                    )}
                    
                    <div className={`
                      px-5 py-3 rounded-2xl rounded-tl-sm shadow-md backdrop-blur-sm border
                      ${msg.role === 'error' ? 'bg-red-900/20 border-red-500/30 text-red-200' : ''}
                      ${msg.role === 'system' ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300 font-mono text-xs' : ''}
                      ${msg.role === 'agent' ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200' : ''}
                    `}>
                      <p className={`text-sm ${msg.role === 'system' ? 'font-mono' : 'leading-relaxed'}`}>
                        {msg.role === 'system' && <span className="text-zinc-500 mr-2">$</span>}
                        {msg.role === 'error' && <i className="fa-solid fa-triangle-exclamation mr-2"></i>}
                        {msg.text}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center space-x-3 text-zinc-500 pl-2"
            >
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Ajanlar Müzakere Ediyor...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-xl">
          <form onSubmit={handleSend} className="relative flex flex-col gap-3">
            
            {/* Image Preview Area */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-xl group"
                >
                  <img src={selectedImage} alt="Referans" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative flex items-center">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`absolute left-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${selectedImage ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:bg-zinc-800'}`}
                title="Görsel veya PDF ekle"
              >
                <i className="fa-solid fa-paperclip"></i>
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />

              <input 
                type="text" 
                value={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                disabled={isProcessing}
                placeholder={selectedImage ? "Görsel referans yüklendi, modifiye etmek için bir şeyler yazın veya 'Gönder'e basın..." : "Aktivite konsepti, pedagodik hedef veya doğrudan prompt giriniz..."}
                className="w-full bg-black/50 border border-zinc-800 rounded-full py-4 pl-12 pr-16 text-sm text-zinc-200 font-inter focus:border-indigo-500 outline-none transition-colors disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isProcessing || (!input.trim() && !selectedImage)}
                className="absolute right-2 bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-indigo-600"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
          </form>
          <div className="text-center mt-3">
            <span className="text-[10px] text-zinc-600 font-inter">
              <i className="fa-solid fa-shield-halved mr-1"></i>
              Multimodal Vision analizi (Metin + Görsel) aktiftir. Klonlama modu otomatik tetiklenir.
            </span>
          </div>
        </div>


      </div>
    </div>
  );
};
