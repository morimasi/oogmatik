import React from 'react';
import { Question } from '../../../types/schemas';
import { MCQQuestion } from './MCQQuestion';
import { DragDropQuestion } from './DragDropQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { OpenEndedQuestion } from './OpenEndedQuestion';
import { FillBlankQuestion } from './FillBlankQuestion';
import { SpellingCorrectQuestion } from './SpellingCorrectQuestion';

interface QuestionRendererProps {
    question: Question;
    onAnswer: (isCorrect: boolean) => void;
}

/**
 * Evrensel Soru Renderer — tüm soru tiplerini otomatik doğru bileşenle açar.
 * Her bileşenin farklı onAnswer signature'ı normalize edilerek (isCorrect: boolean) olarak döndürülür.
 */
export function QuestionRenderer({ question, onAnswer }: QuestionRendererProps) {
    switch (question.type) {
        case 'MCQ':
            // MCQQuestion: onAnswer(isCorrect: boolean, selectedOptionId: string)
            return (
                <MCQQuestion
                    question={question as any}
                    onAnswer={(isCorrect: boolean) => onAnswer(isCorrect)}
                />
            );

        case 'DRAG_DROP':
            // DragDropQuestion: onAnswer(isCorrect: boolean, orderedIds?: string[])
            return (
                <DragDropQuestion
                    question={question as any}
                    onAnswer={(isCorrect: boolean) => onAnswer(isCorrect)}
                />
            );

        case 'TRUE_FALSE':
            return (
                <TrueFalseQuestion
                    question={question as any}
                    onAnswer={(isCorrect: boolean) => onAnswer(isCorrect)}
                />
            );

        case 'OPEN_ENDED':
            // OpenEndedQuestion.onAnswer signature: (answer: string) => void
            // Açık uçlu sorularda gönderim "doğru" kabul edilir (pedagojik)
            return (
                <OpenEndedQuestion
                    question={question as any}
                    onAnswer={(answer: string) => onAnswer(answer.trim().length > 0)}
                />
            );


        case 'FILL_BLANK':
            // FillBlankQuestion: onAnswer(isCorrect: boolean, answers: Record<string,string>)
            return (
                <FillBlankQuestion
                    question={question as any}
                    onAnswer={(isCorrect: boolean) => onAnswer(isCorrect)}
                />
            );

        case 'SPELLING_CORRECT':
            return (
                <SpellingCorrectQuestion
                    question={question as any}
                    onAnswer={(isCorrect: boolean) => onAnswer(isCorrect)}
                />
            );

        default:
            return (
                <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-2xl text-amber-800 font-bold">
                    ⚠️ Desteklenmeyen soru tipi: {(question as any).type}
                </div>
            );
    }
}
