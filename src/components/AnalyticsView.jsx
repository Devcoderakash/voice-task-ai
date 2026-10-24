import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Mic, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  Sparkles,
  Zap
} from 'lucide-react';
import { PRIORITIES, CATEGORIES } from '../constants/initialData';

export default function AnalyticsView({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const voiceCreated = tasks.filter(t => t.voiceCreated).length;
  const voiceRate = total > 0 ? Math.round((voiceCreated / total) * 100) : 0;

  // Priority distribution counts
  const priorityCounts = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  // Category distribution
  const categoryCounts = CATEGORIES.filter(c => c !== 'All').map(cat => ({
    name: cat,
    count: tasks.filter(t => t.category === cat).length,
    completed: tasks.filter(t => t.category === cat && t.status === 'completed').length
  }));

  return (
    <div className="space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Task Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{completionRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{completed} of {total} completed tasks</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Voice AI Automation</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Mic className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{voiceRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{voiceCreated} voice tasks captured</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Focus Index</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {priorityCounts.urgent + priorityCounts.high}
          </p>
          <p className="text-xs text-slate-400 mt-1">High-impact tasks scheduled</p>
        </div>

      </div>

      {/* Grid: Priority Matrix Breakdown & Category Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Matrix Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Priority Matrix Breakdown
            </h3>
            <span className="text-xs text-slate-400">Volume</span>
          </div>

          <div className="space-y-3">
            {PRIORITIES.map((p) => {
              const count = priorityCounts[p.id] || 0;
              const percent = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                      {p.label}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        p.id === 'urgent' ? 'bg-rose-500' :
                        p.id === 'high' ? 'bg-amber-500' :
                        p.id === 'medium' ? 'bg-brand-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Load Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-brand-500" />
              Workspace & Category Allocation
            </h3>
            <span className="text-xs text-slate-400">Progress</span>
          </div>

          <div className="space-y-3">
            {categoryCounts.map((cat) => {
              const pct = total > 0 ? Math.round((cat.count / total) * 100) : 0;
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {cat.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {cat.completed}/{cat.count} done
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* AI Productivity Tips Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white border border-brand-800/40">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0 border border-brand-500/30">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">
              AI Productivity Tip: Voice First Execution
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Did you know you can dictate your entire day's agenda in one sentence? Try saying: 
              <span className="text-brand-300 italic"> "Add urgent task Prepare investor pitch due tomorrow with tag Finance and notes review deck"</span>. 
              Voice Task AI parses due dates, priorities, tags, and notes with zero manual clicking.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
