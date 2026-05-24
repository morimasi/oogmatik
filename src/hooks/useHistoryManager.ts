import { useState, useEffect } from 'react';
import { ActivityType, HistoryItem, WorksheetData } from '../types';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../constants';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';

export const useHistoryManager = (
    addSavedWorksheet: (name: string, type: ActivityType, data: WorksheetData) => Promise<string | null>,
    loadSavedWorksheet: (worksheet: any) => void,
    setOpenModal: (modal: any) => void,
    setIsAuthModalOpen: (open: boolean) => void
) => {
    const { user } = useAuthStore();
    const { activeStudent } = useStudentStore();

    const [historyItems, setHistoryItems] = useState<HistoryItem[]>(() => {
        try {
            const stored = localStorage.getItem('user_history');
            return stored ? JSON.parse(stored) as HistoryItem[] : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('user_history', JSON.stringify(historyItems));
    }, [historyItems]);

    const addToHistory = (activityType: ActivityType, data: WorksheetData) => {
        if (!data) return;
        const activity = ACTIVITIES.find((a) => a.id === activityType);
        const category = ACTIVITY_CATEGORIES.find((c) => c.activities.includes(activityType));
        if (!activity || !category) return;
        const newItem: HistoryItem = {
            id: Date.now().toString() + Math.random(),
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
    };

    const clearHistory = () => {
        setHistoryItems([]);
    };

    const deleteHistoryItem = (id: string) => {
        setHistoryItems((prev: HistoryItem[]) => prev.filter((i: HistoryItem) => i.id !== id));
    };

    const handleRestoreFromHistory = (item: HistoryItem) => {
        loadSavedWorksheet({
            id: item.id,
            userId: item.userId,
            name: item.title,
            activityType: item.activityType,
            worksheetData: item.data,
            createdAt: item.timestamp,
            icon: ACTIVITIES.find((a) => a.id === item.activityType)?.icon || 'fa-file',
            category: item.category,
        });
        setOpenModal(null);
    };

    const handleSaveHistoryItem = (item: HistoryItem) => {
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }
        addSavedWorksheet(`${item.title} (Geçmiş)`, item.activityType, item.data);
    };

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
