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
    } catch {
      /* fallback */
    }
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

  const handlePrint = () => {
    const htmlContent = exportAd(output, 'html');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  return (
    <div className="flex items-center gap-1.5 font-lexend">
      <select
        value={exportFormat}
        onChange={e => setExportFormat(e.target.value as 'md' | 'json' | 'html')}
        className="py-1 px-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-bold focus:outline-none focus:border-indigo-500/40 cursor-pointer appearance-none"
      >
        <option value="md" className="bg-zinc-900">MD</option>
        <option value="json" className="bg-zinc-900">JSON</option>
        <option value="html" className="bg-zinc-900">HTML</option>
      </select>

      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-[10px] font-bold hover:bg-white/10 transition-all"
        title="Metni Kopyala"
      >
        <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-copy'}`} />
        <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
      </button>

      <button
        onClick={handleDownload}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-zinc-300 text-[10px] font-bold hover:bg-white/10 transition-all"
        title="Dosyayı İndir"
      >
        <i className="fa-solid fa-download" />
        <span>İndir</span>
      </button>

      <button
        onClick={handlePrint}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold hover:bg-indigo-500/30 transition-all shadow-sm"
        title="A4 Yazdır / PDF Kaydet"
      >
        <i className="fa-solid fa-print" />
        <span>Yazdır / PDF</span>
      </button>
    </div>
  );
};
