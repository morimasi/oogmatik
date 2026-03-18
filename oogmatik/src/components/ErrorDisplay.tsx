import React from 'react';
import { AppError, RateLimitError, ValidationError, TimeoutError, AuthenticationError } from '../utils/AppError';

interface ErrorDisplayProps {
  error: Error | AppError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  isRetrying = false,
}: ErrorDisplayProps) => {
  if (!error) return null;

  const isAppError = error instanceof AppError;
  const userMessage = isAppError ? error.userMessage : error.message;
  const errorCode = isAppError ? error.code : 'UNKNOWN_ERROR';
  const isRetryable = isAppError ? error.isRetryable : false;

  // Determine icon and color based on error type
  const getErrorUI = () => {
    if (error instanceof RateLimitError) {
      return {
        icon: 'fa-hourglass-end',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        iconColor: 'text-yellow-500',
      };
    }
    if (error instanceof ValidationError) {
      return {
        icon: 'fa-circle-exclamation',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-500',
      };
    }
    if (error instanceof TimeoutError) {
      return {
        icon: 'fa-clock',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-500',
      };
    }
    if (error instanceof AuthenticationError) {
      return {
        icon: 'fa-lock',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        iconColor: 'text-red-500',
      };
    }
    // Default error styling
    return {
      icon: 'fa-exclamation-triangle',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      iconColor: 'text-red-500',
    };
  };

  const ui = getErrorUI();

  return (
    <div
      className={`
        w-full p-4 rounded-lg border-2 ${ui.borderColor} ${ui.bgColor}
        animate-in slide-in-from-top-2 fade-in-50 duration-300
      `}
      role="alert"
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">
          <i className={`fa-solid ${ui.icon} ${ui.iconColor} text-lg`}></i>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm ${ui.textColor} mb-1`}>
            {error instanceof RateLimitError && 'İstek Sınırı'}
            {error instanceof ValidationError && 'Doğrulama Hatası'}
            {error instanceof TimeoutError && 'Zaman Aşımı'}
            {error instanceof AuthenticationError && 'Kimlik Doğrulama Hatası'}
            {!isAppError && 'Bir Hata Oluştu'}
            {isAppError &&
              ![
                RateLimitError,
                ValidationError,
                TimeoutError,
                AuthenticationError,
              ].some((Type) => error instanceof Type) &&
              'Hata'}
          </h3>
          <p className={`text-xs ${ui.textColor} opacity-90 leading-relaxed`}>
            {userMessage}
          </p>

          {/* Error code for debugging */}
          {isAppError && (
            <p className={`text-[10px] ${ui.textColor} opacity-60 mt-1 font-mono`}>
              Kod: {errorCode}
            </p>
          )}

          {/* Rate limit specific info */}
          {error instanceof RateLimitError && error.details?.retryAfter && (
            <p className={`text-xs ${ui.textColor} opacity-75 mt-2`}>
              Lütfen{' '}
              <span className="font-bold">
                {Math.ceil(error.details.retryAfter / 1000)} saniye
              </span>{' '}
              sonra tekrar deneyin.
            </p>
          )}

          {/* Validation error details */}
          {error instanceof ValidationError && error.details && (
            <ul className={`text-xs ${ui.textColor} opacity-75 mt-2 list-disc list-inside space-y-0.5`}>
              {Object.entries(error.details).slice(0, 3).map(([field, message]) => (
                <li key={field}>{String(message)}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex gap-2">
          {isRetryable && onRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className={`
                px-3 py-1.5 rounded-lg font-bold text-xs
                transition-all duration-200
                ${
                  isRetrying
                    ? `${ui.bgColor} ${ui.textColor} opacity-50 cursor-not-allowed`
                    : `${ui.textColor} bg-white border ${ui.borderColor} hover:bg-opacity-50`
                }
              `}
            >
              {isRetrying ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-1"></i>
                  Deneniyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rotate-right mr-1"></i>
                  Tekrar Dene
                </>
              )}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`
                px-3 py-1.5 rounded-lg font-bold text-xs
                transition-all duration-200
                ${ui.textColor} bg-white border ${ui.borderColor}
                hover:bg-opacity-50
              `}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
