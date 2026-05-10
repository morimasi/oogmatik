import React, { ChangeEvent, useState } from 'react';
import { SectionHeader } from '../../components/shared/SectionHeader';
import { ToggleSwitch } from '../../components/shared/ToggleSwitch';
import { useProfileSettings } from '../../hooks/useProfileSettings';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useToastStore } from '../../../../store/useToastStore';
import { authService } from '../../../../services/authService';
import { AppError } from '../../../../utils/AppError';
import { logError } from '../../../../utils/errorHandler';
import type { SecuritySettingsProps } from '../../types';

export const SecuritySettings: React.FC<SecuritySettingsProps> = () => {
    const { user } = useProfileSettings();
    const { logout } = useAuthStore();

    const [showPwForm, setShowPwForm] = useState(false);
    const [pwForm, setPwForm] = useState({ next: '', confirm: '' });
    const [savingPw, setSavingPw] = useState(false);
    const [delStep, setDelStep] = useState<0 | 1>(0);
    const [delText, setDelText] = useState('');
    const [deleting, setDeleting] = useState(false);

    const pwStrength = (() => {
        const p = pwForm.next;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s += 25;
        if (/[A-Z]/.test(p)) s += 25;
        if (/[0-9]/.test(p)) s += 25;
        if (/[^A-Za-z0-9]/.test(p)) s += 25;
        return s;
    })();

    const handlePwChange = async () => {
        if (pwForm.next.length < 8) { useToastStore.getState().error('Şifre en az 8 karakter olmalıdır.'); return; }
        if (pwForm.next !== pwForm.confirm) { useToastStore.getState().error('Şifreler eşleşmiyor.'); return; }
        setSavingPw(true);
        try {
            await authService.updatePassword(pwForm.next);
            useToastStore.getState().success('Şifreniz başarıyla güncellendi.');
            setShowPwForm(false);
            setPwForm({ next: '', confirm: '' });
        } catch (e: unknown) {
            const err = e instanceof AppError ? e : new AppError(String(e), 'PASSWORD_UPDATE_ERROR', 500);
            logError(err, { context: 'SecuritySettings.handlePwChange' });
            useToastStore.getState().error('Şifre güncellenirken hata oluştu.');
        } finally { setSavingPw(false); }
    };

    const handleDelete = async () => {
        if (delText !== 'HESABIMI SİL' || !user) return;
        setDeleting(true);
        try {
            await authService.deleteUser(user.id);
            await logout();
        } catch (e: unknown) {
            const err = e instanceof AppError ? e : new AppError(String(e), 'DELETE_ACCOUNT_ERROR', 500);
            logError(err, { context: 'SecuritySettings.handleDelete' });
            useToastStore.getState().error('Hesap silinirken hata oluştu.');
        } finally { setDeleting(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Şifre Güvenliği */}
            <div className="bg-[var(--bg-secondary)]/50 p-5 rounded-2xl border border-[var(--border-color)]">
                <SectionHeader title="Şifre Güvenliği" icon="fa-key" />
                {!showPwForm ? (
                    <button onClick={() => setShowPwForm(true)} className="px-5 py-3 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-xl font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all shadow-sm">
                        Yeni Şifre Oluştur
                    </button>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Yeni Şifre</label>
                                <input type="password" value={pwForm.next} onChange={(e: ChangeEvent<HTMLInputElement>) => setPwForm(p => ({ ...p, next: e.target.value }))} className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1">Şifre Tekrar</label>
                                <input type="password" value={pwForm.confirm} onChange={(e: ChangeEvent<HTMLInputElement>) => setPwForm(p => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl focus:ring-2 focus:ring-[var(--accent-color)] outline-none" />
                            </div>
                        </div>
                        {/* Strength Meter */}
                        {pwForm.next && (
                            <div className="space-y-1">
                                <div className="flex gap-1">
                                    {[25, 50, 75, 100].map(t => (
                                        <div key={t} className={`flex-1 h-1.5 rounded-full transition-all ${pwStrength >= t ? (pwStrength >= 75 ? 'bg-emerald-500' : pwStrength >= 50 ? 'bg-amber-500' : 'bg-rose-500') : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                    ))}
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-right" style={{ color: pwStrength >= 75 ? '#10b981' : pwStrength >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {pwStrength >= 75 ? 'Güçlü' : pwStrength >= 50 ? 'Orta' : 'Zayıf'}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setShowPwForm(false)} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">İptal</button>
                            <button onClick={handlePwChange} disabled={savingPw} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                                {savingPw ? <i className="fa-solid fa-circle-notch fa-spin" /> : 'Şifreyi Güncelle'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Veri Dışa Aktarma */}
            <div className="p-5 bg-[var(--bg-secondary)]/50 rounded-2xl border border-[var(--border-color)]">
                <SectionHeader title="Veri Yönetimi (KVKK)" icon="fa-database" description="Tüm verilerinizi dışa aktarabilirsiniz" />
                <button className="px-5 py-3 bg-[var(--bg-paper)] text-[var(--text-primary)] rounded-xl font-black text-[10px] uppercase tracking-widest border border-[var(--border-color)] hover:border-indigo-500 transition-all shadow-sm">
                    <i className="fa-solid fa-download mr-2" /> Verilerimi İndir (JSON)
                </button>
            </div>

            {/* Hesap Silme */}
            <div className="p-5 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <SectionHeader title="Risk Alanı" icon="fa-triangle-exclamation" />
                <p className="text-[10px] font-bold text-rose-600/70 uppercase tracking-wider mb-4">
                    Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak yok edilir.
                </p>
                {delStep === 0 && (
                    <button onClick={() => setDelStep(1)} className="px-5 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:scale-105 active:scale-95 transition-all">
                        Hesabımı Sonlandır
                    </button>
                )}
                {delStep === 1 && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                        <p className="text-[10px] font-black text-rose-800 dark:text-rose-400 uppercase tracking-widest">"HESABIMI SİL" yazın:</p>
                        <input type="text" value={delText} onChange={(e: ChangeEvent<HTMLInputElement>) => setDelText(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-black/50 border-2 border-rose-200 dark:border-rose-900 rounded-xl focus:ring-4 focus:ring-rose-500/20 outline-none text-rose-600 font-black text-center" placeholder="HESABIMI SİL" />
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => { setDelStep(0); setDelText(''); }} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Vazgeç</button>
                            <button onClick={handleDelete} disabled={deleting || delText !== 'HESABIMI SİL'} className="px-6 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-30 shadow-xl">
                                {deleting ? 'SİLİNİYOR...' : 'HESABI KALICI OLARAK TEMİZLE'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
