// Type definitions for VoiceTask AI

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  status: TaskStatus;
  subtasks: Subtask[];
  createdAt: string; // ISO date string
  completedAt: string | null;
  voiceCreated?: boolean;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  voiceCreatedCount: number;
  urgentOrHigh: number;
}

export interface UserSettings {
  speechRate: number;
  voiceFeedback: boolean;
  soundEffects: boolean;
  autoOpenVoiceOnStart: boolean;
  collapsedSidebar?: boolean;
}

export interface VoiceCommandResult {
  action: 'CREATE_TASK' | 'COMPLETE_TASK' | 'DELETE_TASK' | 'FILTER_PRIORITY' | 'FILTER_STATUS' | 'FILTER_TIMEFRAME' | 'CLEAR_FILTERS' | 'SET_THEME' | 'READ_TASKS';
  task?: Task;
  targetTitle?: string;
  taskId?: string | null;
  priority?: Priority;
  status?: TaskStatus;
  timeframe?: 'today' | 'upcoming' | 'overdue' | 'all';
  theme?: 'light' | 'dark';
  filter?: string;
  message: string;
  rawText?: string;
}
