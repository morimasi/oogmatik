import React, { useState } from 'react';
import { X, Code, Zap, Rocket, GitBranch, Database, Cloud, Shield, Users, BookOpen, Terminal, Cpu, Globe, ArrowRight, CheckCircle, Star } from 'lucide-react';

export const DeveloperVisionModule: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('architecture');

  const techStack = [
    { name: 'React 18', icon: Code, color: 'blue', description: 'Modern UI framework' },
    { name: 'TypeScript', icon: Terminal, color: 'indigo', description: 'Type-safe development' },
    { name: 'Node.js', icon: Cpu, color: 'green', description: 'Server-side runtime' },
    { name: 'Firebase', icon: Database, color: 'yellow', description: 'Real-time database' },
    { name: 'Vercel', icon: Cloud, color: 'purple', description: 'Cloud deployment' },
    { name: 'Gemini AI', icon: Zap, color: 'orange', description: 'AI integration' }
  ];

  const architecture = [
    {
      title: 'Frontend Architecture',
      description: 'Component-based, scalable UI system',
      features: ['React 18 + TypeScript', 'Tailwind CSS', 'Zustand State Management', 'Vite Build System']
    },
    {
      title: 'Backend Services',
      description: 'Serverless, microservices architecture',
      features: ['Firebase Functions', 'RESTful APIs', 'Real-time Database', 'Cloud Storage']
    },
    {
      title: 'AI Integration',
      description: 'Advanced AI-powered content generation',
      features: ['Gemini 2.5 Flash', 'Custom Prompts', 'Content Optimization', 'Smart Templates']
    }
  ];

  const roadmap = [
    {
      phase: 'Phase 1',
      title: 'Foundation',
      status: 'completed',
      features: ['Core Platform', 'AI Integration', 'Basic Analytics', 'User Management']
    },
    {
      phase: 'Phase 2',
      title: 'Expansion',
      status: 'current',
      features: ['Advanced AI', 'Mobile Apps', 'API Platform', 'Enterprise Features']
    },
    {
      phase: 'Phase 3',
      title: 'Innovation',
      status: 'upcoming',
      features: ['AI Tutoring', 'VR Integration', 'Blockchain Certificates', 'Global Scale']
    }
  ];

  const openSource = [
    { name: 'oogmatik/core', description: 'Core platform components', stars: '2.3k' },
    { name: 'oogmatik/ai-sdk', description: 'AI integration SDK', stars: '1.8k' },
    { name: 'oogmatik/ui-lib', description: 'Reusable UI components', stars: '1.2k' },
    { name: 'oogmatik/api', description: 'REST API documentation', stars: '956' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-zinc-200">
        {/* Header - Ultra Compact */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-gradient-to-r from-slate-900 to-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Geliştirici Vizyonu</h2>
              <p className="text-xs text-slate-300">Teknoloji, mimari ve yol haritası</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          {[
            { id: 'architecture', label: 'Mimari', icon: Database },
            { id: 'techstack', label: 'Teknoloji', icon: Code },
            { id: 'roadmap', label: 'Yol Haritası', icon: Rocket },
            { id: 'opensource', label: 'Open Source', icon: GitBranch }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {activeSection === 'architecture' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Modern, Ölçeklenebilir Mimari</h3>
                <p className="text-slate-600">Enterprise-ready platform architecture</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {architecture.map((item, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                    <ul className="space-y-2">
                      {item.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'techstack' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Güçlü Teknoloji Yığını</h3>
                <p className="text-slate-600">En modern teknolojilerle geliştirildi</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {techStack.map((tech, index) => {
                  const Icon = tech.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors text-center">
                      <div className={`w-12 h-12 bg-${tech.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <Icon className={`w-6 h-6 text-${tech.color}-600`} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{tech.name}</h4>
                      <p className="text-xs text-slate-500">{tech.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSection === 'roadmap' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Yol Haritası</h3>
                <p className="text-slate-600">Gelecek vizyonumuz ve hedeflerimiz</p>
              </div>
              <div className="space-y-4">
                {roadmap.map((phase, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          phase.status === 'completed' ? 'bg-green-100' :
                          phase.status === 'current' ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                          {phase.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : phase.status === 'current' ? (
                            <Zap className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Rocket className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{phase.title}</h4>
                          <p className="text-sm text-slate-500">{phase.phase}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                        phase.status === 'current' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {phase.status === 'completed' ? 'Tamamlandı' :
                         phase.status === 'current' ? 'Devam Ediyor' : 'Planlanıyor'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {phase.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 bg-slate-300 rounded-full" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'opensource' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Open Source Projeler</h3>
                <p className="text-slate-600">Toplulukla birlikte geliştiriyoruz</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openSource.map((project, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900 font-mono">{project.name}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-slate-600">{project.stars}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{project.description}</p>
                    <button className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors">
                      <Github className="w-3 h-3" />
                      GitHub'da Görüntüle
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-900 mb-2">Katkıda Bulunun</h4>
                <p className="text-sm text-slate-600 mb-4">
                  Open source projelerimize katkıda bulunarak eğitim teknolojisinin geleceğini şekillendirin.
                </p>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Geliştirici Olarak Katıl
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-slate-600">API Status: Operational</span>
              </div>
              <span className="text-xs text-slate-500">Version 2.5.0</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
