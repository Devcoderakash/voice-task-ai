/**
 * Utility functions for robust task statistics, filtering, and sorting calculations
 */

export const calculateTaskStats = (tasks, referenceDateStr) => {
  const todayStr = referenceDateStr || new Date().toISOString().split('T')[0];

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  // Pending tasks: anything not completed
  const pending = tasks.filter(t => t.status !== 'completed').length;
  
  // Overdue tasks: dueDate < today AND not completed
  const overdue = tasks.filter(t => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr).length;

  // Due today: dueDate === today AND not completed
  const dueToday = tasks.filter(t => t.status !== 'completed' && t.dueDate === todayStr).length;

  // Completion percentage
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Urgent and high priority active tasks
  const urgentOrHigh = tasks.filter(t => 
    t.status !== 'completed' && (t.priority === 'urgent' || t.priority === 'high')
  ).length;

  // Voice created count
  const voiceCreatedCount = tasks.filter(t => t.voiceCreated).length;

  return {
    total,
    completed,
    pending,
    overdue,
    dueToday,
    completionRate,
    urgentOrHigh,
    voiceCreatedCount
  };
};

export const getRelativeDueDateLabel = (dueDate, todayStr = new Date().toISOString().split('T')[0]) => {
  if (!dueDate) return { label: 'No date', status: 'normal' };

  if (dueDate === todayStr) {
    return { label: 'Due Today', status: 'today' };
  }

  if (dueDate < todayStr) {
    const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(dueDate).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return { 
      label: diffDays === 1 ? '1 day overdue' : `${diffDays} days overdue`, 
      status: 'overdue' 
    };
  }

  const diffTime = Math.abs(new Date(dueDate).getTime() - new Date(todayStr).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return { label: 'Due Tomorrow', status: 'upcoming' };
  }
  if (diffDays <= 7) {
    return { label: `In ${diffDays} days`, status: 'upcoming' };
  }

  return { label: dueDate, status: 'future' };
};
