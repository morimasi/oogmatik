# Premium Student Studio Module Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement fully functional dummy-data backed interactive modules for the "Öğrencilerim" (Student Dashboard) section to replace non-functional UI placeholders, turning them into a realistic Premium Studio.

**Architecture:** We will create specific mock-data state mechanisms inside the individual modules (Overview, AI Insights, IEP, Academic, Portfolio). We'll use local state to simulate backend updates for immediate visual feedback, allowing the user to interact with the forms, add/edit goals, grades, and notes without requiring full backend Firestore integration for this "functional prototype" phase.

**Tech Stack:** React 18 + TypeScript (strict) + Vite + Tailwind CSS

---

### Task 1: Create Overview Module (PDF Report simulation)

**Files:**

- Create: `src/components/Student/modules/OverviewModule.tsx`

- [ ] **Step 1: Write the module implementation**

Implement a functional UI that displays the student's core stats. Make the "PDF İndir" button show a toast notification simulating a download.

```typescript
import React from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const OverviewModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
    const toast = useToastStore();

    const handleDownloadReport = () => {
        toast.success(`${student.name} için PDF raporu hazırlanıyor...`);
        setTimeout(() => toast.success('PDF başarıyla indirildi!'), 2000);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">Genel Gelişim Özeti</h3>
                    <p className="text-zinc-500 text-sm mt-1">Öğrencinin son 30 günlük performansı.</p>
                 </div>
                 <button onClick={handleDownloadReport} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                     <i className="fa-solid fa-download"></i> Raporu İndir
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                     <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4"><i className="fa-solid fa-arrow-trend-up"></i></div>
                     <h4 className="font-bold text-emerald-900 dark:text-emerald-100">Bilişsel Gelişim</h4>
                     <p className="text-3xl font-black text-emerald-600 mt-2">+12%</p>
                 </div>
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/30">
                     <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4"><i className="fa-solid fa-bullseye"></i></div>
                     <h4 className="font-bold text-blue-900 dark:text-blue-100">BEP Hedefleri</h4>
                     <p className="text-3xl font-black text-blue-600 mt-2">4 / 6</p>
                     <p className="text-xs text-blue-500 mt-1 font-bold">Tamamlanan</p>
                 </div>
                 <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-3xl border border-purple-100 dark:border-purple-900/30">
                     <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-4"><i className="fa-solid fa-clock"></i></div>
                     <h4 className="font-bold text-purple-900 dark:text-purple-100">Çalışma Süresi</h4>
                     <p className="text-3xl font-black text-purple-600 mt-2">24s</p>
                     <p className="text-xs text-purple-500 mt-1 font-bold">Bu Ay</p>
                 </div>
             </div>
        </div>
    );
};
```

### Task 2: Create AI Insights Module

**Files:**

- Create: `src/components/Student/modules/AIInsightsModule.tsx`

- [ ] **Step 1: Write the module implementation**

Implement an interactive module where "Yeniden Analiz Et" simulates a loading state and updates the insight text.

```typescript
import React, { useState } from 'react';
import { AdvancedStudent } from '../../../types/student-advanced';

export const AIInsightsModule: React.FC<{ student: AdvancedStudent }> = ({ student }) => {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [insights, setInsights] = useState([
        "Görsel tarama testlerindeki reaksiyon süresinde %15 iyileşme gözlemlendi.",
        "Heceleme egzersizlerinde 'b' ve 'd' harflerini karıştırma sıklığı azaldı.",
        "Dikkat süresi ortalama 12 dakikadan 18 dakikaya çıktı."
    ]);

    const handleReAnalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => {
            setInsights([
                ...insights,
                "Yeni Analiz: Sözel hafıza görevlerinde artan başarı trendi tespit edildi. Görsel destekli okuma parçalarına ağırlık verilmesi önerilir."
            ]);
            setIsAnalyzing(false);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black flex items-center gap-3"><i className="fa-solid fa-brain-circuit text-indigo-400"></i> Oogmatik AI Motoru</h3>
                        <p className="text-indigo-200 mt-2 max-w-lg">Öğrencinin platform üzerindeki tüm etkileşimleri, çözdüğü testler ve öğretmen notları harmanlanarak oluşturulan derin analizler.</p>
                    </div>
                    <button
                        onClick={handleReAnalyze}
                        disabled={isAnalyzing}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all flex items-center gap-2 border border-white/20"
                    >
                        {isAnalyzing ? <><i className="fa-solid fa-spinner fa-spin"></i> Analiz Ediliyor...</> : <><i className="fa-solid fa-rotate-right"></i> Verileri Güncelle</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-4 animate-in slide-in-from-bottom-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-sparkles"></i>
                        </div>
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">{insight}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### Task 3: Create IEP Module

**Files:**

- Create: `src/components/Student/modules/IEPModule.tsx`

- [ ] **Step 1: Write the module implementation**

Add ability to create, list and toggle status of IEP goals.

```typescript
import React, { useState } from 'react';
import { AdvancedStudent, IEPGoal } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const IEPModule: React.FC<{ student: AdvancedStudent, onUpdate: (iep: any) => void }> = ({ student, onUpdate }) => {
    const toast = useToastStore();
    const [goals, setGoals] = useState<IEPGoal[]>(student.iep?.goals || [
        { id: '1', title: 'Okuma Akıcılığı', description: 'Dakikada 60 kelime doğru okuma hedefine ulaşılacak.', status: 'in_progress', category: 'academic', targetDate: '2026-06-01', progress: 40, priority: 'high', strategies: [], resources: [], evaluationMethod: 'test', reviews: [] }
    ]);
    const [newGoalTitle, setNewGoalTitle] = useState('');

    const handleAddGoal = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newGoalTitle.trim()) return;

        const goal: IEPGoal = {
            id: Date.now().toString(),
            title: newGoalTitle,
            description: 'Yeni eklenen hedef',
            status: 'not_started',
            category: 'academic',
            targetDate: new Date().toISOString(),
            progress: 0,
            priority: 'medium',
            strategies: [],
            resources: [],
            evaluationMethod: 'observation',
            reviews: []
        };

        const updated = [...goals, goal];
        setGoals(updated);
        setNewGoalTitle('');
        onUpdate({ goals: updated, status: 'active', startDate: new Date().toISOString(), endDate: '', diagnosis: [], strengths: [], needs: [], accommodations: [], teamMembers: [], lastUpdated: new Date().toISOString() });
        toast.success('Yeni BEP hedefi eklendi.');
    };

    const toggleGoalStatus = (id: string) => {
        const updated = goals.map(g => {
            if(g.id === id) {
                return { ...g, status: g.status === 'achieved' ? 'in_progress' : 'achieved', progress: g.status === 'achieved' ? 50 : 100 } as IEPGoal;
            }
            return g;
        });
        setGoals(updated);
        onUpdate({ goals: updated, status: 'active', startDate: '', endDate: '', diagnosis: [], strengths: [], needs: [], accommodations: [], teamMembers: [], lastUpdated: new Date().toISOString() });
    };

    return (
        <div className="space-y-8">
            <form onSubmit={handleAddGoal} className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex gap-4">
                <input
                    type="text"
                    value={newGoalTitle}
                    onChange={e => setNewGoalTitle(e.target.value)}
                    placeholder="Yeni BEP Hedefi (Örn: Çarpım tablosunu ezbere sayar)"
                    className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 font-bold outline-none focus:border-indigo-500"
                />
                <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-colors">
                    <i className="fa-solid fa-plus mr-2"></i> Hedef Ekle
                </button>
            </form>

            <div className="grid grid-cols-1 gap-4">
                {goals.map(goal => (
                    <div key={goal.id} className={`p-6 rounded-2xl border transition-all ${goal.status === 'achieved' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button onClick={() => toggleGoalStatus(goal.id)} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${goal.status === 'achieved' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600 text-transparent hover:border-indigo-500'}`}>
                                    <i className="fa-solid fa-check text-xs"></i>
                                </button>
                                <div>
                                    <h4 className={`font-bold text-lg ${goal.status === 'achieved' ? 'text-emerald-900 dark:text-emerald-400 line-through opacity-70' : 'text-zinc-900 dark:text-white'}`}>{goal.title}</h4>
                                    <p className="text-zinc-500 text-xs mt-1">{goal.description}</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg text-xs font-bold uppercase">{goal.category}</span>
                        </div>
                    </div>
                ))}
                {goals.length === 0 && (
                    <div className="text-center py-12 text-zinc-400 border-2 border-dashed rounded-3xl border-zinc-200 dark:border-zinc-800">
                        Henüz hedef eklenmemiş.
                    </div>
                )}
            </div>
        </div>
    );
};
```

### Task 4: Create Academic Module

**Files:**

- Create: `src/components/Student/modules/AcademicModule.tsx`

- [ ] **Step 1: Write the module implementation**

Implement a form to add new grades and list existing ones.

```typescript
import React, { useState } from 'react';
import { AdvancedStudent, GradeEntry } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const AcademicModule: React.FC<{ student: AdvancedStudent, onUpdate: (data: any) => void }> = ({ student, onUpdate }) => {
    const toast = useToastStore();
    const [grades, setGrades] = useState<GradeEntry[]>(student.academic?.grades || []);

    const [subject, setSubject] = useState('Türkçe');
    const [score, setScore] = useState('');

    const handleAddGrade = (e: React.FormEvent) => {
        e.preventDefault();
        if(!score) return;

        const newGrade: GradeEntry = {
            id: Date.now().toString(),
            subject,
            score: Number(score),
            maxScore: 100,
            type: 'exam',
            date: new Date().toISOString(),
            weight: 1
        };

        const updated = [newGrade, ...grades];
        setGrades(updated);
        onUpdate({ academic: { ...student.academic, grades: updated } });
        setScore('');
        toast.success('Not başarıyla eklendi.');
    };

    return (
        <div className="space-y-8">
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-3xl p-6">
                <h3 className="font-black text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2"><i className="fa-solid fa-star"></i> Yeni Not Girişi</h3>
                <form onSubmit={handleAddGrade} className="flex gap-4">
                    <select value={subject} onChange={e => setSubject(e.target.value)} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 font-bold outline-none">
                        <option>Türkçe</option>
                        <option>Matematik</option>
                        <option>Hayat Bilgisi</option>
                        <option>Fen Bilimleri</option>
                    </select>
                    <input type="number" min="0" max="100" placeholder="Puan (0-100)" value={score} onChange={e => setScore(e.target.value)} className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 font-bold outline-none" />
                    <button type="submit" className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-colors">Kaydet</button>
                </form>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {grades.map(g => (
                    <div key={g.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-xl font-black mb-3 ${g.score >= 85 ? 'bg-emerald-100 text-emerald-600' : g.score >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                            {g.score}
                        </div>
                        <h4 className="font-black text-zinc-800 dark:text-zinc-200">{g.subject}</h4>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(g.date).toLocaleDateString()}</p>
                    </div>
                ))}
                {grades.length === 0 && <div className="col-span-full py-10 text-center text-zinc-400">Not kaydı bulunmuyor.</div>}
            </div>
        </div>
    );
};
```

### Task 5: Create Portfolio Module

**Files:**

- Create: `src/components/Student/modules/PortfolioModule.tsx`

- [ ] **Step 1: Write the module implementation**

Add fake upload functionality for documents and images.

```typescript
import React, { useState } from 'react';
import { AdvancedStudent, PortfolioItem } from '../../../types/student-advanced';
import { useToastStore } from '../../../store/useToastStore';

export const PortfolioModule: React.FC<{ student: AdvancedStudent, onUpdate: (data: any) => void }> = ({ student, onUpdate }) => {
    const toast = useToastStore();
    const [items, setItems] = useState<PortfolioItem[]>(student.portfolio || []);
    const [isUploading, setIsUploading] = useState(false);

    const handleFakeUpload = () => {
        setIsUploading(true);
        setTimeout(() => {
            const newItem: PortfolioItem = {
                id: Date.now().toString(),
                title: `Taranmış Belge ${items.length + 1}`,
                description: 'Sınıf içi çalışma kağıdı.',
                date: new Date().toISOString(),
                type: 'image',
                url: 'https://placehold.co/600x400/png',
                tags: ['çalışma', 'sınıfiçi'],
                skillsDemonstrated: [],
                isPublic: false
            };
            const updated = [newItem, ...items];
            setItems(updated);
            onUpdate({ portfolio: updated });
            setIsUploading(false);
            toast.success('Belge portfolyoya eklendi.');
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/20">
                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-full shadow-sm flex items-center justify-center mb-6">
                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-indigo-400"></i>
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Yeni Materyal Yükle</h3>
                <p className="text-zinc-500 mb-6 text-sm max-w-md">Öğrencinin fiziksel çalışmalarını fotoğraflayarak veya PDF raporlarını yükleyerek dijital portfolyo oluşturun.</p>
                <button onClick={handleFakeUpload} disabled={isUploading} className="px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-transform disabled:opacity-50">
                    {isUploading ? 'Yükleniyor...' : 'Dosya Seç'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <div key={item.id} className="group relative bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all">
                        <div className="h-32 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 text-4xl">
                            {item.type === 'image' ? <i className="fa-regular fa-image"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{item.title}</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">{new Date(item.date).toLocaleDateString()}</p>
                        </div>
                        <button className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-md rounded-lg text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
```

### Task 6: Hook Modules up to AdvancedStudentManager

**Files:**

- Modify: `src/components/Student/AdvancedStudentManager.tsx`

- [ ] **Step 1: Import modules in AdvancedStudentManager**

Edit `AdvancedStudentManager.tsx` to uncomment or import the newly created modules and render them properly in the switch statement for the different tabs. Make sure any missing props are passed. Add `toast` calls for settings updates if needed.

The current `AdvancedStudentManager.tsx` references missing files like `FinancialModule` which we deleted. We must update the `renderContent` switch to only use the modules we just built, or gracefully handle missing ones (like returning a placeholder for "Yakında").

```typescript
// Replace missing module imports in AdvancedStudentManager with our new ones or remove references
import { OverviewModule } from './modules/OverviewModule';
import { AIInsightsModule } from './modules/AIInsightsModule';
import { IEPModule } from './modules/IEPModule';
import { AcademicModule } from './modules/AcademicModule';
import { PortfolioModule } from './modules/PortfolioModule';

// In renderContent:
// Remove Financial, Behavior, Attendance, Settings cases.
// Keep Overview, AI_Insights, IEP, Academic, Portfolio.
```

- [ ] **Step 2: Clean up unused states and files**
      Ensure the project builds cleanly without errors about missing modules.

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-01-student-modules.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - Use `subagent-driven-development` skill: fresh subagent per task, review between tasks, fast iteration
**2. Inline Execution** - Use `executing-plans` skill: execute in this session, batch execution with checkpoints

**Which approach?**
