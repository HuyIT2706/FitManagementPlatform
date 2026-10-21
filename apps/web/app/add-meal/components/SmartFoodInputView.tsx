'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Mic,
  Search,
  Sparkles,
  Loader2,
  Camera,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from '../../../utils/toast';
import { parseVietnameseFoodTokens } from '../../../utils/smartFoodParser';

interface SmartFoodInputViewProps {
  initialTab?: 'voice' | 'text' | 'camera';
  onBack: () => void;
  onAnalyze: (rawText: string) => void;
  onAnalyzeImage?: (base64Image: string) => void;
  isAnalyzing: boolean;
  onManualSearch: () => void;
}

// Typing for Web Speech API
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

export const SmartFoodInputView = ({
  initialTab = 'voice',
  onBack,
  onAnalyze,
  onAnalyzeImage,
  isAnalyzing,
  onManualSearch,
}: SmartFoodInputViewProps) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text' | 'camera'>(initialTab);
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  // Camera & Image state
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const cameraCaptureInputRef = useRef<HTMLInputElement | null>(null);
  const fileLibraryInputRef = useRef<HTMLInputElement | null>(null);

  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const accumulatedFinalRef = useRef('');
  const hasTriggeredAnalyzeRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const SILENCE_TIMEOUT_MS = 3500;
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        void 0;
      }
    }
  }, []);

  const triggerAnalyze = useCallback(
    (textToAnalyze: string) => {
      const q = textToAnalyze.trim();
      if (!q || hasTriggeredAnalyzeRef.current) return;
      hasTriggeredAnalyzeRef.current = true;
      stopListening();
      onAnalyze(q);
    },
    [onAnalyze, stopListening]
  );

  const startListening = useCallback(() => {
    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.info('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói trực tiếp. Hãy sử dụng tab Nhập văn bản nhé!');
      setActiveTab('text');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          void 0;
        }
      }

      hasTriggeredAnalyzeRef.current = false;
      latestTranscriptRef.current = '';
      accumulatedFinalRef.current = '';

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let sessionFinalTranscript = '';
        let sessionInterimTranscript = '';

        // Accumulate ALL results in this recognition session from index 0 to avoid dropping earlier words
        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item && item[0]) {
            const transcriptPiece = item[0].transcript || '';
            if (item.isFinal) {
              sessionFinalTranscript += (sessionFinalTranscript ? ' ' : '') + transcriptPiece.trim();
            } else {
              sessionInterimTranscript += (sessionInterimTranscript ? ' ' : '') + transcriptPiece.trim();
            }
          }
        }

        // Combine previously accumulated text (across browser auto-restarts) with current session text
        const parts = [
          accumulatedFinalRef.current,
          sessionFinalTranscript,
          sessionInterimTranscript,
        ].filter(Boolean);

        const fullText = parts.join(' ').replace(/\s+/g, ' ').trim();

        if (fullText) {
          setSpeechTranscript(fullText);
          latestTranscriptRef.current = fullText;

          // Auto-trigger analyze after 2.8s of silence after user finishes speaking
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          silenceTimeoutRef.current = setTimeout(() => {
            triggerAnalyze(latestTranscriptRef.current);
          }, SILENCE_TIMEOUT_MS);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
        if (event.error === 'not-allowed') {
          toast.error('Vui lòng cấp quyền truy cập Microphone cho trình duyệt.');
          isListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // If Chrome/browser ended on its own due to momentary silence, but user is still speaking
        // and silence timer has not fired yet:
        if (isListeningRef.current && !hasTriggeredAnalyzeRef.current) {
          if (latestTranscriptRef.current) {
            accumulatedFinalRef.current = latestTranscriptRef.current;
          }
          try {
            recognition.start();
            return;
          } catch {
            // Cannot restart, finish gracefully below
          }
        }

        isListeningRef.current = false;
        setIsListening(false);
        if (latestTranscriptRef.current.trim() && !hasTriggeredAnalyzeRef.current) {
          triggerAnalyze(latestTranscriptRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [triggerAnalyze]);

  // Clean up when switching away from voice tab or unmounting
  useEffect(() => {
    if (activeTab !== 'voice') {
      stopListening();
    }
  }, [activeTab, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          void 0;
        }
      }
    };
  }, [stopListening]);

  const handleMicToggle = () => {
    if (isListeningRef.current || isListening) {
      const text = latestTranscriptRef.current.trim() || speechTranscript.trim();
      stopListening();
      if (text && !hasTriggeredAnalyzeRef.current) {
        triggerAnalyze(text);
      }
    } else {
      hasTriggeredAnalyzeRef.current = false;
      latestTranscriptRef.current = '';
      accumulatedFinalRef.current = '';
      setSpeechTranscript('');
      startListening();
    }
  };

  const handleAnalyzeText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      toast.error('Vui lòng nhập tên món ăn và trọng lượng');
      return;
    }
    onAnalyze(textInput.trim());
  };

  // Client-side image compression with Canvas
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDimension = 1024;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        };
        img.onerror = () => reject(new Error('Không thể đọc hình ảnh.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Không thể tải tệp hình ảnh.'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh (JPG, PNG, WebP).');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedData = await compressImage(file);
      setSelectedImagePreview(compressedData);
      e.target.value = '';
      if (onAnalyzeImage) {
        onAnalyzeImage(compressedData);
      }
    } catch (err: unknown) {
      console.error('Image compression failed:', err);
      toast.error('Không thể xử lý hình ảnh. Vui lòng thử lại!');
    } finally {
      setIsCompressing(false);
    }
  };

  const exampleSample = 'Cơm trắng 180 gram, Ức gà sống 180 gram';

  const recognizedTokens = parseVietnameseFoodTokens(
    activeTab === 'voice' ? speechTranscript : textInput
  );

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-background text-on-surface flex flex-col justify-between">
      {/* Hidden file inputs for Camera and Gallery */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraCaptureInputRef}
        onChange={handleImageFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileLibraryInputRef}
        onChange={handleImageFileChange}
        className="hidden"
      />

      <header className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        {/* 3-Tab Segmented Control */}
        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-full border border-slate-200/80 dark:border-white/10">
          {/* 1. Chụp ảnh */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('camera');
              stopListening();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-white/20 text-[#82c91e] dark:text-[#82c91e] shadow-xs'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Camera size={13} className="shrink-0" />
            <span>Chụp ảnh</span>
          </button>

          {/* 2. Nhập nói */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('voice');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white dark:bg-white/20 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Mic size={13} className="shrink-0" />
            <span>Giọng nói</span>
          </button>

          {/* 3. Văn bản */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              stopListening();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <FileText size={13} className="shrink-0" />
            <span>Văn bản</span>
          </button>
        </div>

        <div className="w-9" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto w-full px-5 sm:px-6 pt-6 sm:pt-8 pb-6 text-center">
        {/* ==================== TAB 1: CAMERA ==================== */}
        {activeTab === 'camera' && (
          <div className="w-full flex flex-col items-center">
            {selectedImagePreview ? (
              /* Image Preview & Scanning Card */
              <div className="w-full flex flex-col items-center">
                <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/15 bg-slate-900 shadow-2xl mb-6 group">
                  {/* The captured meal image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedImagePreview}
                    alt="Bữa ăn của bạn"
                    className="w-full h-full object-cover"
                  />

                  {/* Laser Scanning Animation if analyzing */}
                  {isAnalyzing && (
                    <motion.div
                      initial={{ top: '0%' }}
                      animate={{ top: '95%' }}
                      transition={{
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 1.8,
                        ease: 'easeInOut',
                      }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#82c91e] to-transparent shadow-[0_0_15px_#82c91e] z-10"
                    />
                  )}

                  {/* Dark Glass Overlay during processing */}
                  {(isAnalyzing || isCompressing) && (
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 z-20">
                      <div className="px-5 py-3 rounded-2xl bg-black/75 border border-white/20 text-white flex items-center gap-2.5 shadow-2xl">
                        <Loader2 size={18} className="animate-spin text-[#82c91e]" />
                        <span className="text-xs sm:text-sm font-bold">
                          {isCompressing
                            ? 'Đang tối ưu ảnh...'
                            : 'Đang nhận diện món ăn...'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Retake / Re-analyze buttons */}
                {!isAnalyzing && (
                  <div className="w-full flex flex-col gap-2.5 mb-6">
                    <button
                      type="button"
                      onClick={() => onAnalyzeImage?.(selectedImagePreview)}
                      className="w-full py-3.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(102,200,28,0.4)] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={18} />
                      <span>Phân tích lại ảnh này</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => cameraCaptureInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Camera size={16} className="text-[#82c91e]" />
                        <span>Chụp lại</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileLibraryInputRef.current?.click()}
                        className="py-3 px-4 rounded-2xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white font-bold text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <ImageIcon size={16} className="text-blue-500" />
                        <span>Chọn ảnh khác</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Initial State: Prompt user to snap photo or pick from gallery */
              <div className="w-full flex flex-col items-center">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
                  Chụp ảnh bữa ăn để phân tích
                </h1>

                {/* Main Action Cards */}
                <div className="w-full flex flex-col gap-3.5 mb-8">
                  {/* Button 1: Snap Photo Immediately */}
                  <button
                    type="button"
                    onClick={() => cameraCaptureInputRef.current?.click()}
                    className="w-full p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/5 dark:to-transparent border-2 border-emerald-500/30 dark:border-[#82c91e]/40 hover:border-[#82c91e] active:scale-[0.98] transition-all flex items-center gap-4 cursor-pointer text-left shadow-lg group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#82c91e] text-black flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(130,201,30,0.4)] group-hover:scale-110 transition-transform">
                      <Camera size={26} />
                    </div>
                    <div>
                      <div className="font-black text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Chụp ảnh ngay</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#82c91e]/20 text-[#82c91e] text-[10px] font-extrabold uppercase">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                        Mở camera chụp đĩa đồ ăn trước mặt bạn
                      </p>
                    </div>
                  </button>

                  {/* Button 2: Pick from Library */}
                  <button
                    type="button"
                    onClick={() => fileLibraryInputRef.current?.click()}
                    className="w-full p-4 rounded-3xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 active:scale-[0.98] transition-all flex items-center gap-4 cursor-pointer text-left shadow-xs group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <ImageIcon size={22} />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        Chọn ảnh từ thư viện
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/60 mt-0.5">
                        Tải ảnh chụp bữa ăn có sẵn trong máy
                      </p>
                    </div>
                  </button>
                </div>

                {/* Pro-tip Card */}
                <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-left mb-6">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed">
                    <strong className="font-bold">Mẹo chụp chuẩn:</strong> Đặt góc máy từ trên cao nhìn xuống bao trọn toàn bộ đĩa thức ăn trong điều kiện đủ sáng để nhận diện chính xác nhất.
                  </p>
                </div>
              </div>
            )}

            {/* Manual Search Button */}
            <button
              type="button"
              onClick={onManualSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/10 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer mt-2"
            >
              <Search size={15} className="text-slate-400" />
              <span>Tìm kiếm thủ công</span>
            </button>
          </div>
        )}

        {/* ==================== TAB 2: VOICE ==================== */}
        {activeTab === 'voice' && (
          <>
            {/* Voice Mode Instructions */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-5">
              Hãy đọc chậm và rõ ràng, Nhấn mic để nói nhé.
            </h1>

            {/* Spoken Quote / Example */}
            <div
              onClick={() => {
                const sample = speechTranscript || exampleSample;
                setSpeechTranscript(sample);
                triggerAnalyze(sample);
              }}
              className="mb-6 px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 max-w-xs transition-all cursor-pointer hover:bg-emerald-500/15"
              title="Nhấn để phân tích câu này ngay"
            >
              <p className="text-emerald-600 dark:text-primary font-bold text-sm sm:text-base leading-relaxed break-words">
                &ldquo;{speechTranscript || exampleSample}&rdquo;
              </p>
            </div>

            {/* Live Token Preview if detected */}
            {recognizedTokens.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-6">
                {recognizedTokens.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1"
                  >
                    <span>{t.query}</span>
                    <span className="text-primary font-black">({t.weight}g)</span>
                  </span>
                ))}
              </div>
            )}

            {/* Manual Search Button */}
            <button
              type="button"
              onClick={onManualSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 text-slate-700 dark:text-white/80 hover:bg-slate-50 dark:hover:bg-white/10 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer mb-8"
            >
              <Search size={15} className="text-slate-400" />
              <span>Tìm kiếm thủ công</span>
            </button>

            {/* Auto-analyzing indicator */}
            {isAnalyzing && (
              <div className="mb-6 flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-primary text-xs sm:text-sm font-extrabold animate-pulse shadow-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Đang phân tích món ăn giúp bạn...</span>
              </div>
            )}

            {/* Large Glowing Microphone Button Area */}
            <div className="my-auto py-6 flex flex-col items-center justify-center relative">
              {/* Outer Pulsing Aura Circles */}
              <div
                className={`absolute w-64 h-64 rounded-full pointer-events-none transition-all duration-700 ${
                  isListening
                    ? 'bg-emerald-500/15 dark:bg-primary/15 animate-ping opacity-75'
                    : 'bg-emerald-500/5 dark:bg-primary/5 opacity-40'
                }`}
              />
              <div
                className={`absolute w-48 h-48 rounded-full pointer-events-none transition-all duration-500 ${
                  isListening
                    ? 'bg-emerald-500/20 dark:bg-primary/20 animate-pulse'
                    : 'bg-emerald-500/10 dark:bg-primary/10'
                }`}
              />

              {/* Main Circular Mic Button */}
              <button
                type="button"
                onClick={handleMicToggle}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
                  isListening
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 border-4 border-emerald-500 dark:border-primary scale-105'
                    : 'bg-slate-100 dark:bg-white/10 hover:bg-emerald-50 dark:hover:bg-white/15 border-2 border-slate-200 dark:border-white/10'
                }`}
                title={isListening ? 'Nhấn để dừng nghe' : 'Nhấn để nói'}
              >
                {isListening ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-6 bg-emerald-600 dark:bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-10 bg-emerald-600 dark:bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-7 bg-emerald-600 dark:bg-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-4 bg-emerald-600 dark:bg-primary rounded-full animate-bounce [animation-delay:-0.2s]" />
                  </div>
                ) : (
                  <Mic size={34} className="text-slate-600 dark:text-white/80" />
                )}
              </button>

              <span className="mt-4 text-xs font-bold text-slate-500 dark:text-white/60">
                {isListening ? 'Đang lắng nghe...' : 'Nhấn vào micro để nói'}
              </span>

              {/* Instant Analyze button while recording */}
              {isListening && speechTranscript && (
                <button
                  type="button"
                  onClick={() => {
                    const text = latestTranscriptRef.current.trim() || speechTranscript.trim();
                    if (text) {
                      triggerAnalyze(text);
                    }
                  }}
                  className="mt-3.5 px-5 py-2.5 rounded-full bg-primary text-black font-extrabold text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all shadow-[0_0_15px_rgba(102,200,28,0.35)] flex items-center gap-2 cursor-pointer animate-in fade-in zoom-in-95 duration-200"
                >
                  <Sparkles size={16} />
                  <span>Xong & Phân tích ngay</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* ==================== TAB 3: TEXT ==================== */}
        {activeTab === 'text' && (
          <div className="w-full text-left">
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center">
              Nhập nhiều món ăn cùng lúc
            </h2>
            <form onSubmit={handleAnalyzeText} className="space-y-4">
              <div className="relative">
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Nhập món ăn, ví dụ: cơm trắng 180g ức gà sống 180g, 1 quả trứng..."
                  className="w-full p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-2xl text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:border-primary resize-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              {/* Tokens Preview */}
              {recognizedTokens.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {recognizedTokens.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1"
                    >
                      <span>{t.query}</span>
                      <span className="text-primary font-black">({t.weight}g)</span>
                    </span>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={!textInput.trim() || isAnalyzing}
                className="w-full py-3.5 rounded-2xl bg-primary text-black font-extrabold text-sm hover:opacity-90 active:scale-95 transition-all shadow-[0_0_15px_rgba(102,200,28,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Đang tìm món...</span>
                  </>
                ) : (
                  <>
                    <span>Phân tích & Tìm món</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onManualSearch}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white transition-colors text-center cursor-pointer"
              >
                Hoặc tìm kiếm thủ công từng món
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Safe bottom spacing */}
      <div className="h-6" />
    </div>
  );
};
