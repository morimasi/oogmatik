import React, { useState } from 'react';

export const AIEnhanceEntryPanel: React.FC<{
  selectedItemId?: string;
  onRequestEnhancement: (topic: string) => void;
}> = ({ selectedItemId, onRequestEnhancement }) => {
  const [enhancement, setEnhancement] = useState('');

  const submit = () => {
    if (enhancement.trim().length > 2) {
      onRequestEnhancement(enhancement.trim());
      setEnhancement('');
    }
  };

  return (
    <div className="rounded-lg border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5 p-4">
      <h4 className="mb-2 font-semibold text-[var(--accent-color)]">AI ile Geliştir</h4>
      <p className="mb-3 text-xs text-[var(--text-secondary)]">Seçilen etkinliği özel konuyla zenginleştir</p>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Özel konu veya ek bilgi gir..."
          value={enhancement}
          onChange={(event) => setEnhancement(event.target.value)}
          disabled={!selectedItemId}
          className="w-full rounded-lg border border-[var(--border-color)] px-3 py-2 text-sm placeholder:text-[var(--text-secondary)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!selectedItemId || enhancement.trim().length < 3}
          className="w-full rounded-lg bg-[var(--accent-color)] px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50 hover:opacity-90"
        >
          Zenginleştir
        </button>
      </div>
    </div>
  );
};
