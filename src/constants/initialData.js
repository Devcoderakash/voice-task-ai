// Sample initial tasks for first-time launch
export const INITIAL_TASKS = [
  {
    id: 'task_1',
    title: 'Finalize Q3 Product Roadmap & Strategy Deck',
    description: 'Synthesize user feedback from customer interviews and align cross-functional team milestones for next quarter.',
    priority: 'urgent',
    category: 'Product',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString().split('T')[0], // Today
    dueTime: '17:00',
    status: 'in-progress',
    subtasks: [
      { id: 'sub_1_1', title: 'Compile voice feedback survey', completed: true },
      { id: 'sub_1_2', title: 'Prepare slide deck for leadership', completed: true },
      { id: 'sub_1_3', title: 'Review engineering bandwidth', completed: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    completedAt: null,
    voiceCreated: true,
  },
  {
    id: 'task_2',
    title: 'Audit Deep Purple Design System Components',
    description: 'Ensure color contrast meets WCAG AAA standards in dark and light modes, and refine micro-animations for task cards.',
    priority: 'high',
    category: 'Design',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Tomorrow
    dueTime: '14:00',
    status: 'todo',
    subtasks: [
      { id: 'sub_2_1', title: 'Test purple-600 on slate-900', completed: true },
      { id: 'sub_2_2', title: 'Update glassmorphism backdrop blur', completed: false },
      { id: 'sub_2_3', title: 'Export Figma token variables', completed: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    completedAt: null,
    voiceCreated: false,
  },
  {
    id: 'task_3',
    title: 'Implement Voice Task AI Speech-to-Text Integration',
    description: 'Integrate Web Speech API with natural language entity recognition for automatic priority and due date assignment.',
    priority: 'urgent',
    category: 'Engineering',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString().split('T')[0], // Today
    dueTime: '18:30',
    status: 'in-progress',
    subtasks: [
      { id: 'sub_3_1', title: 'Speech recognition wrapper with fallback', completed: true },
      { id: 'sub_3_2', title: 'Natural language date parsing', completed: true },
      { id: 'sub_3_3', title: 'Audio waveform pulse feedback', completed: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    completedAt: null,
    voiceCreated: true,
  },
  {
    id: 'task_4',
    title: 'Review Quarterly Financial Forecast & Cloud Spend',
    description: 'Analyze AWS and AI inference compute costs against budget projections.',
    priority: 'medium',
    category: 'Finance',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0], // 4 days later
    dueTime: '11:00',
    status: 'todo',
    subtasks: [
      { id: 'sub_4_1', title: 'Export cost allocation tags', completed: false },
      { id: 'sub_4_2', title: 'Schedule meeting with accounting', completed: false },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    completedAt: null,
    voiceCreated: false,
  },
  {
    id: 'task_5',
    title: 'Weekly 5km Morning Run & Wellness Session',
    description: 'Maintain cardio routine, stay hydrated, and practice morning mindfulness.',
    priority: 'low',
    category: 'Personal',
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0], // Yesterday (Overdue/Completed example)
    dueTime: '07:30',
    status: 'completed',
    subtasks: [
      { id: 'sub_5_1', title: '5km jog at neighborhood park', completed: true },
      { id: 'sub_5_2', title: 'Post-run stretch & hydration', completed: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    voiceCreated: true,
  },
  {
    id: 'task_6',
    title: 'Deploy Production Release v2.4 to Staging',
    description: 'Run end-to-end regression tests and verify dark mode contrast before pushing to live cluster.',
    priority: 'high',
    category: 'Engineering',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    dueTime: '16:00',
    status: 'completed',
    subtasks: [
      { id: 'sub_6_1', title: 'Run Cypress E2E tests', completed: true },
      { id: 'sub_6_2', title: 'Verify CDN cache invalidation', completed: true },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    voiceCreated: false,
  }
];

export const CATEGORIES = [
  'All',
  'Product',
  'Design',
  'Engineering',
  'Finance',
  'Personal',
  'Marketing'
];

export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: 'rose', bgLight: 'bg-rose-50', textLight: 'text-rose-700', borderLight: 'border-rose-200', bgDark: 'dark:bg-rose-950/40', textDark: 'dark:text-rose-300', dot: 'bg-rose-500' },
  { id: 'high', label: 'High', color: 'amber', bgLight: 'bg-amber-50', textLight: 'text-amber-700', borderLight: 'border-amber-200', bgDark: 'dark:bg-amber-950/40', textDark: 'dark:text-amber-300', dot: 'bg-amber-500' },
  { id: 'medium', label: 'Medium', color: 'purple', bgLight: 'bg-purple-50', textLight: 'text-purple-700', borderLight: 'border-purple-200', bgDark: 'dark:bg-purple-950/40', textDark: 'dark:text-purple-300', dot: 'bg-purple-500' },
  { id: 'low', label: 'Low', color: 'emerald', bgLight: 'bg-emerald-50', textLight: 'text-emerald-700', borderLight: 'border-emerald-200', bgDark: 'dark:bg-emerald-950/40', textDark: 'dark:text-emerald-300', dot: 'bg-emerald-500' },
];
