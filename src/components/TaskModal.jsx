import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  AlertCircle, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { PRIORITIES, CATEGORIES } from '../constants/initialData';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('Product');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('17:00');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isDictatingTitle, setIsDictatingTitle] = useState(false);
  const [isDictatingDesc, setIsDictatingDesc] = useState(false);

  // Form Validation State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setPriority(taskToEdit.priority || 'medium');
      setCategory(taskToEdit.category || 'Product');
      setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(taskToEdit.dueTime || '17:00');
      setSubtasks(taskToEdit.subtasks ? [...taskToEdit.subtasks] : []);
    } else {
      // Default new task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory('Product');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('17:00');
      setSubtasks([]);
    }
    setErrors({});
    setTouched({});
  }, [taskToEdit, isOpen]);

  // Inline Dictation for Title or Description
  const handleDictate = (field) => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (field === 'title') {
      setIsDictatingTitle(true);
      const recognizer = createSpeechRecognizer({
        onResult: ({ final }) => {
          if (final) {
            setTitle(prev => prev ? `${prev} ${final}` : final);
            setIsDictatingTitle(false);
          }
        },
        onError: () => setIsDictatingTitle(false),
        onEnd: () => setIsDictatingTitle(false)
      });
      recognizer?.start();
    } else {
      setIsDictatingDesc(true);
      const recognizer = createSpeechRecognizer({
        onResult: ({ final }) => {
          if (final) {
            setDescription(prev => prev ? `${prev} ${final}` : final);
            setIsDictatingDesc(false);
          }
        },
        onError: () => setIsDictatingDesc(false),
        onEnd: () => setIsDictatingDesc(false)
      });
      recognizer?.start();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ title: true, dueDate: true });

    if (!validate()) return;

    const taskData = {
      id: taskToEdit ? taskToEdit.id : `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate,
      dueTime,
      status: taskToEdit ? taskToEdit.status : 'todo',
      subtasks,
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
      completedAt: taskToEdit ? taskToEdit.completedAt : null,
      voiceCreated: taskToEdit ? taskToEdit.voiceCreated : false,
    };

    onSave(taskData);
    onClose();
  };

  const handleAddSubtask = (e) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub_${Date.now()}`,
        title: newSubtaskInput.trim(),
        completed: false
      }
    ]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (subId) => {
    setSubtasks(subtasks.filter(s => s.id !== subId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-brand-900/60 rounded-3xl shadow-2xl overflow-hidden purple-glow my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Edit Task' : 'Create New Task'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure task parameters, due date, and subtasks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Title Input with Inline Dictation */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => handleDictate('title')}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition ${isDictatingTitle ? 'bg-rose-500 text-white border-rose-500 animate-pulse' : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border-brand-200 dark:border-brand-800'}`}
              >
                <Mic className="w-3 h-3" />
                <span>{isDictatingTitle ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) validate();
              }}
              onBlur={() => setTouched({ ...touched, title: true })}
              placeholder="e.g. Prepare quarterly financial report and deck"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition ${errors.title ? 'border-rose-400 focus:ring-rose-400/30' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20 focus:border-brand-500'}`}
            />
            {touched.title && errors.title && (
              <p className="flex items-center gap-1 text-xs text-rose-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Description with Voice Dictate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Description & Notes
              </label>
              <button
                type="button"
                onClick={() => handleDictate('desc')}
                className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition ${isDictatingDesc ? 'bg-rose-500 text-white border-rose-500 animate-pulse' : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 border-brand-200 dark:border-brand-800'}`}
              >
                <Mic className="w-3 h-3" />
                <span>{isDictatingDesc ? 'Listening...' : 'Voice Dictate'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key deliverables, links, or context..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
            />
          </div>

          {/* Priority Matrix Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id)}
                    className={`
                      flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all
                      ${isSelected 
                        ? `${p.bgLight} ${p.textLight} ${p.borderLight} ${p.bgDark} ${p.textDark} ring-2 ring-brand-500 shadow-sm` 
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }
                    `}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Workspace */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Category / Tag
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              >
                {CATEGORIES.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Due Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => {
                    setDueDate(e.target.value);
                    if (touched.dueDate) validate();
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 transition ${errors.dueDate ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-500/20'}`}
                />
              </div>
            </div>
          </div>

          {/* Subtasks / Checklist Items */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Subtasks ({subtasks.length})
            </label>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add subtask and press Enter..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950 text-slate-700 dark:text-slate-200 hover:text-brand-600 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition"
              >
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                {subtasks.map((sub, index) => (
                  <div 
                    key={sub.id || index}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300">{sub.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
            >
              <Check className="w-4 h-4" />
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
