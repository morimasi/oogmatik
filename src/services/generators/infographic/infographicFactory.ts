/**
 * @file src/services/generators/infographic/infographicFactory.ts
 * @description InfographicStudio v3 Ultra Premium — Factory Aggregator
 *
 * Sprint 4-9: Tüm 84 aktivite için adapter dosyalarından export.
 * İlk 10 aktivite infographicAdapter.ts'ten re-export edilir.
 * Kalan 74 aktivite adapter dosyalarından export edilir.
 */

import { InfographicGeneratorPair } from '../../../types/infographic';

// ── Sprint 1: İlk 10 Aktivite (infographicAdapter.ts'ten re-export) ──────────
export {
  INFOGRAPHIC_CONCEPT_MAP,
  INFOGRAPHIC_COMPARE,
  INFOGRAPHIC_VISUAL_LOGIC,
  INFOGRAPHIC_VENN_DIAGRAM,
  INFOGRAPHIC_MIND_MAP,
  INFOGRAPHIC_FLOWCHART,
  INFOGRAPHIC_MATRIX_ANALYSIS,
  INFOGRAPHIC_CAUSE_EFFECT,
  INFOGRAPHIC_FISHBONE,
  INFOGRAPHIC_CLUSTER_MAP,
} from './infographicAdapter';

// ── Sprint 4-9: Kalan 74 Aktivite (adapter dosyaları) ────────────────────────
export { INFOGRAPHIC_5W1H_BOARD } from './adapters/adapter_5w1h';
export { INFOGRAPHIC_READING_FLOW } from './adapters/adapter_reading_flow';
export { INFOGRAPHIC_SEQUENCE } from './adapters/adapter_sequence';
export { INFOGRAPHIC_STORY_MAP } from './adapters/adapter_story_map';
export { INFOGRAPHIC_CHARACTER_ANALYSIS } from './adapters/adapter_character_analysis';
export { INFOGRAPHIC_INFERENCE_CHAIN } from './adapters/adapter_inference_chain';
export { INFOGRAPHIC_SUMMARY_PYRAMID } from './adapters/adapter_summary_pyramid';
export { INFOGRAPHIC_PREDICTION_BOARD } from './adapters/adapter_prediction_board';
export { INFOGRAPHIC_COMPARE_TEXTS } from './adapters/adapter_compare_texts';
export { INFOGRAPHIC_THEME_WEB } from './adapters/adapter_theme_web';
export { INFOGRAPHIC_SYLLABLE_MAP } from './adapters/adapter_syllable_map';
export { INFOGRAPHIC_VOCAB_TREE } from './adapters/adapter_vocab_tree';
export { INFOGRAPHIC_TIMELINE_EVENT } from './adapters/adapter_timeline_event';
export { INFOGRAPHIC_WORD_FAMILY } from './adapters/adapter_word_family';
export { INFOGRAPHIC_PREFIX_SUFFIX } from './adapters/adapter_prefix_suffix';
export { INFOGRAPHIC_SENTENCE_BUILDER } from './adapters/adapter_sentence_builder';
export { INFOGRAPHIC_ANTONYM_SYNONYM } from './adapters/adapter_antonym_synonym';
export { INFOGRAPHIC_WORD_ORIGIN } from './adapters/adapter_word_origin';
export { INFOGRAPHIC_COMPOUND_WORD } from './adapters/adapter_compound_word';
export { INFOGRAPHIC_GENRE_CHART } from './adapters/adapter_genre_chart';
export { INFOGRAPHIC_MATH_STEPS } from './adapters/adapter_math_steps';
export { INFOGRAPHIC_NUMBER_LINE } from './adapters/adapter_number_line';
export { INFOGRAPHIC_FRACTION_VISUAL } from './adapters/adapter_fraction_visual';
export { INFOGRAPHIC_MULTIPLICATION_MAP } from './adapters/adapter_multiplication_map';
export { INFOGRAPHIC_GEOMETRY_EXPLORER } from './adapters/adapter_geometry_explorer';
export { INFOGRAPHIC_DATA_CHART } from './adapters/adapter_data_chart';
export { INFOGRAPHIC_ALGEBRA_BALANCE } from './adapters/adapter_algebra_balance';
export { INFOGRAPHIC_MEASUREMENT_GUIDE } from './adapters/adapter_measurement_guide';
export { INFOGRAPHIC_PATTERN_RULE } from './adapters/adapter_pattern_rule';
export { INFOGRAPHIC_WORD_PROBLEM_MAP } from './adapters/adapter_word_problem_map';
export { INFOGRAPHIC_LIFE_CYCLE } from './adapters/adapter_life_cycle';
export { INFOGRAPHIC_FOOD_CHAIN } from './adapters/adapter_food_chain';
export { INFOGRAPHIC_SCIENTIFIC_METHOD } from './adapters/adapter_scientific_method';
export { INFOGRAPHIC_CELL_DIAGRAM } from './adapters/adapter_cell_diagram';
export { INFOGRAPHIC_ECOSYSTEM_WEB } from './adapters/adapter_ecosystem_web';
export { INFOGRAPHIC_STATES_MATTER } from './adapters/adapter_states_matter';
export { INFOGRAPHIC_SOLAR_SYSTEM } from './adapters/adapter_solar_system';
export { INFOGRAPHIC_HUMAN_BODY } from './adapters/adapter_human_body';
export { INFOGRAPHIC_HISTORICAL_TIMELINE } from './adapters/adapter_historical_timeline';
export { INFOGRAPHIC_MAP_EXPLORER } from './adapters/adapter_map_explorer';
export { INFOGRAPHIC_CULTURE_COMPARE } from './adapters/adapter_culture_compare';
export { INFOGRAPHIC_GOVERNMENT_CHART } from './adapters/adapter_government_chart';
export { INFOGRAPHIC_ECONOMIC_FLOW } from './adapters/adapter_economic_flow';
export { INFOGRAPHIC_BIOGRAPHY_BOARD } from './adapters/adapter_biography_board';
export { INFOGRAPHIC_EVENT_ANALYSIS } from './adapters/adapter_event_analysis';
export { INFOGRAPHIC_GEOGRAPHY_PROFILE } from './adapters/adapter_geography_profile';
export { INFOGRAPHIC_BRAINSTORM_WEB } from './adapters/adapter_brainstorm_web';
export { INFOGRAPHIC_SCAMPER } from './adapters/adapter_scamper';
export { INFOGRAPHIC_DESIGN_THINKING } from './adapters/adapter_design_thinking';
export { INFOGRAPHIC_ALTERNATIVE_ENDS } from './adapters/adapter_alternative_ends';
export { INFOGRAPHIC_INVENTION_PLAN } from './adapters/adapter_invention_plan';
export { INFOGRAPHIC_ASSOCIATIONS } from './adapters/adapter_associations';
export { INFOGRAPHIC_ROLE_PLAY_SCENARIO } from './adapters/adapter_role_play_scenario';
export { INFOGRAPHIC_FUTURE_VISION } from './adapters/adapter_future_vision';
export { INFOGRAPHIC_GOAL_SETTING } from './adapters/adapter_goal_setting';
export { INFOGRAPHIC_TIME_MANAGEMENT } from './adapters/adapter_time_management';
export { INFOGRAPHIC_STUDY_PLAN } from './adapters/adapter_study_plan';
export { INFOGRAPHIC_EMOTION_GAUGE } from './adapters/adapter_emotion_gauge';
export { INFOGRAPHIC_SELF_REFLECTION } from './adapters/adapter_self_reflection';
export { INFOGRAPHIC_MOTIVATION_BOARD } from './adapters/adapter_motivation_board';
export { INFOGRAPHIC_NOTE_TAKING } from './adapters/adapter_note_taking';
export { INFOGRAPHIC_TEST_PREPARATION } from './adapters/adapter_test_preparation';
export { INFOGRAPHIC_DYSLEXIA_READING } from './adapters/adapter_dyslexia_reading';
export { INFOGRAPHIC_DYSGRAPHIA_WRITING } from './adapters/adapter_dysgraphia_writing';
export { INFOGRAPHIC_DYSCALCULIA_MATH } from './adapters/adapter_dyscalculia_math';
export { INFOGRAPHIC_ADHD_FOCUS } from './adapters/adapter_adhd_focus';
export { INFOGRAPHIC_EXECUTIVE_FUNCTION } from './adapters/adapter_executive_function';
export { INFOGRAPHIC_SENSORY_INTEGRATION } from './adapters/adapter_sensory_integration';
export { INFOGRAPHIC_ANXIETY_RELIEF } from './adapters/adapter_anxiety_relief';
export { INFOGRAPHIC_SOCIAL_SKILLS } from './adapters/adapter_social_skills';
export { INFOGRAPHIC_ROUTINE_BUILDER } from './adapters/adapter_routine_builder';
export { INFOGRAPHIC_BEHAVIOR_TRACKER } from './adapters/adapter_behavior_tracker';
export { INFOGRAPHIC_BEP_GOAL_MAP } from './adapters/adapter_bep_goal_map';
export { INFOGRAPHIC_IEP_PROGRESS } from './adapters/adapter_iep_progress';
export { INFOGRAPHIC_OBSERVATION_MATRIX } from './adapters/adapter_observation_matrix';
export { INFOGRAPHIC_COGNITIVE_PROFILE } from './adapters/adapter_cognitive_profile';
export { INFOGRAPHIC_BEHAVIOR_INTERVENTION } from './adapters/adapter_behavior_intervention';
export { INFOGRAPHIC_SENSORY_DIET } from './adapters/adapter_sensory_diet';
export { INFOGRAPHIC_PARENT_GUIDE } from './adapters/adapter_parent_guide';
export { INFOGRAPHIC_ACCOMMODATION_LIST } from './adapters/adapter_accommodation_list';
export { INFOGRAPHIC_TRANSITION_PLAN } from './adapters/adapter_transition_plan';
export { INFOGRAPHIC_SPEECH_THERAPY_TARGET } from './adapters/adapter_speech_therapy_target';
export { INFOGRAPHIC_MOTOR_SKILLS } from './adapters/adapter_motor_skills';
export { INFOGRAPHIC_EVALUATION_SUMMARY } from './adapters/adapter_evaluation_summary';
export { INFOGRAPHIC_SHORT_ANSWER } from './adapters/adapter_short_answer';

// ── Aggregated Registry (84 adapter) ─────────────────────────────────────────

import { INFOGRAPHIC_5W1H_BOARD } from './adapters/adapter_5w1h';
import { INFOGRAPHIC_READING_FLOW } from './adapters/adapter_reading_flow';
import { INFOGRAPHIC_SEQUENCE } from './adapters/adapter_sequence';
import { INFOGRAPHIC_STORY_MAP } from './adapters/adapter_story_map';
import { INFOGRAPHIC_CHARACTER_ANALYSIS } from './adapters/adapter_character_analysis';
import { INFOGRAPHIC_INFERENCE_CHAIN } from './adapters/adapter_inference_chain';
import { INFOGRAPHIC_SUMMARY_PYRAMID } from './adapters/adapter_summary_pyramid';
import { INFOGRAPHIC_PREDICTION_BOARD } from './adapters/adapter_prediction_board';
import { INFOGRAPHIC_COMPARE_TEXTS } from './adapters/adapter_compare_texts';
import { INFOGRAPHIC_THEME_WEB } from './adapters/adapter_theme_web';
import { INFOGRAPHIC_SYLLABLE_MAP } from './adapters/adapter_syllable_map';
import { INFOGRAPHIC_VOCAB_TREE } from './adapters/adapter_vocab_tree';
import { INFOGRAPHIC_TIMELINE_EVENT } from './adapters/adapter_timeline_event';
import { INFOGRAPHIC_WORD_FAMILY } from './adapters/adapter_word_family';
import { INFOGRAPHIC_PREFIX_SUFFIX } from './adapters/adapter_prefix_suffix';
import { INFOGRAPHIC_SENTENCE_BUILDER } from './adapters/adapter_sentence_builder';
import { INFOGRAPHIC_ANTONYM_SYNONYM } from './adapters/adapter_antonym_synonym';
import { INFOGRAPHIC_WORD_ORIGIN } from './adapters/adapter_word_origin';
import { INFOGRAPHIC_COMPOUND_WORD } from './adapters/adapter_compound_word';
import { INFOGRAPHIC_GENRE_CHART } from './adapters/adapter_genre_chart';
import { INFOGRAPHIC_MATH_STEPS } from './adapters/adapter_math_steps';
import { INFOGRAPHIC_NUMBER_LINE } from './adapters/adapter_number_line';
import { INFOGRAPHIC_FRACTION_VISUAL } from './adapters/adapter_fraction_visual';
import { INFOGRAPHIC_MULTIPLICATION_MAP } from './adapters/adapter_multiplication_map';
import { INFOGRAPHIC_GEOMETRY_EXPLORER } from './adapters/adapter_geometry_explorer';
import { INFOGRAPHIC_DATA_CHART } from './adapters/adapter_data_chart';
import { INFOGRAPHIC_ALGEBRA_BALANCE } from './adapters/adapter_algebra_balance';
import { INFOGRAPHIC_MEASUREMENT_GUIDE } from './adapters/adapter_measurement_guide';
import { INFOGRAPHIC_PATTERN_RULE } from './adapters/adapter_pattern_rule';
import { INFOGRAPHIC_WORD_PROBLEM_MAP } from './adapters/adapter_word_problem_map';
import { INFOGRAPHIC_LIFE_CYCLE } from './adapters/adapter_life_cycle';
import { INFOGRAPHIC_FOOD_CHAIN } from './adapters/adapter_food_chain';
import { INFOGRAPHIC_SCIENTIFIC_METHOD } from './adapters/adapter_scientific_method';
import { INFOGRAPHIC_CELL_DIAGRAM } from './adapters/adapter_cell_diagram';
import { INFOGRAPHIC_ECOSYSTEM_WEB } from './adapters/adapter_ecosystem_web';
import { INFOGRAPHIC_STATES_MATTER } from './adapters/adapter_states_matter';
import { INFOGRAPHIC_SOLAR_SYSTEM } from './adapters/adapter_solar_system';
import { INFOGRAPHIC_HUMAN_BODY } from './adapters/adapter_human_body';
import { INFOGRAPHIC_HISTORICAL_TIMELINE } from './adapters/adapter_historical_timeline';
import { INFOGRAPHIC_MAP_EXPLORER } from './adapters/adapter_map_explorer';
import { INFOGRAPHIC_CULTURE_COMPARE } from './adapters/adapter_culture_compare';
import { INFOGRAPHIC_GOVERNMENT_CHART } from './adapters/adapter_government_chart';
import { INFOGRAPHIC_ECONOMIC_FLOW } from './adapters/adapter_economic_flow';
import { INFOGRAPHIC_BIOGRAPHY_BOARD } from './adapters/adapter_biography_board';
import { INFOGRAPHIC_EVENT_ANALYSIS } from './adapters/adapter_event_analysis';
import { INFOGRAPHIC_GEOGRAPHY_PROFILE } from './adapters/adapter_geography_profile';
import { INFOGRAPHIC_BRAINSTORM_WEB } from './adapters/adapter_brainstorm_web';
import { INFOGRAPHIC_SCAMPER } from './adapters/adapter_scamper';
import { INFOGRAPHIC_DESIGN_THINKING } from './adapters/adapter_design_thinking';
import { INFOGRAPHIC_ALTERNATIVE_ENDS } from './adapters/adapter_alternative_ends';
import { INFOGRAPHIC_INVENTION_PLAN } from './adapters/adapter_invention_plan';
import { INFOGRAPHIC_ASSOCIATIONS } from './adapters/adapter_associations';
import { INFOGRAPHIC_ROLE_PLAY_SCENARIO } from './adapters/adapter_role_play_scenario';
import { INFOGRAPHIC_FUTURE_VISION } from './adapters/adapter_future_vision';
import { INFOGRAPHIC_GOAL_SETTING } from './adapters/adapter_goal_setting';
import { INFOGRAPHIC_TIME_MANAGEMENT } from './adapters/adapter_time_management';
import { INFOGRAPHIC_STUDY_PLAN } from './adapters/adapter_study_plan';
import { INFOGRAPHIC_EMOTION_GAUGE } from './adapters/adapter_emotion_gauge';
import { INFOGRAPHIC_SELF_REFLECTION } from './adapters/adapter_self_reflection';
import { INFOGRAPHIC_MOTIVATION_BOARD } from './adapters/adapter_motivation_board';
import { INFOGRAPHIC_NOTE_TAKING } from './adapters/adapter_note_taking';
import { INFOGRAPHIC_TEST_PREPARATION } from './adapters/adapter_test_preparation';
import { INFOGRAPHIC_DYSLEXIA_READING } from './adapters/adapter_dyslexia_reading';
import { INFOGRAPHIC_DYSGRAPHIA_WRITING } from './adapters/adapter_dysgraphia_writing';
import { INFOGRAPHIC_DYSCALCULIA_MATH } from './adapters/adapter_dyscalculia_math';
import { INFOGRAPHIC_ADHD_FOCUS } from './adapters/adapter_adhd_focus';
import { INFOGRAPHIC_EXECUTIVE_FUNCTION } from './adapters/adapter_executive_function';
import { INFOGRAPHIC_SENSORY_INTEGRATION } from './adapters/adapter_sensory_integration';
import { INFOGRAPHIC_ANXIETY_RELIEF } from './adapters/adapter_anxiety_relief';
import { INFOGRAPHIC_SOCIAL_SKILLS } from './adapters/adapter_social_skills';
import { INFOGRAPHIC_ROUTINE_BUILDER } from './adapters/adapter_routine_builder';
import { INFOGRAPHIC_BEHAVIOR_TRACKER } from './adapters/adapter_behavior_tracker';
import { INFOGRAPHIC_BEP_GOAL_MAP } from './adapters/adapter_bep_goal_map';
import { INFOGRAPHIC_IEP_PROGRESS } from './adapters/adapter_iep_progress';
import { INFOGRAPHIC_OBSERVATION_MATRIX } from './adapters/adapter_observation_matrix';
import { INFOGRAPHIC_COGNITIVE_PROFILE } from './adapters/adapter_cognitive_profile';
import { INFOGRAPHIC_BEHAVIOR_INTERVENTION } from './adapters/adapter_behavior_intervention';
import { INFOGRAPHIC_SENSORY_DIET } from './adapters/adapter_sensory_diet';
import { INFOGRAPHIC_PARENT_GUIDE } from './adapters/adapter_parent_guide';
import { INFOGRAPHIC_ACCOMMODATION_LIST } from './adapters/adapter_accommodation_list';
import { INFOGRAPHIC_TRANSITION_PLAN } from './adapters/adapter_transition_plan';
import { INFOGRAPHIC_SPEECH_THERAPY_TARGET } from './adapters/adapter_speech_therapy_target';
import { INFOGRAPHIC_MOTOR_SKILLS } from './adapters/adapter_motor_skills';
import { INFOGRAPHIC_EVALUATION_SUMMARY } from './adapters/adapter_evaluation_summary';
import { INFOGRAPHIC_SHORT_ANSWER } from './adapters/adapter_short_answer';

export const INFOGRAPHIC_ADAPTERS_REMAINING_84: Record<string, InfographicGeneratorPair> = {
  INFOGRAPHIC_5W1H_BOARD,
  INFOGRAPHIC_READING_FLOW,
  INFOGRAPHIC_SEQUENCE,
  INFOGRAPHIC_STORY_MAP,
  INFOGRAPHIC_CHARACTER_ANALYSIS,
  INFOGRAPHIC_INFERENCE_CHAIN,
  INFOGRAPHIC_SUMMARY_PYRAMID,
  INFOGRAPHIC_PREDICTION_BOARD,
  INFOGRAPHIC_COMPARE_TEXTS,
  INFOGRAPHIC_THEME_WEB,
  INFOGRAPHIC_SYLLABLE_MAP,
  INFOGRAPHIC_VOCAB_TREE,
  INFOGRAPHIC_TIMELINE_EVENT,
  INFOGRAPHIC_WORD_FAMILY,
  INFOGRAPHIC_PREFIX_SUFFIX,
  INFOGRAPHIC_SENTENCE_BUILDER,
  INFOGRAPHIC_ANTONYM_SYNONYM,
  INFOGRAPHIC_WORD_ORIGIN,
  INFOGRAPHIC_COMPOUND_WORD,
  INFOGRAPHIC_GENRE_CHART,
  INFOGRAPHIC_MATH_STEPS,
  INFOGRAPHIC_NUMBER_LINE,
  INFOGRAPHIC_FRACTION_VISUAL,
  INFOGRAPHIC_MULTIPLICATION_MAP,
  INFOGRAPHIC_GEOMETRY_EXPLORER,
  INFOGRAPHIC_DATA_CHART,
  INFOGRAPHIC_ALGEBRA_BALANCE,
  INFOGRAPHIC_MEASUREMENT_GUIDE,
  INFOGRAPHIC_PATTERN_RULE,
  INFOGRAPHIC_WORD_PROBLEM_MAP,
  INFOGRAPHIC_LIFE_CYCLE,
  INFOGRAPHIC_FOOD_CHAIN,
  INFOGRAPHIC_SCIENTIFIC_METHOD,
  INFOGRAPHIC_CELL_DIAGRAM,
  INFOGRAPHIC_ECOSYSTEM_WEB,
  INFOGRAPHIC_STATES_MATTER,
  INFOGRAPHIC_SOLAR_SYSTEM,
  INFOGRAPHIC_HUMAN_BODY,
  INFOGRAPHIC_HISTORICAL_TIMELINE,
  INFOGRAPHIC_MAP_EXPLORER,
  INFOGRAPHIC_CULTURE_COMPARE,
  INFOGRAPHIC_GOVERNMENT_CHART,
  INFOGRAPHIC_ECONOMIC_FLOW,
  INFOGRAPHIC_BIOGRAPHY_BOARD,
  INFOGRAPHIC_EVENT_ANALYSIS,
  INFOGRAPHIC_GEOGRAPHY_PROFILE,
  INFOGRAPHIC_BRAINSTORM_WEB,
  INFOGRAPHIC_SCAMPER,
  INFOGRAPHIC_DESIGN_THINKING,
  INFOGRAPHIC_ALTERNATIVE_ENDS,
  INFOGRAPHIC_INVENTION_PLAN,
  INFOGRAPHIC_ASSOCIATIONS,
  INFOGRAPHIC_ROLE_PLAY_SCENARIO,
  INFOGRAPHIC_FUTURE_VISION,
  INFOGRAPHIC_GOAL_SETTING,
  INFOGRAPHIC_TIME_MANAGEMENT,
  INFOGRAPHIC_STUDY_PLAN,
  INFOGRAPHIC_EMOTION_GAUGE,
  INFOGRAPHIC_SELF_REFLECTION,
  INFOGRAPHIC_MOTIVATION_BOARD,
  INFOGRAPHIC_NOTE_TAKING,
  INFOGRAPHIC_TEST_PREPARATION,
  INFOGRAPHIC_DYSLEXIA_READING,
  INFOGRAPHIC_DYSGRAPHIA_WRITING,
  INFOGRAPHIC_DYSCALCULIA_MATH,
  INFOGRAPHIC_ADHD_FOCUS,
  INFOGRAPHIC_EXECUTIVE_FUNCTION,
  INFOGRAPHIC_SENSORY_INTEGRATION,
  INFOGRAPHIC_ANXIETY_RELIEF,
  INFOGRAPHIC_SOCIAL_SKILLS,
  INFOGRAPHIC_ROUTINE_BUILDER,
  INFOGRAPHIC_BEHAVIOR_TRACKER,
  INFOGRAPHIC_BEP_GOAL_MAP,
  INFOGRAPHIC_IEP_PROGRESS,
  INFOGRAPHIC_OBSERVATION_MATRIX,
  INFOGRAPHIC_COGNITIVE_PROFILE,
  INFOGRAPHIC_BEHAVIOR_INTERVENTION,
  INFOGRAPHIC_SENSORY_DIET,
  INFOGRAPHIC_PARENT_GUIDE,
  INFOGRAPHIC_ACCOMMODATION_LIST,
  INFOGRAPHIC_TRANSITION_PLAN,
  INFOGRAPHIC_SPEECH_THERAPY_TARGET,
  INFOGRAPHIC_MOTOR_SKILLS,
  INFOGRAPHIC_EVALUATION_SUMMARY,
  INFOGRAPHIC_SHORT_ANSWER,
} as Record<string, InfographicGeneratorPair>;

export const TOTAL_INFOGRAPHIC_ADAPTERS =
  10 + Object.keys(INFOGRAPHIC_ADAPTERS_REMAINING_84).length;
