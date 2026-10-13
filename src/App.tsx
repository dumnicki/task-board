import { useEffect, useState } from "react";
import { Column } from "./components/Column";
import { loadTasks, saveTasks } from "./storage";
import { COLUMNS, columnLabel, type Status, type Task } from "./types";

export function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [newCardId, setNewCardId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function addTask(status: Status) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: "",
      description: "",
      deadline: null,
      status,
    };
    setTasks((current) => [task, ...current]);
    setNewCardId(task.id);
    setNotice(`New task at the top of ${columnLabel(status)}.`);
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
    setNewCardId((current) => (current === id ? null : current));
  }

  function removeTask(id: string) {
    const current = tasks.find((task) => task.id === id);
    setTasks((items) => items.filter((task) => task.id !== id));
    if (current?.title) setNotice(`Removed “${current.title}”.`);
    if (current?.id === newCardId) setNewCardId(null);
  }

  return (
    <main className="page">
      <header className="masthead">
        <div>
          <p className="eyebrow">Personal board</p>
          <h1>Task board</h1>
          <p className="lede">
            Use + on a column to add a card, then drag it between columns. Tasks stay in
            this browser.
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

      <div className="board">
        {COLUMNS.map((column) => (
          <Column
            key={column.id}
            status={column.id}
            label={column.label}
            tasks={tasks.filter((task) => task.status === column.id)}
            now={now}
            newCardId={newCardId}
            onAdd={addTask}
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
