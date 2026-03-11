import React from 'react';
import { FinancialMarketData, FinancialMarketItem } from '../../../types';

interface Props {
    data: FinancialMarketData;
}

export const FinancialMarketSheet: React.FC<Props> = ({ data }) => {
    const currency = data.settings?.currency || 'TRY';
    const isCents = data.settings?.useCents;
    const shelves = data.content?.shelves || [];
    const tasks = data.content?.tasks || [];
    const walletBalance = data.content?.walletBalance || 0;

    const sym = currency === 'TRY' ? '₺' : currency === 'USD' ? '$' : '€';

    const formatPrice = (price: number) => {
        return isCents ? price.toFixed(2) + ' ' + sym : price + ' ' + sym;
    };

    const getItem = (id: string): FinancialMarketItem | undefined => {
        return shelves.find(s => s.id === id);
    };

    return (
        <div className="w-full h-[297mm] p-8 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
            {/* BAŞLIK & CÜZDAN */}
            <div className="flex justify-between items-center border-b-4 border-lime-400 pb-4 mb-4">
                <div>
                    <h1 className="text-4xl font-black text-lime-900 tracking-tighter uppercase">{data.content?.title || "Alışveriş Zamanı"}</h1>
                    <p className="text-sm font-bold text-lime-600 mt-1 uppercase tracking-widest">{data.content?.shopName} • Mantıksal Hesaplama</p>
                </div>

                {/* Cüzdan */}
                <div className="flex items-center gap-3 bg-lime-50 rounded-2xl p-3 border-2 border-lime-200 shadow-sm">
                    <div className="w-12 h-12 bg-white text-lime-500 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-lime-100">
                        <i className="fa-solid fa-wallet"></i>
                    </div>
                    <div>
                        <div className="text-[10px] font-black tracking-widest text-lime-600 uppercase">Cüzdanımdaki Para</div>
                        <div className="text-2xl font-black text-lime-900 leading-none">{formatPrice(walletBalance)}</div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">

                {/* RAF GÖRSELİ */}
                <div className="w-full bg-orange-50/30 rounded-3xl border-2 border-orange-100 p-6 shadow-sm relative pt-10 mt-4 page-break-inside-avoid">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-orange-200 px-6 py-2 rounded-full shadow-md text-orange-800 font-black tracking-widest uppercase text-sm flex items-center gap-2">
                        <i className="fa-solid fa-store"></i> Ürün Rafları
                    </div>

                    <div className="grid grid-cols-4 gap-x-4 gap-y-10">
                        {shelves.map((item) => (
                            <div key={item.id} className="flex flex-col items-center">
                                {/* Ürün Objesi */}
                                <div className="w-20 h-20 bg-white rounded-2xl border-2 border-orange-200 shadow-sm flex flex-col items-center justify-center relative -mb-3 z-10 group">
                                    <i className={`${item.icon} text-4xl text-orange-400 opacity-80 group-hover:scale-110 transition-transform`}></i>
                                </div>
                                {/* Raf Çizgisi */}
                                <div className="w-full h-4 bg-orange-700 rounded-sm shadow-md border-b-2 border-orange-900 relative">
                                    {/* Etiket */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 bg-yellow-100 border border-yellow-400 px-3 py-1 rounded shadow text-xs font-black text-yellow-800 whitespace-nowrap flex flex-col items-center leading-tight">
                                        <span className="text-[9px] uppercase tracking-wider opacity-70">{item.name}</span>
                                        <span>{formatPrice(item.price)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GÖREVLER (TASKS) / FİŞLER */}
                <div className="grid grid-cols-2 gap-6 flex-1 mt-4">
                    {tasks.map((task, tIdx) => (
                        <div key={tIdx} className="bg-white border-2 border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col page-break-inside-avoid relative overflow-hidden">

                            {/* Fiş Tırtığı Efekti (Top) */}
                            <div className="absolute -top-3 left-0 w-full h-6 bg-[length:20px_20px] bg-[radial-gradient(circle_at_10px_0,transparent_10px,#fff_11px)] border-t border-zinc-200 z-10"></div>

                            <div className="flex items-start gap-3 mb-4 mt-2">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 font-black flex items-center justify-center flex-shrink-0 border border-zinc-200">{tIdx + 1}</div>
                                <p className="text-sm font-bold text-zinc-700 leading-snug">{task.instruction}</p>
                            </div>

                            {/* Alışveriş Sepeti */}
                            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 mb-4 flex-1">
                                <div className="text-[10px] font-black text-zinc-400 tracking-widest uppercase mb-2">Sepettekiler</div>
                                <div className="space-y-2">
                                    {task.cart.map((cartItem, cIdx) => {
                                        const prod = getItem(cartItem.itemId);
                                        return (
                                            <div key={cIdx} className="flex justify-between items-center text-sm font-bold text-zinc-600 pb-2 border-b border-zinc-200/50 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-white border border-zinc-200 flex items-center justify-center text-[10px] text-zinc-400">
                                                        <i className={prod?.icon || 'fa-solid fa-box'}></i>
                                                    </div>
                                                    <span>{prod?.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-zinc-400">{cartItem.quantity} Adet</span>
                                                    <span>+ {formatPrice((prod?.price || 0) * cartItem.quantity)}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Hesaplama Alanı */}
                            <div className="border-t-2 border-dashed border-zinc-300 pt-4 mt-auto">
                                <div className="flex justify-between items-center mb-3 text-sm">
                                    <span className="font-bold text-zinc-500">Toplam Tutar:</span>
                                    <div className="w-24 h-8 bg-zinc-100 border-2 border-zinc-200 rounded-lg"></div>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-lime-600">Alınacak Para Üstü:</span>
                                    <div className="w-24 h-8 bg-lime-50 border-2 border-lime-200 rounded-lg"></div>
                                </div>
                            </div>

                            {/* Fiş Tırtığı Efekti (Bottom) */}
                            <div className="absolute -bottom-3 left-0 w-full h-6 bg-[length:20px_20px] bg-[radial-gradient(circle_at_10px_20px,transparent_10px,#fff_11px)] border-b border-zinc-200 z-10 rotate-180"></div>
                        </div>
                    ))}
                </div>

            </div>

            {/* FOOTER */}
            <div className="pt-4 mt-auto border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Finansal Market • G: {tasks.length} • Raf: {shelves.length}</span>
            </div>
        </div>
    );
};

