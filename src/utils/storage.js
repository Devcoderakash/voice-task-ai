import { INITIAL_TASKS } from '../constants/initialData';

const STORAGE_KEY = 'voice_task_ai_tasks_v1';
const SETTINGS_KEY = 'voice_task_ai_settings_v1';
const THEME_KEY = 'voice_task_ai_theme';

export const getStoredTasks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_TASKS;
  } catch (err) {
    console.error('Error reading tasks from localStorage:', err);
    return INITIAL_TASKS;
  }
};

export const saveTasks = (tasks) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage:', err);
  }
};

export const resetToSampleTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
  return INITIAL_TASKS;
};

export const getStoredTheme = () => {
  try {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme) return theme;
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (e) {
    return 'light';
  }
};

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    console.error('Failed to set theme in localStorage', e);
  }
};

export const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      const defaultSettings = {
        speechRate: 1,
        voiceFeedback: true,
        soundEffects: true,
        autoOpenVoiceOnStart: false,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      speechRate: 1,
      voiceFeedback: true,
      soundEffects: true,
      autoOpenVoiceOnStart: false,
    };
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};
