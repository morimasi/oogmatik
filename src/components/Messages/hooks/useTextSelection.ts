import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../../../types';

interface SelectionState {
  selectedText: string;
  messageId: string | null;
  top: number;
  left: number;
  visible: boolean;
}

export function useTextSelection(messagesContainerRef: React.RefObject<HTMLDivElement | null>) {
  const [selection, setSelection] = useState<SelectionState>({
    selectedText: '',
    messageId: null,
    top: 0,
    left: 0,
    visible: false,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const currentMessageIdRef = useRef<string | null>(null);

  const handleMouseUp = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) {
        setSelection((prev) => ({ ...prev, visible: false }));
        return;
      }

      const selectedText = sel.toString().trim();
      if (!selectedText || !currentMessageIdRef.current) {
        setSelection((prev) => ({ ...prev, visible: false }));
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setSelection({
        selectedText: selectedText.substring(0, 200),
        messageId: currentMessageIdRef.current,
        top: rect.top - 45,
        left: rect.left + rect.width / 2,
        visible: true,
      });
    }, 200);
  }, []);

  const handleMouseDown = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection((prev) => ({ ...prev, visible: false }));
      }
    }, 300);
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousedown', handleMouseDown);

    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown, messagesContainerRef.current]);

  const setCurrentMessageId = useCallback((id: string | null) => {
    currentMessageIdRef.current = id;
  }, []);

  const clearSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection((prev) => ({ ...prev, visible: false }));
  }, []);

  const quoteMessage = useCallback(
    (messages: Message[]): { message: Message | null; selectedText: string } => {
      if (!selection.messageId || !selection.selectedText) {
        return { message: null, selectedText: '' };
      }
      const msg = messages.find((m) => m.id === selection.messageId) || null;
      clearSelection();
      return { message: msg, selectedText: selection.selectedText };
    },
    [selection.messageId, selection.selectedText, clearSelection]
  );

  return {
    selection,
    setCurrentMessageId,
    clearSelection,
    quoteMessage,
  };
}
