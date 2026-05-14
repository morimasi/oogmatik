import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, Vibrate, Eye, X, Timer, Clock } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { saveNotificationPrefs } from '../services/notificationService';

interface NotificationSettingsProps {
  open: boolean;
  onClose: () => void;
}

const DISMISS_OPTIONS = [
  { label: '5 sn', value: 5000 },
  { label: '10 sn', value: 10000 },
  { label: '30 sn', value: 30000 },
  { label: 'Kapatma', value: 0 },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ open, onClose }) => {
  const { notificationPrefs, setNotificationPrefs, autoDismissDelay, setAutoDismissDelay } =
    useMessagesStore();
  const [prefs, setPrefs] = useState(notificationPrefs);

  const toggle = (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setNotificationPrefs(updated);
    saveNotificationPrefs(updated);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute top-full right-0 mt-2 w-80 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-[var(--accent-color)]" />
              Bildirim Ayarları
            </h3>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg hover:bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 space-y-1">
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

          {/* Auto-dismiss ayarı */}
          <div className="px-3 pb-3">
            <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-color)]" />
                <span className="text-[10px] font-bold text-[var(--text-primary)]">
                  Otomatik Kapatma
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {DISMISS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setAutoDismissDelay(opt.value)}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      autoDismissDelay === opt.value
                        ? 'bg-[var(--accent-color)] text-white shadow-sm'
                        : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:bg-[var(--surface-glass)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
            <p className="text-[8px] text-[var(--text-muted)] font-medium">
              ✓ Ayarlar otomatik kaydedilir.
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
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        checked
          ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]'
          : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
      }`}
    >
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-[var(--text-primary)]">{label}</p>
      <p className="text-[9px] text-[var(--text-muted)]">{description}</p>
    </div>
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <div className="w-9 h-5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] peer-checked:bg-[var(--accent-color)] transition-colors cursor-pointer" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform pointer-events-none" />
    </div>
  </label>
);
