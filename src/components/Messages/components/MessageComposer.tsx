import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useMessagesStore } from '../store/useMessagesStore';
import { useFileUpload } from '../hooks/useFileUpload';
import { QuoteBar } from './QuoteBar';
import { UploadProgress } from './FileAttachment';
import { DragDropZone } from './DragDropZone';
import { MAX_FILES_PER_MESSAGE } from '../services/fileUploadService';

const MAX_CONTENT_LENGTH = 2000;

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
  const {
    inputRef,
    openFilePicker,
    handleFilesSelected,
    removeFile,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileUpload();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (disabled || sending) return;
    if (!content.trim() && fileUploads.length === 0) return;

    if (fileUploads.length > 0) {
      // Bug fix: tüm (idle + uploading) dosyaları dahil et
      const filesToSend = fileUploads.map((u) => u.file);
      const success = await onSendWithFiles(content.trim(), filesToSend);
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

  const contentLength = content.length;
  const isNearLimit = contentLength > MAX_CONTENT_LENGTH * 0.85;
  const isOverLimit = contentLength > MAX_CONTENT_LENGTH;

  return (
    <DragDropZone
      isActive={isDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="border-t border-[var(--border-color)] bg-[var(--bg-paper)] shrink-0">
        <QuoteBar />

        {/* Upload progress listesi */}
        {fileUploads.length > 0 && (
          <div className="px-4 py-2 space-y-1.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                {fileUploads.length} dosya • {MAX_FILES_PER_MESSAGE - fileUploads.length} daha eklenebilir
              </span>
              <button
                onClick={openFilePicker}
                disabled={fileUploads.length >= MAX_FILES_PER_MESSAGE || !!disabled}
                className="text-[9px] text-[var(--accent-color)] font-bold uppercase tracking-widest hover:underline disabled:opacity-40"
              >
                + Daha Ekle
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
              {fileUploads.map((upload) => (
                <UploadProgress key={upload.id} upload={upload} onRemove={removeFile} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Dosya ekle butonu */}
          <button
            onClick={openFilePicker}
            disabled={fileUploads.length >= MAX_FILES_PER_MESSAGE || !!disabled}
            className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all disabled:opacity-30 shrink-0"
            title={`Dosya Ekle (max ${MAX_FILES_PER_MESSAGE})`}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Gizli dosya input */}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.gif,.webp,.svg,.mp4,.webm,.mov,.mp3,.wav,.ogg,.aac,.zip,.txt,.csv"
            className="hidden"
            onChange={(e) => handleFilesSelected(e.target.files)}
          />

          {/* Mesaj textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                  setContent(e.target.value);
                }
              }}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Mesajınızı yazın... (Enter: gönder, Shift+Enter: yeni satır)"
              rows={1}
              disabled={disabled}
              maxLength={MAX_CONTENT_LENGTH}
              className={`w-full px-4 py-2.5 rounded-xl border bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-lexend text-sm outline-none focus:ring-2 focus:ring-[var(--accent-color)] resize-none disabled:opacity-50 transition-colors ${
                isOverLimit
                  ? 'border-rose-500'
                  : 'border-[var(--border-color)]'
              }`}
              style={{ minHeight: 40, maxHeight: 130 }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 130)}px`;
              }}
            />
            {isNearLimit && (
              <span
                className={`absolute bottom-1 right-3 text-[8px] font-bold ${
                  isOverLimit ? 'text-rose-500' : 'text-[var(--text-muted)]'
                }`}
              >
                {contentLength}/{MAX_CONTENT_LENGTH}
              </span>
            )}
          </div>

          {/* Gönder butonu */}
          <button
            onClick={handleSubmit}
            disabled={disabled || sending || (!content.trim() && fileUploads.length === 0) || isOverLimit}
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
    </DragDropZone>
  );
};
