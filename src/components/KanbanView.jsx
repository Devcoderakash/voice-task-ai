import React from 'react';
import { 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  Volume2,
  Eye
} from 'lucide-react';
import { PRIORITIES } from '../constants/initialData';
import { getRelativeDueDateLabel } from '../utils/taskCalculations';
import { speak } from '../utils/speech';

export default function KanbanView({
  tasks,
  onUpdateStatus,
  onEditTask,
  onOpenNewTaskModal,
  onViewDetails
}) {
  const columns = [
    { id: 'todo', title: 'To Do', icon: CircleDashed, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'in-progress', title: 'In Progress', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'completed', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {columns.map((col) => {
        const Icon = col.icon;
        const columnTasks = tasks.filter(t => t.status === col.id);

        return (
          <div 
            key={col.id}
            className="flex flex-col rounded-2xl glass-panel border border-slate-200/80 dark:border-slate-800/80 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${col.bg} ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                  {col.title}
                </h3>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {columnTasks.length}
                </span>
              </div>

              {col.id === 'todo' && (
                <button
                  onClick={onOpenNewTaskModal}
                  className="p-1 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Add task to this column"
                  aria-label="Add task to To Do column"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Column Tasks List */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                  <p>No tasks in {col.title}</p>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const priorityConfig = PRIORITIES.find(p => p.id === task.priority) || PRIORITIES[2];
                  const relativeDate = getRelativeDueDateLabel(task.dueDate);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-brand-500/40 dark:hover:border-brand-500/40 shadow-sm transition group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className={`
                          text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border
                          ${priorityConfig.bgLight} ${priorityConfig.textLight} ${priorityConfig.borderLight}
                          ${priorityConfig.bgDark} ${priorityConfig.textDark}
                        `}>
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => speak(`${task.title}. ${task.description || ''}`, 1)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 transition"
                            title="Read aloud"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onViewDetails && onViewDetails(task)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-brand-600 transition"
                            title="View details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          {col.id !== 'todo' && (
                            <button
                              onClick={() => onUpdateStatus(task.id, col.id === 'completed' ? 'in-progress' : 'todo')}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Move back"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'completed' && (
                            <button
                              onClick={() => onUpdateStatus(task.id, col.id === 'todo' ? 'in-progress' : 'completed')}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                              title="Move forward"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h4 
                        onClick={() => onViewDetails ? onViewDetails(task) : onEditTask(task)}
                        className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-brand-600 transition"
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p 
                          onClick={() => onViewDetails && onViewDetails(task)}
                          className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 cursor-pointer"
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className={`flex items-center gap-1 ${relativeDate.status === 'overdue' && task.status !== 'completed' ? 'text-rose-500 font-semibold' : ''}`}>
                          <Calendar className="w-3 h-3" />
                          {relativeDate.label}
                        </span>
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
