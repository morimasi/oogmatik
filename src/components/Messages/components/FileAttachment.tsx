import { FileText, Image, Video, Music, Archive, Download, Eye, X, Loader2 } from 'lucide-react';
import type { MessageFile } from '../../../types';
import { getFileCategory, formatFileSize, isPreviewable } from '../services/fileUploadService';
import type { FileUploadState } from '../types';

interface FileAttachmentProps {
  file: MessageFile;
  onPreview?: (file: MessageFile) => void;
  compact?: boolean;
}

const FILE_ICON_MAP = {
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  archive: <Archive className="w-4 h-4" />,
  unknown: <FileText className="w-4 h-4" />,
};

const FILE_COLOR_MAP = {
  image: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  video: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  audio: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  document: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  archive: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
  unknown: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
};

export const FileAttachment: React.FC<FileAttachmentProps> = ({ file, onPreview, compact = false }) => {
  const category = file.mimeCategory ?? getFileCategory(file.type);
  const previewable = isPreviewable(file.type);
  const hasThumbnail = !!file.thumbnailUrl && category === 'image';

  // Resim dosyaları için thumbnail göster
  if (hasThumbnail && !compact) {
    return (
      <div className="relative group rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)]" style={{ maxWidth: 220 }}>
        <img
          src={file.thumbnailUrl}
          alt={file.name}
          className="w-full object-cover"
          style={{ maxHeight: 160 }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          {previewable && onPreview && (
            <button
              onClick={() => onPreview(file)}
              className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-800 hover:bg-white transition-all shadow-lg"
              title="Önizle"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-gray-800 hover:bg-white transition-all shadow-lg"
            title="İndir"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
        {/* Dosya adı alt bar */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
          <p className="text-[9px] text-white font-medium truncate">{file.name}</p>
          <p className="text-[7px] text-white/60">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  }

  // Video için play button overlay
  if (category === 'video' && !compact) {
    return (
      <div
        className={`flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-[var(--surface-glass)] transition-colors cursor-pointer`}
        onClick={() => onPreview?.(file)}
        style={{ maxWidth: 260 }}
      >
        <div className={`w-10 h-10 rounded-lg ${FILE_COLOR_MAP[category]} border flex items-center justify-center shrink-0 relative`}>
          {FILE_ICON_MAP[category]}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full bg-blue-500/80 flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white fill-white ml-0.5" viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9"/></svg>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{file.name}</p>
          <p className="text-[8px] text-[var(--text-muted)] font-medium">{formatFileSize(file.size)} • Video</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <a
            href={file.url}
            download={file.name}
            target="_blank"
            rel="noopener noreferrer"
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all"
            title="İndir"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] group hover:bg-[var(--surface-glass)] transition-colors" style={{ maxWidth: 260 }}>
      <div className={`w-8 h-8 rounded-lg ${FILE_COLOR_MAP[category]} border flex items-center justify-center shrink-0`}>
        {FILE_ICON_MAP[category]}
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

// ─── Upload Progress bileşeni (MessageComposer içinde kullanılır) ───────────
interface UploadProgressProps {
  upload: FileUploadState;
  onRemove: (id: string) => void;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ upload, onRemove }) => {
  const category = getFileCategory(upload.file.type);
  const colors: Record<string, string> = {
    image: 'bg-purple-500', video: 'bg-blue-500', audio: 'bg-emerald-500',
    document: 'bg-amber-500', archive: 'bg-rose-500', unknown: 'bg-zinc-500',
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
      <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center shrink-0">
        {upload.status === 'uploading' || upload.status === 'processing' ? (
          <Loader2 className="w-4 h-4 text-[var(--accent-color)] animate-spin" />
        ) : upload.status === 'error' ? (
          <X className="w-4 h-4 text-rose-500" />
        ) : (
          FILE_ICON_MAP[category]
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[var(--text-primary)] truncate">{upload.file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${colors[category] ?? 'bg-[var(--accent-color)]'} transition-all duration-300`}
              style={{ width: `${upload.progress}%` }}
            />
          </div>
          <span className="text-[8px] font-bold text-[var(--text-muted)]">
            {upload.status === 'complete' ? '✓' : upload.status === 'error' ? '✗' : `${upload.progress}%`}
          </span>
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
