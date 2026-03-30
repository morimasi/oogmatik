import { GeneratorOptions } from '../../../../types/core';
import {
    InfographicActivityResult,
    InfographicAgeGroup,
    InfographicProfile,
    InfographicDifficulty,
} from '../../../../types/infographic';

/**
 * Generator fonksiyonları için standart parametre genişletmesi (tip güvenliği)
 */
export interface GenerateParams {
    topic: string;
    ageGroup: InfographicAgeGroup;
    profile: InfographicProfile;
    difficulty: InfographicDifficulty;
    studentId?: string; // Sadece ID olacak şekilde maskeleme yapılacak! (KVKK)
}

/**
 * Her bir generator (Offline/AI) bu imzaya uymalı
 */
export type InfographicGeneratorFn = (
    options: GeneratorOptions & { topic?: string } // Backward kompatibilite
) => Promise<InfographicActivityResult>;
