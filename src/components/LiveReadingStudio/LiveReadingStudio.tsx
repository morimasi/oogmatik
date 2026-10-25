import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mic,
  MicOff,
  Sliders,
  FileDown,
  Sparkles,
  ChevronRight,
  HelpCircle,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Volume2
} from 'lucide-react';
import { EduMascot, MascotState } from './EduMascot';
import { AudioWaveform } from './AudioWaveform';
import { ReadingRulerStage } from './ReadingRulerStage';
import { CoachSettingsDrawer, CoachSettings } from './CoachSettingsDrawer';
import { SAMPLE_READING_PASSAGES, ReadingPassage, parseCustomTextToPassage } from './sampleStories';
import { LiveReadingCoachService } from '../../services/liveReadingCoachService';
import { ReadingSessionMetrics } from '../../services/phonological/phonologicalScoringEngine';
import { ReadingAssessmentPdfGenerator } from '../../services/pdf/ReadingAssessmentPdfGenerator';
import { useStudentStore } from '../../store/useStudentStore';
import { useToastStore } from '../../store/useToastStore';

interface LiveReadingStudioProps {
  onBack?: () => void;
  initialPassage?: ReadingPassage;
}

export const LiveReadingStudio: React.FC<LiveReadingStudioProps> = ({
  onBack,
  initialPassage,
}) => {
  const { activeStudent } = useStudentStore();
  const toast = useToastStore();

  // Aktif Metin
  const [selectedPassage, setSelectedPassage] = useState<ReadingPassage>(
    initialPassage || SAMPLE_READING_PASSAGES[0]
  );

  // Stüdyo Durumu
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [highlightedSyllable, setHighlightedSyllable] = useState<string | null>(null);
  const [mascotState, setMascotState] = useState<MascotState>('idle');
  const [coachMessage, setCoachMessage] = useState<string>(
    'Merhaba! Ben senin okuma koçunum. Hazırsan mikrofonu açıp okumaya başlayabilirsin.'
  );
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [sessionMetrics, setSessionMetrics] = useState<ReadingSessionMetrics | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');

  // Okuduğunu Anlama Mini Soruları Durumu
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [activeModalTab, setActiveModalTab] = useState<'metrics' | 'comprehension'>('metrics');

  // Ayarlar
  const [settings, setSettings] = useState<CoachSettings>({
    patienceThresholdSeconds: 3.0,
    scaffoldingLevel: 'hece',
    mascot: 'baykus',
    fontSize: 24,
    isRulerActive: true,
    isSyllableColoringActive: false,
    isVoiceActive: true,
  });

  // Koç Servisi Referansı
  const coachRef = useRef<LiveReadingCoachService | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Koç Servisini Başlat
  useEffect(() => {
    coachRef.current = new LiveReadingCoachService({
      onWordAdvanced: (index) => {
        setCurrentWordIndex(index);
      },
      onSyllableHighlighted: (syl) => {
        setHighlightedSyllable(syl);
      },
      onMascotStateChange: (state) => {
        setMascotState(state);
      },
      onCoachMessage: (msg) => {
        setCoachMessage(msg);
      },
      onVolumeChange: (rms) => {
        setCurrentVolume(rms);
      },
      onSessionComplete: (metrics) => {
        setIsSessionActive(false);
        setSessionMetrics(metrics);
        setUserAnswers({});
        setActiveModalTab('metrics');
        if (timerRef.current) clearInterval(timerRef.current);
        toast.success('Tebrikler! Okuma seansı başarıyla tamamlandı.');
      },
      onError: (err) => {
        toast.error(err.message || 'Mikrofon başlatılamadı.');
        setIsSessionActive(false);
      },
    });

    return () => {
      coachRef.current?.stopSession();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [toast]);

  // Zamanlayıcı
  useEffect(() => {
    if (isSessionActive) {
      setSessionDuration(0);
      timerRef.current = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  // Seansı Başlat / Duraklat
  const handleToggleSession = async () => {
    if (!coachRef.current) return;

    if (isSessionActive) {
      coachRef.current.stopSession();
      setIsSessionActive(false);
      setMascotState('idle');
      setCoachMessage('Okuma duraklatıldı. İstediğin zaman tekrar devam edebilirsin.');
    } else {
      setSessionMetrics(null);
      setUserAnswers({});
      coachRef.current.setPatienceThreshold(settings.patienceThresholdSeconds);
      await coachRef.current.startSession(selectedPassage);
      setIsSessionActive(true);
      setCurrentWordIndex(0);
      setHighlightedSyllable(null);
    }
  };

  // Manuel Kelime İlerletme (Öğretmen / Öğrenci Tıklaması)
  const handleAdvanceManually = () => {
    if (!coachRef.current) return;
    coachRef.current.advanceWord();
  };

  // İpucu İste
  const handleRequestHint = () => {
    if (!coachRef.current || !selectedPassage) return;
    const currentWord = selectedPassage.words[currentWordIndex];
    const syllables = selectedPassage.syllabifiedWords[currentWordIndex] || [currentWord];
    const firstSyllable = syllables[0] || currentWord.slice(0, 2);

    setHighlightedSyllable(firstSyllable);
    setMascotState('hinting');
    setCoachMessage(`Hadi bakalım: "${firstSyllable}-..."`);
    coachRef.current.speakVoiceHint(`Hadi bakalım: ${firstSyllable}`);
  };

  // Metin Değiştir
  const handleSelectPassage = (passage: ReadingPassage) => {
    if (isSessionActive && coachRef.current) {
      coachRef.current.stopSession();
      setIsSessionActive(false);
    }
    setSelectedPassage(passage);
    setCurrentWordIndex(0);
    setHighlightedSyllable(null);
    setSessionMetrics(null);
    setUserAnswers({});
    setMascotState('idle');
    setCoachMessage(`"${passage.title}" seçildi. Hazırsan mikrofonu açıp okuyabilirsin.`);
  };

  // Özel Metin Ekle
  const handleSaveCustomPassage = () => {
    if (!customText.trim()) return;
    const newPassage = parseCustomTextToPassage(customTitle, customText);
    setSelectedPassage(newPassage);
    setShowCustomModal(false);
    setCustomTitle('');
    setCustomText('');
    setCurrentWordIndex(0);
    setSessionMetrics(null);
    setUserAnswers({});
    toast.success('Özel okuma metni yüklendi ve otomatik hecelendi!');
  };

  // Zafer Aydın PDF Karnesini İndir
  const handleExportPdf = () => {
    const studentDisplayName = activeStudent?.name || 'Sevgili Öğrenci';

    if (!sessionMetrics) {
      const metrics = coachRef.current?.completeSession();
      if (metrics) {
        ReadingAssessmentPdfGenerator.generate({
          studentName: studentDisplayName,
          passage: selectedPassage,
          metrics,
        });
      }
      return;
    }

    ReadingAssessmentPdfGenerator.generate({
      studentName: studentDisplayName,
      passage: selectedPassage,
      metrics: sessionMetrics,
    });
    toast.success('Sesli okuma karnesi A4 PDF olarak indirildi.');
  };

  // Anlama Sorusu Cevaplama
  const handleAnswerQuestion = (qId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
    const question = selectedPassage.comprehensionQuestions?.find((q) => q.id === qId);
    if (!question) return;

    if (optionIdx === question.correctIndex) {
      setMascotState('celebrating');
      coachRef.current?.speakVoiceHint('Harika! Doğru cevap.');
    } else {
      setMascotState('hinting');
      coachRef.current?.speakVoiceHint('Neredeyse doğruydu! Hadi ipucunu hatırla.');
    }
  };

  // Dakika:Saniye Formatı
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Canlı WCPM Tahmini
  const liveWcpm = sessionDuration > 3
    ? Math.round((currentWordIndex / sessionDuration) * 60)
    : 0;

  return (
    <div className="relative min-h-screen w-full bg-[#08080C] text-white font-lexend overflow-x-hidden flex flex-col">
      {/* Arka Plan Atmosferik Parlamalar */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ÜST BAR (Top Navigation & Metrics) */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/60 backdrop-blur-2xl">
        {/* Sol: Geri ve Başlık */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Stüdyodan Çık</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-indigo-300 bg-clip-text text-transparent">
                CANLI AI OKUMA KOÇU
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.1 Ultra
              </span>
            </div>
            {activeStudent && (
              <p className="text-[11px] text-zinc-400">
                Öğrenci: <strong className="text-zinc-200">{activeStudent.name}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Orta: Canlı İstatistik Rozetleri */}
        <div className="hidden md:flex items-center gap-3">
          {/* Süre */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Süre:</span>
            <span className="font-mono font-bold text-amber-300">{formatTime(sessionDuration)}</span>
          </div>

          {/* Anlık WCPM */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Hız:</span>
            <span className="font-bold text-emerald-400">{liveWcpm} <span className="text-[10px] font-normal text-zinc-500">kel/dk</span></span>
          </div>

          {/* Okunan Kelime */}
          <div className="px-3.5 py-1.5 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">İlerleme:</span>
            <span className="font-bold text-indigo-300">{currentWordIndex} / {selectedPassage.words.length}</span>
          </div>
        </div>

        {/* Sağ: Metin Seçici, Ayarlar ve PDF İndir */}
        <div className="flex items-center gap-2">
          {/* Metin Değiştirici */}
          <select
            value={selectedPassage.id}
            onChange={(e) => {
              const found = SAMPLE_READING_PASSAGES.find((p) => p.id === e.target.value);
              if (found) handleSelectPassage(found);
            }}
            className="hidden sm:block text-xs bg-zinc-900 border border-white/10 rounded-2xl px-3 py-2 text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {SAMPLE_READING_PASSAGES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.ageGroup})
              </option>
            ))}
          </select>

          {/* Özel Metin Ekle */}
          <button
            onClick={() => setShowCustomModal(true)}
            title="Kendi Okuma Metnini Ekle"
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Metin Ekle</span>
          </button>

          {/* Ayarlar */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Ayarlar</span>
          </button>

          {/* PDF Karnesi */}
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">A4 Karne</span>
          </button>
        </div>
      </header>

      {/* ANA İÇERİK (Maskot, Konuşma Balonu & Okuma Sahnesi) */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-6xl mx-auto w-full">
        {/* ÜST MASKOT VE KOÇ KONUŞMA ALANI */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center gap-6 mb-8 pt-2">
          {/* SVG Canlı Maskot */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <EduMascot type={settings.mascot} state={mascotState} size={130} />
            {/* Ses Dalga Spektrumu */}
            <AudioWaveform volume={currentVolume} isActive={isSessionActive} className="mt-3" />
          </div>

          {/* Koç Konuşma Balonu */}
          <motion.div
            key={coachMessage}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative flex-1 p-5 rounded-[2rem] bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-950/80 border border-indigo-500/20 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                {settings.mascot === 'baykus' ? 'Bilge Baykuş' : settings.mascot === 'kedi' ? 'Neşeli Kedi' : 'Robot Can'}
              </span>
              <span className="text-[10px] text-zinc-500 ml-auto">
                {isSessionActive ? 'Canlı Dinleniyor...' : 'Beklemede'}
              </span>
            </div>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-medium">
              "{coachMessage}"
            </p>

            {/* Balon Oku (Sol) */}
            <div className="hidden sm:block absolute top-10 -left-2.5 w-5 h-5 bg-indigo-950/60 border-l border-b border-indigo-500/20 rotate-45" />
          </motion.div>
        </div>

        {/* ORTA OKUMA SAHNESİ (Reading Stage) */}
        <ReadingRulerStage
          passage={selectedPassage}
          currentWordIndex={currentWordIndex}
          highlightedSyllable={highlightedSyllable}
          fontSize={settings.fontSize}
          isRulerActive={settings.isRulerActive}
          isSyllableColoringActive={settings.isSyllableColoringActive}
          onWordClick={(index) => {
            coachRef.current?.setWordIndex(index);
          }}
        />

        {/* ALT KONTROL PANELİ (Child-friendly Control Bar) */}
        <div className="w-full max-w-2xl mt-8 flex items-center justify-between gap-4 p-4 rounded-[2.5rem] bg-zinc-900/70 border border-white/10 shadow-2xl backdrop-blur-2xl">
          {/* İpucu İste Butonu */}
          <button
            onClick={handleRequestHint}
            disabled={!isSessionActive}
            title="Kelime İpucu İste"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">İpucu Ver</span>
          </button>

          {/* Ana Mikrofon Başlat/Durdur Butonu */}
          <motion.button
            onClick={handleToggleSession}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-extrabold text-sm sm:text-base shadow-2xl transition-all ${
              isSessionActive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-white shadow-emerald-500/30'
            }`}
          >
            {isSessionActive ? (
              <>
                <MicOff className="w-6 h-6 animate-pulse" />
                <span>Okumayı Durdur</span>
              </>
            ) : (
              <>
                <Mic className="w-6 h-6" />
                <span>Okumaya Başla</span>
              </>
            )}
          </motion.button>

          {/* Sonraki Kelime / Manuel İlerle */}
          <button
            onClick={handleAdvanceManually}
            disabled={!isSessionActive}
            title="Kelimeyi Geç"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">Sonraki Kelime</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* SEANS TAMAMLANDI ÖZET KARTI (Modal) */}
      <AnimatePresence>
        {sessionMetrics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-xl rounded-[3rem] bg-zinc-950 border border-white/10 p-6 sm:p-8 shadow-2xl text-center font-lexend relative my-8"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto mb-3 text-amber-400">
                <Award className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-1">
                Harika Bir Seans Tamamlandı!
              </h2>
              <p className="text-xs text-zinc-400 mb-4">
                {selectedPassage.title} — {sessionMetrics.gradeLevelEquivalent}
              </p>

              {/* Sekmeler: Metrikler / Okuduğunu Anlama */}
              {selectedPassage.comprehensionQuestions && selectedPassage.comprehensionQuestions.length > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4 p-1 rounded-2xl bg-zinc-900 border border-white/5">
                  <button
                    onClick={() => setActiveModalTab('metrics')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activeModalTab === 'metrics'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Akıcılık ve Hız Raporu
                  </button>
                  <button
                    onClick={() => setActiveModalTab('comprehension')}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                      activeModalTab === 'comprehension'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Okuduğunu Anlama ({selectedPassage.comprehensionQuestions.length} Soru)
                  </button>
                </div>
              )}

              {activeModalTab === 'metrics' ? (
                <>
                  {/* Sonuç Kartları */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5 text-left">
                    <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Dakikada Doğru Kelime</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">{sessionMetrics.wcpm}</span>
                      <span className="text-[9px] text-zinc-500 block">WCPM Hızı</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Doğruluk Oranı</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-indigo-400">%{sessionMetrics.accuracyPercentage}</span>
                      <span className="text-[9px] text-zinc-500 block">{sessionMetrics.correctWordsCount}/{sessionMetrics.totalWordsRead} Kelime</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Akıcılık & Prozodi</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-amber-400">{sessionMetrics.prosodyScore}/100</span>
                      <span className="text-[9px] text-zinc-500 block">Tonlama Başarısı</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5">
                      <span className="text-[10px] text-zinc-400 block mb-0.5">Kendi Hatasını Bulma</span>
                      <span className="text-xl sm:text-2xl font-extrabold text-teal-400">{sessionMetrics.selfCorrectionCount}</span>
                      <span className="text-[9px] text-zinc-500 block">Öz-Denetim Başarısı</span>
                    </div>
                  </div>

                  {/* Pedagojik Özet */}
                  <p className="text-xs text-zinc-300 bg-white/5 p-3.5 rounded-2xl border border-white/5 mb-5 leading-relaxed text-left">
                    {sessionMetrics.pedagogicalSummary}
                  </p>
                </>
              ) : (
                /* Okuduğunu Anlama Mini Soruları */
                <div className="space-y-4 mb-5 text-left max-h-60 overflow-y-auto pr-1">
                  {selectedPassage.comprehensionQuestions?.map((q, idx) => {
                    const selectedIdx = userAnswers[q.id];
                    const isAnswered = selectedIdx !== undefined;
                    const isCorrect = isAnswered && selectedIdx === q.correctIndex;

                    return (
                      <div key={q.id} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/5 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                          Soru {idx + 1}
                        </span>
                        <p className="text-xs font-semibold text-white">{q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedIdx === optIdx;
                            const isOptionCorrect = optIdx === q.correctIndex;

                            let btnStyle = 'bg-zinc-800/80 border-white/5 text-zinc-300 hover:bg-zinc-800';
                            if (isAnswered) {
                              if (isOptionCorrect) {
                                btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold';
                              } else if (isChosen) {
                                btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-300';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleAnswerQuestion(q.id, optIdx)}
                                className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && isOptionCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                                {isAnswered && isChosen && !isOptionCorrect && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                              </button>
                            );
                          })}
                        </div>
                        {isAnswered && (
                          <p className="text-[10px] text-zinc-400 italic pt-1">
                            {q.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Butonlar */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSessionMetrics(null)}
                  className="flex-1 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition-colors"
                >
                  Tekrar Oku
                </button>
                <button
                  onClick={handleExportPdf}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>A4 Karne İndir</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ÖZEL METİN GİRİŞİ MODALI */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-lg rounded-[2.5rem] bg-zinc-950 border border-white/10 p-6 sm:p-8 shadow-2xl font-lexend text-white"
            >
              <h3 className="text-lg font-bold mb-1">Özel Okuma Metni Yükle</h3>
              <p className="text-xs text-zinc-400 mb-4">
                Öğretmen veya veli olarak çocuğa çalıştırmak istediğiniz herhangi bir metni buraya yapıştırabilirsiniz. TDK kurallarına göre anında hecelerine ayrılacaktır.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Metin Başlığı</label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Örn: Hafta Sonu Pikniği"
                    className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1">Okuma Metni</label>
                  <textarea
                    rows={5}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Metni buraya yazın veya yapıştırın..."
                    className="w-full text-xs p-3 rounded-xl bg-zinc-900 border border-white/10 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs"
                >
                  İptal
                </button>
                <button
                  onClick={handleSaveCustomPassage}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-400 text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
                >
                  Metni Yükle ve Başla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AYARLAR ÇEKMECESİ */}
      <CoachSettingsDrawer
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) => {
          setSettings((prev) => ({ ...prev, ...newSettings }));
          if (newSettings.patienceThresholdSeconds && coachRef.current) {
            coachRef.current.setPatienceThreshold(newSettings.patienceThresholdSeconds);
          }
        }}
      />
    </div>
  );
};
