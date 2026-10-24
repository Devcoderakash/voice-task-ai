import React, { useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  Volume2, 
  Mic, 
  CheckSquare, 
  Square,
  Flame,
  AlertCircle
} from 'lucide-react';
import { PRIORITIES } from '../constants/initialData';
import { getRelativeDueDateLabel } from '../utils/taskCalculations';
import { speak } from '../utils/speech';

export default function TaskDetailsModal({
  isOpen,
  task,
  onClose,
  onEdit,
  onDeleteRequest,
  onToggleComplete,
  onToggleSubtask
}) {
  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const isCompleted = task.status === 'completed';
  const priorityConfig = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];
  const relativeDate = getRelativeDueDateLabel(task.dueDate);

  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const handleReadAloud = () => {
    speak(`${task.title}. Priority is ${task.priority}. Due on ${task.dueDate}. ${task.description || ''}`, 1);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-title"
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-brand-900/60 rounded-3xl shadow-2xl overflow-hidden purple-glow my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-2">
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border
              ${priorityConfig.bgLight} ${priorityConfig.textLight} ${priorityConfig.borderLight}
              ${priorityConfig.bgDark} ${priorityConfig.textDark}
            `}>
              <span className={`w-2 h-2 rounded-full ${priorityConfig.dot}`} />
              <span className="capitalize">{task.priority} Priority</span>
            </span>

            {task.voiceCreated && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                <Mic className="w-3 h-3 text-brand-500" />
                Voice Task
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReadAloud}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Read task details aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Title & Status */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`
                mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0
                ${isCompleted
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/40'
                  : 'border-2 border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400 bg-white dark:bg-slate-800'
                }
              `}
              title={isCompleted ? "Mark incomplete" : "Mark completed"}
            >
              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5 text-transparent" />}
            </button>

            <div className="flex-1">
              <h2 id="task-details-title" className={`text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                {task.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Status: <span className="font-semibold capitalize text-brand-600 dark:text-brand-400">{task.status}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Notes & Description
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {task.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Due Date
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {task.dueDate || 'No due date'}
              </p>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${relativeDate.status === 'overdue' ? 'text-rose-500' : relativeDate.status === 'today' ? 'text-amber-500' : 'text-slate-400'}`}>
                {relativeDate.label}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Category
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {task.category || 'General'}
              </p>
              <span className="text-[10px] text-slate-400">Workspace Tag</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Created At
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                {new Date(task.createdAt).toLocaleDateString()}
              </p>
              {task.completedAt && (
                <span className="text-[10px] text-emerald-500">
                  Completed {new Date(task.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>

          </div>

          {/* Subtasks Section */}
          {totalSubtasks > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Subtasks Checklist ({completedSubtasks}/{totalSubtasks})
                </span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">
                  {progressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-1.5 pt-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 cursor-pointer text-xs transition"
                  >
                    {sub.completed ? (
                      <CheckSquare className="w-4 h-4 text-brand-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <span className={`text-slate-700 dark:text-slate-300 ${sub.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDeleteRequest(task);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
