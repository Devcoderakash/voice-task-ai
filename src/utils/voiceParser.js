// Voice Task Natural Language Parser

export const parseVoiceInput = (rawText, existingTasks = []) => {
  if (!rawText || typeof rawText !== 'string') return null;

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Theme Commands
  if (lower.includes('dark mode') || lower.includes('dark theme')) {
    return {
      action: 'SET_THEME',
      theme: 'dark',
      message: 'Switching to dark mode',
      rawText: text,
    };
  }
  if (lower.includes('light mode') || lower.includes('light theme')) {
    return {
      action: 'SET_THEME',
      theme: 'light',
      message: 'Switching to light mode',
      rawText: text,
    };
  }

  // 2. Clear Filters
  if (lower.includes('clear filter') || lower.includes('reset filter') || lower.includes('show all tasks')) {
    return {
      action: 'CLEAR_FILTERS',
      message: 'Filters cleared. Showing all tasks.',
      rawText: text,
    };
  }

  // 3. Read Tasks Briefing
  if (
    lower.includes('read my tasks') ||
    lower.includes('read tasks') ||
    lower.includes('what are my tasks') ||
    lower.includes('tell me my tasks') ||
    lower.includes('daily briefing')
  ) {
    return {
      action: 'READ_TASKS',
      filter: lower.includes('today') ? 'today' : (lower.includes('urgent') ? 'urgent' : 'all'),
      message: 'Reading your scheduled tasks',
      rawText: text,
    };
  }

  // 4. Mark Complete Command
  const completeMatch = lower.match(/(?:mark|complete|finish|check off)\s+(?:task\s+)?(.+?)(?:\s+as\s+(?:done|completed))?$/i);
  if (
    (lower.startsWith('complete') || lower.startsWith('mark') || lower.startsWith('finish')) &&
    completeMatch && completeMatch[1]
  ) {
    const targetTitle = completeMatch[1].replace(/as\s+(?:done|completed)/i, '').trim();
    const matchedTask = existingTasks.find(t => 
      t.title.toLowerCase().includes(targetTitle.toLowerCase()) ||
      targetTitle.toLowerCase().includes(t.title.toLowerCase())
    );

    return {
      action: 'COMPLETE_TASK',
      targetTitle,
      taskId: matchedTask ? matchedTask.id : null,
      message: matchedTask ? `Marked "${matchedTask.title}" as completed` : `Task matching "${targetTitle}" not found`,
      rawText: text,
    };
  }

  // 5. Delete Task Command
  const deleteMatch = lower.match(/(?:delete|remove)\s+(?:task\s+)?(.+?)$/i);
  if ((lower.startsWith('delete') || lower.startsWith('remove')) && deleteMatch && deleteMatch[1]) {
    const targetTitle = deleteMatch[1].trim();
    const matchedTask = existingTasks.find(t => 
      t.title.toLowerCase().includes(targetTitle.toLowerCase()) ||
      targetTitle.toLowerCase().includes(t.title.toLowerCase())
    );

    return {
      action: 'DELETE_TASK',
      targetTitle,
      taskId: matchedTask ? matchedTask.id : null,
      message: matchedTask ? `Deleted task "${matchedTask.title}"` : `Task matching "${targetTitle}" not found`,
      rawText: text,
    };
  }

  // 6. Filter by priority or status
  if (lower.startsWith('filter by') || lower.startsWith('show ')) {
    if (lower.includes('urgent')) return { action: 'FILTER_PRIORITY', priority: 'urgent', message: 'Filtering by Urgent priority' };
    if (lower.includes('high')) return { action: 'FILTER_PRIORITY', priority: 'high', message: 'Filtering by High priority' };
    if (lower.includes('medium')) return { action: 'FILTER_PRIORITY', priority: 'medium', message: 'Filtering by Medium priority' };
    if (lower.includes('low')) return { action: 'FILTER_PRIORITY', priority: 'low', message: 'Filtering by Low priority' };
    if (lower.includes('completed') || lower.includes('done')) return { action: 'FILTER_STATUS', status: 'completed', message: 'Showing completed tasks' };
    if (lower.includes('today')) return { action: 'FILTER_TIMEFRAME', timeframe: 'today', message: "Showing today's tasks" };
  }

  // 7. Create New Task (Default Intelligent Extraction)
  let cleanText = text;
  
  // Strip command prefixes like "Add task", "Create task", "New task", "Remember to", "Remind me to"
  cleanText = cleanText.replace(/^(?:add\s+task|create\s+task|new\s+task|add\s+a\s+task|create\s+a\s+task|remember\s+to|remind\s+me\s+to|add)\s+/i, '');

  let priority = 'medium';
  if (/\b(urgent|critical|emergency|asap)\b/i.test(cleanText)) {
    priority = 'urgent';
    cleanText = cleanText.replace(/\b(urgent|critical|emergency|asap)\s*(?:priority)?\b/gi, '').trim();
  } else if (/\b(high\s+priority|important|top\s+priority)\b/i.test(cleanText)) {
    priority = 'high';
    cleanText = cleanText.replace(/\b(high\s+priority|important|top\s+priority)\b/gi, '').trim();
  } else if (/\b(low\s+priority|minor|optional)\b/i.test(cleanText)) {
    priority = 'low';
    cleanText = cleanText.replace(/\b(low\s+priority|minor|optional)\b/gi, '').trim();
  } else if (/\b(medium\s+priority|normal\s+priority)\b/i.test(cleanText)) {
    priority = 'medium';
    cleanText = cleanText.replace(/\b(medium\s+priority|normal\s+priority)\b/gi, '').trim();
  }

  // Extract Due Date
  let dueDate = new Date().toISOString().split('T')[0]; // default today
  let dueTime = '17:00';

  if (/\btomorrow\b/i.test(cleanText)) {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    dueDate = tmr.toISOString().split('T')[0];
    cleanText = cleanText.replace(/\b(?:due|by|on)?\s*tomorrow\b/gi, '').trim();
  } else if (/\bin\s+(\d+)\s+days?\b/i.test(cleanText)) {
    const match = cleanText.match(/\bin\s+(\d+)\s+days?\b/i);
    if (match && match[1]) {
      const days = parseInt(match[1], 10);
      const target = new Date();
      target.setDate(target.getDate() + days);
      dueDate = target.toISOString().split('T')[0];
      cleanText = cleanText.replace(/\b(?:due|by|on)?\s*in\s+\d+\s+days?\b/gi, '').trim();
    }
  } else if (/\bnext\s+week\b/i.test(cleanText)) {
    const target = new Date();
    target.setDate(target.getDate() + 7);
    dueDate = target.toISOString().split('T')[0];
    cleanText = cleanText.replace(/\b(?:due|by|on)?\s*next\s+week\b/gi, '').trim();
  } else if (/\b(?:due|by|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i.test(cleanText)) {
    const dayMatch = cleanText.match(/\b(?:due|by|on)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    if (dayMatch) {
      const dayName = dayMatch[1].toLowerCase();
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = daysOfWeek.indexOf(dayName);
      const today = new Date().getDay();
      let diff = targetDay - today;
      if (diff <= 0) diff += 7; // next upcoming day
      const target = new Date();
      target.setDate(target.getDate() + diff);
      dueDate = target.toISOString().split('T')[0];
      cleanText = cleanText.replace(dayMatch[0], '').trim();
    }
  } else if (/\b(?:due|by|on)?\s*today\b/i.test(cleanText)) {
    dueDate = new Date().toISOString().split('T')[0];
    cleanText = cleanText.replace(/\b(?:due|by|on)?\s*today\b/gi, '').trim();
  }

  // Extract Category / Tag
  let category = 'Work';
  const tagMatch = cleanText.match(/\b(?:with\s+tag|tag|category|in\s+category|tagged)\s+([A-Za-z]+)\b/i);
  if (tagMatch) {
    category = capitalize(tagMatch[1]);
    cleanText = cleanText.replace(tagMatch[0], '').trim();
  } else {
    // Detect keyword category
    if (/\b(design|ui|ux|figma|prototype|mockup)\b/i.test(cleanText)) category = 'Design';
    else if (/\b(code|bug|api|deploy|engineering|backend|frontend|react|database)\b/i.test(cleanText)) category = 'Engineering';
    else if (/\b(budget|invoice|finance|cost|tax|payment|bill)\b/i.test(cleanText)) category = 'Finance';
    else if (/\b(personal|gym|workout|run|grocery|shopping|doctor|family)\b/i.test(cleanText)) category = 'Personal';
    else if (/\b(marketing|social|seo|campaign|ad|content|post)\b/i.test(cleanText)) category = 'Marketing';
    else if (/\b(roadmap|strategy|client|meeting|presentation|deck|launch)\b/i.test(cleanText)) category = 'Product';
  }

  // Extract Description if present
  let description = '';
  const descMatch = cleanText.match(/\b(?:with\s+description|description|notes?|details?)\s+(.+)$/i);
  if (descMatch) {
    description = descMatch[1].trim();
    cleanText = cleanText.substring(0, descMatch.index).trim();
  }

  // Clean trailing prepositions & whitespace
  let title = cleanText
    .replace(/\s+(?:due|by|with|at|tagged|in)$/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();

  // If title is empty, fallback to raw input
  if (!title) {
    title = text;
  } else {
    title = capitalize(title);
  }

  return {
    action: 'CREATE_TASK',
    task: {
      id: 'task_' + Date.now(),
      title,
      description: description || `Created via Voice Task AI voice command.`,
      priority,
      category,
      dueDate,
      dueTime,
      status: 'todo',
      subtasks: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      voiceCreated: true,
    },
    message: `Created new ${priority} priority task "${title}" in ${category}`,
    rawText: text,
  };
};

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
