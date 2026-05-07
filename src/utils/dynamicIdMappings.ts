import { ActivityType } from '../types/activity';
import { logInfo } from './logger.js';

// Centralized dynamic Firestore ID mappings to internal ActivityType values.
// Extended from 7 to 40+ mappings for comprehensive activity type support
export const DYNAMIC_ID_MAPPINGS: Record<string, ActivityType> = {
  // Original 7 mappings
  'PZW4TWcMW7eB89z1M2EB': ActivityType.ES_ANLAMLI_KELIMELER,
  'L0L6Y9PrZNzsiJ2Ott7g': ActivityType.MATH_PUZZLE,
  'vY3R8kM9z1P2Q3R4S5T6': ActivityType.NUMBER_LOGIC_RIDDLES,
  'k3R8kM9z1P2Q3R4S5T6a': ActivityType.BRAIN_TEASERS,
  'MfH9I6jyuvHJWTadIb91': ActivityType.NUMBER_SENSE,
  'ücgwen_1769002912962': ActivityType.SHAPE_COUNTING,
  'Msc0QEAM8Ax1bcIWJ33v': ActivityType.MAP_INSTRUCTION,

  // Extended mappings for all ActivityType enums (40+ types)
  // Core Language & Reading Activities
  'activity_hece_parkuru': ActivityType.HECE_PARKURU,
  'activity_find_letter_pair': ActivityType.FIND_LETTER_PAIR,
  'activity_reading_sudoku': ActivityType.READING_SUDOKU,
  'activity_syllable_master_lab': ActivityType.SYLLABLE_MASTER_LAB,
  'activity_reading_stroop': ActivityType.READING_STROOP,
  'activity_family_relations': ActivityType.FAMILY_RELATIONS,
  'activity_family_logic_test': ActivityType.FAMILY_LOGIC_TEST,
  'activity_synonym_antonym_match': ActivityType.SYNONYM_ANTONYM_MATCH,
  'activity_letter_visual_matching': ActivityType.LETTER_VISUAL_MATCHING,
  'activity_syllable_word_builder': ActivityType.SYLLABLE_WORD_BUILDER,
  
  // Math & Logic Activities
  'activity_algorithm_generator': ActivityType.ALGORITHM_GENERATOR,
  'activity_ai_worksheet_converter': ActivityType.AI_WORKSHEET_CONVERTER,
  'activity_hidden_password_grid': ActivityType.HIDDEN_PASSWORD_GRID,
  'activity_clock_reading': ActivityType.CLOCK_READING,
  'activity_money_counting': ActivityType.MONEY_COUNTING,
  'activity_math_memory_cards': ActivityType.MATH_MEMORY_CARDS,
  'activity_find_the_difference': ActivityType.FIND_THE_DIFFERENCE,
  'activity_visual_odd_one_out': ActivityType.VISUAL_ODD_ONE_OUT,
  'activity_grid_drawing': ActivityType.GRID_DRAWING,
  'activity_symmetry_drawing': ActivityType.SYMMETRY_DRAWING,
  
  // Word & Text Activities
  'activity_word_search': ActivityType.WORD_SEARCH,
  'activity_morphology_matrix': ActivityType.MORPHOLOGY_MATRIX,
  'activity_reading_pyramid': ActivityType.READING_PYRAMID,
  'activity_number_path_logic': ActivityType.NUMBER_PATH_LOGIC,
  'activity_directional_tracking': ActivityType.DIRECTIONAL_TRACKING,
  'activity_story_comprehension': ActivityType.STORY_COMPREHENSION,
  'activity_story_analysis': ActivityType.STORY_ANALYSIS,
  'activity_story_creation_prompt': ActivityType.STORY_CREATION_PROMPT,
  'activity_words_in_story': ActivityType.WORDS_IN_STORY,
  'activity_story_sequencing': ActivityType.STORY_SEQUENCING,
  
  // Proverb Activities
  'activity_proverb_saying_sort': ActivityType.PROVERB_SAYING_SORT,
  'activity_proverb_word_chain': ActivityType.PROVERB_WORD_CHAIN,
  'activity_proverb_fill_blank': ActivityType.PROVERB_FILL_IN_THE_BLANK,
  'activity_proverb_search': ActivityType.PROVERB_SEARCH,
  'activity_proverb_sentence_finder': ActivityType.PROVERB_SENTENCE_FINDER,
  
  // Assessment & Workbook
  'activity_missing_parts': ActivityType.MISSING_PARTS,
  'activity_ocr_content': ActivityType.OCR_CONTENT,
  'activity_assessment_report': ActivityType.ASSESSMENT_REPORT,
  'activity_workbook': ActivityType.WORKBOOK,
  
  // Advanced Math Puzzles
  'activity_futoshi': ActivityType.FUTOSHIKI,
  'activity_kendoku': ActivityType.KENDOKU,
  'activity_number_pyramid': ActivityType.NUMBER_PYRAMID,
  'activity_number_pattern': ActivityType.NUMBER_PATTERN,
  'activity_real_life_math': ActivityType.REAL_LIFE_MATH_PROBLEMS,
  'activity_math_studio': ActivityType.MATH_STUDIO,
  
  // Memory & Attention Activities
  'activity_word_memory': ActivityType.WORD_MEMORY,
  'activity_visual_memory': ActivityType.VISUAL_MEMORY,
  'activity_character_memory': ActivityType.CHARACTER_MEMORY,
  'activity_color_wheel_memory': ActivityType.COLOR_WHEEL_MEMORY,
  'activity_image_comprehension': ActivityType.IMAGE_COMPREHRENSION,
  'activity_stroop_test': ActivityType.STROOP_TEST,
  'activity_burdon_test': ActivityType.BURDON_TEST,
  'activity_number_search': ActivityType.NUMBER_SEARCH,
  'activity_chaotic_number_search': ActivityType.CHAOTIC_NUMBER_SEARCH,
  
  // Attention Development
  'activity_attention_development': ActivityType.ATTENTION_DEVELOPMENT,
  'activity_attention_focus': ActivityType.ATTENTION_FOCUS,
  'activity_find_identical_word': ActivityType.FIND_IDENTICAL_WORD,
  'activity_letter_grid_test': ActivityType.LETTER_GRID_TEST,
  'activity_target_search': ActivityType.TARGET_SEARCH,
  'activity_reading_flow': ActivityType.READING_FLOW,
  
  // Phonological & Language Skills
  'activity_phonological_awareness': ActivityType.PHONOLOGICAL_AWARENESS,
  'activity_rapid_naming': ActivityType.RAPID_NAMING,
  'activity_letter_discrimination': ActivityType.LETTER_DISCRIMINATION,
  'activity_mirror_letters': ActivityType.MIRROR_LETTERS,
  'activity_syllable_train': ActivityType.SYLLABLE_TRAIN,
  'activity_visual_tracking_lines': ActivityType.VISUAL_TRACKING_LINES,
  'activity_backward_spelling': ActivityType.BACKWARD_SPELLING,
  'activity_code_reading': ActivityType.CODE_READING,
  
  // Puzzle & Logic Activities
  'activity_attention_to_question': ActivityType.ATTENTION_TO_QUESTION,
  'activity_handwriting_practice': ActivityType.HANDWRITING_PRACTICE,
  'activity_anagram': ActivityType.ANAGRAM,
  'activity_crossword': ActivityType.CROSSWORD,
  'activity_odd_one_out': ActivityType.ODD_ONE_OUT,
  'activity_thematic_odd_one_out': ActivityType.THEMATIC_ODD_ONE_OUT,
  'activity_concept_match': ActivityType.CONCEPT_MATCH,
  'activity_estimation': ActivityType.ESTIMATION,
  'activity_spatial_grid': ActivityType.SPATIAL_GRID,
  'activity_odd_even_sudoku': ActivityType.ODD_EVEN_SUDOKU,
  'activity_punctuation_maze': ActivityType.PUNCTUATION_MAZE,
  'activity_logic_grid_puzzle': ActivityType.LOGIC_GRID_PUZZLE,
  'activity_dot_painting': ActivityType.DOT_PAINTING,
  'activity_shape_sudoku': ActivityType.SHAPE_SUDOKU,
  'activity_visual_arithmetic': ActivityType.VISUAL_ARITHMETIC,
  'activity_abc_connect': ActivityType.ABC_CONNECT,
  'activity_magic_pyramid': ActivityType.MAGIC_PYRAMID,
  'activity_capsule_game': ActivityType.CAPSULE_GAME,
  'activity_five_w_one_h': ActivityType.FIVE_W_ONE_H,
  'activity_sentence_5w1h': ActivityType.SENTENCE_5W1H,
  'activity_colorful_syllable_reading': ActivityType.COLORFUL_SYLLABLE_READING,
  'activity_family_tree_matrix': ActivityType.FAMILY_TREE_MATRIX,
  'activity_apartment_logic': ActivityType.APARTMENT_LOGIC_PUZZLE,
  'activity_financial_market': ActivityType.FINANCIAL_MARKET_CALCULATOR,
  'activity_directional_code': ActivityType.DIRECTIONAL_CODE_READING,
  'activity_logic_error_hunter': ActivityType.LOGIC_ERROR_HUNTER,
  'activity_pattern_completion': ActivityType.PATTERN_COMPLETION,
  'activity_visual_interpretation': ActivityType.VISUAL_INTERPRETATION,
  
  // Special Activities
  'activity_kavram_haritasi': ActivityType.KAVRAM_HARITASI,
  'activity_box_math': ActivityType.BOX_MATH,
  'activity_sinav': ActivityType.SINAV,
  'activity_mat_sinav': ActivityType.MAT_SINAV,
  'activity_premium_studio': ActivityType.PREMIUM_STUDIO,
};

/**
 * Register a new dynamic mapping at runtime
 * Used for auto-registration when new activities are created
 */
export function registerDynamicMapping(
  firebaseId: string,
  activityType: ActivityType
): void {
  if (!firebaseId || firebaseId.trim() === '') {
    throw new Error('firebaseId cannot be empty');
  }
  DYNAMIC_ID_MAPPINGS[firebaseId] = activityType;
  logInfo(`Registered dynamic mapping: ${firebaseId} → ${activityType}`);
}

export function mapDynamicIdToActivityType(id: string): ActivityType | undefined {
  if (!id || id.trim() === '') return undefined;
  return DYNAMIC_ID_MAPPINGS[id];
}

export default mapDynamicIdToActivityType;
