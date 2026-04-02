import { useState, useCallback } from 'react';
import { ActivityType } from '../../../types/activity';
import { InfographicCategoryId } from '../constants/categoryConfig';
import { useUIStore } from '../../../store/useUIStore';

export type InfographicGenMode = 'fast' | 'ai';

interface UseInfographicStudioProps {
    initialCategory?: InfographicCategoryId;
    initialActivity?: ActivityType;
}

export const useInfographicStudio = ({
    initialCategory = 'visual-spatial',
    initialActivity,
}: UseInfographicStudioProps = {}) => {
    const [selectedCategory, setSelectedCategory] = useState<InfographicCategoryId>(initialCategory);
    const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(initialActivity || null);
    const [mode, setMode] = useState<InfographicGenMode>('ai'); // Default AI in V3
    const [isAnonymousMode, setIsAnonymousMode] = useState(false); // KVKK compliance for Clinical

    const handleCategoryChange = useCallback((categoryId: InfographicCategoryId) => {
        setSelectedCategory(categoryId);
        setSelectedActivity(null); // Kategori değişince seçili aktiviteyi sıfırla

        // Klinik kategori seçildiğinde uyarı ver ve KVKK modunu aktif et
        if (categoryId === 'clinical-bep') {
            setIsAnonymousMode(true);
            setMode('ai'); // Clinical offline olamaz
        }
    }, []);

    const handleActivitySelect = useCallback((activityId: ActivityType) => {
        setSelectedActivity(activityId);
    }, []);

    const handleModeChange = useCallback((newMode: InfographicGenMode) => {
        // Clinical kategoride offline mod seçilemez
        if (selectedCategory === 'clinical-bep' && newMode === 'fast') {
            alert('Yetki Hatası: Klinik ve BEP içerikleri rastgele (Hızlı) modda üretilemez. Yalnızca Dr. Ahmet Kaya onaylı AI modeli ile üretilebilir.');
            return;
        }
        setMode(newMode);
    }, [selectedCategory]);

    return {
        selectedCategory,
        selectedActivity,
        mode,
        isAnonymousMode,
        setIsAnonymousMode,
        handleCategoryChange,
        handleActivitySelect,
        handleModeChange,
    };
};
