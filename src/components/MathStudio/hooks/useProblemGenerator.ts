// Math Studio — AI Problem Generator Hook

import { useState, useCallback } from 'react';
import { MathProblemConfig, MathProblem } from '../../../types/math';
import { generateMathProblemsAI } from '../../../services/generators/mathStudio';
import { DEFAULT_PROBLEM_CONFIG } from '../constants';

import { logInfo, logError, logWarn } from '../../../utils/logger.js';
export const useProblemGenerator = (initialStudentName: string) => {
    const [problemConfig, setProblemConfig] = useState<MathProblemConfig>({
        ...DEFAULT_PROBLEM_CONFIG,
        studentName: initialStudentName || '',
    });
    const [generatedProblems, setGeneratedProblems] = useState<MathProblem[]>([]);
    const [instruction, setInstruction] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleProblemOp = useCallback((op: string) => {
        setProblemConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
        });
    }, []);

    const toggleProblemType = useCallback((type: 'standard' | 'fill-in' | 'true-false' | 'comparison') => {
        setProblemConfig(prev => {
            const current = prev.problemTypes || [];
            const newTypes = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
            if (newTypes.length === 0) return prev; // En az 1 tip seçili kalmalı
            return { ...prev, problemTypes: newTypes };
        });
    }, []);

    const handleGenerateProblems = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        setIsGenerating(true);
        try {
            const result = await generateMathProblemsAI(problemConfig);
            const mapped = (result.problems || []).map((p: any, i: number) => ({
                id: `p-${Date.now()}-${i}`,
                text: p.text || "Soru metni yüklenemedi.",
                answer: p.answer || "?",
                operationHint: p.operationHint,
                type: p.type || 'standard',
                imagePrompt: p.imagePrompt,
                options: p.options || [],
                steps: p.steps || [],
            }));
            setGeneratedProblems(mapped);
            setInstruction(result.instruction || '');
            return { success: true };
        } catch (e) {
            logError(e);
            return { success: false, error: "Problem üretilemedi. API Hatası." };
        } finally {
            setIsGenerating(false);
        }
    }, [problemConfig]);

    return {
        problemConfig,
        setProblemConfig,
        generatedProblems,
        instruction,
        isGenerating,
        toggleProblemOp,
        toggleProblemType,
        handleGenerateProblems,
    };
};
