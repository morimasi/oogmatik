import React from 'react';
import { CreativeStudio } from './CreativeStudio/index';
import { useOCRScanner } from './OCRScanner/useOCRScanner';
import { OCRToast } from './OCRScanner/OCRToast';
import { OCRProgressTracker } from './OCRScanner/OCRProgressTracker';
import { OCRUploader } from './OCRScanner/OCRUploader';
import { OCRStudio, StudentSelector } from './OCRScanner/OCRStudio';
import { OCRResults } from './OCRScanner/OCRResults';
import { OCRVariations } from './OCRScanner/OCRVariations';

interface OCRScannerProps {
  onBack: () => void;
  onResult: (data: any) => void;
}
export const OCRScanner = ({ onBack, onResult }: OCRScannerProps) => {
  const {
    step, setStep,
    images, activeImageIndex,
    blueprintData, setBlueprintData,
    editedTitle, setEditedTitle,
    editedBlueprint, setEditedBlueprint,
    isEditingBlueprint, setIsEditingBlueprint,
    difficulty, setDifficulty,
    variantCount, setVariantCount,
    itemCount, setItemCount,
    concept, setConcept,
    finalData, setFinalData,
    toast,
    retryCount,
    progressStartTime,
    isDragOver,
    fileInputRef, dropZoneRef,
    variationResults, variationCount, setVariationCount,
    activeStudent, students, setActiveStudent,
    showToast,
    handleFile,
    handleDragOver, handleDragLeave, handleDrop,
    removeImage, analyzeImageAt,
    handleGenerateVariations,
  } = useOCRScanner(onBack, onResult);

  return (
    <div className="h-full flex flex-col bg-[#0d0d0f] absolute inset-0 z-50 overflow-hidden font-['Lexend'] text-white">
      <div className="h-16 bg-[#16161a] border-b border-white/5 flex justify-between items-center px-6 shrink-0 z-50">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 border border-white/10 transition-all"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400">
            OCR Stüdyosu
          </h2>
          <span className="text-[8px] font-bold opacity-30 tracking-[0.2em]">
            AKILLI MATERYAL TARAYICI
          </span>
        </div>
        <StudentSelector
          students={students}
          activeStudent={activeStudent}
          onSelect={setActiveStudent}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        {step === 'upload' && (
          <OCRUploader
            images={images}
            isDragOver={isDragOver}
            dropZoneRef={dropZoneRef}
            fileInputRef={fileInputRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onFileChange={handleFile}
            onRemoveImage={removeImage}
            onAnalyzeImage={analyzeImageAt}
            onAddFile={() => fileInputRef.current?.click()}
            onCreateFromBlueprint={() => {
              setBlueprintData({ worksheetBlueprint: '...', title: 'Yeni Etkinlik' });
              setStep('studio');
            }}
            onCreativeStudio={() => setStep('creative')}
          />
        )}

        {step === 'creative' && (
          <CreativeStudio onResult={onResult} onCancel={() => setStep('upload')} />
        )}

        {step === 'analyzing' && (
          <OCRProgressTracker
            phase="analyzing"
            startTime={progressStartTime}
            retryCount={retryCount}
          />
        )}

        {step === 'studio' && blueprintData && (
          <OCRStudio
            images={images}
            activeImageIndex={activeImageIndex}
            blueprintData={blueprintData}
            editedTitle={editedTitle}
            editedBlueprint={editedBlueprint}
            isEditingBlueprint={isEditingBlueprint}
            difficulty={difficulty}
            itemCount={itemCount}
            variantCount={variantCount}
            concept={concept}
            variationCount={variationCount}
            activeStudent={activeStudent}
            students={students}
            onTitleChange={setEditedTitle}
            onBlueprintChange={setEditedBlueprint}
            onToggleEditBlueprint={() => setIsEditingBlueprint(!isEditingBlueprint)}
            onDifficultyChange={setDifficulty}
            onItemCountChange={setItemCount}
            onVariantCountChange={setVariantCount}
            onConceptChange={setConcept}
            onVariationCountChange={setVariationCount}
            onAnalyzeImage={analyzeImageAt}
            onBack={() => setStep('upload')}
            onGenerate={() => {}}
            onGenerateVariations={handleGenerateVariations}
            onSelectStudent={setActiveStudent}
            onAddFile={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            handleFile={handleFile}
          />
        )}

        {step === 'generating' && (
          <OCRProgressTracker
            phase="generating"
            startTime={progressStartTime}
            retryCount={0}
            variantCount={variantCount}
            activeStudent={activeStudent}
          />
        )}

        {step === 'result' && finalData && (
          <OCRResults finalData={finalData} onResult={onResult} />
        )}

        {step === 'variations' && variationResults && (
          <OCRVariations
            variationResults={variationResults}
            onBack={() => setStep('studio')}
            onAddToWorksheet={(variation) => {
              onResult(variation);
              showToast('✅ Varyasyon çalışma kâğıdına eklendi!', 'success');
            }}
          />
        )}
      </div>

      {toast && <OCRToast message={toast.message} type={toast.type} onClose={() => {}} />}

      <style>{`
        @keyframes progress { 0% { left: -100%; width: 60%; } 100% { left: 100%; width: 60%; } }
        .animate-progress { position: relative; animation: progress 2s infinite cubic-bezier(0.65, 0, 0.35, 1); }
      `}</style>
    </div>
  );
};
