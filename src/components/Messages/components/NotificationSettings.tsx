import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Volume2, Vibrate, Eye, X } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose }) => {
  const { notificationPrefs, setNotificationPrefs } = useMessagesStore();
  const [prefs, setPrefs] = useState(notificationPrefs);

  const toggle = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setNotificationPrefs(updated);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-72 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
              Bildirim Ayarları
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg hover:bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <SettingRow
              icon={Bell}
              label="Görsel Bildirim"
              description="Toast bildirimleri göster"
              checked={prefs.visual}
              onChange={() => toggle('visual')}
            />
            <SettingRow
              icon={Volume2}
              label="Ses"
              description="Yeni mesaj sesi çal"
              checked={prefs.sound}
              onChange={() => toggle('sound')}
            />
            <SettingRow
              icon={Vibrate}
              label="Titreşim"
              description="Mobilde titreşim uyarısı"
              checked={prefs.vibration}
              onChange={() => toggle('vibration')}
            />
            <SettingRow
              icon={Eye}
              label="Mesaj Önizleme"
              description="Bildirimde mesaj içeriğini göster"
              checked={prefs.showPreview}
              onChange={() => toggle('showPreview')}
            />
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <p className="text-[8px] text-[var(--text-muted)] font-medium">
              Değişiklikler otomatik kaydedilir.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SettingRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}> = ({ icon: Icon, label, description, checked, onChange }) => (
  <label className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-glass)] cursor-pointer transition-colors group">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
      checked ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
    }`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-[var(--text-primary)]">{label}</p>
      <p className="text-[9px] text-[var(--text-muted)]">{description}</p>
    </div>
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <div className="w-9 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] peer-checked:bg-[var(--accent-color)] transition-colors cursor-pointer" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform pointer-events-none" />
    </div>
  </label>
);
