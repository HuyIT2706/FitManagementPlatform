'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Mic, Search, Sparkles, Loader2 } from 'lucide-react';
import toast from '../../../utils/toast';
import { parseVietnameseFoodTokens } from '../../../utils/smartFoodParser';

interface SmartFoodInputViewProps {
  initialTab?: 'voice' | 'text';
  onBack: () => void;
  onAnalyze: (rawText: string) => void;
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
  isAnalyzing,
  onManualSearch,
}: SmartFoodInputViewProps) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>(initialTab);
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');

  const isListeningRef = useRef(false);
  const latestTranscriptRef = useRef('');
  const hasTriggeredAnalyzeRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item) {
            if (item.isFinal) {
              finalTranscript += item[0]?.transcript || '';
            } else {
              interimTranscript += item[0]?.transcript || '';
            }
          }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText) {
          setSpeechTranscript(currentText);
          latestTranscriptRef.current = currentText;

          // Auto-trigger analyze after 1.5s of silence after user finishes speaking
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }
          silenceTimeoutRef.current = setTimeout(() => {
            triggerAnalyze(latestTranscriptRef.current);
          }, 1500);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
        if (event.error === 'not-allowed') {
          toast.error('Vui lòng cấp quyền truy cập Microphone cho trình duyệt.');
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        // If speaking finished and hasn't analyzed yet, auto analyze
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
      stopListening();
      if (latestTranscriptRef.current.trim() && !hasTriggeredAnalyzeRef.current) {
        triggerAnalyze(latestTranscriptRef.current);
      }
    } else {
      hasTriggeredAnalyzeRef.current = false;
      latestTranscriptRef.current = '';
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

  const exampleSample = 'Cơm trắng 180 gram, Ức gà sống 180 gram';

  const recognizedTokens = parseVietnameseFoodTokens(
    activeTab === 'voice' ? speechTranscript : textInput
  );

  return (
    <div className="min-h-screen bg-surface-container-low dark:bg-background text-on-surface flex flex-col justify-between">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-background/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors cursor-pointer"
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center bg-slate-100 dark:bg-white/10 p-1 rounded-full border border-slate-200/80 dark:border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('text');
              stopListening();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white dark:bg-white/20 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <span>Nhập văn bản</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('voice');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-white dark:bg-white/20 text-emerald-600 dark:text-primary shadow-xs'
                : 'text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Mic size={13} className="text-emerald-500 dark:text-primary shrink-0" />
            <span>Nhập nói</span>
          </button>
        </div>

        <div className="w-9" />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start max-w-md mx-auto w-full px-6 pt-10 pb-6 text-center">
        {activeTab === 'voice' ? (
          <>
            {/* Voice Mode Instructions */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug mb-5">
              Hãy đọc chậm và rõ ràng, để Táo tìm món giúp bạn ngay.
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
                {isListening ? 'Đang lắng nghe bạn nói...' : 'Nhấn vào micro để nói'}
              </span>
            </div>
          </>
        ) : (
          /* Text Mode Area */
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
                    <Sparkles size={18} />
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
