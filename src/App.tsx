import { useEffect, useState, type FormEvent } from "react";
import { Column } from "./components/Column";
import { parseCalendarDate } from "./deadline";
import { loadTasks, saveTasks } from "./storage";
import { COLUMNS, columnLabel, type Status, type Task } from "./types";

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Add a title before creating the task.");
      return;
    }
    if (deadline && !parseCalendarDate(deadline)) {
      setError("Use a real calendar date for the deadline.");
      return;
    }

    const task: Task = {
      id: crypto.randomUUID(),
      title: trimmed,
      description: description.trim(),
      deadline: deadline || null,
      status: "todo",
    };
    setTasks((current) => [...current, task]);
    setTitle("");
    setDescription("");
    setDeadline("");
    setError("");
    setNotice(`Added “${trimmed}” to To do.`);
  }

  function moveTask(id: string, status: Status) {
    const current = tasks.find((task) => task.id === id);
    if (!current || current.status === status) return;
    setTasks((items) => {
      const task = items.find((item) => item.id === id);
      if (!task || task.status === status) return items;
      return [...items.filter((item) => item.id !== id), { ...task, status }];
    });
    setNotice(`Moved “${current.title}” to ${columnLabel(status)}.`);
  }

  function updateTask(
    id: string,
    patch: Partial<Pick<Task, "title" | "description" | "deadline">>,
  ) {
    setTasks((items) =>
      items.map((task) => (task.id === id ? { ...task, ...patch } : task)),
    );
  }

  function removeTask(id: string) {
    const current = tasks.find((task) => task.id === id);
    setTasks((items) => items.filter((task) => task.id !== id));
    if (current) setNotice(`Removed “${current.title}”.`);
  }

  return (
    <main className="page">
      <header className="masthead">
        <div>
          <p className="eyebrow">Personal board</p>
          <h1>Task board</h1>
          <p className="lede">
            Add a task, then drag the card between columns. Tasks stay in this browser.
          </p>
        </div>
        <ul className="legend">
          <li>
            <span className="swatch soon" aria-hidden="true" />
            Coming up, due within 2 days
          </li>
          <li>
            <span className="swatch overdue" aria-hidden="true" />
            Past deadline
          </li>
          <li>
            <span className="swatch done" aria-hidden="true" />
            Finished
          </li>
        </ul>
      </header>

      <form className="composer" onSubmit={addTask}>
        <label className="field grow">
          Task
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs doing?"
            maxLength={120}
            autoComplete="off"
          />
        </label>
        <label className="field">
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </label>
        <button type="submit" className="add-button">
          Add to To do
        </button>
        <label className="field description">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional note"
            maxLength={500}
            rows={2}
          />
        </label>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            status={column.id}
            label={column.label}
            tasks={tasks.filter((task) => task.status === column.id)}
            now={now}
            onMove={moveTask}
            onUpdate={updateTask}
            onRemove={removeTask}
          />
        ))}
      </div>

      <p className="visually-hidden" aria-live="polite">
        {notice}
      </p>
    </main>
  );
}
