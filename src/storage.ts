import { demoTasks } from "./demo";
import { parseCalendarDate } from "./deadline";
import { isStatus, type Task } from "./types";

const STORAGE_KEY = "task-board.tasks.v1";

function readTask(value: unknown): Task | null {
  if (!value || typeof value !== "object") return null;
  const task = value as Record<string, unknown>;
  if (typeof task.id !== "string" || typeof task.title !== "string" || !task.title.trim()) {
    return null;
  }
  if (!isStatus(task.status)) return null;

  let deadline: string | null = null;
  if (typeof task.deadline === "string") {
    if (!parseCalendarDate(task.deadline)) return null;
    deadline = task.deadline;
  } else if (task.deadline != null) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    description: typeof task.description === "string" ? task.description : "",
    deadline,
    status: task.status,
  };
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return demoTasks();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const task = readTask(item);
      return task ? [task] : [];
    });
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
