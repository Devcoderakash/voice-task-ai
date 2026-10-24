import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ListTodo, 
  Sparkles, 
  Volume2, 
  VolumeX,
  TrendingUp,
  Flame,
  Mic
} from 'lucide-react';
import { speak } from '../utils/speech';

export default function StatsCards({ tasks, onFilterTimeframe, onFilterPriority, onFilterStatus }) {
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const pending = total - completed;

  const urgentOrHigh = tasks.filter(t => 
    (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed'
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdue = tasks.filter(t => t.dueDate < todayStr && t.status !== 'completed').length;
  const voiceCreatedCount = tasks.filter(t => t.voiceCreated).length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Generate dynamic AI briefing
  const briefingText = `Here is your Voice Task AI productivity update. You have ${total} total tasks, with ${completed} completed, which is a ${completionPercentage}% completion rate. There are ${dueToday} tasks due today, ${overdue} overdue items, and ${urgentOrHigh} urgent priorities requiring immediate focus.`;

  const handleToggleSpeakBriefing = () => {
    if (isSpeakingBriefing) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingBriefing(false);
    } else {
      setIsSpeakingBriefing(true);
      speak(briefingText, 1);
      // reset after speech estimated duration
      setTimeout(() => {
        setIsSpeakingBriefing(false);
      }, 10000);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* AI Daily Briefing Banner with Subtitle Animation */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-brand-950/20 border border-brand-800/40">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                AI Assistant Briefing
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="text-shimmer">
                {completionPercentage >= 70 ? 'Outstanding progress today!' : urgentOrHigh > 0 ? 'High-priority focus recommended.' : 'Welcome to your productivity hub.'}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              You have <span className="text-white font-semibold">{pending} pending tasks</span> ({dueToday} due today, {urgentOrHigh} urgent). {voiceCreatedCount > 0 && <span>🎙️ {voiceCreatedCount} created via voice.</span>} Keep up the momentum!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggleSpeakBriefing}
              className={`
                flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all
                ${isSpeakingBriefing 
                  ? 'bg-amber-400 text-slate-900 shadow-md shadow-amber-400/30 animate-pulse' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }
              `}
              title="Listen to voice briefing"
            >
              {isSpeakingBriefing ? (
                <>
                  <VolumeX className="w-4 h-4 text-slate-900" />
                  <span>Stop Briefing</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-brand-300" />
                  <span>Listen to Briefing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Total Tasks */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('all')}
          className="cursor-pointer glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 dark:hover:border-brand-500/40 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">all workspaces</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Mic className="w-3 h-3 text-brand-500" /> {voiceCreatedCount} via voice
            </span>
            <span>View all →</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('completed')}
          className="cursor-pointer glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{completionPercentage}%</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{completed} of {total} done</span>
          </div>
          <div className="mt-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Urgent & High Priority */}
        <div 
          onClick={() => onFilterPriority && onFilterPriority('urgent')}
          className="cursor-pointer glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-rose-500/40 dark:hover:border-rose-500/40 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Urgent & High</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{urgentOrHigh}</span>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">needs attention</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Critical actions</span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">Filter →</span>
          </div>
        </div>

        {/* Due Today & Overdue */}
        <div 
          onClick={() => onFilterTimeframe && onFilterTimeframe('today')}
          className="cursor-pointer glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Due Today</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{dueToday}</span>
            {overdue > 0 && (
              <span className="text-xs text-rose-600 dark:text-rose-400 font-bold bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                +{overdue} overdue
              </span>
            )}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Scheduled today</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">View today →</span>
          </div>
        </div>

      </div>

    </div>
  );
}
