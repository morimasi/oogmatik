
import { db } from './firebaseClient';
import * as firestore from "firebase/firestore";

const { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } = firestore;

export interface ReadingTemplate {
    id: string;
    name: string;
    layout: any[];
    createdAt: string;
}

export const readingTemplateService = {
    saveTemplate: async (userId: string, name: string, layout: any[]): Promise<string> => {
        const colRef = collection(db, "users", userId, "reading_templates");
        const docRef = await addDoc(colRef, {
            name,
            layout: JSON.stringify(layout), // Firestore nesting limit safety
            createdAt: new Date().toISOString()
        });
        return docRef.id;
    },

    getTemplates: async (userId: string): Promise<ReadingTemplate[]> => {
        const colRef = collection(db, "users", userId, "reading_templates");
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                name: data.name,
                layout: JSON.parse(data.layout),
                createdAt: data.createdAt
            };
        });
    },

    deleteTemplate: async (userId: string, templateId: string): Promise<void> => {
        await deleteDoc(doc(db, "users", userId, "reading_templates", templateId));
    }
};
