
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";
import { DynamicActivity, PromptTemplate, StaticContentItem, ActivityDraft } from '../types/admin';
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
        // 1. Create a Prompt Template based on draft instructions
        const promptId = `prompt_${Date.now()}`; // Unique ID
        
        let finalTemplate = "";

        // Eğer OCR'dan gelen özel bir talimat varsa, temiz bir şablon oluştur
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
            // Eğer özel talimat yoksa (manuel taslak), baseType'ın şablonunu al
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

        // 2. Create the Dynamic Activity
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

        // 3. Delete the draft
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

        let taskSpecific = "";

        // Generic Fallback
        taskSpecific = `
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

        // Use a generic schema for testing to see raw structure or partial structure
        const genericSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                pedagogicalNote: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                data: { type: Type.ARRAY, items: { type: Type.OBJECT, description: "Dynamic content items" } }, 
                // Loose schema to allow most AI responses to pass
                items: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                questions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                puzzles: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                rows: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                pairs: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                leftColumn: { type: Type.ARRAY, items: { type: Type.OBJECT } }, // For relations
                rightColumn: { type: Type.ARRAY, items: { type: Type.OBJECT } },
                grid: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
            }
        };

        const fullContext = `
        [SYSTEM ROLE & INSTRUCTION]:
        ${prompt.systemInstruction}

        [TASK]:
        ${compiledPrompt}
        `;

        return await generateWithSchema(fullContext, genericSchema, prompt.modelConfig?.modelName || 'gemini-2.5-flash');
    }
};

const PEDAGOGICAL_PROMPT_BASE = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve ÖĞRETİM TASARIMCISI]

TEMEL PRENSİPLER:
1. **Bilişsel Yük Teorisi:** Gereksiz karmaşıklıktan kaçın. Yönergeler "kısa, net ve eylem odaklı" olsun.
2. **Pozitif Dil:** Hata yapmayı değil, denemeyi teşvik eden bir dil kullan.
3. **Görsel Destek:** Soyut kavramları somut görsellerle eşleştir.
4. **Çıktı Formatı:** Kesinlikle ve sadece geçerli JSON üret.
`;
