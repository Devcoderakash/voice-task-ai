import { INITIAL_TASKS } from '../constants/initialData';

const STORAGE_KEY = 'voice_task_ai_tasks_v1';
const SETTINGS_KEY = 'voice_task_ai_settings_v1';
const THEME_KEY = 'voice_task_ai_theme';
const INITIALIZED_KEY = 'voice_task_ai_initialized_v1';

// In-memory fallback if localStorage is disabled or throws
let memoryTasks = null;
let memoryTheme = 'light';
let memorySettings = null;

const isStorageAvailable = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

export const getStoredTasks = () => {
  if (!isStorageAvailable()) {
    if (memoryTasks === null) memoryTasks = [...INITIAL_TASKS];
    return memoryTasks;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const hasInitialized = window.localStorage.getItem(INITIALIZED_KEY);

    // If first launch and key not present at all:
    if (raw === null && !hasInitialized) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
      window.localStorage.setItem(INITIALIZED_KEY, 'true');
      return INITIAL_TASKS;
    }

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Invalid tasks format in localStorage; returning empty list');
      return [];
    }

    // Filter out corrupted task objects
    const validTasks = parsed.filter(t => t && typeof t === 'object' && t.id && t.title);
    return validTasks;
  } catch (err) {
    console.error('Error reading tasks from localStorage:', err);
    return memoryTasks || [];
  }
};

export const saveTasks = (tasks) => {
  if (!Array.isArray(tasks)) return;

  if (!isStorageAvailable()) {
    memoryTasks = [...tasks];
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    window.localStorage.setItem(INITIALIZED_KEY, 'true');
  } catch (err) {
    console.error('Error saving tasks to localStorage:', err);
    memoryTasks = [...tasks];
  }
};

export const resetToSampleTasks = () => {
  saveTasks(INITIAL_TASKS);
  return INITIAL_TASKS;
};

export const clearAllTasks = () => {
  saveTasks([]);
  return [];
};

export const getStoredTheme = () => {
  if (!isStorageAvailable()) {
    return memoryTheme;
  }

  try {
    const theme = window.localStorage.getItem(THEME_KEY);
    if (theme === 'dark' || theme === 'light') return theme;

    // System dark mode preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (e) {
    return 'light';
  }
};

export const saveTheme = (theme) => {
  const targetTheme = theme === 'dark' ? 'dark' : 'light';
  memoryTheme = targetTheme;

  if (typeof document !== 'undefined') {
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  if (isStorageAvailable()) {
    try {
      window.localStorage.setItem(THEME_KEY, targetTheme);
    } catch (e) {
      console.warn('Failed to persist theme in localStorage', e);
    }
  }
};

export const getStoredSettings = () => {
  const defaultSettings = {
    speechRate: 1,
    voiceFeedback: true,
    soundEffects: true,
    autoOpenVoiceOnStart: false,
    collapsedSidebar: false
  };

  if (!isStorageAvailable()) {
    return memorySettings || defaultSettings;
  }

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
      return defaultSettings;
    }
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...(typeof parsed === 'object' && parsed ? parsed : {}) };
  } catch (e) {
    return defaultSettings;
  }
};

export const saveSettings = (settings) => {
  memorySettings = { ...settings };
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
};
