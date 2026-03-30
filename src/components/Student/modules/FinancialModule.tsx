import React from 'react';
import { AdvancedStudent, Transaction } from '../../../types/student-advanced';

interface FinancialModuleProps {
    student: AdvancedStudent;
    onUpdate?: (updatedData: Partial<AdvancedStudent>) => void;
}

export const FinancialModule: React.FC<FinancialModuleProps> = ({ student, onUpdate }) => {
    const handleFakePayment = () => {
        if (!onUpdate) return;
        const currentTx = student.financial?.transactions || [];
        const newTx: Transaction = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            description: "Online Ödeme Alındı",
            amount: 500,
            currency: 'TRY',
            type: "payment",
            category: "tuition",
            status: "paid"
        };
        const currentBalance = student.financial?.balance || 0;

        onUpdate({
            ...student,
            financial: {
                ...student.financial,
                balance: Math.max(0, currentBalance - 500),
                transactions: [newTx, ...currentTx]
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-800 dark:to-black rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
                    <p className="text-zinc-400 text-sm font-medium mb-1">Toplam Bakiye</p>
                    <h2 className="text-4xl font-black tracking-tight mb-4">
                        {student.financial?.balance?.toLocaleString('tr-TR')} ₺
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handleFakePayment} className="flex-1 bg-white text-zinc-900 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                            Ödeme Al
                        </button>
                        <button className="flex-1 bg-zinc-700/50 text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-colors border border-zinc-600">
                            Fatura
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800">
                    <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Ödeme Planı</h3>
                    <div className="space-y-4">
                        {student.financial?.paymentPlan?.slice(0, 3).map((plan) => (
                            <div key={plan.id} className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                                        {plan.installmentNumber}. Taksit
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Vade: {new Date(plan.dueDate).toLocaleDateString('tr-TR')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        {plan.amount.toLocaleString('tr-TR')} ₺
                                    </p>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full 
                                        ${plan.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                                            plan.status === 'overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {plan.status === 'paid' ? 'Ödendi' : plan.status === 'overdue' ? 'Gecikmiş' : 'Bekliyor'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                        <i className="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Burs Durumu</h3>
                    <p className="text-emerald-500 font-black text-3xl my-2">
                        %{student.financial?.scholarshipRate || 0}
                    </p>
                    <p className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        {student.financial?.scholarshipType === 'merit' ? 'Başarı Bursu' : 'Kardeş İndirimi'}
                    </p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white">İşlem Geçmişi</h3>
                    <div className="flex gap-2">
                        <select className="bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-xs font-bold px-3 py-2 text-zinc-600 dark:text-zinc-400 focus:ring-0">
                            <option>Son 30 Gün</option>
                            <option>Bu Dönem</option>
                            <option>Tümü</option>
                        </select>
                        <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 hover:bg-zinc-200 transition-colors">
                            <i className="fa-solid fa-download"></i>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-medium border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-6 py-4">Tarih</th>
                                <th className="px-6 py-4">Açıklama</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4">Tutar</th>
                                <th className="px-6 py-4">Durum</th>
                                <th className="px-6 py-4">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {student.financial?.transactions?.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                        {new Date(tx.date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">
                                        {tx.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                                            {tx.category === 'tuition' ? 'Eğitim' : tx.category === 'materials' ? 'Materyal' : tx.category}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${tx.type === 'payment' ? 'text-emerald-600' : 'text-zinc-900 dark:text-white'}`}>
                                        {tx.type === 'payment' ? '+' : '-'}{tx.amount.toLocaleString('tr-TR')} ₺
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                                            ${tx.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                tx.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'paid' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            {tx.status === 'paid' ? 'Tamamlandı' : tx.status === 'pending' ? 'Bekliyor' : 'İptal'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400">
                                        <button className="hover:text-indigo-600 transition-colors">
                                            <i className="fa-solid fa-file-invoice"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
