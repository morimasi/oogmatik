
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
        if(confirm("Öğrenci bilgilerini temizlemek istediğinize emin misiniz?")) {
            onClear();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="bg-indigo-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <i className="fa-solid fa-user-graduate"></i> Öğrenci Bilgisi
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-sm text-indigo-800 dark:text-indigo-200 mb-4">
                        <i className="fa-solid fa-circle-info mr-2"></i>
                        Buraya girdiğiniz bilgiler, oluşturacağınız tüm çalışma sayfalarının üzerine otomatik olarak eklenecektir.
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Adı Soyadı</label>
                        <input 
                            type="text" 
                            required
                            value={profile.name}
                            onChange={e => setProfile({...profile, name: e.target.value})}
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Örn: Ali Yılmaz"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Okul / Kurum</label>
                            <input 
                                type="text" 
                                value={profile.school}
                                onChange={e => setProfile({...profile, school: e.target.value})}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Örn: Atatürk İÖO"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sınıf</label>
                            <input 
                                type="text" 
                                value={profile.grade}
                                onChange={e => setProfile({...profile, grade: e.target.value})}
                                className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Örn: 2-A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Tarih</label>
                        <input 
                            type="text" 
                            value={profile.date}
                            onChange={e => setProfile({...profile, date: e.target.value})}
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Ek Notlar (Opsiyonel)</label>
                        <textarea 
                            value={profile.notes}
                            onChange={e => setProfile({...profile, notes: e.target.value})}
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 outline-none h-20 resize-none"
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
                            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-colors"
                        >
                            Bilgileri Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
