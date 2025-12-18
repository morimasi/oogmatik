
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, StaticContentItem, ActivityDraft, PromptSnippet } from '../types/admin';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { PEDAGOGICAL_BASE, IMAGE_GENERATION_GUIDE } from './generators/prompts';
import { generateWithSchema } from './geminiClient';
import { Type } from '@google/genai';
import { PROVERBS, SAYINGS } from '../data/sentences';
import { TR_VOCAB } from '../data/vocabulary';
import { UserRole, UserStatus, ActivityType } from '../types';

const { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, orderBy, query } = firestore;

export const adminService = {
    // --- ACTIVITIES ---
    getAllActivities: async (): Promise<DynamicActivity[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_activities"));
            
            const dbActivities = snapshot.docs.map(d => d.data() as DynamicActivity);
            return dbActivities;
        } catch (e) {
            console.error("Fetch activities failed", e);
            return [];
        }
    },

    saveActivity: async (activity: DynamicActivity) => {
        await setDoc(doc(db, "config_activities", activity.id), activity, { merge: true });
    },

    deleteActivity: async (id: string) => {
        await deleteDoc(doc(db, "config_activities", id));
    },

    // --- SNIPPETS (LIBRARY) ---
    getAllSnippets: async (): Promise<PromptSnippet[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_snippets"));
            return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as PromptSnippet));
        } catch (e) {
            console.error("Fetch snippets failed", e);
            return [];
        }
    },

    saveSnippet: async (snippet: PromptSnippet) => {
        const payload = { ...snippet, updatedAt: new Date().toISOString() };
        if (snippet.id) {
             await setDoc(doc(db, "config_snippets", snippet.id), payload, { merge: true });
        } else {
             await addDoc(collection(db, "config_snippets"), payload);
        }
    },

    deleteSnippet: async (id: string) => {
        await deleteDoc(doc(db, "config_snippets", id));
    },

    // --- DRAFTS (OCR TO SYSTEM) ---
    saveDraftActivity: async (draft: Omit<ActivityDraft, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, "activity_drafts"), {
            ...draft,
            createdAt: new Date().toISOString()
        });
    },

    getAllDrafts: async (): Promise<ActivityDraft[]> => {
        try {
            const q = query(collection(db, "activity_drafts"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ActivityDraft));
        } catch (e) {
            console.error("Fetch drafts failed", e);
            return [];
        }
    },

    publishDraft: async (draft: ActivityDraft, finalConfig: { title: string, description: string, icon: string, category: string }) => {
        const promptId = `prompt_${Date.now()}`;
        
        let finalTemplate = "";
        if (draft.customInstructions && draft.customInstructions.length > 10) {
            finalTemplate = `
${PEDAGOGICAL_PROMPT_BASE}

GÖREV: ${draft.title} etkinliği oluştur.
KONU: {{topic}}
ZORLUK: {{difficulty}}
ADET: {{itemCount}}

ÖZEL ÜRETİM ALGORİTMASI (OCR KAYNAKLI):
=========================================
${draft.customInstructions}
=========================================

${IMAGE_GENERATION_GUIDE}

ÇIKTI FORMATI:
Sadece JSON formatında, yukarıdaki algoritmaya uygun veri yapısını döndür.
            `;
        } else {
            const basePrompt = adminService.getInitialPromptForActivity(draft.baseType as ActivityType);
             finalTemplate = basePrompt.replace(
                "ÇIKTI (JSON): ...", 
                `
                EKSTRA ÖZEL TALİMATLAR:
                ${draft.description}
                
                ÇIKTI (JSON): ...
                `
            );
        }

        const newPrompt: PromptTemplate = {
            id: promptId,
            name: `${finalConfig.title} Promptu`,
            description: `OCR/Taslak kaynaklı otomatik oluşturulan prompt. Kaynak: ${draft.baseType}`,
            category: finalConfig.category,
            systemInstruction: "Sen uzman bir eğitim materyali tasarımcısısın.",
            template: finalTemplate.trim(),
            variables: ['difficulty', 'topic', 'worksheetCount', 'itemCount'],
            tags: ['ocr', 'auto-generated', finalConfig.category],
            updatedAt: new Date().toISOString(),
            version: 1,
            history: []
        };

        await setDoc(doc(db, "config_prompts", promptId), newPrompt);

        const activityId = `ACT_${Date.now()}`;
        const newActivity: DynamicActivity = {
            id: activityId,
            title: finalConfig.title,
            description: finalConfig.description,
            icon: finalConfig.icon,
            category: finalConfig.category || 'others',
            isActive: true,
            isPremium: false,
            promptId: promptId,
            defaultParams: draft.defaultParams || { difficulty: 'Orta', itemCount: 10, topic: 'Genel' }
        };

        await setDoc(doc(db, "config_activities", activityId), newActivity);
        await deleteDoc(doc(db, "activity_drafts", draft.id));
    },
    
    deleteDraft: async (id: string) => {
        await deleteDoc(doc(db, "activity_drafts", id));
    },

    // --- PROMPTS ---
    getAllPrompts: async (): Promise<PromptTemplate[]> => {
        try {
            const snapshot = await getDocs(collection(db, "config_prompts"));
            return snapshot.docs.map(d => d.data() as PromptTemplate);
        } catch (e) {
            console.error("Fetch prompts failed", e);
            return [];
        }
    },
    
    getPromptTemplate: async (id: string): Promise<PromptTemplate | null> => {
        try {
            const ref = doc(db, "config_prompts", id);
            const snap = await getDoc(ref);
            if (snap.exists()) return snap.data() as PromptTemplate;
            return null;
        } catch (e) {
            console.error("Fetch specific prompt failed", e);
            return null;
        }
    },

    // --- REVERSE ENGINEER DEFAULT PROMPTS ---
    getInitialPromptForActivity: (activityId: ActivityType): string => {
        const base = PEDAGOGICAL_BASE;
        const imgGuide = IMAGE_GENERATION_GUIDE;
        const taskSpecific = `
GÖREV: Eğitim materyali üret.
TÜR: ${activityId}
ZORLUK: {{difficulty}}
KONU: {{topic}}
ADET: {{itemCount}}

Bu aktivite türü için uygun, çocuk dostu ve eğitici içerik oluştur.
        `;
        return `${base}\n\n${taskSpecific}\n\n${imgGuide}\n\nÇIKTI (JSON): ...`;
    },

    savePrompt: async (prompt: PromptTemplate, changeLog: string = 'Update') => {
        const newVersionEntry = {
            version: prompt.version || 1,
            template: prompt.template,
            systemInstruction: prompt.systemInstruction,
            updatedAt: new Date().toISOString(),
            changeLog
        };

        const payload: PromptTemplate = { 
            ...prompt, 
            updatedAt: new Date().toISOString(), 
            version: (prompt.version || 0) + 1,
            history: [...(prompt.history || []), newVersionEntry]
        };

        await setDoc(doc(db, "config_prompts", prompt.id), payload, { merge: true });
        return payload;
    },

    deletePrompt: async (id: string) => {
        await deleteDoc(doc(db, "config_prompts", id));
    },

    // --- STATIC CONTENT ---
    getAllStaticContent: async (): Promise<StaticContentItem[]> => {
        try {
            const snapshot = await getDocs(collection(db, "static_content"));
            if (snapshot.empty) {
                return [
                    { id: 'proverbs', title: 'Atasözleri', type: 'list', data: PROVERBS, updatedAt: new Date().toISOString() },
                    { id: 'sayings', title: 'Özdeyişler', type: 'list', data: SAYINGS, updatedAt: new Date().toISOString() },
                    { id: 'vocab_animals', title: 'Kelime: Hayvanlar', type: 'list', data: TR_VOCAB.animals, updatedAt: new Date().toISOString() },
                    { id: 'vocab_school', title: 'Kelime: Okul', type: 'list', data: TR_VOCAB.school, updatedAt: new Date().toISOString() }
                ];
            }
            return snapshot.docs.map(d => d.data() as StaticContentItem);
        } catch (e) {
            console.error("Fetch static content failed", e);
            return [];
        }
    },

    saveStaticContent: async (content: StaticContentItem) => {
        await setDoc(doc(db, "static_content", content.id), {
            ...content,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    },

    // --- USER MANAGEMENT ---
    updateUserRole: async (userId: string, newRole: UserRole) => {
        await updateDoc(doc(db, "users", userId), { role: newRole });
    },

    updateUserStatus: async (userId: string, newStatus: UserStatus) => {
        await updateDoc(doc(db, "users", userId), { status: newStatus });
    },

    // --- SIMULATION ---
    testPrompt: async (prompt: PromptTemplate, testVariables: Record<string, any>) => {
        let compiledPrompt = prompt.template;
        
        Object.entries(testVariables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            compiledPrompt = compiledPrompt.replace(regex, String(value));
        });

        // Use a broad but valid schema to catch typical AI outputs
        const genericSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                // Use a union of common structures to prevent empty results
                data: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: {type: Type.STRING}, value: {type: Type.STRING}, id: {type: Type.STRING} } } },
                items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: {type: Type.STRING}, value: {type: Type.STRING}, id: {type: Type.STRING}, isCorrect: {type: Type.BOOLEAN}, imagePrompt: {type: Type.STRING} } } },
                questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: {type: Type.STRING}, text: {type: Type.STRING}, answer: {type: Type.STRING}, options: {type: Type.ARRAY, items: {type: Type.STRING}}, correct: {type: Type.STRING}, imagePrompt: {type: Type.STRING} } } },
                puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { puzzle: {type: Type.STRING}, question: {type: Type.STRING}, answer: {type: Type.STRING}, clues: {type: Type.ARRAY, items: {type: Type.STRING}}, imagePrompt: {type: Type.STRING} } } },
                rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: {type:Type.STRING}, items: {type:Type.ARRAY, items: {type:Type.STRING}}, text: {type:Type.STRING} } } },
                pairs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item1: {type:Type.STRING}, item2: {type:Type.STRING}, id: {type:Type.STRING}, imagePrompt1: {type:Type.STRING} } } },
                operations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { num1: {type:Type.NUMBER}, num2: {type:Type.NUMBER}, operator: {type:Type.STRING}, answer: {type:Type.NUMBER} }, required: ['num1', 'operator', 'answer'] } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }
        };

        const fullContext = `
        [SYSTEM ROLE & INSTRUCTION]:
        ${prompt.systemInstruction}

        [TASK]:
        ${compiledPrompt}
        `;

        // Force Stable Model usage
        return await generateWithSchema(fullContext, genericSchema, 'gemini-3-flash-preview');
    }
};

const PEDAGOGICAL_PROMPT_BASE = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve ÖĞRETİM TASARIMCISI]

TEMEL PRENSİPLER:
1. **Bilişsel Yük Teorisi:** Gereksiz karmaşıklıktan kaçın. Yönergeler "kısa, net ve eylem odaklı" olsun.
2. **Pozitif Dil:** Hata yapmayı değil, denemeyi teşvik eden bir dil kullan.
3. **Görsel Destek:** Soyut kavramları somut görsellerle eşleştir.
4. **Çıktı Formatı:** Kesinlikle ve sadece geçerli JSON üret.
5. **Veri Doluluğu:** JSON dizilerini boş bırakma. İstenen sayıda örnek üret.
`;
