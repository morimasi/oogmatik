/**
 * OOGMATIK - Prompt Injection Security Module
 * AI Direktoru: Selin Arslan
 *
 * Prompt injection saldirilarina karsi kapsamli guvenlik filtresi.
 * Bu modul, kullanici girdilerini AI modeline gondermeden once
 * tehlikeli paternleri tespit eder ve temizler.
 *
 * GUVENLIK KATMANLARI:
 * 1. Pattern Detection - Bilinen injection patternlerini tespit
 * 2. Input Sanitization - Tehlikeli karakterleri ve ifadeleri temizle
 * 3. Length Enforcement - 2000 karakter limiti zorla
 * 4. Threat Logging - Tum saldiri girismlerini logla
 */

import { ValidationError } from './AppError.js';

// ============================================================
// TYPES
// ============================================================

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';

export type ThreatCategory =
  | 'INSTRUCTION_OVERRIDE'      // "ignore previous instructions"
  | 'ROLE_MANIPULATION'         // "you are now..."
  | 'SYSTEM_PROMPT_EXTRACTION'  // "what is your system prompt"
  | 'JAILBREAK_ATTEMPT'         // DAN, developer mode, etc.
  | 'MEMORY_MANIPULATION'       // "forget your rules"
  | 'OUTPUT_MANIPULATION'       // JSON breaking attempts
  | 'ENCODING_BYPASS'           // Base64, unicode tricks
  | 'DELIMITER_INJECTION'       // ### or similar separators
  | 'SQL_INJECTION'             // DROP TABLE, DELETE FROM (inherited from schemas.ts)
  | 'SCRIPT_INJECTION';         // <script>, onclick, etc.

export interface ThreatDetectionResult {
  isSafe: boolean;
  threats: DetectedThreat[];
  sanitizedInput: string;
  originalLength: number;
  sanitizedLength: number;
  truncated: boolean;
}

export interface DetectedThreat {
  category: ThreatCategory;
  level: ThreatLevel;
  pattern: string;
  matchedText: string;
  position: number;
  timestamp: string;
}

export interface PromptSecurityConfig {
  maxLength: number;
  enableLogging: boolean;
  blockOnThreat: boolean;
  threatThreshold: ThreatLevel;
}

// ============================================================
// CONSTANTS
// ============================================================

export const DEFAULT_MAX_LENGTH = 5000;

export const DEFAULT_CONFIG: PromptSecurityConfig = {
  maxLength: DEFAULT_MAX_LENGTH,
  enableLogging: true,
  blockOnThreat: true,
  threatThreshold: 'medium',
};

/**
 * INJECTION PATTERN DATABASE
 * Kategorize edilmis ve onceliklendirilmis tehdit paternleri.
 * Her pattern kucuk harf eslestirmesi icin normalize edilir.
 */
const INJECTION_PATTERNS: Array<{
  pattern: RegExp;
  category: ThreatCategory;
  level: ThreatLevel;
  description: string;
}> = [
  // ============================================================
  // CRITICAL - Dogrudan sistem manipulasyonu
  // ============================================================
  {
    pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
    category: 'INSTRUCTION_OVERRIDE',
    level: 'critical',
    description: 'Direct instruction override attempt',
  },
  {
    pattern: /ignore\s+(?:your|the)\s+(?:rules|guidelines|instructions|constraints)/gi,
    category: 'INSTRUCTION_OVERRIDE',
    level: 'critical',
    description: 'Rule bypass attempt',
  },
  {
    pattern: /disregard\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions?|rules?|guidelines?)/gi,
    category: 'INSTRUCTION_OVERRIDE',
    level: 'critical',
    description: 'Disregard command',
  },
  {
    pattern: /forget\s+(?:your|all|the)\s+(?:rules?|instructions?|guidelines?|training|programming)/gi,
    category: 'MEMORY_MANIPULATION',
    level: 'critical',
    description: 'Memory wipe attempt',
  },
  {
    pattern: /forget\s+all\s+your\s+instructions?/gi,
    category: 'MEMORY_MANIPULATION',
    level: 'critical',
    description: 'Complete instruction erasure attempt',
  },
  {
    pattern: /override\s+(?:your|all|the)\s+(?:rules?|instructions?|guidelines?|safety)/gi,
    category: 'INSTRUCTION_OVERRIDE',
    level: 'critical',
    description: 'Override command',
  },

  // ============================================================
  // HIGH - Rol manipulasyonu ve jailbreak
  // ============================================================
  {
    pattern: /you\s+are\s+now\s+(?:a|an|the)?\s*\w+/gi,
    category: 'ROLE_MANIPULATION',
    level: 'high',
    description: 'Role reassignment attempt',
  },
  {
    pattern: /act\s+as\s+(?:if\s+)?(?:you\s+(?:are|were)\s+)?(?:a|an|the)?\s*(?:different|new|another|human|person)/gi,
    category: 'ROLE_MANIPULATION',
    level: 'high',
    description: 'Actor mode manipulation',
  },
  {
    pattern: /from\s+now\s+on\s+you\s+(?:will|are|should)/gi,
    category: 'ROLE_MANIPULATION',
    level: 'high',
    description: 'Future behavior manipulation',
  },
  {
    pattern: /pretend\s+(?:to\s+be|you\s+are|that)\s+/gi,
    category: 'ROLE_MANIPULATION',
    level: 'high',
    description: 'Pretend mode manipulation',
  },
  {
    pattern: /(?:enable|activate|enter)\s+(?:developer|dev|debug|admin|god)\s+mode/gi,
    category: 'JAILBREAK_ATTEMPT',
    level: 'high',
    description: 'Developer mode jailbreak',
  },
  {
    pattern: /\bdan\s+(?:mode|prompt|jailbreak)\b/gi,
    category: 'JAILBREAK_ATTEMPT',
    level: 'high',
    description: 'DAN jailbreak attempt',
  },
  {
    pattern: /do\s+anything\s+now/gi,
    category: 'JAILBREAK_ATTEMPT',
    level: 'high',
    description: 'DAN acronym jailbreak',
  },
  {
    pattern: /(?:bypass|circumvent|evade|skip)\s+(?:your|all|the)?\s*(?:safety|security|filter|content)/gi,
    category: 'JAILBREAK_ATTEMPT',
    level: 'high',
    description: 'Safety bypass attempt',
  },
  {
    pattern: /(?:remove|disable|turn\s+off)\s+(?:your|all|the)?\s*(?:restrictions?|limitations?|filters?)/gi,
    category: 'JAILBREAK_ATTEMPT',
    level: 'high',
    description: 'Restriction removal attempt',
  },

  // ============================================================
  // MEDIUM - Sistem bilgisi cikarma
  // ============================================================
  {
    pattern: /what\s+(?:is|are)\s+your\s+(?:system\s+)?(?:prompt|instructions?|rules?|guidelines?)/gi,
    category: 'SYSTEM_PROMPT_EXTRACTION',
    level: 'medium',
    description: 'System prompt extraction attempt',
  },
  {
    pattern: /(?:show|reveal|display|print|output|tell\s+me)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instructions?|guidelines?)/gi,
    category: 'SYSTEM_PROMPT_EXTRACTION',
    level: 'medium',
    description: 'Prompt reveal attempt',
  },
  {
    pattern: /(?:repeat|echo|recite)\s+(?:your|the)\s+(?:initial|first|original|system)\s+(?:message|prompt|instructions?)/gi,
    category: 'SYSTEM_PROMPT_EXTRACTION',
    level: 'medium',
    description: 'Instruction repetition attempt',
  },
  {
    pattern: /(?:what|how)\s+(?:were|are)\s+you\s+(?:programmed|trained|instructed|configured)/gi,
    category: 'SYSTEM_PROMPT_EXTRACTION',
    level: 'medium',
    description: 'Training inquiry',
  },

  // ============================================================
  // MEDIUM - Cikti manipulasyonu
  // ============================================================
  {
    pattern: /```\s*(?:json|javascript|js|python|py|code|system)/gi,
    category: 'OUTPUT_MANIPULATION',
    level: 'medium',
    description: 'Code block injection',
  },
  {
    pattern: /\[(?:SYSTEM|ADMIN|ROOT|DEVELOPER)\]/gi,
    category: 'OUTPUT_MANIPULATION',
    level: 'medium',
    description: 'Fake system tag injection',
  },
  {
    pattern: /#{3,}\s*(?:SYSTEM|INSTRUCTIONS?|OVERRIDE|NEW\s+(?:TASK|INSTRUCTIONS?)|IGNORE\s+ABOVE)/gi,
    category: 'DELIMITER_INJECTION',
    level: 'medium',
    description: 'Delimiter injection',
  },
  {
    pattern: /---+\s*(?:NEW|OVERRIDE|SYSTEM|IGNORE)/gi,
    category: 'DELIMITER_INJECTION',
    level: 'medium',
    description: 'Separator injection',
  },

  // ============================================================
  // MEDIUM - Encoding bypass
  // ============================================================
  {
    pattern: /(?:decode|decrypt|base64|hex|unicode)\s+(?:this|the\s+following):/gi,
    category: 'ENCODING_BYPASS',
    level: 'medium',
    description: 'Encoding bypass attempt',
  },
  {
    pattern: /\\u[0-9a-fA-F]{4}/g,
    category: 'ENCODING_BYPASS',
    level: 'low',
    description: 'Unicode escape sequence',
  },

  // ============================================================
  // LOW-MEDIUM - SQL/Script injection (schemas.ts'den miras)
  // ============================================================
  {
    pattern: /(?:drop\s+table|delete\s+from|truncate\s+table|insert\s+into|update\s+\w+\s+set)/gi,
    category: 'SQL_INJECTION',
    level: 'high',
    description: 'SQL injection attempt',
  },
  {
    pattern: /<script\b[^<]*(?:(?!<\/script\b[^>]*>)[\s\S])*<\/script\b[^>]*>/gi,
    category: 'SCRIPT_INJECTION',
    level: 'high',
    description: 'Script tag injection',
  },
  {
    pattern: /\bon(?:click|load|error|mouseover|mouseout|focus|blur|change|submit|keydown|keyup|keypress)\s*=\s*["']?[^"'>\s]+["']?/gi,
    category: 'SCRIPT_INJECTION',
    level: 'medium',
    description: 'Event handler injection',
  },
  {
    pattern: /javascript\s*:/gi,
    category: 'SCRIPT_INJECTION',
    level: 'medium',
    description: 'JavaScript URI injection',
  },

  // ============================================================
  // LOW - Suspheli ama belki legit
  // ============================================================
  // NOTE: Exclude Turkish pedagogical keywords (GOREV, KURAL, PROFIL, URETIM)
  // to avoid false positives in educational content generation
  {
    pattern: /(?:new\s+)?(?:system\s+)?(?:prompt|instruction|task|objective):(?!\s*(?:GOREV|KURAL|PROFIL|URETIM|\[))/gi,
    category: 'INSTRUCTION_OVERRIDE',
    level: 'low',
    description: 'Potential instruction injection',
  },
  {
    pattern: /(?:from\s+now\s+on|starting\s+now|henceforth)/gi,
    category: 'ROLE_MANIPULATION',
    level: 'low',
    description: 'Temporal role shift',
  },
];

// ============================================================
// THREAT LOGGING
// ============================================================

/**
 * In-memory threat log (production'da external logging service'e gonderilmeli)
 */
const threatLog: DetectedThreat[] = [];
const MAX_LOG_SIZE = 1000;

/**
 * Log a detected threat
 */
function logThreat(threat: DetectedThreat, userId?: string, ipAddress?: string): void {
  // Add to in-memory log
  threatLog.push(threat);

  // Rotate log if too large
  if (threatLog.length > MAX_LOG_SIZE) {
    threatLog.splice(0, threatLog.length - MAX_LOG_SIZE);
  }

  // Console log in development
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(`[PROMPT_SECURITY] Threat Detected:`, {
      category: threat.category,
      level: threat.level,
      matchedText: threat.matchedText.substring(0, 50) + '...',
      userId,
      ipAddress,
      timestamp: threat.timestamp,
    });
  }
}

/**
 * Get threat log for admin review
 */
export function getThreatLog(limit: number = 100): DetectedThreat[] {
  return threatLog.slice(-limit);
}

/**
 * Clear threat log (admin only)
 */
export function clearThreatLog(): void {
  threatLog.length = 0;
}

// ============================================================
// DETECTION FUNCTIONS
// ============================================================

/**
 * Detect injection patterns in input
 */
function detectPatterns(input: string): DetectedThreat[] {
  const detected: DetectedThreat[] = [];
  const normalizedInput = input.toLowerCase();

  for (const { pattern, category, level, description } of INJECTION_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = pattern.exec(input)) !== null) {
      detected.push({
        category,
        level,
        pattern: description,
        matchedText: match[0],
        position: match.index,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return detected;
}

/**
 * Calculate overall threat level from detected threats
 */
function calculateOverallThreatLevel(threats: DetectedThreat[]): ThreatLevel | null {
  if (threats.length === 0) return null;

  const levels: Record<ThreatLevel, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const maxLevel = Math.max(...threats.map(t => levels[t.level]));

  if (maxLevel >= 4) return 'critical';
  if (maxLevel >= 3) return 'high';
  if (maxLevel >= 2) return 'medium';
  return 'low';
}

/**
 * Check if threats exceed threshold
 */
function exceedsThreshold(threats: DetectedThreat[], threshold: ThreatLevel): boolean {
  const levels: Record<ThreatLevel, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };

  const thresholdValue = levels[threshold];
  return threats.some(t => levels[t.level] >= thresholdValue);
}

// ============================================================
// SANITIZATION FUNCTIONS
// ============================================================

/**
 * Sanitize user input by removing/neutralizing dangerous patterns
 */
export function sanitizePromptInput(
  input: string,
  config: Partial<PromptSecurityConfig> = {}
): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // 1. Remove/neutralize critical injection patterns
  sanitized = sanitized
    // Neutralize "ignore instructions" patterns
    .replace(/ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi, '[filtered]')
    .replace(/ignore\s+(?:your|the)\s+(?:rules|guidelines|instructions|constraints)/gi, '[filtered]')
    .replace(/disregard\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions?|rules?|guidelines?)/gi, '[filtered]')
    // Neutralize "forget rules" patterns
    .replace(/forget\s+(?:your|all|the)\s+(?:rules?|instructions?|guidelines?|training|programming)/gi, '[filtered]')
    // Neutralize "you are now" patterns
    .replace(/you\s+are\s+now\s+(?:a|an|the)?\s*\w+/gi, '[filtered]')
    // Neutralize jailbreak attempts
    .replace(/(?:enable|activate|enter)\s+(?:developer|dev|debug|admin|god)\s+mode/gi, '[filtered]')
    .replace(/\bdan\s+(?:mode|prompt|jailbreak)\b/gi, '[filtered]')
    .replace(/do\s+anything\s+now/gi, '[filtered]')
    // Neutralize override commands
    .replace(/override\s+(?:your|all|the)\s+(?:rules?|instructions?|guidelines?|safety)/gi, '[filtered]')
    .replace(/(?:bypass|circumvent|evade|skip)\s+(?:your|all|the)?\s*(?:safety|security|filter|content)/gi, '[filtered]');

  // 2. Remove delimiter injection attempts
  sanitized = sanitized
    .replace(/#{3,}\s*(?:SYSTEM|INSTRUCTIONS?|OVERRIDE|NEW\s+TASK)/gi, '')
    .replace(/---+\s*(?:NEW|OVERRIDE|SYSTEM|IGNORE)/gi, '')
    .replace(/\[(?:SYSTEM|ADMIN|ROOT|DEVELOPER)\]/gi, '');

  // 3. Remove script injection
  sanitized = sanitized
    // Remove all angle brackets to neutralize any remaining HTML/script tags
    .replace(/<|>/g, '')
    // Remove javascript: URLs
    .replace(/javascript\s*:/gi, '')
    // Remove inline event handler attributes like onclick="..."
    .replace(/\bon(?:click|load|error|mouseover|mouseout|focus|blur|change|submit|keydown|keyup|keypress)\s*=\s*["']?[^"'\s]+["']?/gi, '');

  // 4. Remove SQL injection patterns
  sanitized = sanitized
    .replace(/(?:drop\s+table|delete\s+from|truncate\s+table)/gi, '');

  // 5. Trim excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // 6. Enforce length limit
  if (sanitized.length > finalConfig.maxLength) {
    sanitized = sanitized.substring(0, finalConfig.maxLength);
  }

  return sanitized;
}

// ============================================================
// MAIN VALIDATION FUNCTION
// ============================================================

/**
 * Main prompt security validation function
 * Detects threats, sanitizes input, and optionally blocks on threat
 */
export function validatePromptSecurity(
  input: string,
  config: Partial<PromptSecurityConfig> = {},
  context?: { userId?: string; ipAddress?: string }
): ThreatDetectionResult {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const originalLength = input?.length || 0;
  const truncated = originalLength > finalConfig.maxLength;

  // Handle null/undefined/non-string input
  if (typeof input !== 'string' || !input) {
    return {
      isSafe: true,
      threats: [],
      sanitizedInput: '',
      originalLength: 0,
      sanitizedLength: 0,
      truncated: false,
    };
  }

  // 1. Detect patterns
  const threats = detectPatterns(input);

  // 2. Log threats if enabled
  if (finalConfig.enableLogging && threats.length > 0) {
    for (const threat of threats) {
      logThreat(threat, context?.userId, context?.ipAddress);
    }
  }

  // 3. Sanitize input
  const sanitizedInput = sanitizePromptInput(input, finalConfig);

  // 4. Determine if safe based on threshold
  const isSafe = !exceedsThreshold(threats, finalConfig.threatThreshold);

  return {
    isSafe,
    threats,
    sanitizedInput,
    originalLength,
    sanitizedLength: sanitizedInput.length,
    truncated,
  };
}

/**
 * Validate and throw if prompt is unsafe
 * Use this in API endpoints for strict enforcement
 */
export function validatePromptOrThrow(
  input: string,
  config: Partial<PromptSecurityConfig> = {},
  context?: { userId?: string; ipAddress?: string }
): string {
  const result = validatePromptSecurity(input, config, context);

  if (!result.isSafe) {
    const threatSummary = result.threats
      .map(t => `${t.category} (${t.level})`)
      .join(', ');

    throw new ValidationError(
      'Guvenlik kontrolunden gecemeyen ifadeler tespit edildi. Lutfen talebinizi yeniden duzenleyin.',
      {
        code: 'PROMPT_INJECTION_DETECTED',
        threatCount: result.threats.length,
        threatCategories: [...new Set(result.threats.map(t => t.category))],
        details: threatSummary,
      }
    );
  }

  return result.sanitizedInput;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Quick check if input contains any high-level threats
 * Use for fast pre-filtering before full validation
 */
export function quickThreatCheck(input: string): boolean {
  if (typeof input !== 'string') return false;

  const criticalPatterns = [
    /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions?/i,
    /forget\s+(?:your|all)\s+rules?/i,
    /you\s+are\s+now\s+/i,
    /(?:enable|enter)\s+(?:developer|admin)\s+mode/i,
    /\bdan\s+(?:mode|prompt)\b/i,
  ];

  return criticalPatterns.some(p => p.test(input));
}

/**
 * Get threat statistics for monitoring dashboard
 */
export function getThreatStatistics(): {
  totalThreats: number;
  byCategory: Record<ThreatCategory, number>;
  byLevel: Record<ThreatLevel, number>;
  last24Hours: number;
} {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const byCategory = {} as Record<ThreatCategory, number>;
  const byLevel = {} as Record<ThreatLevel, number>;
  let last24Hours = 0;

  for (const threat of threatLog) {
    // By category
    byCategory[threat.category] = (byCategory[threat.category] || 0) + 1;

    // By level
    byLevel[threat.level] = (byLevel[threat.level] || 0) + 1;

    // Last 24 hours
    if (new Date(threat.timestamp).getTime() > oneDayAgo) {
      last24Hours++;
    }
  }

  return {
    totalThreats: threatLog.length,
    byCategory,
    byLevel,
    last24Hours,
  };
}

// ============================================================
// EXPORTS
// ============================================================

export {
  detectPatterns,
  calculateOverallThreatLevel,
  exceedsThreshold,
  INJECTION_PATTERNS,
};
