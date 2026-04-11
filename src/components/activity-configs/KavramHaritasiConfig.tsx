import React from 'react';
interface Props {
  options: Record<string, unknown>;
  onChange: (opts: Record<string, unknown>) => void;
}
export const KavramHaritasiConfig: React.FC<Props> = ({ options, onChange }) => {
  const opts = options as Record<string, unknown>;
  const kavram = (opts.kavramHaritasi || {}) as Record<string, unknown>;
  return (
    <div className="space-y-5 p-4">
      <div className="pb-3 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-800">Kavram Haritası</h4>
        <p className="text-xs text-zinc-500">Kavramlar arası ilişkileri göster</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Kavram Adı</label>
        <input
          value={(kavram.concept as string) || ''}
          onChange={(e) =>
            onChange({ ...opts, kavramHaritasi: { ...kavram, concept: e.target.value } })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
          placeholder="örn: Canlılar"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Derinlik</label>
        <select
          value={(kavram.depth as number) || 2}
          onChange={(e) =>
            onChange({ ...opts, kavramHaritasi: { ...kavram, depth: Number(e.target.value) } })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
        >
          <option value={1}>1 Seviye</option>
          <option value={2}>2 Seviye</option>
          <option value={3}>3 Seviye</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Dal Sayısı</label>
        <input
          type="number"
          value={(kavram.branchCount as number) || 3}
          onChange={(e) =>
            onChange({
              ...opts,
              kavramHaritasi: { ...kavram, branchCount: Number(e.target.value) },
            })
          }
          className="w-full p-2 border-2 border-zinc-200 rounded-lg"
          min={2}
          max={6}
        />
      </div>
    </div>
  );
};
export default KavramHaritasiConfig;
