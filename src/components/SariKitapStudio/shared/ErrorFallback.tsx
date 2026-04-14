import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center"
      style={{
        background: 'rgba(24, 24, 27, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(234, 179, 8, 0.15)',
        borderRadius: '2.5rem',
        minHeight: '200px',
      }}
    >
      <div className="text-4xl mb-4">⚠</div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: 'Inter, sans-serif', color: '#eab308' }}
      >
        Bir sorun oluştu
      </h3>
      <p
        className="text-sm mb-4 max-w-md"
        style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.6)' }}
      >
        Bu bileşen geçici olarak kullanılamıyor. Lütfen tekrar deneyin.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre
          className="text-xs mb-4 p-2 rounded max-w-md overflow-auto"
          style={{ background: 'rgba(0,0,0,0.3)', color: '#f87171' }}
        >
          {error.message}
        </pre>
      )}
      <button
        onClick={resetErrorBoundary}
        className="px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
        style={{
          background: 'rgba(234, 179, 8, 0.2)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          color: '#eab308',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        Tekrar Dene
      </button>
    </div>
  );
};
