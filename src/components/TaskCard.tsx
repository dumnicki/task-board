import { useEffect, useState, type DragEvent, type FormEvent } from "react";
import {
  deadlineSummary,
  deadlineTone,
  formatDeadline,
} from "../deadline";
import { COLUMNS, type Status, type Task } from "../types";

type TaskCardProps = {
  task: Task;
  now: Date;
  onMove: (id: string, status: Status) => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, "title" | "deadline">>) => void;
  onRemove: (id: string) => void;
};

export function TaskCard({ task, now, onMove, onUpdate, onRemove }: TaskCardProps) {
  const [title, setTitle] = useState(task.title);
  const [dragging, setDragging] = useState(false);
  const tone = deadlineTone(task.deadline, now);
  const summary = task.deadline ? deadlineSummary(task.deadline, now) : null;
  const formatted = task.deadline ? formatDeadline(task.deadline) : null;

  useEffect(() => {
    setTitle(task.title);
  }, [task.title]);

  function commitTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitle(task.title);
      return;
    }
    if (trimmed !== task.title) onUpdate(task.id, { title: trimmed });
  }

  function onTitleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitTitle();
  }

  function onDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
    setDragging(true);
  }

  return (
    <article className={dragging ? `card tone-${tone} is-dragging` : `card tone-${tone}`}>
      <div className="card-toolbar">
        <div
          className="drag-handle"
          draggable
          aria-hidden="true"
          onDragStart={onDragStart}
          onDragEnd={() => setDragging(false)}
        >
          Drag
        </div>
        <button
          type="button"
          className="text-button"
          onClick={() => onRemove(task.id)}
        >
          Remove
          <span className="visually-hidden"> {task.title}</span>
        </button>
      </div>

      <form onSubmit={onTitleSubmit}>
        <label className="title-field">
          <span className="visually-hidden">Title for {task.title}</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            maxLength={120}
          />
        </label>
      </form>

      <p className={`deadline tone-${tone}`}>
        <span>{summary ?? "No deadline"}</span>
        {formatted && <time dateTime={task.deadline ?? undefined}>{formatted}</time>}
      </p>

      <label className="date-field">
        Deadline
        <input
          type="date"
          value={task.deadline ?? ""}
          onChange={(event) =>
            onUpdate(task.id, { deadline: event.target.value || null })
          }
        />
      </label>

      <div className="moves" role="group" aria-label={`Move ${task.title}`}>
        {COLUMNS.map((column) => (
          <button
            key={column.id}
            type="button"
            className="move-button"
            aria-pressed={task.status === column.id}
            onClick={() => onMove(task.id, column.id)}
          >
            {column.label}
          </button>
        ))}
      </div>
    </article>
  );
}
