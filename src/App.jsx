import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import TaskDetailsModal from './components/TaskDetailsModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import KanbanView from './components/KanbanView';
import AnalyticsView from './components/AnalyticsView';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';

import { 
  getStoredTasks, 
  saveTasks, 
  getStoredTheme, 
  saveTheme, 
  getStoredSettings, 
  saveSettings,
  resetToSampleTasks,
  clearAllTasks
} from './utils/storage';
import { PRIORITIES, CATEGORIES } from './constants/initialData';
import { speak } from './utils/speech';

import { 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Plus, 
  Mic, 
  RotateCcw, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  CalendarDays,
  FolderOpen
} from 'lucide-react';

export default function App() {
  // Persistence & Global State
  const [tasks, setTasks] = useState(() => getStoredTasks());
  const [theme, setTheme] = useState(() => getStoredTheme());
  const [settings, setSettings] = useState(() => getStoredSettings());
  
  // Navigation & View State
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'tasks' | 'today' | 'kanban' | 'analytics'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(() => !!getStoredSettings().collapsedSidebar);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Search, Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // 'All' | 'todo' | 'in-progress' | 'completed'
  const [selectedTimeframe, setSelectedTimeframe] = useState('All'); // 'All' | 'today' | 'upcoming' | 'overdue'
  const [sortBy, setSortBy] = useState('dueDate'); // 'dueDate' | 'priority' | 'createdAt' | 'title'
  const [sortDirection, setSortDirection] = useState('asc');

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Initialize Theme on Mount
  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  // Save tasks to LocalStorage whenever tasks update
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const handleToggleDesktopCollapse = () => {
    setIsDesktopCollapsed(prev => {
      const next = !prev;
      const updatedSettings = { ...settings, collapsedSidebar: next };
      setSettings(updatedSettings);
      saveSettings(updatedSettings);
      return next;
    });
  };

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type, id: Date.now() });
  };

  // Keyboard Shortcuts Handler (Cmd+K, Alt+V, Alt+N, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-tasks-input');
        if (searchInput) searchInput.focus();
      }
      // Voice trigger: Alt+V
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setIsVoiceModalOpen(prev => !prev);
      }
      // New Task: Alt+N
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setTaskToEdit(null);
        setIsTaskModalOpen(true);
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (isVoiceModalOpen) setIsVoiceModalOpen(false);
        if (isTaskModalOpen) setIsTaskModalOpen(false);
        if (selectedTaskForDetails) setSelectedTaskForDetails(null);
        if (taskToDelete) setTaskToDelete(null);
        if (isSettingsModalOpen) setIsSettingsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVoiceModalOpen, isTaskModalOpen, selectedTaskForDetails, taskToDelete, isSettingsModalOpen]);

  // Task Handlers
  const handleCreateOrUpdateTask = (taskData) => {
    if (taskToEdit) {
      setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
      if (selectedTaskForDetails?.id === taskData.id) {
        setSelectedTaskForDetails(taskData);
      }
      showToast('Task Updated', `"${taskData.title}" has been saved.`, 'success');
    } else {
      setTasks(prev => [taskData, ...prev]);
      showToast('Task Created', `"${taskData.title}" added to your workspace.`, 'success');
    }
    setTaskToEdit(null);
  };

  const handleToggleComplete = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const isNowCompleted = t.status !== 'completed';
        const updated = {
          ...t,
          status: isNowCompleted ? 'completed' : 'todo',
          completedAt: isNowCompleted ? new Date().toISOString() : null,
          subtasks: t.subtasks?.map(s => ({ ...s, completed: isNowCompleted })) || []
        };
        if (selectedTaskForDetails?.id === taskId) {
          setSelectedTaskForDetails(updated);
        }
        showToast(
          isNowCompleted ? 'Task Completed! 🎉' : 'Task Reopened',
          `"${t.title}" status updated to ${updated.status}.`,
          'success'
        );
        return updated;
      }
      return t;
    }));
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subtasks.map(s => 
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        const updatedTask = {
          ...t,
          subtasks: updatedSubtasks,
          status: allCompleted ? 'completed' : (t.status === 'completed' ? 'in-progress' : t.status),
          completedAt: allCompleted ? new Date().toISOString() : null
        };
        if (selectedTaskForDetails?.id === taskId) {
          setSelectedTaskForDetails(updatedTask);
        }
        return updatedTask;
      }
      return t;
    }));
  };

  const handleRequestDelete = (task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    const deletedId = taskToDelete.id;
    const deletedTitle = taskToDelete.title;
    setTasks(prev => prev.filter(t => t.id !== deletedId));
    if (selectedTaskForDetails?.id === deletedId) {
      setSelectedTaskForDetails(null);
    }
    setTaskToDelete(null);
    showToast('Task Deleted', `"${deletedTitle}" has been removed.`, 'error');
  };

  const handleDuplicateTask = (task) => {
    const duplicated = {
      ...task,
      id: `task_${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'todo',
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    setTasks(prev => [duplicated, ...prev]);
    showToast('Task Duplicated', `Created a copy of "${task.title}".`, 'success');
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
        if (selectedTaskForDetails?.id === taskId) {
          setSelectedTaskForDetails(updated);
        }
        return updated;
      }
      return t;
    }));
  };

  // Voice NLP Command Executor
  const handleExecuteVoiceCommand = (parsed) => {
    if (!parsed) return;

    if (parsed.action === 'CREATE_TASK' && parsed.task) {
      setTasks(prev => [parsed.task, ...prev]);
      showToast('Voice Task Created! 🎙️', parsed.message, 'voice');
      if (settings?.voiceFeedback) {
        speak(`Task created: ${parsed.task.title}`, settings.speechRate);
      }
    } else if (parsed.action === 'COMPLETE_TASK') {
      if (parsed.taskId) {
        handleToggleComplete(parsed.taskId);
        if (settings?.voiceFeedback) {
          speak(parsed.message, settings.speechRate);
        }
      } else {
        showToast('Voice Action', parsed.message, 'info');
      }
    } else if (parsed.action === 'DELETE_TASK') {
      if (parsed.taskId) {
        const target = tasks.find(t => t.id === parsed.taskId);
        if (target) {
          handleRequestDelete(target);
        }
      } else {
        showToast('Voice Action', parsed.message, 'info');
      }
    } else if (parsed.action === 'FILTER_PRIORITY') {
      setSelectedPriority(parsed.priority);
      setActiveView('tasks');
      showToast('Filter Applied', parsed.message, 'voice');
    } else if (parsed.action === 'FILTER_STATUS') {
      setSelectedStatus(parsed.status);
      setActiveView('tasks');
      showToast('Filter Applied', parsed.message, 'voice');
    } else if (parsed.action === 'FILTER_TIMEFRAME') {
      setSelectedTimeframe(parsed.timeframe);
      setActiveView('tasks');
      showToast('Filter Applied', parsed.message, 'voice');
    } else if (parsed.action === 'CLEAR_FILTERS') {
      handleResetFilters();
      showToast('Filters Cleared', 'Showing all tasks across workspaces', 'info');
    } else if (parsed.action === 'SET_THEME') {
      setTheme(parsed.theme);
      saveTheme(parsed.theme);
      showToast('Theme Updated', parsed.message, 'voice');
    } else if (parsed.action === 'READ_TASKS') {
      const pendingTasks = tasks.filter(t => t.status !== 'completed');
      const textToRead = pendingTasks.length > 0 
        ? `You have ${pendingTasks.length} pending tasks. First is: ${pendingTasks[0].title}. Priority: ${pendingTasks[0].priority}.`
        : 'You have no pending tasks. Great job!';
      speak(textToRead, settings?.speechRate || 1);
      showToast('Speaking Briefing', textToRead, 'voice');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedPriority('All');
    setSelectedStatus('All');
    setSelectedTimeframe('All');
  };

  // Filtered & Sorted Tasks computation
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter(task => {
      // View specific constraints
      if (activeView === 'today') {
        if (task.dueDate !== todayStr) return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        const matchesPriority = task.priority?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesPriority) {
          return false;
        }
      }

      // Category Filter
      if (selectedCategory !== 'All' && task.category !== selectedCategory) {
        return false;
      }

      // Priority Filter
      if (selectedPriority !== 'All' && task.priority !== selectedPriority) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'All' && task.status !== selectedStatus) {
        return false;
      }

      // Timeframe Filter
      if (selectedTimeframe === 'today' && task.dueDate !== todayStr) {
        return false;
      }
      if (selectedTimeframe === 'upcoming' && task.dueDate <= todayStr) {
        return false;
      }
      if (selectedTimeframe === 'overdue' && (task.dueDate >= todayStr || task.status === 'completed')) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      let compare = 0;
      if (sortBy === 'dueDate') {
        compare = (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'priority') {
        const priorityRank = { urgent: 4, high: 3, medium: 2, low: 1 };
        compare = (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
      } else if (sortBy === 'createdAt') {
        compare = (b.createdAt || '').localeCompare(a.createdAt || '');
      } else if (sortBy === 'title') {
        compare = (a.title || '').localeCompare(b.title || '');
      }

      return sortDirection === 'asc' ? compare : -compare;
    });
  }, [tasks, activeView, searchTerm, selectedCategory, selectedPriority, selectedStatus, selectedTimeframe, sortBy, sortDirection]);

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All' || selectedPriority !== 'All' || selectedStatus !== 'All' || selectedTimeframe !== 'All';
  const urgentCount = tasks.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'completed').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top SaaS Header */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        urgentCount={urgentCount}
        onFocusSearch={() => {
          const input = document.getElementById('search-tasks-input');
          if (input) input.focus();
        }}
      />

      {/* Main Layout Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-8">
          
          {/* Navigation Sidebar */}
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            tasks={tasks}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            isDesktopCollapsed={isDesktopCollapsed}
            onToggleDesktopCollapse={handleToggleDesktopCollapse}
          />

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 transition-all duration-300 ${isDesktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'} space-y-6`}>
            
            {/* 1. Dashboard View */}
            {activeView === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* Stats Cards & AI Briefing */}
                <StatsCards
                  tasks={tasks}
                  onFilterTimeframe={(tf) => {
                    setSelectedTimeframe(tf);
                    setActiveView('tasks');
                  }}
                  onFilterPriority={(p) => {
                    setSelectedPriority(p);
                    setActiveView('tasks');
                  }}
                  onFilterStatus={(s) => {
                    setSelectedStatus(s);
                    setActiveView('tasks');
                  }}
                />

                {/* Dashboard Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Active Focus Tasks</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {tasks.filter(t => t.status !== 'completed').length} pending
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      High priority deliverables and today's schedule
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200 dark:border-brand-800/80 hover:bg-brand-100 transition"
                    >
                      <Mic className="w-3.5 h-3.5 text-brand-600" />
                      <span>Dictate Task</span>
                    </button>
                    <button
                      onClick={() => {
                        setTaskToEdit(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Task List in Dashboard */}
                <div className="space-y-3">
                  {tasks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-8 text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        Your task list is empty
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Create a new task with your voice, click add, or restore realistic sample demo tasks to explore features.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setTaskToEdit(null);
                            setIsTaskModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow"
                        >
                          Create First Task
                        </button>
                        <button
                          onClick={() => {
                            const samples = resetToSampleTasks();
                            setTasks(samples);
                            showToast('Sample Tasks Restored', 'Loaded 6 sample productivity tasks.', 'success');
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
                        >
                          Load Sample Tasks
                        </button>
                      </div>
                    </div>
                  ) : (
                    tasks.slice(0, 5).map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDeleteRequest={handleRequestDelete}
                        onDuplicate={handleDuplicateTask}
                        onToggleSubtask={handleToggleSubtask}
                        onViewDetails={(t) => setSelectedTaskForDetails(t)}
                      />
                    ))
                  )}

                  {tasks.length > 5 && (
                    <div className="text-center pt-2">
                      <button
                        onClick={() => setActiveView('tasks')}
                        className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        View all {tasks.length} tasks in full list →
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 2. All Tasks & Today View */}
            {(activeView === 'tasks' || activeView === 'today') && (
              <div className="space-y-5 animate-fade-in">
                
                {/* Header & Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{activeView === 'today' ? "Today's Schedule" : "All Workspace Tasks"}</span>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                        {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeView === 'today' 
                        ? 'Items due by midnight today or pending immediate action' 
                        : 'Filter by priority, due date, tags, and status'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold text-xs border border-brand-200 dark:border-brand-800/80 hover:bg-brand-100 transition purple-glow-sm"
                    >
                      <Mic className="w-3.5 h-3.5 text-brand-600" />
                      <span>Voice Command</span>
                    </button>
                    <button
                      onClick={() => {
                        setTaskToEdit(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Task</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Sort Control Bar */}
                <div className="glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  
                  {/* Row 1: Priority Chips & Status Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                      {[
                        { id: 'All', label: 'All' },
                        { id: 'todo', label: 'To Do' },
                        { id: 'in-progress', label: 'In Progress' },
                        { id: 'completed', label: 'Completed' },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedStatus(tab.id)}
                          className={`
                            px-3 py-1.5 rounded-lg font-medium transition
                            ${selectedStatus === tab.id
                              ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-sm font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }
                          `}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Priority Filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Priority:</span>
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="All">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>

                      {/* Sort Dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="dueDate">Due Date</option>
                        <option value="priority">Priority Rank</option>
                        <option value="createdAt">Date Created</option>
                        <option value="title">Alphabetical</option>
                      </select>

                      <button
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                        title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                        aria-label="Toggle sort direction"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>

                  {/* Active Filter Badges */}
                  {hasActiveFilters && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">Active filters:</span>
                      
                      {searchTerm && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                          Search: "{searchTerm}"
                        </span>
                      )}

                      {selectedCategory !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium">
                          Category: {selectedCategory}
                        </span>
                      )}

                      {selectedPriority !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium capitalize">
                          Priority: {selectedPriority}
                        </span>
                      )}

                      {selectedStatus !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium capitalize">
                          Status: {selectedStatus}
                        </span>
                      )}

                      {selectedTimeframe !== 'All' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium capitalize">
                          Timeframe: {selectedTimeframe}
                        </span>
                      )}

                      <button
                        onClick={handleResetFilters}
                        className="ml-auto text-brand-600 dark:text-brand-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  )}

                </div>

                {/* Tasks List Content */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 text-center space-y-3 border border-dashed border-slate-300 dark:border-slate-800">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-white">
                        No tasks found
                      </h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {hasActiveFilters 
                          ? 'No tasks matched your current search and filter combination. Try resetting filters.' 
                          : 'You currently have no tasks in this view. Use the Voice Assistant or click New Task to create one!'}
                      </p>
                      {hasActiveFilters ? (
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow hover:bg-brand-700 transition"
                        >
                          Clear Filters
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setTaskToEdit(null);
                            setIsTaskModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow hover:bg-brand-700 transition"
                        >
                          Create New Task
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(t) => {
                          setTaskToEdit(t);
                          setIsTaskModalOpen(true);
                        }}
                        onDeleteRequest={handleRequestDelete}
                        onDuplicate={handleDuplicateTask}
                        onToggleSubtask={handleToggleSubtask}
                        onViewDetails={(t) => setSelectedTaskForDetails(t)}
                      />
                    ))
                  )}
                </div>

              </div>
            )}

            {/* 3. Kanban Board View */}
            {activeView === 'kanban' && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Kanban Workflow Board
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Visualize task progress and move tasks across stages
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Task</span>
                  </button>
                </div>

                <KanbanView
                  tasks={filteredTasks}
                  onUpdateStatus={handleUpdateStatus}
                  onEditTask={(t) => {
                    setTaskToEdit(t);
                    setIsTaskModalOpen(true);
                  }}
                  onOpenNewTaskModal={() => {
                    setTaskToEdit(null);
                    setIsTaskModalOpen(true);
                  }}
                  onViewDetails={(t) => setSelectedTaskForDetails(t)}
                />
              </div>
            )}

            {/* 4. Analytics View */}
            {activeView === 'analytics' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Productivity Analytics & Matrix
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time performance metrics, priority load, and voice automation statistics
                  </p>
                </div>

                <AnalyticsView tasks={tasks} />
              </div>
            )}

          </main>

        </div>
      </div>

      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={!!selectedTaskForDetails}
        task={selectedTaskForDetails}
        onClose={() => setSelectedTaskForDetails(null)}
        onEdit={(task) => {
          setSelectedTaskForDetails(null);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDeleteRequest={(task) => {
          setSelectedTaskForDetails(null);
          handleRequestDelete(task);
        }}
        onToggleComplete={handleToggleComplete}
        onToggleSubtask={handleToggleSubtask}
      />

      {/* Confirmation Dialog for Deletion */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        taskTitle={taskToDelete?.title || 'this task'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        tasks={tasks}
        onExecuteCommand={handleExecuteVoiceCommand}
        theme={theme}
      />

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleCreateOrUpdateTask}
        taskToEdit={taskToEdit}
      />

      {/* Settings & Storage Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
          showToast('Settings Saved', 'Voice and preference options updated.', 'success');
        }}
        tasks={tasks}
        onImportTasks={(imported) => {
          setTasks(imported);
          saveTasks(imported);
          showToast('Data Imported', `Successfully loaded ${imported.length} tasks.`, 'success');
        }}
        onResetDemoData={() => {
          const samples = resetToSampleTasks();
          setTasks(samples);
          showToast('Reset Complete', 'Default demo tasks loaded.', 'success');
        }}
        onClearAllTasks={() => {
          clearAllTasks();
          setTasks([]);
          showToast('Tasks Cleared', 'All tasks have been removed.', 'error');
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
