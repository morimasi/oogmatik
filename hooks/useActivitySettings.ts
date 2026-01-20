
import { useState, useEffect, useCallback } from 'react';
import { GeneratorOptions } from '../types';
import { getDefaultOptionsForActivity } from '../registry';

const STORAGE_PREFIX = 'activity_settings_v1_';

export const useActivitySettings = (activityId: string) => {
    // 1. Başlangıç State'ini Belirle
    const [options, setOptions] = useState<GeneratorOptions>(() => {
        try {
            // Önce LocalStorage'a bak
            const savedItem = localStorage.getItem(`${STORAGE_PREFIX}${activityId}`);
            const defaultOptions = getDefaultOptionsForActivity(activityId);

            if (savedItem) {
                // Kayıtlı ayarları varsayılanlarla birleştir (yeni eklenen alanlar bozulmasın diye)
                const parsed = JSON.parse(savedItem);
                return { ...defaultOptions, ...parsed };
            }

            return defaultOptions;
        } catch (error) {
            console.warn('Ayarlar okunurken hata oluştu, varsayılanlar kullanılıyor:', error);
            return getDefaultOptionsForActivity(activityId);
        }
    });

    // 2. Ayar Değiştirme Fonksiyonu
    const updateOption = useCallback((key: keyof GeneratorOptions, value: any) => {
        setOptions(prev => {
            const newOptions = { ...prev, [key]: value };
            
            // Değişikliği anında hafızaya yaz
            try {
                localStorage.setItem(`${STORAGE_PREFIX}${activityId}`, JSON.stringify(newOptions));
            } catch (e) {
                console.error("Ayarlar kaydedilemedi:", e);
            }
            
            return newOptions;
        });
    }, [activityId]);

    // 3. Aktivite ID değiştiğinde state'i yenile (Sidebar'dan hızlı geçişler için)
    useEffect(() => {
        const loadSettings = () => {
            try {
                const savedItem = localStorage.getItem(`${STORAGE_PREFIX}${activityId}`);
                const defaultOptions = getDefaultOptionsForActivity(activityId);
                
                if (savedItem) {
                    setOptions({ ...defaultOptions, ...JSON.parse(savedItem) });
                } else {
                    setOptions(defaultOptions);
                }
            } catch (e) {
                setOptions(getDefaultOptionsForActivity(activityId));
            }
        };
        loadSettings();
    }, [activityId]);

    // 4. Toplu güncelleme (Örn: Hazır şablon yüklerken)
    const setAllOptions = useCallback((newOptions: GeneratorOptions) => {
        setOptions(newOptions);
        localStorage.setItem(`${STORAGE_PREFIX}${activityId}`, JSON.stringify(newOptions));
    }, [activityId]);

    return { options, updateOption, setAllOptions };
};
