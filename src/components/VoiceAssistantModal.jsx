import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  CornerDownLeft, 
  Check, 
  AlertCircle, 
  Volume2, 
  Calendar, 
  Tag, 
  Flame, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported, speak } from '../utils/speech';
import { parseVoiceInput } from '../utils/voiceParser';

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  tasks,
  onExecuteCommand,
  theme
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  const sampleCommands = [
    "Add urgent task Prepare investor pitch deck due tomorrow with tag Finance",
    "Create task Audit mobile accessibility high priority due Friday with tag Design",
    "Add task Run 5km cardio session low priority tag Personal",
    "Mark task Prepare investor pitch as completed",
    "Filter by urgent",
    "Switch to dark mode",
    "Read my tasks for today"
  ];

  // Initialize Speech Recognition when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setInterimTranscript('');
      setParsedResult(null);
      setErrorMsg('');
      return;
    }

    if (isSpeechRecognitionSupported()) {
      startListening();
    } else {
      setErrorMsg('Microphone API is not supported in this browser environment. You can test natural language parsing below!');
    }

    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg('');
    setTranscript('');
    setInterimTranscript('');
    setParsedResult(null);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      recognitionRef.current = createSpeechRecognizer({
        onStart: () => {
          setIsListening(true);
        },
        onResult: ({ final, interim, isFinal }) => {
          if (interim) {
            setInterimTranscript(interim);
          }
          if (final) {
            setTranscript(final);
            setInterimTranscript('');
            // Parse voice input dynamically
            const result = parseVoiceInput(final, tasks);
            setParsedResult(result);
          } else if (interim) {
            const preview = parseVoiceInput(interim, tasks);
            setParsedResult(preview);
          }
        },
        onError: (err) => {
          console.warn('Speech recognizer error:', err);
          setIsListening(false);
          if (err === 'not-allowed') {
            setErrorMsg('Microphone access was denied. Please allow microphone permissions or type a command below.');
          } else if (err === 'no-speech') {
            setErrorMsg('No speech detected. Please try speaking closer to your microphone.');
          } else {
            setErrorMsg(`Voice recognition: ${err}. You can also type commands below.`);
          }
        },
        onEnd: () => {
          setIsListening(false);
        }
      });

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (e) {
      console.warn('Failed to start recognition', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleManualSubmit = (e) => {
    if (e) e.preventDefault();
    if (!manualInput.trim()) return;

    const result = parseVoiceInput(manualInput, tasks);
    setTranscript(manualInput);
    setParsedResult(result);
  };

  const handleApplyCommand = () => {
    if (!parsedResult) return;
    onExecuteCommand(parsedResult);
    onClose();
  };

  const handleSelectSample = (sampleText) => {
    setManualInput(sampleText);
    setTranscript(sampleText);
    const result = parseVoiceInput(sampleText, tasks);
    setParsedResult(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-brand-900/60 rounded-3xl shadow-2xl overflow-hidden purple-glow transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Banner */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Voice Command Center
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  AI NLP Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak naturally to create tasks, assign priorities, set deadlines, and manage filters.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Mic Visualizer */}
        <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Animated Microphone Orb */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-brand-500/20 animate-ping" />
                <div className="absolute w-36 h-36 rounded-full bg-brand-500/10 animate-pulse" />
              </>
            )}

            <button
              onClick={isListening ? stopListening : startListening}
              className={`
                relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl
                ${isListening 
                  ? 'bg-gradient-to-tr from-rose-600 to-brand-600 shadow-rose-500/30 purple-glow-active' 
                  : 'bg-gradient-to-tr from-brand-700 to-indigo-600 hover:scale-105 shadow-brand-600/40'
                }
              `}
              title={isListening ? "Click to stop listening" : "Click to speak"}
            >
              {isListening ? (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              ) : (
                <MicOff className="w-8 h-8 sm:w-10 sm:h-10 text-white/80" />
              )}
            </button>
          </div>

          {/* Sound Waves Animation Bar (Visible while listening) */}
          {isListening && (
            <div className="flex items-center justify-center gap-1.5 h-8">
              {[...Array(7)].map((_, i) => (
                <span
                  key={i}
                  className="w-1 bg-brand-500 rounded-full soundwave-bar"
                />
              ))}
            </div>
          )}

          {/* Transcript / Listening State Text */}
          <div className="w-full max-w-lg min-h-[50px] flex items-center justify-center">
            {isListening ? (
              <p className="text-base sm:text-lg font-medium text-brand-600 dark:text-brand-300 animate-pulse">
                {interimTranscript || transcript || 'Listening... Speak your task command now'}
              </p>
            ) : transcript ? (
              <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100">
                "{transcript}"
              </p>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Tap microphone to begin or test a voice command below
              </p>
            )}
          </div>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Live AI Parsed Preview Card */}
          {parsedResult && (
            <div className="w-full text-left p-4 sm:p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/80 animate-slide-up space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  AI Parsed Intent: {parsedResult.action.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Ready to apply
                </span>
              </div>

              {parsedResult.action === 'CREATE_TASK' && parsedResult.task && (
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {parsedResult.task.title}
                  </h4>
                  
                  {parsedResult.task.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {parsedResult.task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-semibold border border-brand-200 dark:border-brand-800">
                      <Flame className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Priority: <span className="capitalize">{parsedResult.task.priority}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-semibold border border-brand-200 dark:border-brand-800">
                      <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Due: {parsedResult.task.dueDate}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 font-semibold border border-brand-200 dark:border-brand-800">
                      <Tag className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      Tag: {parsedResult.task.category}
                    </span>
                  </div>
                </div>
              )}

              {parsedResult.action !== 'CREATE_TASK' && (
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {parsedResult.message}
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={handleApplyCommand}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Execute Command</span>
                </button>
              </div>
            </div>
          )}

          {/* Fallback Natural Language Text Input */}
          <div className="w-full">
            <form onSubmit={handleManualSubmit} className="relative">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Or type voice command e.g. 'Add urgent task Review metrics due tomorrow'..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
                title="Parse command"
              >
                <CornerDownLeft className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Sample Commands Quick Click Chips */}
          <div className="w-full text-left space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Try Sample Voice Commands
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleCommands.map((cmd, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSample(cmd)}
                  className="text-left text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 hover:text-brand-600 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
