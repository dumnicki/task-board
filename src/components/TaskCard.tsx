import { useEffect, useRef, useState, type DragEvent, type FormEvent } from "react";
import { compactDeadline, deadlineTone, type DeadlineTone } from "../deadline";
import type { Task } from "../types";

type TaskCardProps = {
  task: Task;
  now: Date;
  startInEdit?: boolean;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, "title" | "description" | "deadline">>,
  ) => void;
  onRemove: (id: string) => void;
};

function cancelDrag(event: DragEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export function TaskCard({
  task,
  now,
  startInEdit = false,
  onUpdate,
  onRemove,
}: TaskCardProps) {
  const [editing, setEditing] = useState(startInEdit);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [deadline, setDeadline] = useState(task.deadline ?? "");
  const cardRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef({ title, description, deadline });
  const taskRef = useRef(task);
  const onUpdateRef = useRef(onUpdate);
  const onRemoveRef = useRef(onRemove);
  draftRef.current = { title, description, deadline };
  taskRef.current = task;
  onUpdateRef.current = onUpdate;
  onRemoveRef.current = onRemove;

  const shownDeadline = editing ? deadline || null : task.deadline;
  const tone: DeadlineTone | "done" =
    task.status === "completed" ? "done" : deadlineTone(shownDeadline, now);
  const due = shownDeadline ? compactDeadline(shownDeadline, now) : null;

  useEffect(() => {
    if (editing) titleRef.current?.focus();
  }, [editing]);

  useEffect(() => {
    if (!editing) return;

    function commit() {
      const draft = draftRef.current;
      const current = taskRef.current;
      const trimmedTitle = draft.title.trim();
      if (!trimmedTitle) {
        if (current.title.trim()) {
          setTitle(current.title);
          setDescription(current.description);
          setDeadline(current.deadline ?? "");
          setEditing(false);
          return;
        }
        onRemoveRef.current(current.id);
        return;
      }
      onUpdateRef.current(current.id, {
        title: trimmedTitle,
        description: draft.description.trim(),
        deadline: draft.deadline || null,
      });
      setTitle(trimmedTitle);
      setEditing(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node) || cardRef.current?.contains(target)) return;
      commit();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") commit();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [editing]);

  function startEditing() {
    setTitle(task.title);
    setDescription(task.description);
    setDeadline(task.deadline ?? "");
    setEditing(true);
  }

  function finishEditing() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      if (task.title.trim()) {
        setTitle(task.title);
        setDescription(task.description);
        setDeadline(task.deadline ?? "");
        setEditing(false);
        return;
      }
      onRemove(task.id);
      return;
    }
    onUpdate(task.id, {
      title: trimmedTitle,
      description: description.trim(),
      deadline: deadline || null,
    });
    setTitle(trimmedTitle);
    setEditing(false);
  }

  function onEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    finishEditing();
  }

  function onDragStart(event: DragEvent<HTMLElement>) {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest("button, input, textarea, label")
    ) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", task.id);
    event.dataTransfer.effectAllowed = "move";
    setDragging(true);
  }

  return (
    <article
      ref={cardRef}
      className={dragging ? `card tone-${tone} is-dragging` : `card tone-${tone}`}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragEnd={() => setDragging(false)}
    >
      <div className="card-top">
        {due ? (
          <p className={`due tone-${tone}`}>
            <time dateTime={shownDeadline ?? undefined}>{due}</time>
          </p>
        ) : (
          <span />
        )}
        <div className="card-actions">
          <button
            type="button"
            className="icon-button"
            aria-label={
              editing
                ? `Done editing ${task.title || "new task"}`
                : `Edit ${task.title || "new task"}`
            }
            aria-pressed={editing}
            onClick={() => (editing ? finishEditing() : startEditing())}
            onDragStart={cancelDrag}
          >
            {editing ? <CheckIcon /> : <PencilIcon />}
          </button>
          <button
            type="button"
            className="icon-button danger"
            aria-label={`Remove ${task.title || "new task"}`}
            onClick={() => onRemove(task.id)}
            onDragStart={cancelDrag}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {editing ? (
        <form className="edit-form" onSubmit={onEditSubmit}>
          <label>
            Title
            <input
              ref={titleRef}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What needs doing?"
              maxLength={120}
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={500}
              rows={3}
            />
          </label>
          <label>
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>
        </form>
      ) : (
        <>
          <h3 className="card-title">{task.title}</h3>
          {task.description && <p className="card-description">{task.description}</p>}
        </>
      )}
    </article>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
      <path d="M13.5 6.5l3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M7 7l1 13h8l1-13" />
    </svg>
  );
}
