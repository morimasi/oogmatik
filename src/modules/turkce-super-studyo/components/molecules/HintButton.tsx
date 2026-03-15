'use client';
import React, { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Lightbulb } from 'lucide-react';

interface HintButtonProps {
  hint: string;
  onHintUsed?: () => void;
}

export const HintButton: React.FC<HintButtonProps> = ({ hint, onHintUsed }) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !open && onHintUsed) {
      onHintUsed();
    }
    setOpen(newOpen);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-xl hover:bg-yellow-200 transition-colors font-medium border-2 border-yellow-300 shadow-sm outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="İpucu Al"
        >
          <Lightbulb size={24} className="text-yellow-600" />
          <span className="text-lg">İpucu</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 max-w-sm p-5 bg-white rounded-2xl shadow-xl border-4 border-yellow-200 text-gray-800 animate-in fade-in zoom-in duration-200"
          sideOffset={8}
          align="start"
        >
          <div className="flex gap-4">
            <Lightbulb size={32} className="text-yellow-500 shrink-0 mt-1" />
            <p className="text-xl leading-relaxed font-medium text-gray-700">{hint}</p>
          </div>
          <Popover.Arrow className="fill-yellow-200 w-4 h-2" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
