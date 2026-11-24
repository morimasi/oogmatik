import { useState, useEffect, useCallback } from 'react';
import { ActivityType, HistoryItem, SavedWorksheet, WorksheetData } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';

const LEGACY_HISTORY_KEY = 'user_history';
const getHistoryStorageKey = (userId?: string) => `user_history_${userId || 'guest'}`;

const readStoredHistory = (key: string): HistoryItem[] => {
    try {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(key);
        if (stored) {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? (parsed as HistoryItem[]) : [];
        }
        // Fallback migration from legacy key only if scoped key is empty
        const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
        if (legacy && key === getHistoryStorageKey('guest')) {
            const parsedLegacy = JSON.parse(legacy);
            return Array.isArray(parsedLegacy) ? (parsedLegacy as HistoryItem[]) : [];
        }
        return [];
    } catch {
        return [];
    }
};

const safePersistHistory = (key: string, items: HistoryItem[]) => {
    if (typeof window === 'undefined') return;
    let slice = items;
    // Try saving; if localStorage quota exceeded, progressively trim oldest entries
    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            localStorage.setItem(key, JSON.stringify(slice));
            return;
        } catch {
            if (slice.length <= 5) return;
            slice = slice.slice(0, Math.max(5, Math.floor(slice.length / 2)));
        }
    }
};

export const useHistoryManager = (
    addSavedWorksheet: (name: string, type: ActivityType, data: WorksheetData) => Promise<string | null>,
    loadSavedWorksheet: (worksheet: Partial<SavedWorksheet> & Record<string, unknown>) => void,
    setOpenModal: (modal: null) => void,
    setIsAuthModalOpen: (open: boolean) => void
) => {
    const { user } = useAuthStore();
    const { activeStudent } = useStudentStore();
    const storageKey = getHistoryStorageKey(user?.id);

    const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => readStoredHistory(storageKey));

    // Reload user-scoped history when authenticated user changes
    useEffect(() => {
        setHistoryItems(readStoredHistory(storageKey));
    }, [storageKey]);

    useEffect(() => {
        safePersistHistory(storageKey, historyItems);
    }, [historyItems, storageKey]);

    const addToHistory = useCallback((activityType: ActivityType, data: WorksheetData) => {
        if (!data) return;
        const activity = ACTIVITIES.find((a) => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find((c) => c.activities.includes(activityType));
        if (!activity || !category) return;
        const newItem: HistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            userId: user?.id || 'guest',
            studentId: activeStudent?.id,
            studentName: activeStudent?.name,
            activityType,
            data,
            timestamp: new Date().toISOString(),
            title: activity.title,
            category: { id: category.id, title: category.title },
        };
        setHistoryItems((prev: HistoryItem[]) => [newItem, ...prev].slice(0, 100));
    }, [user?.id, activeStudent?.id, activeStudent?.name]);

    const clearHistory = useCallback(() => {
        setHistoryItems([]);
    }, []);

    const deleteHistoryItem = useCallback((id: string) => {
        setHistoryItems((prev: HistoryItem[]) => prev.filter((i: HistoryItem) => i.id !== id));
    }, []);

    const handleRestoreFromHistory = useCallback((item: HistoryItem) => {
        loadSavedWorksheet({
            id: item.id,
            userId: item.userId,
            studentId: item.studentId,
            studentName: item.studentName,
            name: item.title,
            activityType: item.activityType,
            worksheetData: item.data,
            createdAt: item.timestamp,
            icon: ACTIVITIES.find((a) => a.id === item.activityType)?.icon || 'fa-file',
            category: item.category,
        });
        setOpenModal(null);
    }, [loadSavedWorksheet, setOpenModal]);

    const handleSaveHistoryItem = useCallback(async (item: HistoryItem) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        await addSavedWorksheet(`${item.title} (Geçmiş)`, item.activityType, item.data);
    }, [user, setIsAuthModalOpen, addSavedWorksheet]);

    return {
        historyItems,
        setHistoryItems,
        addToHistory,
        clearHistory,
        deleteHistoryItem,
        handleRestoreFromHistory,
        handleSaveHistoryItem,
    };
};
