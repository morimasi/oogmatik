/**
 * BDMIND - Trust & Security Badge Components
 * KVKK güvenlik rozetleri ve AI denetim sertifikası
 * Pazarlama ve güven inşası için UI bileşenleri
 */

import React from 'react';

/**
 * KVKK Güvenlik Rozeti
 * "Veli/Öğrenci Verileri KVKK 3. Katman Koruması ile Uçtan Uca Şifrelenmektedir"
 */
export const KvkkSecurityBadge: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-xl
        bg-emerald-500/10 text-emerald-400
        border border-emerald-500/20
        backdrop-blur-sm
        ${sizeClasses[size]}
        ${className}
      `}
      role="status"
      aria-label="KVKK uyumlu veri koruması aktif"
    >
      <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
      <span className="font-medium">
        KVKK 3. Katman Koruması — Uçtan Uca Şifreli
      </span>
    </div>
  );
};

/**
 * AI Denetim Sertifikası
 * "AI Denetiminden Geçti" yeşil check-mark
 */
export const AiVerifiedBadge: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-xl
        bg-indigo-500/10 text-indigo-400
        border border-indigo-500/20
        backdrop-blur-sm
        ${sizeClasses[size]}
        ${className}
      `}
      role="status"
      aria-label="AI denetiminden geçti"
    >
      <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-medium">
        AI Denetiminden Geçti
      </span>
    </div>
  );
};

/**
 * Zero-Knowledge Privacy Badge
 * "Sıfır Bilgi Prensibi" — Verileriniz şifrelenir, biz bile okuyamayız
 */
export const ZeroKnowledgeBadge: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1 gap-1.5',
    md: 'text-sm px-3 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2.5',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`
        inline-flex items-center rounded-xl
        bg-violet-500/10 text-violet-400
        border border-violet-500/20
        backdrop-blur-sm
        ${sizeClasses[size]}
        ${className}
      `}
      role="status"
      aria-label="Sıfır bilgi prensibi ile korunmaktadır"
    >
      <svg className={iconSizes[size]} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="font-medium">
        Zero-Knowledge — Sıfır Bilgi Prensibi
      </span>
    </div>
  );
};

/**
 * Trust Badge Group — Tüm güvenlik rozetlerini bir arada gösterir
 */
export const TrustBadgeGroup: React.FC<{
  className?: string;
  showKvkk?: boolean;
  showAiVerified?: boolean;
  showZeroKnowledge?: boolean;
}> = ({
  className = '',
  showKvkk = true,
  showAiVerified = true,
  showZeroKnowledge = false,
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showKvkk && <KvkkSecurityBadge size="sm" />}
      {showAiVerified && <AiVerifiedBadge size="sm" />}
      {showZeroKnowledge && <ZeroKnowledgeBadge size="sm" />}
    </div>
  );
};
