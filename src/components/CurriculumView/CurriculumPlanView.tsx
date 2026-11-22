import React from 'react';
import { Curriculum, Difficulty, CurriculumActivity, CurriculumDay } from '../../types';
import { DayCard } from './DayCard';
import { CurriculumGoalsEditor } from './CurriculumGoalsEditor';
import { CurriculumViewMode } from './useCurriculumState';

interface CurriculumPlanViewProps {
    curriculum: Curriculum;
    isSaved: boolean;
    onStartCurriculumActivity: (planId: string, day: number, activityId: string, activityType: string, studentName: string, title: string, difficulty: Difficulty, goal: string, studentId?: string) => void;
    handleToggleActivity: (day: number, actId: string) => Promise<void>;
    handleSaveDayNote: (day: number, note: string) => Promise<void>;
    handleSaveDayFocusEdit: (day: number) => Promise<void>;
    handleReplaceActivity: (day: number, actId: string) => Promise<void>;
    handleSaveGoal: (idx: number) => Promise<void>;
    handleStartEditingGoal: (idx: number, goal: string) => void;
    handleAddGoal: () => Promise<void>;
    handleDeleteGoal: (idx: number) => Promise<void>;
    handleSaveNoteEdit: () => Promise<void>;
    handleDeletePlan: () => Promise<void>;
    editingDay: number | null;
    setEditingDay: (d: number | null) => void;
    tempFocus: string;
    setTempFocus: (v: string) => void;
    editingGoal: number | null;
    setEditingGoal: (v: number | null) => void;
    tempGoal: string;
    setTempGoal: (v: string) => void;
    isAddingGoal: boolean;
    setIsAddingGoal: (v: boolean) => void;
    newGoalText: string;
    setNewGoalText: (v: string) => void;
    isEditingNote: boolean;
    setIsEditingNote: (v: boolean) => void;
    tempNote: string;
    setTempNote: (v: string) => void;
    changingActivityDay: number | null;
    setChangingActivityDay: (v: number | null) => void;
    viewMode?: CurriculumViewMode;
    setViewMode?: (m: CurriculumViewMode) => void;
    searchQuery?: string;
    setSearchQuery?: (q: string) => void;
    statusFilter?: 'all' | 'pending' | 'completed';
    setStatusFilter?: (s: 'all' | 'pending' | 'completed') => void;
    domainFilter?: 'all' | 'math' | 'reading' | 'visual' | 'attention';
    setDomainFilter?: (d: 'all' | 'math' | 'reading' | 'visual' | 'attention') => void;
    filteredSchedule?: CurriculumDay[];
    analytics?: {
        totalActivities: number;
        completedActivities: number;
        totalMinutes: number;
        completedMinutes: number;
        progressPercent: number;
        domainCounts: { math: number; reading: number; visual: number; attention: number; general: number };
        difficultyCounts: { Kolay: number; Orta: number; Zor: number };
    } | null;
}

export const CurriculumPlanView: React.FC<CurriculumPlanViewProps> = ({
    curriculum,
    isSaved,
    onStartCurriculumActivity,
    handleToggleActivity,
    handleSaveDayNote,
    handleSaveDayFocusEdit,
    handleReplaceActivity,
    handleSaveGoal,
    handleStartEditingGoal,
    handleAddGoal,
    handleDeleteGoal,
    handleSaveNoteEdit,
    handleDeletePlan,
    editingDay,
    setEditingDay,
    tempFocus,
    setTempFocus,
    editingGoal,
    setEditingGoal,
    tempGoal,
    setTempGoal,
    isAddingGoal,
    setIsAddingGoal,
    newGoalText,
    setNewGoalText,
    isEditingNote,
    setIsEditingNote,
    tempNote,
    setTempNote,
    changingActivityDay,
    setChangingActivityDay,
    viewMode = 'cards',
    setViewMode,
    searchQuery = '',
    setSearchQuery,
    statusFilter = 'all',
    setStatusFilter,
    domainFilter = 'all',
    setDomainFilter,
    filteredSchedule,
    analytics
}) => {
    const daysToRender = filteredSchedule || curriculum.schedule;
    const progress = analytics?.progressPercent ?? Math.round(
        (curriculum.schedule.filter(d =>
            d.isCompleted || (d.activities.length > 0 && d.activities.every((a: CurriculumActivity) => a.status === 'completed'))
        ).length / curriculum.schedule.length) * 100
    );

    return (
        <div className="curriculum-plan-content max-w-6xl mx-auto space-y-8 pb-20">

            {/* Plan Header & Hero Card */}
            <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-zinc-200/70 dark:border-zinc-700/70 shadow-xl relative overflow-hidden print:border-none print:shadow-none print:p-0">
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none print:hidden"></div>
                
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
                        <div className="flex gap-5 items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/25 border-4 border-white dark:border-zinc-700 shrink-0">
                                <i className="fa-solid fa-graduation-cap"></i>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                                        Bireysel Gelişim Rotası
                                    </span>
                                    {curriculum.planType && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200 dark:border-purple-800">
                                            {curriculum.planType === 'hybrid' ? 'MEB + BEP Hibrit' : curriculum.planType === 'meb' ? 'MEB Müfredatı' : 'Özel Eğitim BEP'}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mt-2 tracking-tight">
                                    {curriculum.studentName}
                                </h1>
                                <p className="text-zinc-500 dark:text-zinc-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
                                    <span>{curriculum.grade}</span>
                                    <span>•</span>
                                    <span>{curriculum.durationDays} GÜNLÜK AKIŞ</span>
                                    {curriculum.subject && (
                                        <>
                                            <span>•</span>
                                            <span className="text-indigo-600 dark:text-indigo-400">{curriculum.subject}</span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Top progress metrics & delete */}
                        <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
                            <div className="bg-zinc-50 dark:bg-zinc-900/80 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4 w-full md:w-auto justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">GENEL TAMAMLANMA</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">%{progress}</span>
                                        <span className="text-xs text-zinc-400 font-bold">
                                            ({analytics?.completedActivities ?? 0}/{analytics?.totalActivities ?? 0} aktivite)
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 text-lg">
                                    <i className="fa-solid fa-chart-pie"></i>
                                </div>
                            </div>
                            {isSaved && (
                                <button
                                    onClick={handleDeletePlan}
                                    className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest flex items-center gap-2 px-2 print:hidden"
                                >
                                    <i className="fa-solid fa-trash-can"></i> Planı Sil
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Goals and Pedagogical Note section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-100 dark:border-zinc-700/60">
                        <CurriculumGoalsEditor
                            curriculum={curriculum}
                            isSaved={isSaved}
                            editingGoal={editingGoal}
                            tempGoal={tempGoal}
                            isAddingGoal={isAddingGoal}
                            newGoalText={newGoalText}
                            setEditingGoal={setEditingGoal}
                            setTempGoal={setTempGoal}
                            setIsAddingGoal={setIsAddingGoal}
                            setNewGoalText={setNewGoalText}
                            handleSaveGoal={handleSaveGoal}
                            handleStartEditingGoal={handleStartEditingGoal}
                            handleAddGoal={handleAddGoal}
                            handleDeleteGoal={handleDeleteGoal}
                        />

                        <div>
                            <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-200/60 dark:border-zinc-700 pb-2 mb-3 flex items-center gap-2">
                                <i className="fa-solid fa-chalkboard-user text-amber-500"></i> Öğretmen Stratejisi & Nöro-Pedagojik Not
                            </h4>
                            <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 rounded-3xl border border-amber-200/60 dark:border-amber-800/40 relative group/note">
                                {isEditingNote ? (
                                    <div className="space-y-2">
                                        <textarea
                                            value={tempNote}
                                            onChange={e => setTempNote(e.target.value)}
                                            className="w-full p-3 text-xs bg-white dark:bg-zinc-800 border-2 border-amber-400 rounded-xl outline-none h-24 resize-none font-medium text-zinc-800 dark:text-zinc-200"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveNoteEdit}
                                                className="px-4 py-2 bg-amber-600 text-white text-[9px] font-black uppercase rounded-xl hover:bg-amber-700 shadow-sm"
                                            >
                                                Kaydet
                                            </button>
                                            <button
                                                onClick={() => setIsEditingNote(false)}
                                                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-[9px] font-black uppercase rounded-xl"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-quote-left text-amber-300 dark:text-amber-700 mb-2 block text-lg"></i>
                                        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed italic font-medium">
                                            {curriculum.note ? `"${curriculum.note}"` : 'Pedagojik açıklama henüz eklenmemiş.'}
                                        </p>
                                        {isSaved && (
                                            <button
                                                onClick={() => { setIsEditingNote(true); setTempNote(curriculum.note || ''); }}
                                                className="absolute top-3 right-3 text-amber-600 hover:text-amber-700 opacity-0 group-hover/note:opacity-100 transition-opacity p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 print:hidden"
                                                title="Notu Düzenle"
                                            >
                                                <i className="fa-solid fa-pen text-xs"></i>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode & Filter Controls (Print:hidden) */}
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-4 rounded-3xl border border-zinc-200/60 dark:border-zinc-700/60 shadow-lg space-y-4 print:hidden">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    
                    {/* View Mode Selector */}
                    {setViewMode && (
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
                            {[
                                { id: 'cards', label: 'Kartlar', icon: 'fa-grip' },
                                { id: 'timeline', label: 'Yol Haritası', icon: 'fa-route' },
                                { id: 'meb-matrix', label: 'MEB Matrisi', icon: 'fa-table-cells' },
                                { id: 'analytics', label: 'Bilişsel Analitik', icon: 'fa-chart-simple' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id as CurriculumViewMode)}
                                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                                        viewMode === tab.id
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <i className={`fa-solid ${tab.icon}`}></i>
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Filter and Search Bar */}
                    <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                        {/* Search input */}
                        {setSearchQuery && (
                            <div className="relative flex-1 lg:w-56">
                                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs"></i>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Aktivite veya konu ara..."
                                    className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:ring-2 ring-indigo-500/30 text-zinc-800 dark:text-zinc-200"
                                />
                            </div>
                        )}

                        {/* Status Filter */}
                        {setStatusFilter && (
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as 'all' | 'pending' | 'completed')}
                                className="px-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="pending">Bekleyenler</option>
                                <option value="completed">Tamamlananlar</option>
                            </select>
                        )}

                        {/* Domain Filter */}
                        {setDomainFilter && (
                            <select
                                value={domainFilter}
                                onChange={e => setDomainFilter(e.target.value as 'all' | 'math' | 'reading' | 'visual' | 'attention')}
                                className="px-3 py-2 text-xs font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none text-zinc-700 dark:text-zinc-300 cursor-pointer"
                            >
                                <option value="all">Tüm Alanlar</option>
                                <option value="math">Matematik</option>
                                <option value="reading">Okuma & Dil</option>
                                <option value="visual">Görsel & Mekansal</option>
                                <option value="attention">Dikkat & Hafıza</option>
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA BY VIEW MODE */}

            {/* 1. CARDS VIEW */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {daysToRender.map((day, idx) => {
                        const isFirstIncomplete = !day.isCompleted && (idx === 0 || curriculum.schedule[idx - 1]?.isCompleted);
                        return (
                            <DayCard
                                key={day.day}
                                day={day}
                                isActiveDay={isFirstIncomplete}
                                isSaved={isSaved}
                                onToggleActivity={handleToggleActivity}
                                onStartActivity={(id, type, title, diff, goal) =>
                                    onStartCurriculumActivity(
                                        curriculum.id,
                                        day.day,
                                        id,
                                        type,
                                        curriculum.studentName,
                                        title,
                                        diff,
                                        goal,
                                        curriculum.studentId || undefined
                                    )
                                }
                                onSaveNote={handleSaveDayNote}
                                editingDay={editingDay}
                                tempFocus={tempFocus}
                                onEditDayFocus={(d, focus) => { setEditingDay(d); setTempFocus(focus); }}
                                onSaveDayFocus={handleSaveDayFocusEdit}
                                onTempFocusChange={setTempFocus}
                                changingActivityDay={changingActivityDay}
                                onSetChangingDay={setChangingActivityDay}
                                onReplaceActivity={handleReplaceActivity}
                            />
                        );
                    })}
                </div>
            )}

            {/* 2. TIMELINE / ROADMAP VIEW */}
            {viewMode === 'timeline' && (
                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-700/70 shadow-xl space-y-8">
                    <div className="border-b border-zinc-100 dark:border-zinc-700 pb-4">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-route text-indigo-500"></i> Kronolojik Gelişim Yol Haritası
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Öğrencinin gün gün ilerleme adımları ve kazanım tamamlama basamakları.
                        </p>
                    </div>

                    <div className="relative pl-6 md:pl-10 space-y-8 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-emerald-500">
                        {curriculum.schedule.map((day) => {
                            const isAllCompleted = day.activities.length > 0 && day.activities.every(a => a.status === 'completed');
                            return (
                                <div key={day.day} className="relative group">
                                    <div className={`absolute -left-6 md:-left-10 top-1 w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all ${
                                        isAllCompleted
                                            ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                                            : 'bg-white dark:bg-zinc-800 text-indigo-600 border-2 border-indigo-500 shadow-md'
                                    }`}>
                                        {isAllCompleted ? <i className="fa-solid fa-check"></i> : day.day}
                                    </div>

                                    <div className={`p-5 rounded-3xl border transition-all ${
                                        isAllCompleted
                                            ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30'
                                            : 'bg-zinc-50/80 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-700/60'
                                    } hover:shadow-lg`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase">
                                                    {day.day}. Gün Odak
                                                </span>
                                                <h4 className="font-black text-sm text-zinc-900 dark:text-white">
                                                    {day.focus}
                                                </h4>
                                            </div>
                                            {day.kazanimKod && (
                                                <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                    MEB: {day.kazanimKod}
                                                </span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {day.activities.map(act => (
                                                <div key={act.id} className="p-3 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200/70 dark:border-zinc-700/70 flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h5 className={`font-black text-xs truncate ${act.status === 'completed' ? 'line-through text-zinc-400' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                                            {act.title}
                                                        </h5>
                                                        <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{act.goal}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => onStartCurriculumActivity(
                                                            curriculum.id,
                                                            day.day,
                                                            act.activityId,
                                                            act.activityId,
                                                            curriculum.studentName,
                                                            act.title,
                                                            act.difficultyLevel,
                                                            act.goal,
                                                            curriculum.studentId || undefined
                                                        )}
                                                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase shrink-0 transition-colors"
                                                    >
                                                        Başlat
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. MEB COMPETENCY MATRIX VIEW */}
            {viewMode === 'meb-matrix' && (
                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-700/70 shadow-xl space-y-6">
                    <div className="border-b border-zinc-100 dark:border-zinc-700 pb-4">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-table-cells text-indigo-500"></i> MEB Kazanım ve Beceri Eşleme Matrisi
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Bu plandaki tüm aktivitelerin MEB müfredat kodları, hedeflenen bilişsel alanlar ve tamamlanma durumları.
                        </p>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                                    <th className="py-3 px-4">Gün</th>
                                    <th className="py-3 px-4">Odak Konu</th>
                                    <th className="py-3 px-4">Aktivite</th>
                                    <th className="py-3 px-4">Bilişsel Alan</th>
                                    <th className="py-3 px-4">Zorluk</th>
                                    <th className="py-3 px-4">MEB Kazanım</th>
                                    <th className="py-3 px-4 text-right">Durum</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/60 text-xs">
                                {curriculum.schedule.flatMap(day =>
                                    day.activities.map(act => (
                                        <tr key={act.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                            <td className="py-3 px-4 font-black text-indigo-600 dark:text-indigo-400">
                                                {day.day}. Gün
                                            </td>
                                            <td className="py-3 px-4 font-bold text-zinc-700 dark:text-zinc-300">
                                                {day.focus}
                                            </td>
                                            <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                                                {act.title}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700 font-bold text-[10px] uppercase text-zinc-600 dark:text-zinc-300">
                                                    {act.domain || 'Bilişsel'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold">
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                                    act.difficultyLevel === 'Zor'
                                                        ? 'text-rose-600 bg-rose-50'
                                                        : act.difficultyLevel === 'Orta'
                                                            ? 'text-amber-600 bg-amber-50'
                                                            : 'text-emerald-600 bg-emerald-50'
                                                }`}>
                                                    {act.difficultyLevel}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                                                {act.kazanimKod || day.kazanimKod || 'Müfredat Uyarlamalı'}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {act.status === 'completed' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 font-black text-[10px] uppercase">
                                                        <i className="fa-solid fa-circle-check"></i> Tamam
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-500 font-black text-[10px] uppercase">
                                                        <i className="fa-solid fa-clock"></i> Bekliyor
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 4. COGNITIVE ANALYTICS & BALANCE VIEW */}
            {viewMode === 'analytics' && analytics && (
                <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-zinc-200/70 dark:border-zinc-700/70 shadow-xl space-y-8">
                    <div className="border-b border-zinc-100 dark:border-zinc-700 pb-4">
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-chart-pie text-indigo-500"></i> Bilişsel Gelişim ve Müfredat Denge Analitiği
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            Plandaki aktivitelerin bilişsel alanlara dağılımı ve pedagojik zorluk dengesi.
                        </p>
                    </div>

                    {/* Stats KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800">
                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Toplam Aktivite</p>
                            <p className="text-3xl font-black text-indigo-900 dark:text-indigo-200 mt-1">{analytics.totalActivities}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">{analytics.completedActivities} tamamlandı</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                            <p className="text-[10px] font-black uppercase text-purple-600 tracking-wider">Tahmini Süre</p>
                            <p className="text-3xl font-black text-purple-900 dark:text-purple-200 mt-1">{analytics.totalMinutes} dk</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Yaklaşık {Math.round(analytics.totalMinutes / 60)} saat</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                            <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Genel Başarı Oranı</p>
                            <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200 mt-1">%{analytics.progressPercent}</p>
                            <p className="text-[10px] text-zinc-500 mt-1">Zamanında ilerleme</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                            <p className="text-[10px] font-black uppercase text-amber-600 tracking-wider">Zorluk Seviyesi</p>
                            <p className="text-lg font-black text-amber-900 dark:text-amber-200 mt-2">
                                {analytics.difficultyCounts.Kolay}K • {analytics.difficultyCounts.Orta}O • {analytics.difficultyCounts.Zor}Z
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1">Sarmal ZPD Dengesi</p>
                        </div>
                    </div>

                    {/* Domain Distribution Bars */}
                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
                        <h4 className="text-xs font-black uppercase text-zinc-500 tracking-wider">Bilişsel Alan Dağılımı</h4>
                        <div className="space-y-3">
                            {[
                                { id: 'math', label: 'Matematik & Mantık', count: analytics.domainCounts.math, color: 'bg-emerald-500', icon: 'fa-calculator' },
                                { id: 'reading', label: 'Okuma & Dil', count: analytics.domainCounts.reading, color: 'bg-indigo-500', icon: 'fa-book-open' },
                                { id: 'visual', label: 'Görsel & Mekansal', count: analytics.domainCounts.visual, color: 'bg-amber-500', icon: 'fa-eye' },
                                { id: 'attention', label: 'Dikkat & Hafıza', count: analytics.domainCounts.attention, color: 'bg-purple-500', icon: 'fa-brain' }
                            ].map(item => {
                                const pct = analytics.totalActivities > 0 ? Math.round((item.count / analytics.totalActivities) * 100) : 0;
                                return (
                                    <div key={item.id} className="space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                                <i className={`fa-solid ${item.icon} text-zinc-400 text-xs`}></i>
                                                {item.label}
                                            </span>
                                            <span className="font-mono font-bold text-zinc-500">
                                                {item.count} aktivite (%{pct})
                                            </span>
                                        </div>
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                                            <div className={`${item.color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Official Teacher Signature Block for Print/PDF Mode */}
            <div className="hidden print:block pt-10 mt-10 border-t-2 border-zinc-300">
                <div className="flex justify-between items-start text-xs text-zinc-600">
                    <div>
                        <p className="font-bold">Öğretmen / Uzman:</p>
                        <p className="mt-8">İmza: __________________________</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">MEB BEP Birim Onayı:</p>
                        <p className="mt-8">Tarih / Kaşe: ____________________</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
