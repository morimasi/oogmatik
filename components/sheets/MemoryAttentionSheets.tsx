
import React from 'react';
import { 
    WordMemoryData, VisualMemoryData, NumberSearchData, FindDuplicateData, LetterGridTestData, FindLetterPairData, TargetSearchData,
    ColorWheelMemoryData, ImageComprehensionData, CharacterMemoryData, StroopTestData, ChaoticNumberSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader } from './common';

export const WordMemorySheet: React.FC<{ data: WordMemoryData }> = ({ data }) => (
    <div>
        <div className="page relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                {(data.wordsToMemorize || []).map((word, index) => (
                    <div key={index} className="p-6 bg-amber-100 dark:bg-amber-800/50 border-2 border-amber-300 rounded-xl text-center shadow-md">
                        {/* FIX: word is an object, render its 'text' property */}
                        <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100">{word.text}</p>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-0 w-full text-center text-sm text-zinc-400 italic print:block hidden">
                --- Katlama Çizgisi ---
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center mt-8">{data.testTitle}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(data.testWords || []).map((word, index) => (
                    <div key={index} className="flex items-center bg-white dark:bg-zinc-700/50 p-4 rounded-lg border border-zinc-200 shadow-sm">
                        <div className="w-6 h-6 border-2 border-zinc-400 rounded-md mr-3 shrink-0"></div>
                        {/* FIX: word is an object, render its 'text' property */}
                        <label className="text-lg">{word.text}</label>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const VisualMemorySheet: React.FC<{ data: VisualMemoryData }> = ({ data }) => (
    <div>
        <div className="page relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                {(data.itemsToMemorize || []).map((item, index) => (
                    <div key={index} className="p-4 bg-white dark:bg-zinc-800 border-2 border-indigo-200 rounded-xl text-center flex flex-col items-center justify-center aspect-square shadow-md">
                        {/* FIX: item is an object, use its 'description' property before splitting */}
                        <p className="text-5xl mb-2">{item.description.split(' ').pop()}</p>
                        {/* FIX: item is an object, use its 'description' property before splitting */}
                        <p className="text-xs font-semibold text-zinc-500 uppercase">{item.description.split(' ').slice(0, -1).join(' ')}</p>
                    </div>
                ))}
            </div>
            <div className="absolute bottom-0 w-full text-center text-sm text-zinc-400 italic print:block hidden">
                --- Katlama Çizgisi ---
            </div>
        </div>
        <div className="page-break"></div>
        <div className="page">
            <h3 className="text-2xl font-bold mb-4 text-center mt-8">{data.testTitle}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {(data.testItems || []).map((item, index) => (
                    <div key={index} className="flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-700/50 p-3 rounded-lg border cursor-pointer hover:bg-zinc-50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                        <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mb-3 shrink-0"></div>
                        {/* FIX: item is an object, use its 'description' property before splitting */}
                        <p className="text-4xl">{item.description.split(' ').pop()}</p>
                        {/* FIX: item is an object, use its 'description' property before splitting */}
                        <label className="text-xs mt-1 font-medium">{item.description.split(' ').slice(0, -1).join(' ')}</label>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const NumberSearchSheet: React.FC<{ data: NumberSearchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || `Sayıları sırasıyla bul: ${data.range?.start} - ${data.range?.end}`} note={data.pedagogicalNote} />
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 text-center p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200">
            {(data.numbers || []).map((num, index) => (
                <div key={index} className="font-mono text-xl p-2 hover:bg-zinc-100 rounded cursor-pointer select-none">
                    {num}
                </div>
            ))}
        </div>
    </div>
);

export const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Satırlardaki ikizleri bul."} note={data.pedagogicalNote} />
        <div className="p-6 bg-white dark:bg-zinc-700/30 rounded-xl shadow-sm border border-zinc-200">
            <table className="w-full border-separate border-spacing-y-4">
                <tbody>
                {(data.rows || []).map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 transition-colors rounded-lg">
                        <td className="p-2 text-zinc-400 font-bold text-xs w-8">{rowIndex + 1}</td>
                        {(row || []).map((char, charIndex) => (
                            <td key={charIndex} className="text-center font-mono text-2xl p-3 border-l border-zinc-200 first:border-l-0 first:rounded-l-lg last:rounded-r-lg">
                                {char}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Hedef harfleri bul."} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-xl shadow-inner flex justify-center">
            <table className="border-collapse">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-lg w-8 h-8 p-1 hover:bg-yellow-100 cursor-pointer">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction || "a, b, d, g harflerini bul ve çiz."} note={data.pedagogicalNote} />
        <div className="mb-6 border-2 p-4 rounded-lg grid grid-cols-2 gap-4 bg-zinc-50 print:bg-white" style={{borderColor: 'var(--worksheet-border-color)'}}>
            <div><label className="block text-sm font-bold uppercase text-zinc-500">Adı Soyadı:</label><div className="h-8 mt-1 border-b-2 border-zinc-300"></div></div>
            <div><label className="block text-sm font-bold uppercase text-zinc-500">Süre:</label><div className="h-8 mt-1 border-b-2 border-zinc-300"></div></div>
        </div>
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg">
            <table className="w-full border-separate border-spacing-y-2">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <td className="text-xs text-zinc-400 w-4">{rowIndex+1}</td>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-center font-serif text-lg w-6 h-8">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "İkilileri bul."} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-xl w-10 h-10" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Hedefi bul."} note={data.pedagogicalNote} />
        <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-lg shadow-inner max-w-xl mx-auto">
            <table className="table-fixed w-full">
                <tbody>
                    {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {(row || []).map((cell, cellIndex) => (
                                <td key={cellIndex} className="text-center font-mono text-xl p-1 hover:bg-zinc-200 cursor-pointer" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="mt-8 flex justify-center items-center gap-4 p-4 bg-zinc-100 rounded-lg">
            <h4 className="font-bold text-xl">Toplam <span className="text-red-600 text-2xl mx-2">{data.target}</span> Sayısı:</h4>
            <div className="w-16 h-12 border-b-2 border-zinc-800"></div>
        </div>
    </div>
);

export const ColorWheelSheet: React.FC<{ data: ColorWheelMemoryData }> = ({ data }) => {
    const items = data.items || [];
    const angleStep = 360 / items.length;

    const getCoords = (angle: number, radius: number) => [
        50 + radius * Math.cos(angle * Math.PI / 180),
        50 + radius * Math.sin(angle * Math.PI / 180)
    ];

    const renderWheel = (showItems: boolean) => (
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-md mx-auto drop-shadow-xl">
            {(items || []).map((item, index) => {
                const startAngle = index * angleStep - 90;
                const endAngle = (index + 1) * angleStep - 90;
                const midAngle = startAngle + angleStep / 2;

                const [startX, startY] = getCoords(startAngle, 45);
                const [endX, endY] = getCoords(endAngle, 45);
                const largeArcFlag = angleStep <= 180 ? "0" : "1";
                const pathData = `M 50,50 L ${startX},${startY} A 45,45 0 ${largeArcFlag},1 ${endX},${endY} Z`;
                
                // Text position
                const [textX, textY] = getCoords(midAngle, 30);

                return (
                    <g key={index}>
                        <path d={pathData} fill={item.color} stroke="white" strokeWidth="1" />
                        {showItems && (
                            <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle" fontSize="5" fontWeight="bold" fill="white" style={{textShadow: '1px 1px 1px black'}}>
                                {item.name}
                            </text>
                        )}
                    </g>
                );
            })}
            <circle cx="50" cy="50" r="10" fill="white" />
        </svg>
    );

    return (
        <div>
            <div className="page">
                <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
                <div className="my-8">
                    {renderWheel(true)}
                </div>
            </div>

            <div className="page-break"></div>

            <div className="page">
                <h3 className="text-2xl font-bold mb-6 text-center">{data.testTitle}</h3>
                <div className="flex justify-center items-center gap-3 flex-wrap mb-12">
                    {(items || []).map((item, index) => (
                        <div key={index} className="px-3 py-2 bg-white border-2 border-zinc-300 rounded-lg text-sm font-bold shadow-sm">
                            {item.name}
                        </div>
                    ))}
                </div>
                <div className="opacity-50 grayscale hover:grayscale-0 transition-all">
                     {renderWheel(false)}
                </div>
            </div>
        </div>
    );
};

export const ImageComprehensionSheet: React.FC<{ data: ImageComprehensionData }> = ({ data }) => (
    <div>
        <div className="page">
             <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
            <div className="my-6 flex justify-center">
                <ImageDisplay base64={data.imageBase64} description={data.sceneDescription} className="w-full h-96 rounded-xl shadow-md object-cover" />
            </div>
            <div className="bg-yellow-50 dark:bg-zinc-800 p-6 rounded-xl border-l-8 border-yellow-400">
                <p className="text-lg leading-relaxed italic text-zinc-700 dark:text-zinc-300">{data.sceneDescription}</p>
            </div>
        </div>

        <div className="page-break"></div>

        <div className="page">
            <h3 className="text-2xl font-bold mb-6 text-center">{data.testTitle}</h3>
            <div className="space-y-6 max-w-2xl mx-auto">
                {(data.questions || []).map((q, index) => (
                    <div key={index} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border shadow-sm" style={{borderColor: 'var(--worksheet-border-color)'}}>
                        <p className="font-bold text-lg mb-4 text-indigo-800 dark:text-indigo-300">{index + 1}. {q}</p>
                        <div className="w-full h-12 border-b-2 border-dashed border-zinc-300"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const CharacterMemorySheet: React.FC<{ data: CharacterMemoryData }> = ({ data }) => (
    <div>
      <div className="page">
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.memorizeTitle} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
          {(data.charactersToMemorize || []).map((char, index) => (
            <div key={index} className="p-4 bg-white border-2 border-zinc-200 rounded-xl text-center shadow-sm flex flex-col items-center">
              <ImageDisplay base64={char.imageBase64} description={char.description} className="w-32 h-32 mb-3 rounded-full object-cover border-4 border-zinc-100" />
              <p className="text-md font-bold text-zinc-700">{char.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="page-break"></div>
      <div className="page">
        <h3 className="text-2xl font-bold mb-6 text-center mt-8">{data.testTitle}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
          {(data.testCharacters || []).map((char, index) => (
            <div key={index} className="flex flex-col items-center bg-white p-3 rounded-lg border border-zinc-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-6 h-6 border-2 border-zinc-300 rounded-full mb-2 self-end"></div>
              <ImageDisplay base64={char.imageBase64} description={char.description} className="w-20 h-20 mb-2 rounded-full" />
              <label className="text-xs text-center font-semibold">{char.description}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
);

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Rengi söyle!"} note={data.pedagogicalNote} />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-8 text-center mt-8">
            {(data.items || []).map((item, index) => (
                <div key={index} className="p-6 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center h-32">
                    <p className="text-4xl sm:text-5xl font-black tracking-wide" style={{ color: item.color, textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
                        {item.text}
                    </p>
                </div>
            ))}
        </div>
    </div>
);

export const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="relative w-full h-[700px] bg-white dark:bg-zinc-800 rounded-xl shadow-inner overflow-hidden border-2 border-zinc-300 mx-auto max-w-3xl">
            {(data.numbers || []).map((num, index) => (
                <span
                    key={index}
                    className="absolute font-bold font-mono cursor-pointer select-none hover:scale-150 transition-transform"
                    style={{
                        left: `${num.x}%`,
                        top: `${num.y}%`,
                        fontSize: `${num.size + 0.5}rem`,
                        transform: `rotate(${num.rotation}deg)`,
                        color: num.color,
                    }}
                >
                    {num.value}
                </span>
            ))}
        </div>
    </div>
);
