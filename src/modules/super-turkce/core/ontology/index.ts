/**
 * MEB Müfredat Ontolojisi - Index
 * 
 * Sınıf seviyesine göre kazanımlar, birimler ve kelime listeleri.
 */

// MEB Curriculum (already in types.ts)
export { MEB_CURRICULUM } from '../types';
export type { GradeLevel, Objective, Unit, GradeCurriculum } from '../types';

// Vocabulary Ontology
export {
  VOCABULARY_ONTOLOGY,
  getTier2Words,
  getTier3Words,
  getVocabularyStats
} from './VocabularyOntology';
export type { VocabularyWord, GradeVocabulary } from './VocabularyOntology';
