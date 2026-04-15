import React from 'react';

interface ErrorFallbackProps {
    onRetry: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ onRetry }) => {
    return (
        <div className="sk-error-card">
            <span className="sk-error-icon">⚠️</span>
            <h3>Üretim Sırasında Hata</h3>
            <p>İçerik üretilirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
            <button onClick={onRetry} className="sk-retry-btn">
                Tekrar Dene
            </button>
        </div>
    );
};
