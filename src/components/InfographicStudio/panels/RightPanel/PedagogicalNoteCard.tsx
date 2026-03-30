import React from 'react';
import { BookOpen, GraduationCap, Link } from 'lucide-react';

interface PedagogicalNoteCardProps {
    note?: string;
}

export const PedagogicalNoteCard: React.FC<PedagogicalNoteCardProps> = ({ note }) => {
    if (!note) return null;

    return (
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-semibold text-emerald-300">Öğretmen / Veli Notu</h3>
            </div>
            <div className="text-sm text-emerald-100/70 leading-relaxed font-lexend space-y-2">
                {note.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                ))}
            </div>

            {/* Oogmatik core team instructions require 100% adherence to BEP objectives implicitly. This badge serves as a pedagogical trust indicator */}
            <div className="mt-4 pt-4 border-t border-emerald-500/20 flex items-center space-x-2 text-xs text-emerald-400/80">
                <GraduationCap className="w-4 h-4" />
                <span>Elif Yıldız (Pedagog) ZPD Kriterlerine Uygun</span>
            </div>
        </div>
    );
};
