import React, { useState, useEffect } from 'react';
import { useReadingStudio } from '../../../context/ReadingStudioContext';

export const ArchivePanel = () => {
    const { setStoryData, setLayout, setConfig } = useReadingStudio();
    const [savedProjects, setSavedProjects] = useState<any[]>([]);

    useEffect(() => {
        const loadArchive = () => {
            try {
                const data = localStorage.getItem('reading_studio_archive');
                if (data) {
                    setSavedProjects(JSON.parse(data));
                }
            } catch (e) {
                console.error("Archive loading error", e);
            }
        };
        
        loadArchive();
        // Custom event listener for updates
        window.addEventListener('reading_studio_saved', loadArchive);
        return () => window.removeEventListener('reading_studio_saved', loadArchive);
    }, []);

    const loadProject = (project: any) => {
        if (window.confirm('Mevcut çalışmanız silinecek. Arşivdeki projeyi yüklemek istiyor musunuz?')) {
            setConfig(project.config);
            setStoryData(project.storyData);
            setLayout(project.layout);
        }
    };

    const deleteProject = (id: string) => {
        if (window.confirm('Bu projeyi arşivden silmek istediğinize emin misiniz?')) {
            const newArchive = savedProjects.filter(p => p.id !== id);
            localStorage.setItem('reading_studio_archive', JSON.stringify(newArchive));
            setSavedProjects(newArchive);
            window.dispatchEvent(new Event('reading_studio_saved'));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500 border border-purple-500/20">
                    <i className="fa-solid fa-folder-open text-xs"></i>
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Arşivim</h3>
            </div>

            {savedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-700 mb-4 border border-zinc-800">
                        <i className="fa-solid fa-box-open text-2xl"></i>
                    </div>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Arşiv Boş</p>
                    <p className="text-[10px] text-zinc-600 mt-2 italic">Kaydettiğiniz çalışmalar burada listelenir.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {savedProjects.map((project) => (
                        <div key={project.id} className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-3 flex flex-col gap-2 group hover:border-zinc-500 transition-colors">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-bold text-white mb-1">{project.title || 'İsimsiz Proje'}</h4>
                                    <span className="text-[9px] text-zinc-500 font-mono">{new Date(project.date).toLocaleString('tr-TR')}</span>
                                </div>
                                <button onClick={() => deleteProject(project.id)} className="w-6 h-6 rounded-md bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
                                    <i className="fa-solid fa-trash text-[10px]"></i>
                                </button>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">{project.layoutCount} Bileşen</span>
                            </div>
                            <button
                                onClick={() => loadProject(project)}
                                className="w-full mt-2 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-600 hover:text-white transition-colors"
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