import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateTaskStats, getRelativeDueDateLabel } from '../utils/taskCalculations.js';
import { parseVoiceInput } from '../utils/voiceParser.js';

test('Task Statistics Calculations: correct pending, overdue, completed, and completionRate', () => {
  const referenceToday = '2026-10-24';

  const mockTasks = [
    { id: '1', title: 'Task 1', status: 'completed', dueDate: '2026-10-23', priority: 'high', voiceCreated: true },
    { id: '2', title: 'Task 2', status: 'in-progress', dueDate: '2026-10-24', priority: 'urgent', voiceCreated: false },
    { id: '3', title: 'Task 3', status: 'todo', dueDate: '2026-10-20', priority: 'medium', voiceCreated: true }, // Overdue
    { id: '4', title: 'Task 4', status: 'todo', dueDate: '2026-10-28', priority: 'low', voiceCreated: false },
  ];

  const stats = calculateTaskStats(mockTasks, referenceToday);

  assert.equal(stats.total, 4, 'Total tasks should be 4');
  assert.equal(stats.completed, 1, 'Completed tasks should be 1');
  assert.equal(stats.pending, 3, 'Pending tasks should be 3');
  assert.equal(stats.dueToday, 1, 'Due today should be 1');
  assert.equal(stats.overdue, 1, 'Overdue should be 1 (Task 3)');
  assert.equal(stats.urgentOrHigh, 1, 'Active urgent/high should be 1 (Task 2, Task 1 is completed)');
  assert.equal(stats.completionRate, 25, 'Completion rate should be 25%');
  assert.equal(stats.voiceCreatedCount, 2, 'Voice created count should be 2');
});

test('Overdue and due-today calculations: completed tasks must NOT be counted as overdue', () => {
  const referenceToday = '2026-10-24';

  const tasksWithOldCompleted = [
    { id: '1', title: 'Old completed task', status: 'completed', dueDate: '2026-10-01', priority: 'urgent' },
  ];

  const stats = calculateTaskStats(tasksWithOldCompleted, referenceToday);

  assert.equal(stats.completed, 1);
  assert.equal(stats.overdue, 0, 'Completed tasks must never be counted as overdue');
  assert.equal(stats.pending, 0, 'Completed tasks must never be counted as pending');
});

test('Relative Due Date Labels: accurate relative status', () => {
  const referenceToday = '2026-10-24';

  const todayLabel = getRelativeDueDateLabel('2026-10-24', referenceToday);
  assert.equal(todayLabel.label, 'Due Today');
  assert.equal(todayLabel.status, 'today');

  const overdueLabel = getRelativeDueDateLabel('2026-10-22', referenceToday);
  assert.equal(overdueLabel.label, '2 days overdue');
  assert.equal(overdueLabel.status, 'overdue');

  const tomorrowLabel = getRelativeDueDateLabel('2026-10-25', referenceToday);
  assert.equal(tomorrowLabel.label, 'Due Tomorrow');
  assert.equal(tomorrowLabel.status, 'upcoming');
});

test('Natural Language Voice Parser: Task Creation with priority, due date, category', () => {
  const voiceCommand = "Add urgent task Prepare investor presentation due tomorrow with tag Finance";
  const parsed = parseVoiceInput(voiceCommand, []);

  assert.ok(parsed, 'Voice command should parse');
  assert.equal(parsed.action, 'CREATE_TASK');
  assert.ok(parsed.task);
  assert.equal(parsed.task.priority, 'urgent');
  assert.equal(parsed.task.category, 'Finance');
  assert.ok(parsed.task.title.toLowerCase().includes('prepare investor presentation'));
});

test('Natural Language Voice Parser: Theme and Filter commands', () => {
  const darkCommand = parseVoiceInput("Switch to dark mode", []);
  assert.equal(darkCommand.action, 'SET_THEME');
  assert.equal(darkCommand.theme, 'dark');

  const filterCommand = parseVoiceInput("Filter by urgent", []);
  assert.equal(filterCommand.action, 'FILTER_PRIORITY');
  assert.equal(filterCommand.priority, 'urgent');

  const clearCommand = parseVoiceInput("Clear filters", []);
  assert.equal(clearCommand.action, 'CLEAR_FILTERS');
});

test('Natural Language Voice Parser: Task completion intent', () => {
  const mockTasks = [
    { id: 't123', title: 'Prepare design tokens', status: 'todo' }
  ];

  const completeCommand = parseVoiceInput("Mark task Prepare design tokens as completed", mockTasks);
  assert.equal(completeCommand.action, 'COMPLETE_TASK');
  assert.equal(completeCommand.taskId, 't123');
});
