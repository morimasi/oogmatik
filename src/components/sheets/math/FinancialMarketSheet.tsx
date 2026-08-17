import React from 'react';
import { FinancialMarketData, FinancialMarketItem } from '../../../types';
import { PedagogicalHeader } from '../common';

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

    const taskColsClass = tasks.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : tasks.length <= 4 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className="w-full flex flex-col bg-white font-['Lexend'] min-h-[297mm] p-4 print:p-2 transition-all duration-300">
            <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

            {/* SHOP HEADER & WALLET BAR */}
            <div className="flex justify-between items-center bg-lime-500/10 border-2 border-lime-500/20 rounded-3xl p-3 print:p-2 my-2 shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-xs">
                        <i className="fa-solid fa-store"></i>
                    </div>
                    <div>
                        <h2 className="text-base font-black text-lime-950 uppercase tracking-tight">{data.content?.shopName || "Bereket Süpermarket"}</h2>
                        <span className="text-[9px] font-bold text-lime-700 uppercase tracking-wider">Finansal Okuryazarlık • Bütçe & Para Hesaplama</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-lime-300 shadow-2xs">
                    <i className="fa-solid fa-wallet text-lime-600 text-base"></i>
                    <div className="flex flex-col text-right">
                        <span className="text-[7px] font-black text-zinc-400 uppercase leading-none">Açılış Cüzdanı</span>
                        <span className="text-sm font-black text-lime-900 leading-tight">{formatPrice(walletBalance)}</span>
                    </div>
                </div>
            </div>

            {/* RAF GÖRSELİ */}
            <div className="w-full bg-orange-50/40 rounded-3xl border-2 border-orange-200/60 p-4 print:p-2 shadow-2xs relative my-2">
                <div className="absolute -top-3 left-6 bg-white border border-orange-300 px-3 py-0.5 rounded-full shadow-2xs text-orange-900 font-black tracking-wider uppercase text-[9px] flex items-center gap-1.5">
                    <i className="fa-solid fa-[#fa8c16] fa-cart-shopping text-orange-500"></i> Market Rafları & Fiyat Etiketleri
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-2 pt-2">
                    {shelves.map((item) => (
                        <div key={item.id} className="flex flex-col items-center">
                            {/* Ürün Objesi */}
                            <div className="w-14 h-14 bg-white rounded-2xl border border-orange-200 shadow-2xs flex flex-col items-center justify-center relative -mb-2 z-10 group">
                                <i className={`${item.icon || 'fa-solid fa-box'} text-2xl text-orange-500 group-hover:scale-110 transition-transform`}></i>
                            </div>
                            {/* Raf Çizgisi */}
                            <div className="w-full h-3 bg-amber-800 rounded-xs shadow-xs border-b border-amber-950 relative">
                                {/* Etiket */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 bg-yellow-100 border border-yellow-400 px-1.5 py-0.5 rounded shadow-2xs text-[8px] font-black text-yellow-900 whitespace-nowrap flex flex-col items-center leading-none">
                                    <span className="text-[7px] uppercase tracking-tighter opacity-80 max-w-[50px] truncate">{item.name}</span>
                                    <span className="text-orange-900 font-extrabold">{formatPrice(item.price)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* GÖREVLER (TASKS) / FİŞLER */}
            <div className={`grid ${taskColsClass} gap-3 print:gap-2 flex-1 my-2 items-stretch`}>
                {tasks.map((task, tIdx) => (
                    <div key={tIdx} className="bg-white border-2 border-zinc-200 rounded-3xl p-3 print:p-2 shadow-xs flex flex-col justify-between relative overflow-hidden">

                        {/* Fiş Header */}
                        <div className="flex items-center justify-between border-b pb-1.5 mb-2 border-zinc-100">
                            <div className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-lime-100 text-lime-800 font-black text-[10px] flex items-center justify-center border border-lime-200">
                                    {tIdx + 1}
                                </span>
                                <span className="text-[10px] font-black text-zinc-800 uppercase tracking-tight">Fiş #{tIdx + 101}</span>
                            </div>
                            {task.discountAmount && (
                                <span className="bg-red-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest animate-pulse">
                                    %{10} İndirimli
                                </span>
                            )}
                        </div>

                        <p className="text-[9px] font-bold text-zinc-700 leading-snug mb-2">{task.instruction}</p>

                        {/* Alışveriş Sepeti Tablosu */}
                        <div className="bg-zinc-50 rounded-xl p-2 border border-zinc-200 mb-2">
                            <div className="text-[8px] font-black text-zinc-400 tracking-wider uppercase mb-1">Sepet Detayı</div>
                            <div className="space-y-1">
                                {task.cart.map((cartItem, cIdx) => {
                                    const prod = getItem(cartItem.itemId);
                                    return (
                                        <div key={cIdx} className="flex justify-between items-center text-[8px] font-bold text-zinc-700 border-b border-zinc-200/50 pb-0.5 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-1">
                                                <i className={`${prod?.icon || 'fa-solid fa-box'} text-[9px] text-zinc-400`}></i>
                                                <span className="truncate max-w-[80px]">{prod?.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-zinc-400">{cartItem.quantity} Adet</span>
                                                <span className="font-black text-zinc-900">{formatPrice((prod?.price || 0) * cartItem.quantity)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Hesaplama Kutuları */}
                        <div className="border-t border-dashed border-zinc-300 pt-2 mt-auto space-y-1">
                            <div className="flex justify-between items-center text-[9px]">
                                <span className="font-bold text-zinc-500">Ödenecek Tutar:</span>
                                <div className="w-16 h-5 bg-zinc-100 border border-zinc-300 rounded-md"></div>
                            </div>
                            <div className="flex justify-between items-center text-[9px]">
                                <span className="font-bold text-lime-700">Para Üstü:</span>
                                <div className="w-16 h-5 bg-lime-50 border border-lime-300 rounded-md"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CLINICAL FOOTER */}
            <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
                        FİNANSAL OKURYAZARLIK &<br />MATEMATİKSEL BÜTÇE
                    </span>
                </div>
                {[
                    { label: 'HEDEF SÜRE', val: '10:00', unit: 'dk' },
                    { label: 'HESAPLANAN', val: '___', unit: 'Fiş' },
                    { label: 'BAŞARI PUANI', val: '___', unit: 'p' },
                ].map((item) => (
                    <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
                        <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
                        <div className="flex items-end gap-0.5">
                            <span className="text-xs font-black text-white">{item.val}</span>
                            <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


