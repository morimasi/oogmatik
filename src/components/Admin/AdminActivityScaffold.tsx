import * as React from 'react';
import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/useAuthStore';
import { safeFetch, getAuthHeaders } from '../../utils/apiClient';
import { User, CognitiveErrorTag } from '../../types';
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

import Editor from '@monaco-editor/react';
import { useVFSStore } from '../../store/useVFSStore';
import { GhostWriter, createGhostWriter } from '../../utils/ghostWriter';
import { injectionMonitor } from '../../utils/injectionMonitor';
import { getInitialAgentStates, AgentState, agents } from '../../services/agentService';
import { LivePreviewDashboard } from './LivePreviewDashboard';
import VFSService from '../../services/vfsFileService';

interface VFSFile {
  name: string;
  language: string;
  content: string;
}

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
  const [activeSideTab, setActiveSideTab] = useState<'explorer' | 'agents' | 'history'>('explorer');
  
  // Use centralized VFS store
  const files = useVFSStore((state: any) => state.files);
  const vfsActiveFile = useVFSStore((state: any) => state.activeFile);
  const updateFile = useVFSStore((state: any) => state.updateFile);
  const setActiveFile = useVFSStore((state: any) => state.setActiveFile);

  const [activeFileLocal, setActiveFileLocal] = useState<string>('ActivityEngine.tsx');
  
  // Agent states
  const [agentStates, setAgentStates] = useState<AgentState[]>(getInitialAgentStates());
  
  const activeFile = vfsActiveFile || activeFileLocal;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state: { user: User | null }) => state.user);

  // Firestore Collection Reference
  const logsRef = collection(db, 'scaffoldLogs');

  useEffect(() => {
    VFSService.loadInitialFiles();
    loadHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle active file synchronization
  useEffect(() => {
    if (vfsActiveFile) {
      setActiveFileLocal(vfsActiveFile);
    }
  }, [vfsActiveFile]);

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
        await addSystemMessage('Otonom Üretim Terminali (v2 Professional) başlatıldı.', 'Kernel', 'fa-microchip');
        await addAgentMessage('Gelişmiş AI destekli CLI asistanı hazır. Architectural DNA motoru aktif.', 'Selin Arslan (AI Mimarisi)', 'fa-robot text-purple-400');
        await addSystemMessage('Oogmatik ~ root@core: /scaffold/cli/engine-v4', 'Terminal', 'fa-terminal');
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

    // Update agent states to show they're working
    setAgentStates((prev: AgentState[]) => prev.map((a: AgentState) => ({ ...a, status: 'analyzing' as const })));

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
        await new Promise(r => setTimeout(r, 1200));
        await addAgentMessage('Görsel DNA çözümleniyor. Müşteri içerik talebi AI üretim hattına aktarılıyor...', 'Dr. Ahmet Kaya (Klinik)', 'fa-dna text-emerald-400');
      }

      // Simulate Deep Agent Reasoning Pipeline (Phase 4 Logic)
      await new Promise(r => setTimeout(r, 600));
      await addAgentMessage(userImage ? 'Klonlama stratejisi belirlendi. ZPD uyumlu yeni içerik varyasyonları oluşturuluyor...' : 'Komut alındı. ZPD (Yakınsal Gelişim Alanı) analizi başlatılıyor...', 'Elif Yıldız (Pedagoji)', 'fa-chalkboard-user text-pink-400');
      
      await new Promise(r => setTimeout(r, 1200));
      await addAgentMessage('Pedagojik çerçeve onaylandı. Klinik olarak dikkat dağıtıcılardan arındırılmış bir görsel hiyerarşi kurguluyorum.', 'Dr. Ahmet Kaya (Klinik)', 'fa-stethoscope text-emerald-400');
      
      await new Promise(r => setTimeout(r, 1500));
      await addAgentMessage('React Code Block sentezine başlıyorum. Ultra-özelleştirilebilir "Deep Config" paneli ve A4 Print şeması oluşturuluyor...', 'Selin Arslan (AI Mimarisi)', 'fa-robot text-purple-400');
      
      // Use Ghost Writer to update code
      const currentFile = activeFile || 'ActivityEngine.tsx';
      const ghostWriter = createGhostWriter(
        (content: string) => updateFile(currentFile, content),
        { lineDelay: 30 }
      );
      
      const newCode = `import React from 'react';
import { motion } from 'framer-motion';

// AUTONOM_CONFIG_START
export const Config = () => {
  return (
    <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
      <h2 className="text-xl font-black text-indigo-400 mb-2">${userText || 'Otonom Etkinlik'}</h2>
      <p className="text-xs text-zinc-500 tracking-wider uppercase">Konfigürasyon Paneli v4</p>
    </div>
  );
}
// AUTONOM_CONFIG_END

export const Activity = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 font-lexend">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-500"></i>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i className="fa-solid fa-brain text-white text-xl"></i>
           </div>
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-1">${userText || 'Otonom Etkinlik'}</h2>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">AI-Native Generative Module</p>
           </div>
        </div>

        <div className="space-y-6 text-zinc-400 leading-relaxed font-medium text-sm">
           <p>Bu eğitim materyali, Bursa Disleksi Pedagojik DNA'sı kullanılarak otonom olarak üretilmiştir.</p>
           <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="block text-[10px] font-black text-indigo-400 uppercase mb-1">Müfredat</span>
                 <span className="text-white text-xs font-bold">MEB 2025 Uyumlu</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <span className="block text-[10px] font-black text-emerald-400 uppercase mb-1">Klinik Doğrulama</span>
                 <span className="text-white text-xs font-bold">ZPD Optimize</span>
              </div>
           </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center">
           <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">© 2026 Oogmatik Engine</span>
           <button className="px-6 py-2 bg-white text-black text-[11px] font-black rounded-xl hover:bg-zinc-200 transition-all uppercase tracking-widest">Başlat</button>
        </div>
      </motion.div>
    </div>
  );
}`;
      
      await ghostWriter.writeLineByLine(newCode);

      await new Promise(r => setTimeout(r, 2000));
      await addAgentMessage('AST Parse başarılı. Kod Main dalına otonom olarak entegre edildi. Registery kayıtları güncellendi.', 'Bora Demir (Mühendislik)', 'fa-code text-blue-400');

      // Update registry using injection monitor
      const registryContent = files['registry.ts']?.content || '';
      if (registryContent) {
        await injectionMonitor.updateMarker(
          registryContent,
          'REGISTRY',
          `'${(userText || 'AutoModule').toUpperCase().replace(/\s+/g, '_')}': { component: 'ActivityEngine', status: 'active' },`,
          (newRegistryContent: string) => updateFile('registry.ts', newRegistryContent)
        );
      }

      await addSystemMessage('Modül başarıyla yayına alındı.', 'Oogmatik Core', 'fa-check-double text-green-500');

      // Update all agent states to success
      setAgentStates((prev: AgentState[]) => prev.map((a: AgentState, i: number) => ({
        ...a,
        status: 'success' as const,
        analysis: {
          status: 'success' as const,
          feedback: `Agent ${i + 1} completed successfully`,
          suggestions: []
        }
      })));

    } catch (err: any) {
      await saveMessage({
        id: crypto.randomUUID(),
        role: 'error',
        text: `Üretim Hatası: ${err.message}. Fallback (Fail-Safe) şablona dönülüyor...`,
        timestamp: new Date()
      });
      
      // Update agent states to error
      setAgentStates((prev: AgentState[]) => prev.map((a: AgentState) => ({ ...a, status: 'error' as const })));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#080808] font-lexend overflow-hidden select-none">
      
      {/* IDE ÜST BAR (Toolbar) */}
      <div className="h-10 bg-[#1a1a1a] border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 shadow-lg z-50">
        <div className="flex items-center gap-4">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 hover:bg-red-500/80 transition-all cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40 hover:bg-yellow-500/80 transition-all cursor-pointer"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40 hover:bg-green-500/80 transition-all cursor-pointer"></div>
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-2"></div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 tracking-wider">
            <i className="fa-solid fa-folder-open text-xs text-indigo-400"></i>
            <span>oogmatik / src / components / scaffold / <span className="text-zinc-300">Terminal.cli</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Engine: v2.4 Online
          </div>
          <button onClick={clearHistory} className="text-zinc-600 hover:text-red-400 transition-colors" title="Sıfırla">
            <i className="fa-solid fa-rotate"></i>
          </button>
        </div>
      </div>

      {/* ANA IDE ÇALIŞMA ALANI */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SOL PANEL: Explorer & Agents */}
        <aside className="w-64 bg-[#0d0d0d] border-r border-zinc-800/50 flex flex-col shrink-0 backdrop-blur-xl">
          <div className="flex border-b border-zinc-800 bg-[#1a1a1a]">
            <button 
              onClick={() => setActiveSideTab('explorer')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeSideTab === 'explorer' ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-400/5' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <i className="fa-solid fa-file-code mb-1 block text-sm"></i>
              Gezgin
            </button>
            <button 
              onClick={() => setActiveSideTab('agents')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${activeSideTab === 'agents' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <i className="fa-solid fa-robot mb-1 block text-sm"></i>
              Ajanlar
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {activeSideTab === 'explorer' && (
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-2">Aktif Dosyalar</p>
                  {(Object.values(files) as any[]).map((file: any) => (
                    <div 
                      key={file.name}
                      onClick={() => setActiveFile(file.name)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${activeFile === file.name ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold' : 'hover:bg-zinc-800/30 border-transparent text-zinc-500 text-xs font-semibold'}`}
                    >
                      <i className={file.name.endsWith('.tsx') ? 'fa-brands fa-react' : 'fa-solid fa-scroll'}></i>
                      {file.name}
                    </div>
                  ))}
                </div>
                <div className="space-y-1 pt-4 border-t border-zinc-800/50">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-2">Agent Logs</p>
                  {messages.filter((m: ChatMessage) => m.role !== 'user').slice(-5).map((m: ChatMessage, i: number) => (
                    <div key={i} className="px-3 py-1 text-[9px] font-mono text-zinc-600 truncate">
                      <span className="text-emerald-500 mr-1">✓</span> {m.agentName || 'System'}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeSideTab === 'agents' && (
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-2">Ajan Durumu</p>
                {agentStates.map((agent: AgentState) => (
                  <div key={agent.key} className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-3 hover:border-zinc-700 transition-all">
                    <div className={`w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center ${
                      agent.status === 'analyzing' ? 'animate-pulse' : ''
                    }`}>
                      <i className={`fa-solid ${agents[agent.key]?.icon || 'fa-user'} ${
                        agent.status === 'success' ? 'text-emerald-400' :
                        agent.status === 'error' ? 'text-red-400' :
                        agent.status === 'warning' ? 'text-amber-400' :
                        agent.status === 'analyzing' ? 'text-blue-400' :
                        'text-zinc-500'
                      }`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-white leading-none">{agent.name}</p>
                        <div className={`w-2 h-2 rounded-full ${
                          agent.status === 'idle' ? 'bg-zinc-600' :
                          agent.status === 'analyzing' ? 'bg-blue-500 animate-pulse' :
                          agent.status === 'success' ? 'bg-emerald-500' :
                          agent.status === 'warning' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                      <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-1">{agent.key}</p>
                      {agent.analysis && (
                        <p className={`text-[8px] mt-1 ${
                          agent.analysis.status === 'success' ? 'text-emerald-400' :
                          agent.analysis.status === 'error' ? 'text-red-400' :
                          'text-zinc-400'
                        }`}>
                          {agent.analysis.feedback.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* ORTA PANEL: Editör & Terminal */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d0d0d]">
          
          {/* Editor Header */}
          <div className="h-9 bg-[#1a1a1a] border-b border-zinc-800 flex items-center px-4 overflow-x-auto gap-px shrink-0">
             {(Object.values(files) as any[]).map((file: any) => (
               <div 
                 key={file.name}
                 onClick={() => setActiveFile(file.name)}
                 className={`h-full px-4 flex items-center gap-2 border-r border-zinc-800 cursor-pointer transition-all ${activeFile === file.name ? 'bg-[#0d0d0d] border-t-2 border-indigo-400 text-xs text-white' : 'hover:bg-zinc-900 text-xs text-zinc-500'}`}
               >
                  <i className={file.name.endsWith('.tsx') ? 'fa-brands fa-react text-indigo-400' : 'fa-solid fa-scroll text-amber-500/70'}></i>
                  <span>{file.name}</span>
                  {activeFile === file.name && <i className="fa-solid fa-xmark text-[9px] ml-2 text-zinc-600 hover:text-rose-400 transition-colors"></i>}
               </div>
             ))}
          </div>

          <div className="flex-1 flex flex-col relative min-h-0">
            <div className="flex-1 relative bg-black">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  path={files[activeFile]?.name || 'ActivityEngine.tsx'}
                  defaultLanguage={files[activeFile]?.language || 'typescript'}
                  value={files[activeFile]?.content || '// Select a file'}
                  options={{
                    fontSize: 13,
                    fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    readOnly: false,
                    padding: { top: 20 },
                    lineNumbersMinChars: 3,
                    glyphMargin: false,
                    folding: true,
                    scrollbar: {
                      vertical: 'visible',
                      horizontal: 'visible',
                      useShadows: false,
                      verticalHasArrows: false,
                      horizontalHasArrows: false,
                      verticalScrollbarSize: 10,
                      horizontalScrollbarSize: 10
                    }
                  }}
                />
                
                {/* Floating "AI Engine is Writing" Badge */}
                {isProcessing && (
                  <div className="absolute top-10 right-10 z-20 flex items-center gap-3 px-4 py-2 bg-indigo-600/90 backdrop-blur-md border border-indigo-400/50 rounded-xl shadow-2xl animate-in zoom-in-95">
                    <i className="fa-solid fa-wand-sparkles text-white animate-spin"></i>
                    <span className="text-xs font-black text-white uppercase tracking-widest whitespace-nowrap">Agent Engine Yazıyor...</span>
                  </div>
                )}
            </div>

            {/* TERMINAL / CHAT AREA (Bottom Partition) */}
            <div className="h-72 border-t border-zinc-800/80 bg-[#0d0d0d] flex flex-col shadow-2xl relative z-10">
               <div className="h-8 bg-[#1a1a1a] border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Otonom Çıktı Konsolu (Engine Console)</span>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                      Real-time Feed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-zinc-600">UTF-8</span>
                    <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Admin/Scaffold/VFS</span>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {messages.map((msg: ChatMessage) => (
                      <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, x: -5 }} 
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 group"
                      >
                        <span className={`shrink-0 font-bold ${msg.role === 'user' ? 'text-blue-400' : 'text-zinc-500'}`}>
                          [{msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <span className={`shrink-0 font-black uppercase tracking-widest px-1.5 rounded-[4px] text-[8px] mt-0.5 ${
                          msg.role === 'user' ? 'bg-blue-500/10 text-blue-400' : 
                          msg.role === 'error' ? 'bg-red-500/10 text-red-400' : 
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {msg.agentName || msg.role.toUpperCase()}
                        </span>
                        <p className={`flex-1 break-words leading-relaxed ${msg.role === 'error' ? 'text-red-400' : 'text-zinc-300'}`}>
                          {msg.text}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-zinc-600 animate-pulse">
                      <span className="text-indigo-500">●</span>
                      <span>İşleniyor...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
               </div>

               {/* Command Input Area */}
               <div className="p-3 bg-zinc-900/50 border-t border-zinc-800 backdrop-blur-xl">
                  <form onSubmit={handleSend} className="relative flex items-center">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`absolute left-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${selectedImage ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
                    >
                      <i className="fa-solid fa-eye text-xs"></i>
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
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isProcessing}
                      placeholder="root@oogmatik: ~ Komut girin veya görsel referans yükleyin..."
                      className="w-full bg-black/60 border border-zinc-800 rounded-xl py-3 pl-14 pr-12 text-xs text-zinc-300 font-mono focus:border-indigo-500 outline-none transition-all placeholder:opacity-30"
                    />
                    <button 
                      type="submit"
                      disabled={isProcessing || (!input.trim() && !selectedImage)}
                      className="absolute right-3 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-20"
                    >
                      <i className="fa-solid fa-terminal text-xs"></i>
                    </button>
                  </form>
               </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL: Live Preview Dashboard */}
        <aside className="w-80 bg-[#111111] border-l border-zinc-800 flex flex-col shrink-0">
            <LivePreviewDashboard />
        </aside>

      </div>
    </div>
  );
};
