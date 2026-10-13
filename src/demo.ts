import type { Task } from "./types";

function dayOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Sample board for a first visit, with deadlines relative to today. */
export function demoTasks(): Task[] {
  return [
    {
      id: "demo-release-notes",
      title: "Draft the release notes",
      description: "Lead with what changed, then how to try it.",
      deadline: dayOffset(1),
      status: "todo",
    },
    {
      id: "demo-kitchen",
      title: "Replace the kitchen bulb",
      description: "Warm light, the one by the window.",
      deadline: dayOffset(8),
      status: "todo",
    },
    {
      id: "demo-landlord",
      title: "Reply to the landlord",
      description: "The leak is still there. Send photos.",
      deadline: dayOffset(-3),
      status: "in-progress",
    },
    {
      id: "demo-pack",
      title: "Pack the weekend bag",
      description: "",
      deadline: null,
      status: "in-progress",
    },
    {
      id: "demo-train",
      title: "Book the train",
      description: "Window seat, morning departure.",
      deadline: null,
      status: "completed",
    },
  ];
}
