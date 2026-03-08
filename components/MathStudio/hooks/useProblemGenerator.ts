// Math Studio — AI Problem Generator Hook

import { useState, useCallback } from 'react';
import { MathProblemConfig, MathProblem } from '../../../types/math';
import { generateMathProblemsAI } from '../../../services/generators/mathStudio';
import { DEFAULT_PROBLEM_CONFIG } from '../constants';

export const useProblemGenerator = (initialStudentName: string) => {
    const [problemConfig, setProblemConfig] = useState<MathProblemConfig>({
        ...DEFAULT_PROBLEM_CONFIG,
        studentName: initialStudentName || '',
    });
    const [generatedProblems, setGeneratedProblems] = useState<MathProblem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const toggleProblemOp = useCallback((op: string) => {
        setProblemConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
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
                steps: p.steps || [],
            }));
            setGeneratedProblems(mapped);
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: "Problem üretilemedi. API Hatası." };
        } finally {
            setIsGenerating(false);
        }
    }, [problemConfig]);

    return {
        problemConfig,
        setProblemConfig,
        generatedProblems,
        isGenerating,
        toggleProblemOp,
        handleGenerateProblems,
    };
};
