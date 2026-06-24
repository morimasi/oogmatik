import React from 'react';

interface OCRUploaderProps {
  images: string[];
  isDragOver: boolean;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onAnalyzeImage: (index: number) => void;
  onAddFile: () => void;
  onCreateFromBlueprint: () => void;
  onCreativeStudio: () => void;
}

export const OCRUploader = ({
  images,
  isDragOver,
  dropZoneRef,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveImage,
  onAnalyzeImage,
  onAddFile,
  onCreateFromBlueprint,
  onCreativeStudio,
}: OCRUploaderProps) => {
  return (
    <div
      ref={dropZoneRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700 max-w-4xl mx-auto relative transition-all ${isDragOver ? 'scale-[1.02]' : ''
        }`}
    >
      {isDragOver && (
        <div className="absolute inset-0 bg-indigo-600/20 border-4 border-dashed border-indigo-400 rounded-[4rem] z-40 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-24 h-24 bg-indigo-500/30 rounded-[2rem] flex items-center justify-center text-5xl text-indigo-300 mb-6 animate-bounce">
            <i className="fa-solid fa-cloud-arrow-up"></i>
          </div>
          <h3 className="text-2xl font-black text-indigo-300">Görselleri Buraya Bırakın</h3>
          <p className="text-indigo-400/60 text-xs font-bold mt-2">JPG, PNG, WEBP veya PDF</p>
        </div>
      )}

      <div className="w-24 h-24 bg-indigo-600 rounded-[2.2rem] flex items-center justify-center text-4xl mb-8 shadow-2xl border-4 border-indigo-400/30 rotate-3 animate-pulse">
        <i className="fa-solid fa-dna"></i>
      </div>
      <h1 className="text-5xl font-black mb-4 tracking-tighter text-white">
        Materyal Tara
      </h1>
      <p className="text-slate-400 max-w-xl mb-6 text-lg leading-relaxed font-medium">
        Görselleri sürükle-bırak veya dosya seçerek yükleyin. PDF desteği de var!
      </p>
      <div className="text-xs text-slate-600 mb-8 font-medium flex items-center gap-4 flex-wrap justify-center">
        <span>
          <i className="fa-solid fa-circle-info mr-1.5 text-indigo-500"></i>JPG, PNG, WEBP, PDF
        </span>
        <span>
          <i className="fa-solid fa-images mr-1.5 text-indigo-500"></i>Maks. 5 Görsel
        </span>
        <span>
          <i className="fa-solid fa-hand-pointer mr-1.5 text-indigo-500"></i>Sürükle & Bırak
        </span>
      </div>

      {images.length > 0 && (
        <div className="w-full mb-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-3 px-4 custom-scrollbar justify-center">
            {images.map((img: string, i: number) => (
              <div key={i} className="relative group shrink-0">
                <img
                  src={img}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10 group-hover:border-indigo-400/50 transition-all"
                  alt={`Görsel ${i + 1}`}
                />
                <button
                  onClick={() => onRemoveImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
                <button
                  onClick={() => onAnalyzeImage(i)}
                  className="absolute inset-0 bg-indigo-600/0 hover:bg-indigo-600/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <i className="fa-solid fa-magnifying-glass text-white text-sm"></i>
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                  {i + 1}
                </span>
              </div>
            ))}
            {images.length < 5 && (
              <button
                onClick={onAddFile}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/20 hover:border-indigo-400/50 flex flex-col items-center justify-center shrink-0 text-slate-500 hover:text-indigo-400 transition-all"
              >
                <i className="fa-solid fa-plus text-lg"></i>
                <span className="text-[9px] mt-1 font-bold">Ekle</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4">
        <button
          onClick={onCreateFromBlueprint}
          className="group p-8 bg-indigo-50 border-2 border-indigo-100 text-indigo-950 rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-xl flex flex-col items-center gap-3 text-center hover:border-indigo-300"
        >
          <div className="w-14 h-14 bg-indigo-100/50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <h4 className="font-black text-lg mb-1">Şablondan Üret</h4>
            <p className="text-[10px] font-medium text-slate-500">
              Hazır mimari haritalarını kullan
            </p>
          </div>
        </button>
        <button
          onClick={onCreativeStudio}
          className="group col-span-1 md:col-span-2 p-6 bg-indigo-600 text-white rounded-[2.5rem] hover:-translate-y-2 transition-all shadow-2xl flex flex-col items-center gap-2 text-center border-4 border-transparent hover:border-indigo-400"
        >
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <div>
            <h4 className="font-black text-lg mb-1">Creative Studio</h4>
            <p className="text-[10px] font-medium text-indigo-100 opacity-70">
              Sıfırdan Serbest Üretim
            </p>
          </div>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf"
        capture="environment"
        multiple
        className="hidden"
      />
    </div>
  );
};
