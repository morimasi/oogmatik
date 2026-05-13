import { FileText, Image, Video, Music, Archive, Download, Eye, X, Loader2 } from 'lucide-react';
import type { MessageFile } from '../../../types';
import { getFileCategory, formatFileSize, isPreviewable } from '../services/fileUploadService';
import type { FileUploadState } from '../types';

interface FileAttachmentProps {
  file: MessageFile;
  onPreview?: (file: MessageFile) => void;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onPreview }) => {
  const category = getFileCategory(file.type);
  const previewable = isPreviewable(file.type);

  const iconMap = {
    image: <Image className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    audio: <Music className="w-4 h-4" />,
    document: <FileText className="w-4 h-4" />,
    archive: <Archive className="w-4 h-4" />,
    unknown: <FileText className="w-4 h-4" />,
  };

  const colorMap = {
    image: 'text-purple-500 bg-purple-500/10',
    video: 'text-blue-500 bg-blue-500/10',
    audio: 'text-emerald-500 bg-emerald-500/10',
    document: 'text-amber-500 bg-amber-500/10',
    archive: 'text-rose-500 bg-rose-500/10',
    unknown: 'text-zinc-500 bg-zinc-500/10',
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-[var(--surface-glass)] transition-colors">
      <div className={`w-8 h-8 rounded-lg ${colorMap[category]} flex items-center justify-center shrink-0`}>
        {iconMap[category]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{file.name}</p>
        <p className="text-[8px] text-[var(--text-muted)] font-medium">{formatFileSize(file.size)}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {previewable && onPreview && (
          <button
            onClick={() => onPreview(file)}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
            title="Önizle"
          >
            <Eye className="w-3 h-3" />
          </button>
        )}
        <a
          href={file.url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
          title="İndir"
        >
          <Download className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

interface UploadProgressProps {
  upload: FileUploadState;
  onRemove: (id: string) => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ upload, onRemove }) => {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
        {upload.status === 'uploading' || upload.status === 'processing' ? (
          <Loader2 className="w-4 h-4 text-[var(--accent-color)] animate-spin" />
        ) : upload.status === 'error' ? (
          <X className="w-4 h-4 text-rose-500" />
        ) : (
          <FileText className="w-4 h-4 text-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{upload.file.name}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-color)] transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <span className="text-[8px] font-bold text-[var(--text-muted)]">{upload.progress}%</span>
        </div>
      </div>
      <button
        onClick={() => onRemove(upload.id)}
        className="w-5 h-5 rounded flex items-center justify-center hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
