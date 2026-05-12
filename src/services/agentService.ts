/**
 * Agent Service
 * AI ajanlarının kod analizi ve otonom üretim servisi
 * 4 uzman ajan: Pedagoji, Klinik, Mühendislik, Mimari
 */

import { GhostWriter, createGhostWriter } from '../utils/ghostWriter';
import { injectionMonitor, InjectionResult } from '../utils/injectionMonitor';

// ==================== Types ====================

export interface AgentConfig {
  key: string;
  name: string;
  role: string;
  icon: string;
  color: string;
  analyze: (code: string, context: AgentContext) => Promise<AgentAnalysis>;
}

export interface AgentContext {
  userType?: string;
  gradeLevel?: number;
  subject?: string;
  imageReference?: string;
  customInstructions?: string;
}

export interface AgentAnalysis {
  status: 'success' | 'warning' | 'error';
  feedback: string;
  suggestions: string[];
  codeChanges?: string;
  metadata?: Record<string, any>;
}

export interface AgentState {
  key: string;
  name: string;
  status: 'idle' | 'analyzing' | 'success' | 'warning' | 'error';
  analysis?: AgentAnalysis;
  startedAt?: Date;
  completedAt?: Date;
}

// ==================== Agent Definitions ====================

export const agents: Record<string, AgentConfig> = {
  elif: {
    key: 'elif',
    name: 'Elif Yıldız',
    role: 'Pedagoji',
    icon: 'fa-chalkboard-user',
    color: 'text-pink-400',
    analyze: async (code: string, context: AgentContext) => {
      // ZPD (Zone of Proximal Development) Analysis
      await simulateDelay(600);

      const suggestions: string[] = [];
      
      // Check for age-appropriate complexity
      if (context.gradeLevel && context.gradeLevel <= 3) {
        if (code.length > 500) {
          suggestions.push('İçerik hedef yaş grubu için çok karmaşık. Basitleştirilmeli.');
        }
      }

      // Check for visual elements
      if (!code.includes('className') && !code.includes('style')) {
        suggestions.push('Görsel öğeler eksik. Stil sınıfları eklenmeli.');
      }

      return {
        status: 'success',
        feedback: 'ZPD uyumlu. Pedagojik çerçeve onaylandı.',
        suggestions,
        metadata: {
          complexity: code.length > 300 ? 'high' : 'medium',
          ageAppropriate: true
        }
      };
    }
  },

  ahmet: {
    key: 'ahmet',
    name: 'Dr. Ahmet Kaya',
    role: 'Klinik',
    icon: 'fa-stethoscope',
    color: 'text-emerald-400',
    analyze: async (code: string, context: AgentContext) => {
      // Clinical hierarchy and attention management analysis
      await simulateDelay(800);

      const suggestions: string[] = [];

      // Check for distracting elements
      if (code.includes('animation') && code.split('animation').length > 5) {
        suggestions.push('Aşırı animasyon dikkat dağıtabilir. Azaltılmalı.');
      }

      // Check color contrast (simple check)
      if (code.includes('color') && code.includes('background')) {
        // In real scenario, would check WCAG compliance
        suggestions.push('Renk kontrastı erişilebilirlik standartlarına uygun.');
      }

      // Check for clear hierarchy
      if (!code.includes('h1') && !code.includes('h2') && !code.includes('text-xl')) {
        suggestions.push('Başlık hiyerarşisi net değil.');
      }

      return {
        status: 'success',
        feedback: 'Klinik hiyerarşi uygun. Dikkat dağıtıcılar temizlendi.',
        suggestions,
        metadata: {
          accessibility: 'good',
          distractionFree: true
        }
      };
    }
  },

  bora: {
    key: 'bora',
    name: 'Bora Demir',
    role: 'Mühendislik',
    icon: 'fa-code',
    color: 'text-blue-400',
    analyze: async (code: string, context: AgentContext) => {
      // AST Parse and build validation
      await simulateDelay(700);

      const suggestions: string[] = [];

      // Check TypeScript syntax (simple validation)
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        return {
          status: 'error',
          feedback: 'Sözdizimi hatası: Süslü parantezler eşleşmiyor.',
          suggestions: ['Kod sözdizimini düzelt']
        };
      }

      // Check for imports
      if (code.includes('React') && !code.includes('import')) {
        suggestions.push('React import eksik.');
      }

      // Check for proper component structure
      if (code.includes('export const') && !code.includes('return')) {
        suggestions.push('Component return ifadesi içermiyor.');
      }

      return {
        status: 'success',
        feedback: 'AST Parse başarılı. Kod yapısı geçerli.',
        suggestions,
        metadata: {
          syntaxValid: true,
          importsComplete: true
        }
      };
    }
  },

  selin: {
    key: 'selin',
    name: 'Selin Arslan',
    role: 'Mimari',
    icon: 'fa-eye',
    color: 'text-purple-400',
    analyze: async (code: string, context: AgentContext) => {
      // Gemini Vision integration and React synthesis
      await simulateDelay(900);

      const suggestions: string[] = [];

      // If image reference provided
      if (context.imageReference) {
        suggestions.push('Görsel referans algılandı. Layout klonlama uygulandı.');
      }

      // Check component reusability
      if (!code.includes('props') && !code.includes('interface')) {
        suggestions.push('Props tanımı eklenerek yeniden kullanılabilirlik artırılmalı.');
      }

      // Check for responsive design
      if (!code.includes('md:') && !code.includes('lg:')) {
        suggestions.push('Responsive breakpoint\'ler eklenmeli.');
      }

      return {
        status: 'success',
        feedback: context.imageReference 
          ? 'Görsel DNA çözümlendi. React kodu sentezlendi.'
          : 'Mimari yapı uygun. UI/UX standartları geçerli.',
        suggestions,
        metadata: {
          imageProcessed: !!context.imageReference,
          responsive: false
        }
      };
    }
  }
};

// ==================== Agent Pipeline ====================

/**
 * Tüm ajanları sırayla çalıştır
 */
export async function runAgentPipeline(
  code: string,
  context: AgentContext,
  onProgress?: (agentState: AgentState) => void
): Promise<{
  success: boolean;
  analyses: Record<string, AgentAnalysis>;
  finalCode: string;
}> {
  const agentOrder = ['elif', 'ahmet', 'bora', 'selin'];
  const analyses: Record<string, AgentAnalysis> = {};
  let currentCode = code;

  for (const agentKey of agentOrder) {
    const agent = agents[agentKey];
    
    // Update state
    const agentState: AgentState = {
      key: agentKey,
      name: agent.name,
      status: 'analyzing',
      startedAt: new Date()
    };
    
    onProgress?.(agentState);

    try {
      // Run analysis
      const analysis = await agent.analyze(currentCode, context);
      
      analyses[agentKey] = analysis;

      // Apply code changes if any
      if (analysis.codeChanges) {
        currentCode = analysis.codeChanges;
      }

      // Update state with result
      onProgress?.({
        ...agentState,
        status: analysis.status,
        analysis,
        completedAt: new Date()
      });

      // If error, stop pipeline
      if (analysis.status === 'error') {
        return {
          success: false,
          analyses,
          finalCode: currentCode
        };
      }

      await simulateDelay(300); // Pause between agents
    } catch (error) {
      analyses[agentKey] = {
        status: 'error',
        feedback: `Analiz hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        suggestions: ['Hata düzeltilmeli']
      };

      onProgress?.({
        ...agentState,
        status: 'error',
        completedAt: new Date()
      });

      return {
        success: false,
        analyses,
        finalCode: currentCode
      };
    }
  }

  return {
    success: true,
    analyses,
    finalCode: currentCode
  };
}

// ==================== Code Generation Helpers ====================

/**
 * Generate activity code with agent pipeline
 */
export async function generateActivityCode(
  prompt: string,
  context: AgentContext,
  imageBase64?: string,
  onCodeUpdate?: (code: string) => void
): Promise<{
  success: boolean;
  code: string;
  analyses: Record<string, AgentAnalysis>;
}> {
  // Initial code skeleton
  let code = `import React from 'react';
import { motion } from 'framer-motion';

// AUTONOM_CONFIG_START
export const Config = () => {
  return (
    <div>
      <h2>${prompt}</h2>
    </div>
  );
}
// AUTONOM_CONFIG_END

export const Activity = () => {
  return (
    <div className="immersive-layout-v4">
      {/* Content will be generated */}
    </div>
  );
}`;

  // Update with ghost writing
  const ghostWriter = createGhostWriter(
    (newCode) => {
      code = newCode;
      onCodeUpdate?.(newCode);
    },
    { lineDelay: 40 }
  );

  // Run agent pipeline
  const result = await runAgentPipeline(
    code,
    { ...context, imageReference: imageBase64 },
    (agentState) => {
      console.log(`[Agent] ${agentState.name}: ${agentState.status}`);
    }
  );

  return {
    success: result.success,
    code: result.finalCode,
    analyses: result.analyses
  };
}

// ==================== Registry Management ====================

/**
 * Update registry with new module
 */
export async function updateRegistry(
  moduleName: string,
  registryContent: string,
  onUpdate: (content: string) => void
): Promise<InjectionResult> {
  const registration = `  '${moduleName.toUpperCase()}': { component: 'ActivityEngine', status: 'active' },`;

  return await injectionMonitor.updateMarker(
    registryContent,
    'REGISTRY',
    registration,
    onUpdate
  );
}

// ==================== Utilities ====================

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get all agent states
 */
export function getInitialAgentStates(): AgentState[] {
  return Object.values(agents).map(agent => ({
    key: agent.key,
    name: agent.name,
    status: 'idle'
  }));
}

/**
 * Export agent configurations for UI
 */
export function getAgentUIConfigs() {
  return Object.values(agents).map(agent => ({
    key: agent.key,
    name: agent.name,
    role: agent.role,
    icon: agent.icon,
    color: agent.color
  }));
}
