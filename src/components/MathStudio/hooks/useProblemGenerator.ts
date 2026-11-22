// Math Studio — AI Problem Generator Hook with Robust Offline Fallback

import { useState, useCallback } from 'react';
import { MathProblemConfig, MathProblem } from '../../../types/math';
import { generateMathProblemsAI, generateOfflineMathStudioProblems } from '../../../services/generators/mathStudio';
import { DEFAULT_PROBLEM_CONFIG } from '../constants';
import { calculateItemsPerPage } from '../utils';

import { logError } from '../../../utils/logger.js';

export const useProblemGenerator = (initialStudentName: string, pageMargin: number = 38) => {
    const [problemConfig, setProblemConfig] = useState<MathProblemConfig>({
        ...DEFAULT_PROBLEM_CONFIG,
        studentName: initialStudentName || '',
    });
    const [generatedProblems, setGeneratedProblems] = useState<MathProblem[]>([]);
    const [instruction, setInstruction] = useState<string>('');
    const [pedagogicalNote, setPedagogicalNote] = useState<string>('');
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
            // If autoFillPage is ON, dynamically calculate the count based on A4 capacity
            const effectiveCount = problemConfig.autoFillPage
                ? calculateItemsPerPage(problemConfig, pageMargin)
                : problemConfig.count;

            const finalConfig = { ...problemConfig, count: effectiveCount };

            const result = await generateMathProblemsAI(finalConfig) as { problems?: MathProblem[]; instruction?: string; pedagogicalNote?: string };
            
            const rawProblems = (result && result.problems && result.problems.length > 0)
                ? result.problems
                : generateOfflineMathStudioProblems(finalConfig).problems;

            const mapped: MathProblem[] = rawProblems.map((p, i) => ({
                id: `p-${Date.now()}-${i}`,
                text: p.text || "Soru metni yüklenemedi.",
                answer: p.answer || "?",
                operationHint: p.operationHint,
                type: p.type || 'standard',
                imagePrompt: p.imagePrompt,
                svgCode: p.svgCode,
                options: p.options || [],
                steps: p.steps || [],
            }));

            setGeneratedProblems(mapped);
            setInstruction(result?.instruction || generateOfflineMathStudioProblems(finalConfig).instruction);
            setPedagogicalNote(result?.pedagogicalNote || generateOfflineMathStudioProblems(finalConfig).pedagogicalNote);
            return { success: true };
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            // Seamless offline recovery: never let the student encounter a blank page
            const fallback = generateOfflineMathStudioProblems(problemConfig);
            setGeneratedProblems(fallback.problems);
            setInstruction(fallback.instruction);
            setPedagogicalNote(fallback.pedagogicalNote);
            return { success: true };
        } finally {
            setIsGenerating(false);
        }
    }, [problemConfig, pageMargin]);

    return {
        problemConfig,
        setProblemConfig,
        generatedProblems,
        setGeneratedProblems,
        instruction,
        setInstruction,
        pedagogicalNote,
        setPedagogicalNote,
        isGenerating,
        toggleProblemOp,
        toggleProblemType,
        handleGenerateProblems,
    };
};
