import React from 'react';

interface LetterMazeTestSheetProps {
    data: any;
    settings?: any;
}

export const LetterMazeTestSheet: React.FC<LetterMazeTestSheetProps> = ({ data }) => {
    if (!data?.grid || !data?.rows || !data?.cols) return null;

    return (
        <div className="flex flex-col h-full bg-white relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-4 bg-teal-500 rounded-t-3xl"></div>

            <div className="p-8 pb-4 relative z-10 flex items-center gap-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-2xl">
                    <i className="fa-solid fa-route"></i>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-['Lexend'] mb-1">
                        {data.title || 'Harf Labirenti Testi'}
                    </h2>
                    <p className="text-gray-500 text-sm font-['Lexend'] leading-relaxed">
                        {data.instruction || 'Hedef harfleri takip ederek çıkışı bulun!'}
                    </p>
                </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
                <div
                    className="grid gap-2 border-2 border-teal-200 p-4 rounded-xl bg-teal-50/50"
                    style={{ gridTemplateColumns: `repeat(${data.cols}, minmax(0, 1fr))` }}
                >
                    {data.grid.map((row: string[], rowIndex: number) =>
                        row.map((letter: string, colIndex: number) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className="aspect-square flex items-center justify-center text-3xl font-bold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm"
                            >
                                {letter}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
