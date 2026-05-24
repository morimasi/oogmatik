import React, { useState } from 'react';
import { AdOutput } from '../../../types/adStudio';
import { exportAd } from '../../../services/adGeneratorService';

interface ExportPanelProps {
  output: AdOutput;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ output }) => {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'md' | 'json' | 'html'>('md');

  const handleCopy = async () => {
    const content = exportAd(output, exportFormat);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback */ }
  };

  const handleDownload = () => {
    const content = exportAd(output, exportFormat);
    const mimeTypes: Record<string, string> = {
      md: 'text/markdown',
      json: 'application/json',
      html: 'text/html',
    };
    const blob = new Blob([content], { type: mimeTypes[exportFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bdmind-reklam-${output.id.slice(0, 8)}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={exportFormat}
        onChange={e => setExportFormat(e.target.value as 'md' | 'json' | 'html')}
        className="py-1.5 px-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 text-[9px] font-bold focus:outline-none focus:border-indigo-500/30 cursor-pointer appearance-none"
      >
        <option value="md" className="bg-zinc-900">MD</option>
        <option value="json" className="bg-zinc-900">JSON</option>
        <option value="html" className="bg-zinc-900">HTML</option>
      </select>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 transition-all"
      >
        <i className={`fa-solid ${copied ? 'fa-check text-emerald-500' : 'fa-copy'}`} />
        {copied ? 'Kopyalandı' : 'Kopyala'}
      </button>
      <button
        onClick={handleDownload}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 transition-all"
      >
        <i className="fa-solid fa-download" /> İndir
      </button>
    </div>
  );
};
