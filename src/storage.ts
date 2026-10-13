import { parseCalendarDate } from "./deadline";
import { isStatus, type Task } from "./types";

const STORAGE_KEY = "task-board.tasks.v1";

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  if (typeof task.id !== "string" || typeof task.title !== "string") return false;
  if (!isStatus(task.status)) return false;
  if (task.deadline === null) return true;
  return typeof task.deadline === "string" && parseCalendarDate(task.deadline) !== null;
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTask);
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
