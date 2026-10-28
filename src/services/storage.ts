import type { Habit, IssueReport } from '../types';

const REPORTS_KEY = 'green-india-reports-v1';
const HABITS_KEY = 'green-india-habits-v1';

export function readReports(fallback: IssueReport[]): IssueReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return [...parsed as IssueReport[], ...fallback];
  } catch {
    return fallback;
  }
}

export function saveReport(report: IssueReport): void {
  const current = readLocalReports();
  // Blob URLs are session-only; never persist them because they break after refresh.
  const persistentReport = { ...report };
  delete persistentReport.imageUrl;
  try {
    localStorage.setItem(REPORTS_KEY, JSON.stringify([persistentReport, ...current]));
  } catch (error) {
    // Keep the current session usable even when storage is disabled or full.
    console.warn('Green India could not persist this report in local storage.', error);
  }
}

function readLocalReports(): IssueReport[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(REPORTS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed as IssueReport[] : [];
  } catch {
    return [];
  }
}

export function readHabits(): Habit[] {
  const defaults: Habit[] = [
    { id: 'bottle', label: 'Carry a reusable bottle', done: false },
    { id: 'waste', label: 'Separate wet and dry waste', done: false },
    { id: 'tap', label: 'Save water at home', done: false },
    { id: 'litter', label: 'Put waste in the right bin', done: false },
    { id: 'plant', label: 'Care for a plant or green space', done: false }
  ];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw) as Habit[];
    return defaults.map(item => ({ ...item, done: saved.find(x => x.id === item.id)?.done ?? false }));
  } catch {
    return defaults;
  }
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  } catch (error) {
    console.warn('Green India could not persist eco-habits in local storage.', error);
  }
}