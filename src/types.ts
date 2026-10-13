export const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
] as const;

export type Status = (typeof COLUMNS)[number]["id"];

export type Task = {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  status: Status;
};

export function columnLabel(status: Status): string {
  return COLUMNS.find((column) => column.id === status)?.label ?? status;
}

export function isStatus(value: unknown): value is Status {
  return COLUMNS.some((column) => column.id === value);
}
