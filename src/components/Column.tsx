import { useState, type DragEvent } from "react";
import { deadlineTone } from "../deadline";
import type { Status, Task } from "../types";
import { TaskCard } from "./TaskCard";

type ColumnProps = {
  status: Status;
  label: string;
  tasks: Task[];
  now: Date;
  onMove: (id: string, status: Status) => void;
  onUpdate: (
    id: string,
    patch: Partial<Pick<Task, "title" | "description" | "deadline">>,
  ) => void;
  onRemove: (id: string) => void;
};

export function Column({
  status,
  label,
  tasks,
  now,
  onMove,
  onUpdate,
  onRemove,
}: ColumnProps) {
  const [over, setOver] = useState(false);
  const urgent =
    status === "completed"
      ? 0
      : tasks.filter((task) => {
          const tone = deadlineTone(task.deadline, now);
          return tone === "overdue" || tone === "soon";
        }).length;

  function allowDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOver(true);
  }

  function leaveColumn(event: DragEvent<HTMLElement>) {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setOver(false);
  }

  function dropTask(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setOver(false);
    const id = event.dataTransfer.getData("text/plain");
    if (id) onMove(id, status);
  }

  return (
    <section
      className={over ? "column is-over" : "column"}
      aria-labelledby={`column-${status}`}
      onDragEnter={allowDrop}
      onDragOver={allowDrop}
      onDragLeave={leaveColumn}
      onDrop={dropTask}
    >
      <header className="column-header">
        <h2 id={`column-${status}`}>{label}</h2>
        <span className="count">
          {tasks.length}
          <span className="visually-hidden"> tasks</span>
        </span>
      </header>
      {urgent > 0 && (
        <p className="column-note">
          {urgent} {urgent === 1 ? "deadline needs" : "deadlines need"} attention
        </p>
      )}
      <div className="card-list">
        {tasks.length === 0 && (
          <p className="empty">Drop a task here.</p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            now={now}
            onUpdate={onUpdate}
            onRemove={onRemove}
          />
        ))}
      </div>
    </section>
  );
}
