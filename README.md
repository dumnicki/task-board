# Task board

A personal kanban board that stays in the browser. Three columns, cards you can drag, and deadlines that change color as they get close.

## Run it

```bash
npm install
npm run dev
```

Open the local address Vite prints. The first visit loads a sample board: one card due tomorrow, one overdue, and one already finished.

Your own cards replace that sample and stay in this browser under `task-board.tasks.v1`. Nothing is sent to a server.

To show the sample again, remove that key from the site's local storage and reload. An empty board is kept empty on purpose, so deleting every card does not bring the sample back.

## Use it

| Action | How |
| --- | --- |
| Add a card | **+** on a column. Leave the title blank and the card is discarded. |
| Edit | Pencil, then the check mark, Enter, Escape, or a click outside the card. |
| Move | Drag a card into another column. |
| Remove | Trash icon. |

Coming up means due today or within two days. A past date is marked overdue. A card in **Completed** turns green, whatever its date was.

## Build

```bash
npm run build
npm run preview
```

React, TypeScript, and Vite. No backend.

## License

[MIT](LICENSE) © 2026 Dariusz Dumnicki
