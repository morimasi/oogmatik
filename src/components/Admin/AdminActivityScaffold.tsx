import * as React from 'react';
import { useState } from 'react';
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
            className={`flex items-center space-x-3 px-6 py-2 rounded-2xl transition-all duration-300 relative z-10 ${activeStep === idx
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
                  onChange={(val: string) => setBlueprint({ ...blueprint, identity: { ...blueprint.identity, key: val, enumValue: val.toLowerCase().replace(/_/g, '-') } })}
                />
                <InputGroup
                  label="Başlık"
                  placeholder="Harf Labirenti"
                  value={blueprint.identity.title}
                  onChange={(val: string) => setBlueprint({ ...blueprint, identity: { ...blueprint.identity, title: val } })}
                />
                <div className="col-span-2">
                  <InputGroup
                    label="Açıklama"
                    placeholder="Etkinlik ne işe yarar?"
                    value={blueprint.identity.description}
                    onChange={(val: string) => setBlueprint({ ...blueprint, identity: { ...blueprint.identity, description: val } })}
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

                <div className="grid grid-cols-2 gap-6">
                  <InputGroup
                    label="Interface Adı (PascalCase)"
                    placeholder="LetterMazeData"
                    value={blueprint.dataModel.interfaceName}
                    onChange={(val: string) => setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, interfaceName: val } })}
                  />
                  <InputGroup
                    label="Item Array Adı"
                    placeholder="LetterMazeItem"
                    value={blueprint.dataModel.itemsName}
                    onChange={(val: string) => setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, itemsName: val } })}
                  />
                </div>

                <div className="mt-6 border-t border-zinc-800/50 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-2">Tekil Öğeler (Item Fields)</h4>
                    <button
                      onClick={() => {
                        const newFields = [...blueprint.dataModel.itemFields, { name: '', type: 'string', required: true }];
                        setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, itemFields: newFields } });
                      }}
                      className="text-[10px] bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full font-bold hover:bg-indigo-600/40 transition-colors"
                    >
                      + Alan Ekle
                    </button>
                  </div>

                  <div className="space-y-3">
                    {blueprint.dataModel.itemFields.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-zinc-800">
                        <input
                          type="text"
                          placeholder="Alan Adı (örn: targetWord)"
                          value={field.name}
                          onChange={(e) => {
                            const newFields = [...blueprint.dataModel.itemFields];
                            newFields[idx].name = e.target.value;
                            setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, itemFields: newFields } });
                          }}
                          className="flex-1 bg-transparent border-none text-sm text-zinc-300 outline-none px-2"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => {
                            const newFields = [...blueprint.dataModel.itemFields];
                            newFields[idx].type = e.target.value;
                            setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, itemFields: newFields } });
                          }}
                          className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 rounded outline-none p-1"
                        >
                          <option value="string">string</option>
                          <option value="number">number</option>
                          <option value="boolean">boolean</option>
                          <option value="string[]">string[]</option>
                        </select>
                        <button
                          onClick={() => {
                            const newFields = blueprint.dataModel.itemFields.filter((_, i) => i !== idx);
                            setBlueprint({ ...blueprint, dataModel: { ...blueprint.dataModel, itemFields: newFields } });
                          }}
                          className="text-red-400 hover:text-red-300 px-2"
                        >
                          <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <InputGroup
                  label="AI Rolü"
                  value={blueprint.logic.aiPrompt.role}
                  onChange={(val: string) => setBlueprint({ ...blueprint, logic: { ...blueprint.logic, aiPrompt: { ...blueprint.logic.aiPrompt, role: val } } })}
                />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-zinc-500 tracking-widest pl-2">Görev Tanımı (Prompt)</label>
                  <textarea
                    className="w-full bg-black/40 border border-zinc-800 rounded-3xl p-6 text-sm text-zinc-300 focus:border-indigo-500 outline-none transition-colors min-h-[150px]"
                    placeholder="Gemini'den ne bekliyoruz?"
                    value={blueprint.logic.aiPrompt.task}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBlueprint({ ...blueprint, logic: { ...blueprint.logic, aiPrompt: { ...blueprint.logic.aiPrompt, task: e.target.value } } })}
                  />
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Sol: Ajan Onayları Mock */}
                  <div className="bg-black/30 p-4 rounded-3xl border border-zinc-800">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Ajan Denetim Hattı</h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Elif Yıldız (Pedagoji)', status: 'Bekliyor', icon: 'fa-chalkboard-user' },
                        { name: 'Dr. Ahmet Kaya (Klinik)', status: 'Bekliyor', icon: 'fa-stethoscope' },
                        { name: 'Bora Demir (Mühendislik)', status: 'Bekliyor', icon: 'fa-code' },
                        { name: 'Selin Arslan (AI Mimarisi)', status: 'Bekliyor', icon: 'fa-robot' }
                      ].map((agent, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                          <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <i className={`fa-solid ${agent.icon} w-4`}></i>
                            {agent.name}
                          </div>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase font-bold">
                            {agent.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sağ: Blueprint JSON */}
                  <div className="bg-black/30 p-4 rounded-3xl border border-zinc-800 flex flex-col">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Blueprint Önizleme</h3>
                    <pre className="text-[9px] text-indigo-300 font-mono flex-1 overflow-y-auto max-h-[160px] custom-scrollbar">
                      {JSON.stringify(blueprint, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center space-y-4 pt-4 border-t border-zinc-800/50">
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
                        <span>Onayla ve Kök Dizine Gönder</span>
                      </>
                    )}
                  </button>
                  <p className="text-zinc-500 text-[10px] text-center italic">
                    Vercel ortamında üretim CLI ile geliştirici tarafından yapılır.
                  </p>
                </div>
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

const InputGroup = ({ label, placeholder, value, onChange }: InputGroupProps) => (
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

