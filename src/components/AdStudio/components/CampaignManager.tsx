import React, { useState } from 'react';
import { AdCampaign, AdAudience } from '../../../types/adStudio';
import { useAdHistory } from '../../../hooks/useAdHistory';

const STORAGE_KEY = 'bdmind_ad_campaigns';

function loadCampaigns(): AdCampaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdCampaign[];
  } catch { /* ignore */ }
  return [];
}

function saveCampaigns(campaigns: AdCampaign[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export const CampaignManager: React.FC = () => {
  const { history } = useAdHistory();
  const [campaigns, setCampaigns] = useState<AdCampaign[]>(loadCampaigns);
  const [isCreating, setIsCreating] = useState(false);
  const [newCampaign, setNewCampaign] = useState<Partial<AdCampaign>>({});

  React.useEffect(() => { saveCampaigns(campaigns); }, [campaigns]);

  const createCampaign = () => {
    if (!newCampaign.name) return;
    const campaign: AdCampaign = {
      id: crypto.randomUUID(),
      name: newCampaign.name || '',
      description: newCampaign.description || '',
      ads: [],
      targetAudience: newCampaign.targetAudience || [],
      season: newCampaign.season || '',
      budget: newCampaign.budget || '',
      startDate: newCampaign.startDate || '',
      endDate: newCampaign.endDate || '',
      createdAt: new Date().toISOString(),
    };
    setCampaigns(prev => [...prev, campaign]);
    setIsCreating(false);
    setNewCampaign({});
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-indigo-500" />
          Kampanyalar
          <span className="text-zinc-600 font-mono normal-case tracking-normal">({campaigns.length})</span>
        </h3>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[9px] font-bold hover:bg-indigo-500/30 transition-all"
        >
          <i className="fa-solid fa-plus" /> Yeni Kampanya
        </button>
      </div>

      {isCreating && (
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 mb-4 space-y-3">
          <input
            placeholder="Kampanya adı"
            value={newCampaign.name || ''}
            onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
            className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30"
          />
          <textarea
            placeholder="Açıklama"
            value={newCampaign.description || ''}
            onChange={e => setNewCampaign(p => ({ ...p, description: e.target.value }))}
            rows={2}
            className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30 resize-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Bütçe"
              value={newCampaign.budget || ''}
              onChange={e => setNewCampaign(p => ({ ...p, budget: e.target.value }))}
              className="py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30"
            />
            <input
              type="text"
              placeholder="Sezon"
              value={newCampaign.season || ''}
              onChange={e => setNewCampaign(p => ({ ...p, season: e.target.value }))}
              className="py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={createCampaign} className="flex-1 py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all">
              <i className="fa-solid fa-check mr-1" /> Oluştur
            </button>
            <button onClick={() => setIsCreating(false)} className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 text-[10px] font-bold hover:bg-white/10 transition-all">
              İptal
            </button>
          </div>
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500">
          <i className="fa-solid fa-bullhorn text-2xl" />
          <p className="text-[11px] font-medium">Henüz kampanya oluşturulmadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(campaign => {
            const campaignAds = history.filter(ad => campaign.ads.includes(ad.id));
            return (
              <div key={campaign.id} className="rounded-xl bg-white/5 border border-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-[12px] font-bold text-zinc-300">{campaign.name}</h4>
                    <p className="text-[9px] text-zinc-500">{campaign.description}</p>
                  </div>
                  <button onClick={() => deleteCampaign(campaign.id)} className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-red-400 text-[9px]">
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-zinc-600">
                  {campaign.budget && <span>Bütçe: {campaign.budget}</span>}
                  {campaign.season && <span>· Sezon: {campaign.season}</span>}
                  <span>· Reklam: {campaignAds.length}</span>
                </div>
                {campaignAds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {campaignAds.map(ad => (
                      <span key={ad.id} className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px]">{ad.title}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
