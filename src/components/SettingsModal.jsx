import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  Volume2, 
  Sun, 
  Moon, 
  ShieldCheck,
  Check
} from 'lucide-react';
import { speak } from '../utils/speech';

export default function SettingsModal({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  settings,
  onUpdateSettings,
  tasks,
  onImportTasks,
  onResetDemoData,
  onClearAllTasks
}) {
  const [speechRate, setSpeechRate] = useState(settings?.speechRate || 1);
  const [voiceFeedback, setVoiceFeedback] = useState(settings?.voiceFeedback !== false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voice_task_ai_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (Array.isArray(parsed)) {
            onImportTasks(parsed);
            alert(`Successfully imported ${parsed.length} tasks!`);
          } else {
            alert('Invalid backup format: Expected a JSON array of tasks.');
          }
        } catch (err) {
          alert('Failed to parse JSON file.');
        }
      };
    }
  };

  const handleTestSpeech = () => {
    speak('Welcome to Voice Task AI. Speech synthesis is working perfectly at current rate.', speechRate);
  };

  const handleSaveSettings = () => {
    onUpdateSettings({
      speechRate,
      voiceFeedback
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-brand-900/60 rounded-3xl shadow-2xl overflow-hidden purple-glow my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Settings & Storage
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure voice engine, theme, and local data persistence
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Appearance Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Appearance & Theme
            </h4>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Theme Mode: <span className="capitalize">{theme}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Deep purple accent with clean white or slate dark surface
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold shadow hover:bg-brand-700 transition"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          {/* Voice AI Settings */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Voice AI & Speech Engine
            </h4>
            
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Speech Rate</span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={handleTestSpeech}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Test Voice Output</span>
                </button>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={voiceFeedback}
                    onChange={(e) => setVoiceFeedback(e.target.checked)}
                    className="rounded accent-brand-600"
                  />
                  <span>Voice Feedback</span>
                </label>
              </div>
            </div>
          </div>

          {/* LocalStorage Data & Reset */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Data Management & Backup
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
              >
                <Download className="w-4 h-4 text-slate-400" />
                <span>Export JSON</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Reset to sample demo tasks? This will restore realistic default tasks.')) {
                    onResetDemoData();
                  }
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-semibold hover:bg-brand-100 transition"
              >
                <RotateCcw className="w-4 h-4 text-brand-500" />
                <span>Load Sample Tasks</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Clear all tasks? This is useful for testing empty states.')) {
                    onClearAllTasks();
                  }
                }}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold hover:bg-rose-100 transition"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Clear All Tasks</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
}
