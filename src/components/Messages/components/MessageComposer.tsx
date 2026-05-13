import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { useFileUpload } from '../hooks/useFileUpload';
import { QuoteBar } from './QuoteBar';
import { UploadProgress } from './FileAttachment';
import { MAX_FILES_PER_MESSAGE } from '../services/fileUploadService';

interface MessageComposerProps {
  onSend: (content: string) => Promise<boolean>;
  onSendWithFiles: (content: string, files: File[]) => Promise<boolean>;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onSendWithFiles,
  disabled,
}) => {
  const [content, setContent] = useState('');
  const { sending, fileUploads } = useMessagesStore();
  const { inputRef, openFilePicker, handleFilesSelected, removeFile } = useFileUpload();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (disabled || sending) return;
    if (!content.trim() && fileUploads.length === 0) return;

    if (fileUploads.length > 0) {
      const files = fileUploads
        .filter((u) => u.status === 'uploading' || u.status === 'idle')
        .map((u) => u.file);
      const success = await onSendWithFiles(content.trim(), files);
      if (success) {
        setContent('');
        textareaRef.current?.focus();
      }
    } else {
      const success = await onSend(content.trim());
      if (success) {
        setContent('');
        textareaRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        const dt = new DataTransfer();
        files.forEach((f) => dt.items.add(f));
        handleFilesSelected(dt.files);
      }
    },
    [handleFilesSelected]
  );

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--bg-paper)]">
      <QuoteBar />

      {/* Upload Progress */}
      {fileUploads.length > 0 && (
        <div className="px-4 py-2 space-y-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              {fileUploads.filter((u) => u.status === 'complete').length}/{fileUploads.length} yüklendi
            </span>
            <button
              onClick={openFilePicker}
              className="text-[9px] text-[var(--accent-color)] font-bold uppercase tracking-widest hover:underline"
            >
              + Daha Ekle
            </button>
          </div>
          {fileUploads.map((upload) => (
            <UploadProgress key={upload.id} upload={upload} onRemove={removeFile} />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 p-3">
        <button
          onClick={openFilePicker}
          disabled={fileUploads.length >= MAX_FILES_PER_MESSAGE || disabled}
          className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all disabled:opacity-30 shrink-0"
          title="Dosya Ekle"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.mp3,.wav,.zip,.txt,.csv"
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Mesajınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
            rows={1}
            disabled={disabled}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend text-sm outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none disabled:opacity-50"
            style={{ minHeight: 40, maxHeight: 120 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || sending || (!content.trim() && fileUploads.length === 0)}
          className="w-9 h-9 rounded-xl bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] flex items-center justify-center text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 shrink-0 shadow-lg shadow-[var(--accent-muted)]"
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
