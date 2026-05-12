import { useRef, useEffect, useState } from 'react';
import { useVFSStore } from '../../store/useVFSStore';

/**
 * Live Preview Dashboard
 * VFS'teki kodun anlık görsel yansımasını gösterir
 * Iframe sandbox kullanarak güvenli preview sağlar
 */

export const LivePreviewDashboard: React.FC = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { files, activeFile } = useVFSStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'component' | 'full'>('component');

  useEffect(() => {
    if (!iframeRef.current) return;

    // Find active TypeScript file
    const activeFileData = activeFile ? files[activeFile] : null;
    if (!activeFileData) {
      setError('Önizlenecek dosya yok');
      return;
    }

    generatePreview(activeFileData.content);
  }, [files, activeFile, previewMode]);

  const generatePreview = (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create a sandboxed HTML preview
      const previewHTML = createSandboxHTML(code, previewMode);
      
      if (!iframeRef.current) return;

      const blob = new Blob([previewHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      iframeRef.current.src = url;

      // Cleanup
      return () => URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Preview hatası: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createSandboxHTML = (code: string, mode: 'component' | 'full'): string => {
    const isTSX = code.includes('React') || code.includes('export const');

    if (isTSX && mode === 'component') {
      // Component preview with Babel transformer
      return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      background: #f5f5f5;
      padding: 2rem;
    }
    #root { max-width: 800px; margin: 0 auto; }
    .preview-badge {
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: #6366f1;
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      font-weight: bold;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div class="preview-badge">🔍 Live Preview</div>
  <div id="root"></div>
  
  <script src="https://unpkg.com/react@19/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@19/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"></script>
  
  <script type="text/babel">
    try {
      ${code}
      
      // Try to find and render the main component
      const componentName = 'Activity' || 'Config';
      const Component = window[componentName];
      
      if (Component) {
        ReactDOM.createRoot(document.getElementById('root')).render(
          <Component />
        );
      } else {
        document.getElementById('root').innerHTML = 
          '<div class="p-8 bg-yellow-50 border border-yellow-200 rounded-lg">' +
          '<h2 class="text-xl font-bold text-yellow-800 mb-2">Preview Mode</h2>' +
          '<p class="text-sm text-yellow-700">Component otomatik bulunamadı. Kod yazıldı ama render edilemedi.</p>' +
          '</div>';
      }
    } catch (error) {
      document.getElementById('root').innerHTML = 
        '<div class="p-8 bg-red-50 border border-red-200 rounded-lg">' +
        '<h2 class="text-xl font-bold text-red-800 mb-2">❌ Preview Error</h2>' +
        '<pre class="text-sm text-red-700 font-mono">' + error.message + '</pre>' +
        '</div>';
    }
  </script>
</body>
</html>
      `;
    }

    // Full page or simple HTML preview
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: monospace; 
      background: #1a1a1a; 
      color: #e5e5e5;
      padding: 2rem;
    }
    pre { 
      background: #0d0d0d; 
      padding: 1.5rem; 
      border-radius: 0.5rem;
      overflow-x: auto;
      border: 1px solid #333;
    }
  </style>
</head>
<body>
  <h2 style="color: #6366f1; margin-bottom: 1rem;">📄 Raw Code Preview</h2>
  <pre>${escapeHTML(code)}</pre>
</body>
</html>
    `;
  };

  const escapeHTML = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleRefresh = () => {
    if (activeFile && files[activeFile]) {
      generatePreview(files[activeFile].content);
    }
  };

  const handleToggleMode = () => {
    setPreviewMode(prev => prev === 'component' ? 'full' : 'component');
  };

  return (
    <div className="w-full h-full bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="h-10 bg-[#1a1a1a] border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400">Live Preview</span>
          {isLoading && (
            <span className="text-[10px] text-indigo-400 animate-pulse">Loading...</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMode}
            className="px-2 py-1 bg-zinc-800 rounded text-xs text-white hover:bg-zinc-700 transition-colors"
            title="Toggle Preview Mode"
          >
            <i className="fa-solid fa-layer-group"></i>
          </button>
          <button
            onClick={handleRefresh}
            className="px-2 py-1 bg-zinc-800 rounded text-xs text-white hover:bg-zinc-700 transition-colors"
            title="Refresh Preview"
          >
            <i className="fa-solid fa-refresh"></i>
          </button>
          <button
            onClick={() => {
              if (iframeRef.current) {
                iframeRef.current.requestFullscreen?.();
              }
            }}
            className="px-2 py-1 bg-zinc-800 rounded text-xs text-white hover:bg-zinc-700 transition-colors"
            title="Fullscreen"
          >
            <i className="fa-solid fa-expand"></i>
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 max-w-md">
              <div className="flex items-start gap-3">
                <i className="fa-solid fa-circle-exclamation text-red-400 text-xl mt-1"></i>
                <div>
                  <h3 className="text-sm font-bold text-red-300 mb-2">Preview Hatası</h3>
                  <p className="text-xs text-red-200 font-mono">{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Live Preview"
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-zinc-300 font-medium">Preview yükleniyor...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="h-8 bg-[#1a1a1a] border-t border-zinc-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500">
          <span>
            <i className="fa-solid fa-file-code mr-1"></i>
            {activeFile || 'No file'}
          </span>
          <span>
            <i className="fa-solid fa-code mr-1"></i>
            {previewMode === 'component' ? 'Component' : 'Full'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] text-zinc-400">
            {error ? 'Error' : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
