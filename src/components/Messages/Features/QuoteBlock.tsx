import React from 'react';
import { QuoteData } from '../../../types/messaging';
import { MessageSquare } from 'lucide-react';

interface QuoteBlockProps {
  quoteData: QuoteData;
  isOwn: boolean;
  onScrollToOriginal?: () => void;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({ quoteData, isOwn, onScrollToOriginal }) => {
  return (
    <div
      onClick={onScrollToOriginal}
      className={`
        mx-1.5 mt-1.5 pl-3 pr-2 py-2 
        border-l-[3px] rounded-r-xl text-xs 
        cursor-pointer hover:bg-white/[0.06] transition-all 
        bg-black/20 flex flex-col gap-1 relative
        ${isOwn ? 'border-white/40' : 'border-accent-primary/60'}
      `}
    >
      <div className="flex items-center gap-2">
        <div className={`p-1 rounded-md ${isOwn ? 'bg-white/10' : 'bg-accent-primary/20'}`}>
          <MessageSquare className={`w-3 h-3 ${isOwn ? 'text-white/60' : 'text-accent-primary'}`} />
        </div>
        <span className={`font-bold text-[11px] leading-none ${isOwn ? 'text-white/70' : 'text-accent-primary'}`}>
          {quoteData.originalSenderName}
        </span>
        {!!quoteData.selectedText && (
          <span className="text-[9px] text-white/30 italic">(seçili alıntı)</span>
        )}
      </div>
      <span className="opacity-60 leading-relaxed line-clamp-2 text-[11px]">
        {(quoteData.selectedText as string) || quoteData.originalText}
      </span>
      {onScrollToOriginal && (
        <div className="absolute inset-0 rounded-r-xl hover:bg-white/[0.03] transition-colors" />
      )}
    </div>
  );
};
