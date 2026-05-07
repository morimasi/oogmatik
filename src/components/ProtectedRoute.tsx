import React from 'react';
import { useRBAC } from '../hooks/useRBAC';
import { PermissionModule } from '../types/rbac';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

interface Props {
  module: PermissionModule;
  children: React.ReactNode;
  onBack?: () => void;
}

export const ProtectedRoute: React.FC<Props> = ({ module, children, onBack }) => {
  const { canAccess } = useRBAC();

  if (!canAccess(module)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-[#0A0A0B] p-6 font-lexend">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 text-center shadow-2xl"
        >
          <div className="w-20 h-20 rounded-[2.5rem] bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert className="text-red-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase mb-4 italic">
            ERİŞİM <span className="text-red-500">ENGELLENDİ</span>
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Bu modüle erişim yetkiniz bulunmamaktadır. Lütfen sistem yöneticiniz ile iletişime geçin.
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl py-4 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri Dön
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};
