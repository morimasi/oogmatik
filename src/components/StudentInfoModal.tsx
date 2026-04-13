
import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';

interface StudentInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: StudentProfile | null;
    onSave: (profile: StudentProfile) => void;
    onClear: () => void;
}

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({ isOpen, onClose, currentProfile, onSave, onClear }) => {
    const [profile, setProfile] = useState<StudentProfile>({
        name: '',
        school: '',
        grade: '',
        date: new Date().toLocaleDateString('tr-TR'),
        notes: ''
    });

    useEffect(() => {
        if (isOpen && currentProfile) {
            setProfile(currentProfile);
        } else if (isOpen && !currentProfile) {
            // Reset to defaults if opening empty
            setProfile({
                name: '',
                school: '',
                grade: '',
                date: new Date().toLocaleDateString('tr-TR'),
                notes: ''
            });
        }
    }, [isOpen, currentProfile]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(profile);
        onClose();
    };

    const handleClear = () => {
        if (confirm("Öğrenci bilgilerini temizlemek istediğinize emin misiniz?")) {
            onClear();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-paper)' }}>
                <div className="p-4 flex justify-between items-center text-white" style={{ backgroundColor: 'var(--accent-color)' }}>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <i className="fa-solid fa-user-graduate"></i> Öğrenci Bilgisi
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 rounded-lg text-sm mb-4" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Buraya girdiğiniz bilgiler, oluşturacağınız tüm çalışma sayfalarının üzerine otomatik olarak eklenecektir.
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1" style={{ color: 'var(--text-secondary)' }}>Adı Soyadı</label>
                        <input
                            type="text"
                            required
                            value={profile.name}
                            onChange={e => setProfile({ ...profile, name: e.target.value })}
                            className="w-full p-2 rounded-lg focus:ring-2 outline-none"
                            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                            placeholder="Örn: Ali Yılmaz"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Okul / Kurum</label>
                            <input
                                type="text"
                                value={profile.school}
                                onChange={e => setProfile({ ...profile, school: e.target.value })}
                                className="w-full p-2 rounded-lg focus:ring-2 outline-none"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                                placeholder="Örn: Atatürk İÖO"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Sınıf</label>
                            <input
                                type="text"
                                value={profile.grade}
                                onChange={e => setProfile({ ...profile, grade: e.target.value })}
                                className="w-full p-2 rounded-lg focus:ring-2 outline-none"
                                style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                                placeholder="Örn: 2-A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Tarih</label>
                        <input
                            type="text"
                            value={profile.date}
                            onChange={e => setProfile({ ...profile, date: e.target.value })}
                            className="w-full p-2 rounded-lg focus:ring-2 outline-none"
                            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ek Notlar (Opsiyonel)</label>
                        <textarea
                            value={profile.notes}
                            onChange={e => setProfile({ ...profile, notes: e.target.value })}
                            className="w-full p-2 rounded-lg focus:ring-2 outline-none h-20 resize-none"
                            style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)', color: 'var(--text-primary)' }}
                            placeholder="Örn: Dikkat çalışması..."
                        ></textarea>
                    </div>

                    <div className="flex gap-3 mt-6">
                        {currentProfile && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
                            >
                                Temizle
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-white rounded-lg font-bold shadow-md transition-colors hover:opacity-90"
                            style={{ backgroundColor: 'var(--accent-color)' }}
                        >
                            Bilgileri Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
