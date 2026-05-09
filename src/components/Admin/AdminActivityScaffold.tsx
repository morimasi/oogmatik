import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

/**
 * AdminActivityScaffold: Otonom Etkinlik Üretim Sihirbazı
 * FontAwesome + Tailwind + Framer Motion (Premium UI)
 */
export const AdminActivityScaffold: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const [blueprint, setBlueprint] = useState({
    identity: {
      key: '',
      enumValue: '',
      title: '',
      description: '',
      icon: 'fa-solid fa-star',
      categoryId: 'reading-verbal'
    },
    dataModel: {
      interfaceName: '',
      itemsName: '',
      fields: [],
      itemFields: [{ name: 'content', type: 'string', required: true }]
    },
    logic: {
      offlineAlgorithm: '',
      aiPrompt: {
        role: 'Uzman Eğitimci',
        task: '',
        rules: ['Disleksi dostu dil kullan', 'Zorluğu kademeli artır'],
        schema: { properties: { items: { type: 'ARRAY', items: { type: 'OBJECT', properties: { content: { type: 'STRING' } } } } } }
      }
    }
  });

  const steps = [
    { title: 'Kimlik', icon: 'fa-gear' },
    { title: 'Veri Modeli', icon: 'fa-database' },
    { title: 'AI Mantığı', icon: 'fa-brain' },
    { title: 'Onay & Üret', icon: 'fa-wand-magic-sparkles' }
  ];

  const handleProcess = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/scaffold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blueprint)
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Etkinlik otonom olarak inşa edildi!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error('Hata: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-8 font-lexend">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
        >
          Otonom Etkinlik Üretim Merkezi
        </motion.h2>
        <p className="text-zinc-400 text-sm italic">
          Blueprint tanımlayın, motor kalsın; backend ve frontend otomatik inşa edilsin.
        </p>
      </div>

      {/* Stepper */}
      <div className="flex justify-between items-center bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 p-4 rounded-3xl overflow-hidden relative">
        {steps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setActiveStep(idx)}
            className={`flex items-center space-x-3 px-6 py-2 rounded-2xl transition-all duration-300 relative z-10 ${
              activeStep === idx 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <i className={`fa-solid ${step.icon} text-[14px]`}></i>
            <span className="font-bold text-sm tracking-tight">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-zinc-900/30 backdrop-blur-2xl border border-zinc-800/50 rounded-[2.5rem] p-10 min-h-[500px] relative overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {activeStep === 0 && (
              <div className="grid grid-cols-2 gap-6">
                <InputGroup 
                  label="Enum Key" 
                  placeholder="LETTER_MAZE" 
                  value={blueprint.identity.key} 
                  onChange={(val: string) => setBlueprint({...blueprint, identity: {...blueprint.identity, key: val, enumValue: val.toLowerCase().replace(/_/g, '-')}})} 
                />
                <InputGroup 
                  label="Başlık" 
                  placeholder="Harf Labirenti" 
                  value={blueprint.identity.title} 
                  onChange={(val: string) => setBlueprint({...blueprint, identity: {...blueprint.identity, title: val}})} 
                />
                <div className="col-span-2">
                   <InputGroup 
                    label="Açıklama" 
                    placeholder="Etkinlik ne işe yarar?" 
                    value={blueprint.identity.description} 
                    onChange={(val: string) => setBlueprint({...blueprint, identity: {...blueprint.identity, description: val}})} 
                  />
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-800/20 rounded-2xl border border-zinc-700/30 text-amber-200 text-xs italic">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-info"></i>
                    <span>Veri modeli, hem backend jeneratörünü hem de frontend render katmanını otonom olarak yapılandırır.</span>
                  </div>
                </div>
                <div className="p-10 border-2 border-dashed border-zinc-800 rounded-[2rem] flex flex-col items-center justify-center space-y-4">
                   <i className="fa-solid fa-code text-zinc-700 text-3xl"></i>
                   <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center">
                     Gelişmiş Alan Düzenleyici Yakında...
                   </p>
                </div>
                <pre className="text-[10px] text-zinc-500 bg-black/30 p-4 rounded-xl overflow-auto border border-white/5">
                  {JSON.stringify(blueprint.dataModel, null, 2)}
                </pre>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <InputGroup 
                   label="AI Rolü" 
                   value={blueprint.logic.aiPrompt.role} 
                   onChange={(val: string) => setBlueprint({...blueprint, logic: {...blueprint.logic, aiPrompt: {...blueprint.logic.aiPrompt, role: val}}})} 
                />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-2">Görev Tanımı (Prompt)</label>
                  <textarea 
                    className="w-full bg-black/40 border border-zinc-800 rounded-3xl p-6 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors min-h-[150px]"
                    placeholder="Gemini'den ne bekliyoruz?"
                    value={blueprint.logic.aiPrompt.task}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBlueprint({...blueprint, logic: {...blueprint.logic, aiPrompt: {...blueprint.logic.aiPrompt, task: e.target.value}}})}
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col items-center justify-center space-y-10 py-10">
                <div className="text-center space-y-4">
                   <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                     <i className="fa-solid fa-magic-wand-sparkles text-white text-3xl animate-pulse"></i>
                   </div>
                   <h3 className="text-xl font-bold">Her Şey Hazır Mı?</h3>
                   <p className="text-zinc-500 text-sm max-w-xs mx-auto text-center italic leading-relaxed">
                     "Onayla ve Üret" butonuna bastığınızda, sistem motoru tüm dosyaları yazıp otonom kurulumu tamamlayacaktır.
                   </p>
                </div>

                <button 
                  disabled={isProcessing || !blueprint.identity.key}
                  onClick={handleProcess}
                  className="group relative flex items-center space-x-4 bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-xl"
                >
                  {isProcessing ? (
                    <i className="fa-solid fa-spinner fa-spin text-xl"></i>
                  ) : (
                    <>
                      <i className="fa-solid fa-rocket text-xl"></i>
                      <span>Onayla ve Üret</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center px-4">
        <button 
          onClick={() => setActiveStep((prev: number) => Math.max(0, prev - 1))}
          className="text-zinc-500 hover:text-zinc-300 text-sm font-bold disabled:opacity-0 transition-all uppercase tracking-tighter"
          disabled={activeStep === 0}
        >
          ← Önceki Adım
        </button>
        <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest text-center hidden md:block">
          Oogmatik v2 Professional • Autonomous Scaffold System • Zero Error Protocol
        </div>
        <button 
          onClick={() => setActiveStep((prev: number) => Math.min(steps.length - 1, prev + 1))}
          className="text-indigo-400 hover:text-indigo-300 text-sm font-bold disabled:opacity-0 transition-all uppercase tracking-tighter"
          disabled={activeStep === steps.length - 1}
        >
          Sonraki Adım →
        </button>
      </div>
    </div>
  );
};

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, placeholder, value, onChange }) => (
  <div className="flex flex-col space-y-2">
    <label className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-2">
      {label}
    </label>
    <input 
      type="text" 
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="bg-black/40 border border-zinc-800 rounded-full px-6 py-4 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors placeholder:text-zinc-800"
    />
  </div>
);
