import React, { useState, useEffect } from 'react';
import { useReadingStore } from '../../../store/useReadingStore';
import { auth, db } from '../../../services/firebaseClient';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { logError } from '../../../utils/logger.js';

export const ArchivePanel = () => {
    const { setStoryData, setLayout, setConfig } = useReadingStore();
    const [savedProjects, setSavedProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadArchive = async () => {
        setIsLoading(true);
        try {
            const user = auth.currentUser;
            const combinedProjects: any[] = [];

            // 1. LocalStorage Verisi
            const localData = localStorage.getItem('reading_studio_archive');
            if (localData) {
                const parsed = JSON.parse(localData);
                combinedProjects.push(...parsed);
            }

            // 2. Firestore Verisi (Kullanıcı oturum açmışsa)
            if (user) {
                try {
                    const q = query(
                        collection(db, 'worksheets'),
                        where('userId', '==', user.uid),
                        where('activityType', '==', 'story-comprehension')
                    );
                    const snap = await getDocs(q);
                    snap.forEach((d) => {
                        const data = d.data();
                        if (data.sheets && data.sheets[0]) {
                            const sheet = data.sheets[0];
                            combinedProjects.push({
                                id: d.id,
                                isFirestore: true,
                                title: data.title || sheet.title || 'Okuma Çalışması',
                                date: data.createdAt || new Date().toISOString(),
                                layoutCount: sheet.layout?.length || 0,
                                config: sheet.config,
                                storyData: sheet.storyData,
                                layout: sheet.layout,
                            });
                        }
                    });
                } catch (dbErr) {
                    logError(dbErr as any);
                }
            }

            // Tarihe göre sırala
            combinedProjects.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Çift kayıtları tekilleştir
            const uniqueMap = new Map();
            combinedProjects.forEach(p => uniqueMap.set(p.id || p.title, p));
            setSavedProjects(Array.from(uniqueMap.values()));
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadArchive();
        window.addEventListener('reading_studio_saved', loadArchive);
        return () => window.removeEventListener('reading_studio_saved', loadArchive);
    }, []);

    const loadProject = (project: any) => {
        if (window.confirm('Mevcut çalışmanız silinecek. Arşivdeki projeyi yüklemek istiyor musunuz?')) {
            if (project.config) setConfig(project.config);
            if (project.storyData) setStoryData(project.storyData);
            if (project.layout) setLayout(project.layout);
        }
    };

    const deleteProject = async (project: any) => {
        if (window.confirm('Bu projeyi arşivden silmek istediğinize emin misiniz?')) {
            try {
                if (project.isFirestore && auth.currentUser) {
                    await deleteDoc(doc(db, 'worksheets', project.id));
                }
                const newLocal = savedProjects.filter(p => p.id !== project.id);
                localStorage.setItem('reading_studio_archive', JSON.stringify(newLocal.filter(p => !p.isFirestore)));
                setSavedProjects(newLocal);
                window.dispatchEvent(new Event('reading_studio_saved'));
            } catch (e) {
                logError(e as any);
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 border border-purple-500/20">
                        <i className="fa-solid fa-folder-open text-xs"></i>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Arşivim</h3>
                </div>
                <button
                    onClick={loadArchive}
                    title="Yenile"
                    className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                >
                    <i className={`fa-solid fa-rotate-right text-[10px] ${isLoading ? 'animate-spin' : ''}`}></i>
                </button>
            </div>

            {savedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-4 border border-zinc-800">
                        <i className="fa-solid fa-box-open text-2xl"></i>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Arşiv Boş</p>
                    <p className="text-[10px] text-zinc-600 mt-2 italic">Kaydettiğiniz ve ürettiğiniz tüm içerikler veritabanıyla senkronize olarak burada saklanır.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                    {savedProjects.map((project) => (
                        <div key={project.id} className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 flex flex-col gap-2 group hover:border-zinc-500 transition-colors relative">
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-bold text-white mb-1 truncate">{project.title || 'İsimsiz Proje'}</h4>
                                    <span className="text-[9px] text-zinc-500 font-mono block">
                                        {new Date(project.date).toLocaleString('tr-TR')}
                                    </span>
                                </div>
                                <button
                                    onClick={() => deleteProject(project)}
                                    className="w-6 h-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white shrink-0"
                                >
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md font-bold">
                                    {project.layoutCount || 0} Bileşen
                                </span>
                                {project.isFirestore && (
                                    <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black uppercase">
                                        Bulut Sync
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => loadProject(project)}
                                className="w-full mt-2 py-2 bg-accent/10 text-accent/70 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-accent hover:text-white transition-colors"
                            >
                                Yükle
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};