import React, { useState } from 'react';
import { 
  Check, 
  Calendar, 
  Clock, 
  Tag, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Copy, 
  Volume2, 
  Mic, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRIORITIES } from '../constants/initialData';
import { speak } from '../utils/speech';

export default function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleSubtask
}) {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const isCompleted = task.status === 'completed';
  const priorityConfig = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];

  // Subtask calculation
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const subtasksPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Due date status
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = task.dueDate === todayStr;
  const isOverdue = task.dueDate < todayStr && !isCompleted;

  const handleToggle = () => {
    if (!isCompleted) {
      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.75 },
          colors: ['#7c3aed', '#a855f7', '#10b981', '#f59e0b']
        });
      } catch (e) {}
    }
    onToggleComplete(task.id);
  };

  const handleReadAloud = (e) => {
    e.stopPropagation();
    setIsReading(true);
    const textToSpeak = `${task.title}. Priority ${task.priority}. Due date ${task.dueDate}. ${task.description || ''}`;
    speak(textToSpeak, 1);
    setTimeout(() => {
      setIsReading(false);
    }, 4000);
  };

  return (
    <div className={`
      group relative glass-panel rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:-translate-y-0.5
      ${isCompleted 
        ? 'opacity-70 bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50' 
        : isOverdue
        ? 'border-rose-200 dark:border-rose-900/60 shadow-sm'
        : 'border-slate-200/80 dark:border-slate-800/80 hover:border-brand-500/40 dark:hover:border-brand-500/40 shadow-sm hover:shadow-md'
      }
    `}>
      <div className="flex items-start gap-3.5">
        
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`
            mt-1 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0
            ${isCompleted
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-white dark:bg-slate-800'
            }
          `}
          title={isCompleted ? "Mark incomplete" : "Mark completed"}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header Row: Title and Action Buttons */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`
              text-sm sm:text-base font-semibold leading-snug transition-all
              ${isCompleted 
                ? 'line-through text-slate-400 dark:text-slate-500' 
                : 'text-slate-900 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400'
              }
            `}>
              {task.title}
            </h3>

            {/* Menu & Audio Buttons */}
            <div className="flex items-center gap-1 shrink-0 relative">
              <button
                onClick={handleReadAloud}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${isReading ? 'text-brand-600 animate-pulse' : ''}`}
                title="Read task aloud"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-7 z-30 w-36 py-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDuplicate(task);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete(task.id);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Meta Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            
            {/* Priority Badge */}
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-medium text-[11px] border
              ${priorityConfig.bgLight} ${priorityConfig.textLight} ${priorityConfig.borderLight}
              ${priorityConfig.bgDark} ${priorityConfig.textDark}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
              <span className="capitalize">{task.priority}</span>
            </span>

            {/* Category / Tag */}
            {task.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{task.category}</span>
              </span>
            )}

            {/* Due Date Badge */}
            {task.dueDate && (
              <span className={`
                inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium border
                ${isOverdue 
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900' 
                  : isToday
                  ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60'
                }
              `}>
                <Calendar className="w-3 h-3" />
                <span>
                  {isToday ? 'Today' : isOverdue ? `Overdue (${task.dueDate})` : task.dueDate}
                </span>
                {task.dueTime && <span className="opacity-70">@{task.dueTime}</span>}
              </span>
            )}

            {/* Voice Created indicator */}
            {task.voiceCreated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <Mic className="w-2.5 h-2.5 text-brand-500" />
                Voice
              </span>
            )}

            {/* Subtasks Progress Button */}
            {totalSubtasks > 0 && (
              <button
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

          </div>

          {/* Subtasks List Dropdown */}
          {showSubtasks && totalSubtasks > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 animate-slide-down">
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1 mb-2">
                <div 
                  className="bg-brand-600 h-1 rounded-full transition-all"
                  style={{ width: `${subtasksPercent}%` }}
                />
              </div>
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => onToggleSubtask(task.id, sub.id)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer text-xs"
                >
                  {sub.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-slate-700 dark:text-slate-300 ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
