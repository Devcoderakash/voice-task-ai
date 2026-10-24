import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarDays, 
  KanbanSquare, 
  BarChart3, 
  Mic, 
  Settings, 
  FolderKanban, 
  Flame, 
  Sparkles,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { CATEGORIES } from '../constants/initialData';

export default function Sidebar({
  activeView,
  setActiveView,
  selectedCategory,
  setSelectedCategory,
  isOpen,
  onClose,
  tasks,
  onOpenVoiceModal,
  onOpenSettingsModal,
  isDesktopCollapsed,
  onToggleDesktopCollapse
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare, count: tasks.length },
    { 
      id: 'today', 
      label: 'Today', 
      icon: CalendarDays, 
      count: tasks.filter(t => {
        const todayStr = new Date().toISOString().split('T')[0];
        return t.dueDate === todayStr && t.status !== 'completed';
      }).length 
    },
    { id: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const urgentCount = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 glass-panel border-r border-slate-200/80 dark:border-slate-800/80
        flex flex-col transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDesktopCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        
        {/* Mobile Header / Desktop Collapse Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/70 dark:border-slate-800/70">
          <div className={`flex items-center gap-2.5 ${isDesktopCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-600/30 shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            {!isDesktopCollapsed && (
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
                VoiceTask <span className="text-brand-600 dark:text-brand-400">AI</span>
              </span>
            )}
          </div>

          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Desktop collapse button */}
          <button
            onClick={onToggleDesktopCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Content */}
        <div className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          
          {/* Main Navigation */}
          <div>
            {!isDesktopCollapsed && (
              <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Main Menu
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (onClose) onClose();
                    }}
                    title={isDesktopCollapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center ${isDesktopCollapsed ? 'lg:justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/25 dark:bg-brand-700' 
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                      {!isDesktopCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isDesktopCollapsed && item.count !== undefined && (
                      <span className={`
                        px-2 py-0.5 text-xs font-semibold rounded-full
                        ${isActive 
                          ? 'bg-brand-700/80 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }
                      `}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Voice Command Action */}
          <div>
            {!isDesktopCollapsed ? (
              <>
                <p className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  AI Voice Control
                </p>
                <button
                  onClick={() => {
                    onOpenVoiceModal();
                    if (onClose) onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl bg-gradient-to-br from-brand-900 to-indigo-950 text-white border border-brand-700/40 shadow-lg shadow-purple-950/20 group hover:border-brand-500/80 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold tracking-wide text-brand-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Voice Parser Active
                    </span>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    "Add urgent task Prepare deck due tomorrow with tag Finance"
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-brand-300 group-hover:text-white">
                    <span className="flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5 text-brand-400" /> Open Voice Assistant
                    </span>
                    <span>→</span>
                  </div>
                </button>
              </>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={onOpenVoiceModal}
                  className="w-10 h-10 rounded-xl bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-600/30 transition purple-glow-sm"
                  title="Open Voice Command Center"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Workspaces / Categories */}
          {!isDesktopCollapsed && (
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  Workspaces & Tags
                </p>
                <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => {
                  const count = cat === 'All' 
                    ? tasks.length 
                    : tasks.filter(t => t.category === cat).length;
                  const isSelected = selectedCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        if (activeView !== 'tasks' && activeView !== 'dashboard') {
                          setActiveView('tasks');
                        }
                        if (onClose) onClose();
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition
                        ${isSelected
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800/80'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        <span>{cat}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Urgent Alert Banner */}
          {!isDesktopCollapsed && urgentCount > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs font-bold mb-1">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>{urgentCount} High Priority Items</span>
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-300/70 leading-relaxed">
                Stay on top of critical deliverables today.
              </p>
            </div>
          )}

        </div>

        {/* Footer / Settings */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            onClick={() => {
              onOpenSettingsModal();
              if (onClose) onClose();
            }}
            title={isDesktopCollapsed ? "Settings & Storage" : undefined}
            className={`
              w-full flex items-center ${isDesktopCollapsed ? 'justify-center px-2' : 'gap-3 px-3'} py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition
            `}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            {!isDesktopCollapsed && <span>Settings & Storage</span>}
          </button>
        </div>

      </aside>
    </>
  );
}
