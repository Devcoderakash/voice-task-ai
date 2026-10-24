import React from 'react';
import { 
  Mic, 
  Plus, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Sparkles,
  Menu,
  Command
} from 'lucide-react';

export default function Navbar({
  searchTerm,
  setSearchTerm,
  onOpenVoiceModal,
  onOpenTaskModal,
  theme,
  toggleTheme,
  onToggleSidebar,
  urgentCount,
  onFocusSearch
}) {
  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
                <Mic className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                    Voice Task <span className="text-brand-600 dark:text-brand-400">AI</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 rounded border border-brand-200 dark:border-brand-800">
                    SaaS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Speech-Powered Productivity
                </p>
              </div>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="search-tasks-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks, tags, or voice notes... (Cmd+K)"
                className="w-full pl-10 pr-12 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-transparent focus:border-brand-500 dark:focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded shadow-sm">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right: Voice Action, Create Task, Dark Mode, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Voice Assistant Trigger Button */}
            <button
              onClick={onOpenVoiceModal}
              className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 font-semibold text-sm hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-all purple-glow-sm hover:purple-glow"
              title="Voice AI Command Center"
            >
              <div className="relative">
                <Mic className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <span className="hidden md:inline">Voice Assistant</span>
              <Sparkles className="w-3.5 h-3.5 text-brand-500 opacity-70 group-hover:rotate-12 transition-transform" />
            </button>

            {/* Create Task Button */}
            <button
              onClick={onOpenTaskModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-medium text-sm shadow-md shadow-brand-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition"
              aria-label="Toggle color theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* Notifications with urgent badge */}
            <div className="relative hidden sm:block">
              <button 
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition"
                title={`${urgentCount} urgent / upcoming items`}
              >
                <Bell className="w-4 h-4" />
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                    {urgentCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 p-0.5 ring-2 ring-brand-500/20">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400">
                  AL
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
