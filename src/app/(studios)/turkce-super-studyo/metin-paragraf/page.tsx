'use client';
import React, { useState } from 'react';
import { TextPassage } from '../../../../modules/turkce-super-studyo/components/organisms/TextPassage';
import { MCQQuestion } from '../../../../modules/turkce-super-studyo/components/organisms/questions/MCQQuestion';
import { BookOpen, Sparkles, RefreshCw } from 'lucide-react';

export default function MetinParagrafPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock veri - Gerçek uygulamada AI servisi üzerinden gelecek
    const mockPassage = {
        title: 'Gümüş Kanatlı Güvercin',
        content: 'Bir zamanlar gökyüzünün en yükseklerinde süzülen, kanatları gün ışığında gümüş gibi parlayan bir güvercin varmış. Bu güvercin, sadece bulutların ötesindeki bahçeleri bilirmiş. Bir gün yere inmeye karar vermiş ve küçük bir çocuğun penceresine konmuş.',
        assets: {
            audioUrl: '/mock-audio.mp3'
        }
    };

    const mockQuestions = [
        {
            id: 'q1',
            question: 'Güvercinin kanatları neye benziyormuş?',
            options: ['Altın', 'Gümüş', 'Bronz', 'Elmas'],
            correctAnswer: 'Gümüş',
            explanation: 'Metinde kanatlarının gümüş gibi parladığı belirtilmiştir.'
        },
        {
            id: 'q2',
            question: 'Güvercin nereye konmuş?',
            options: ['Ağaç dalına', 'Çocuğun penceresine', 'Çatıya', 'Parka'],
            correctAnswer: 'Çocuğun penceresine',
            explanation: 'Metnin sonunda güvercinin çocuğun penceresine konduğu yazmaktadır.'
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
                                question={q.question}
                                options={q.options}
                                correctAnswer={q.correctAnswer}
                                explanation={q.explanation}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
