'use client';
import React, { useState } from 'react';
import { TextPassage } from '../../../../modules/turkce-super-studyo/components/organisms/TextPassage';
import { MCQQuestion } from '../../../../modules/turkce-super-studyo/components/organisms/questions/MCQQuestion';
import { BookOpen, Sparkles, RefreshCw } from 'lucide-react';
import { TextPassage as TextPassageType, MCQQuestion as MCQQuestionType } from '../../../../modules/turkce-super-studyo/types/schemas';

export default function MetinParagrafPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    const mockPassage: TextPassageType = {
        id: 'tp1',
        title: 'Gümüş Kanatlı Güvercin',
        content: 'Bir zamanlar gökyüzünün en yükseklerinde süzülen, kanatları gün ışığında gümüş gibi parlayan bir güvercin varmış. Bu güvercin, sadece bulutların ötesindeki bahçeleri bilirmiş. Bir gün yere inmeye karar vermiş ve küçük bir çocuğun penceresine konmuş.',
        metadata: {
            gradeLevel: 2,
            difficulty: 'KOLAY',
            theme: 'HIKAYE',
            wordCount: 42,
            readabilityScore: 85,
            estimatedReadingTimeMs: 60000
        },
        learningOutcomes: ['T.2.3.1'],
        assets: {
            audioUrl: 'https://oogmatik.com/mock-audio.mp3'
        }
    };

    const mockQuestions: MCQQuestionType[] = [
        {
            id: 'q1',
            textId: 'tp1',
            type: 'MCQ',
            instruction: 'Güvercinin kanatları neye benziyormuş?',
            difficulty: 'KOLAY',
            targetSkill: 'ANA_FIKIR',
            learningOutcomes: ['T.2.3.1.1'],
            feedback: {
                correct: 'Harika! Doğru cevap.',
                incorrect: 'Metni tekrar okuyalım. Kanatları ne gibi parlıyordu?'
            },
            options: [
                { id: 'o1', text: 'Altın', isCorrect: false },
                { id: 'o2', text: 'Gümüş', isCorrect: true },
                { id: 'o3', text: 'Bronz', isCorrect: false },
                { id: 'o4', text: 'Elmas', isCorrect: false }
            ]
        },
        {
            id: 'q2',
            textId: 'tp1',
            type: 'MCQ',
            instruction: 'Güvercin nereye konmuş?',
            difficulty: 'KOLAY',
            targetSkill: 'SEBEP_SONUC',
            learningOutcomes: ['T.2.3.1.2'],
            feedback: {
                correct: 'Tebrikler!',
                incorrect: 'Metnin son cümlesini tekrar kontrol edebilirsin.'
            },
            options: [
                { id: 'o5', text: 'Ağaç dalına', isCorrect: false },
                { id: 'o6', text: 'Çocuğun penceresine', isCorrect: true },
                { id: 'o7', text: 'Çatıya', isCorrect: false },
                { id: 'o8', text: 'Parka', isCorrect: false }
            ]
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-indigo-600" />
                        Metin & Paragraf Stüdyosu
                    </h1>
                    <p className="text-gray-600 font-medium mt-1">
                        Yapay zeka ile kişiselleştirilmiş okuma metinleri ve anlama soruları.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => setIsGenerating(false), 1500);
                    }}
                    disabled={isGenerating}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-md disabled:opacity-50"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
                    Yeni Metin Üret
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <TextPassage passage={mockPassage} enableRuler={true} />

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Sparkles className="text-yellow-500" />
                        Anlama Soruları
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {mockQuestions.map((q) => (
                            <MCQQuestion
                                key={q.id}
                                question={q}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
