import { useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMessagesStore } from '../store/useMessagesStore';
import { validateFile, MAX_FILES_PER_MESSAGE } from '../services/fileUploadService';
import { useToastStore } from '../../../store/useToastStore';

export function useFileUpload() {
  const store = useMessagesStore();
  const { addToast } = useToastStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  // Bug fix: fileUploads.length bağımlılığı açıkça belirtildi
  const handleFilesSelected = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList);
      const currentCount = store.fileUploads.length;

      if (currentCount + files.length > MAX_FILES_PER_MESSAGE) {
        addToast(`En fazla ${MAX_FILES_PER_MESSAGE} dosya yüklenebilir.`, 'warning');
        return;
      }

      for (const file of files) {
        const result = validateFile(file);
        if (result.valid) {
          const id = uuidv4();
          store.addFileUpload({ file, id, progress: 0, status: 'idle' });
        } else {
          addToast(`${file.name}: ${result.error}`, 'error');
        }
      }

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store.fileUploads.length, addToast]
  );

  const removeFile = useCallback((uploadId: string) => {
    store.removeFileUpload(uploadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearFiles = useCallback(() => {
    store.clearFileUploads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFilesSelected(e.dataTransfer.files);
    },
    [handleFilesSelected]
  );

  return {
    inputRef,
    openFilePicker,
    handleFilesSelected,
    removeFile,
    clearFiles,
    fileUploads: store.fileUploads,
    uploadCount: store.fileUploads.length,
    isDragOver,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
}

// React import zorunlu
import React from 'react';
