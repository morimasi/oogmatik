/**
 * OOGMATIK - Admin Agent Management Dashboard
 * Ultra-premium AI Agent coordination and monitoring interface
 * Dark Glassmorphism Design
 */

import React, { useState, useEffect } from 'react';
import {
  agentService,
  AGENT_PROFILES,
  AgentRole,
  AgentTask,
  AgentMetrics,
  AgentProfile
} from '../services/agentService';

export const AdminAgentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'conversations' | 'settings'>('overview');
  const [metrics, setMetrics] = useState<Record<AgentRole, AgentMetrics> | null>(null);
  const [_tasks, _setTasks] = useState<AgentTask[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const allMetrics = await agentService.getAllAgentMetrics();
      setMetrics(allMetrics);
    } catch (error) {
      console.error('Failed to load agent metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAgent = async (role: AgentRole) => {
    if (!testPrompt.trim()) {
      alert('Lütfen test içeriği girin');
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const task = await agentService.createTask({
        role,
        type: 'validation',
        description: 'Admin test validation',
        priority: 1,
        input: { content: testPrompt }
      });

      const result = await agentService.executeTask(task.id);
      setTestResult(result.output || {});
      loadData(); // Refresh metrics
    } catch (error) {
      console.error('Agent test failed:', error);
      alert('Test başarısız oldu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    } finally {
      setTestLoading(false);
    }
  };

  const _getStatusColor = (status: AgentTask['status']): string => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'blocked': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const AgentCard: React.FC<{ profile: AgentProfile; metrics?: AgentMetrics }> = ({ profile, metrics }) => (
    <div
      className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--panel-bg-solid)] p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: `linear-gradient(135deg, ${profile.color}15 0%, ${profile.color}05 100%)`
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-6 mb-6">
        <div
          className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 duration-300 overflow-hidden"
          style={{ backgroundColor: profile.color }}
        >
          <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{profile.name}</h3>
          <p
            className="text-sm font-bold uppercase tracking-widest mb-3"
            style={{ color: profile.color }}
          >
            {profile.title}
          </p>
          {metrics && (
            <div className="flex items-center gap-3 mb-4 text-xs font-bold text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-check-circle text-emerald-500"></i>
                {metrics.completedTasks} Görev
              </span>
              <span className="flex items-center gap-1">
                <i className="fa-solid fa-percentage" style={{ color: profile.color }}></i>
                {metrics.successRate.toFixed(0)}% Başarı
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Expertise */}
      <div className="mb-6">
        <h4 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Uzmanlık Alanları
        </h4>
        <div className="flex flex-wrap gap-2">
          {profile.expertise.map((exp, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border"
              style={{
                backgroundColor: `${profile.color}20`,
                borderColor: `${profile.color}40`,
                color: profile.color
              }}
            >
              {exp}
            </span>
          ))}
        </div>
      </div>

      {/* Responsibilities */}
      <div className="mb-6">
        <h4 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Temel Sorumluluklar
        </h4>
        <div className="space-y-2">
          {profile.responsibilities.slice(0, 3).map((resp, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <i className="fa-solid fa-check-circle mt-0.5" style={{ color: profile.color }}></i>
              <span>{resp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedAgent(profile.role)}
          className="flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2"
          style={{
            backgroundColor: profile.color,
            borderColor: profile.color,
            color: 'white'
          }}
        >
          <i className="fa-solid fa-vial mr-2"></i>
          Test Et
        </button>
        <button
          className="w-12 h-12 rounded-2xl bg-[var(--panel-bg-subtle)] hover:bg-[var(--accent-muted)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] transition-all"
          title="Detaylar"
        >
          <i className="fa-solid fa-chart-line"></i>
        </button>
      </div>

      {/* Hover Overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${profile.color}, transparent 70%)`
        }}
      ></div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--text-primary)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Ajanlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-['Lexend']">
      {/* Header */}
      <div className="bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tight">AI Ajan Yönetim Merkezi</h1>
              <p className="text-[var(--text-muted)] font-medium">
                4 Uzman Lider Ajan Koordinasyonu ve Performans İzleme
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-black text-sm uppercase tracking-widest transition-all"
            >
              <i className="fa-solid fa-refresh mr-2"></i>
              Yenile
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: 'fa-chart-pie' },
              { id: 'tasks', label: 'Görevler', icon: 'fa-tasks' },
              { id: 'conversations', label: 'Konuşmalar', icon: 'fa-comments' },
              { id: 'settings', label: 'Ayarlar', icon: 'fa-cog' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] border-[var(--accent-color)]'
                    : 'bg-[var(--panel-bg-subtle)] text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--accent-muted)]'
                }`}
              >
                <i className={`fa-solid ${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1920px] mx-auto px-8 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Metrics Overview */}
            {metrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(Object.keys(AGENT_PROFILES) as AgentRole[]).map((role) => {
                  const profile = AGENT_PROFILES[role];
                  const metric = metrics[role];

                  return (
                    <div
                      key={role}
                      className="rounded-[2.5rem] p-6 border border-[var(--border-color)] bg-[var(--panel-bg-subtle)]"
                      style={{
                        background: `linear-gradient(135deg, ${profile.color}15 0%, ${profile.color}05 100%)`,
                        borderColor: `${profile.color}30`
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center"
                          style={{ backgroundColor: profile.color }}
                        >
                          <img src={profile.avatar} alt="" className="w-full h-full rounded-2xl" />
                        </div>
                        <div>
                          <h3 className="font-black text-[var(--text-primary)] text-sm">{profile.name}</h3>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
                            {profile.title}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--text-muted)]">Toplam Görev</span>
                          <span className="text-lg font-black text-[var(--text-primary)]">{metric.totalTasks}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--text-muted)]">Başarı Oranı</span>
                          <span
                            className="text-lg font-black"
                            style={{ color: profile.color }}
                          >
                            {metric.successRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[var(--text-muted)]">Ort. Yanıt</span>
                          <span className="text-sm font-bold text-[var(--text-secondary)]">
                            {(metric.avgResponseTime / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Agent Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {(Object.keys(AGENT_PROFILES) as AgentRole[]).map((role) => (
                <AgentCard
                  key={role}
                  profile={AGENT_PROFILES[role]}
                  metrics={metrics?.[role]}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="rounded-[2.5rem] bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] p-8">
            <h2 className="text-2xl font-black mb-6">Görev Geçmişi</h2>
            <p className="text-[var(--text-muted)] text-center py-20">
              Görev listesi yakında eklenecek...
            </p>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="rounded-[2.5rem] bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] p-8">
            <h2 className="text-2xl font-black mb-6">Konuşma Geçmişi</h2>
            <p className="text-[var(--text-muted)] text-center py-20">
              Konuşma listesi yakında eklenecek...
            </p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-[2.5rem] bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] p-8">
            <h2 className="text-2xl font-black mb-6">Ajan Ayarları</h2>
            <p className="text-[var(--text-muted)] text-center py-20">
              Ayarlar yakında eklenecek...
            </p>
          </div>
        )}
      </div>

      {/* Test Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-6">
          <div className="bg-[var(--panel-bg-solid)] rounded-[3rem] border border-[var(--border-color)] max-w-3xl w-full p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: AGENT_PROFILES[selectedAgent].color }}
                >
                  <img
                    src={AGENT_PROFILES[selectedAgent].avatar}
                    alt=""
                    className="w-full h-full rounded-2xl"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[var(--text-primary)]">
                    {AGENT_PROFILES[selectedAgent].name}
                  </h2>
                  <p
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: AGENT_PROFILES[selectedAgent].color }}
                  >
                    {AGENT_PROFILES[selectedAgent].title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAgent(null);
                  setTestPrompt('');
                  setTestResult(null);
                }}
                className="w-12 h-12 rounded-full bg-[var(--panel-bg-subtle)] hover:bg-[var(--accent-muted)] border border-[var(--border-color)] flex items-center justify-center transition-all"
              >
                <i className="fa-solid fa-times text-[var(--text-primary)]"></i>
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Test İçeriği
                </label>
                <textarea
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Ajan tarafından değerlendirilecek içeriği girin..."
                  className="w-full h-40 px-6 py-4 bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] rounded-3xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-medium resize-none"
                />
              </div>

              <button
                onClick={() => handleTestAgent(selectedAgent)}
                disabled={testLoading || !testPrompt.trim()}
                className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50"
                style={{
                  backgroundColor: AGENT_PROFILES[selectedAgent].color,
                  color: 'white'
                }}
              >
                {testLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play mr-2"></i>
                    Test Başlat
                  </>
                )}
              </button>

              {testResult && (
                <div className="mt-6 p-6 bg-[var(--panel-bg-subtle)] border border-[var(--border-color)] rounded-3xl">
                  <h3 className="text-sm font-black text-[var(--text-primary)] mb-4 uppercase tracking-widest">
                    Test Sonucu
                  </h3>
                  <pre className="text-xs text-[var(--text-secondary)] font-mono overflow-auto max-h-64 custom-scrollbar">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentManagement;
