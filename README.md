# Campus Life Planner

CampusPlan is an accessible, responsive planner for campus tasks and events, built with semantic HTML, CSS, and vanilla JavaScript ES modules. 

**This is my website: https://liliose-gashugi.github.io/Building-Responsive-UI/**

**This is the link to my demo video: https://www.loom.com/share/a1f6fe1226504dffba67fcc926ee4ef8**

## Features

- Add, edit, and delete tasks and events with inline validation feedback
- Sort by due date, title, or duration in both directions
- Live regex search with a case-sensitive toggle, safe compilation, and `<mark>` highlighting
- Dashboard with total records, planned minutes, top tag, upcoming plans, and a seven-day chart
- Time target with a remaining or overage message
- Minutes to hours conversion in Settings
- Automatic `localStorage` saving, with a warning when storage is full
- JSON export and validated JSON import, including duplicate ID checks
- Starter records loaded from `seed.json`
- Browser tests in `tests.html`

## Project structure

```text
campus-life-planner/
├── index.html
├── tests.html
├── seed.json
├── README.md
├── .gitignore
├── assets/
├── styles/
│   └── style.css
├── scripts/
│   ├── app.js
│   ├── state.js
│   ├── storage.js
│   ├── ui.js
│   ├── validators.js
│   ├── search.js
│   └── tests.js
└── tests/
    └── README.md
```

## Run locally

1. Download or clone the repository.
2. Open the folder in VS Code.
3. Start VS Code Live Server, or run `python3 -m http.server` in the project root.
4. Open `index.html` through that server address.

A local server is required because the project uses ES modules and loads `seed.json` with `fetch`.

## Regex catalog

| Purpose | Pattern | Example |
| --- | --- | --- |
| Title spacing | `^\S(?:.*\S)?$` | Accepts `Read notes`; rejects ` Read notes ` |
| Duration | `^(0\|[1-9]\d*)$` | Accepts `0`, `45`, `120`; rejects `-1`, `02` |
| Date shape | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | Accepts `2026-10-14`; calendar days are checked too |
| Tag | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Accepts `Study Time`, `Self-Study`; rejects `Study!` |
| Repeated words (advanced, back-reference) | `\b(\w+)\s+\1\b` | Rejects `study study` |

Search examples:

- `study\|exam` matches either word.
- `\b\d{2}:\d{2}\b` finds a time token such as `09:30`.
- `^@tag:\w+` matches a note that starts with `@tag:Study`.
- `[` is invalid and shows an accessible error instead of breaking the page.

## Keyboard map

- `Tab` moves to the next link, field, or button; `Shift + Tab` moves back.
- `Enter` or `Space` activates the focused link or button.
- `Enter` inside the form submits it.
- `Escape` dismisses the native confirmation dialogs.
- The first focusable item is the "Skip to content" link.

## Accessibility notes

- Semantic `header`, `nav`, `main`, `section`, and `footer` landmarks with one `h1` and a logical heading order.
- Every input has a bound `<label>`; invalid fields get `aria-invalid`.
- A skip-to-content link and a visible `:focus-visible` outline on all interactive elements.
- Field errors, search results, and data messages use `role="status"` with `aria-live="polite"`.
- The target message switches to `aria-live="assertive"` only when the target is exceeded.
- Search text is escaped before rendering, so highlights use `<mark>` without breaking the markup.
- Deleting a record and importing a file both ask for confirmation.
- Pink and ink colours meet WCAG AA contrast; `prefers-reduced-motion` turns the animations off.
- Layout is mobile-first with breakpoints at 360px, 768px, and 1024px.

## Data model

```json
{
  "id": "rec_seed_01",
  "title": "Review lecture notes",
  "dueDate": "2026-10-14",
  "duration": 45,
  "tag": "Study",
  "notes": "Focus on chapter 3.",
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

Records and settings are saved in `localStorage`. The importer checks every field, the timestamps, and duplicate IDs before replacing your data. Malformed JSON shows an error and leaves existing records untouched.

## Testing

Open `tests.html` through the local server. It runs 12 assertions covering valid records, leading spaces, repeated words, impossible dates, negative durations, invalid tags, regex compilation, invalid patterns, time-token search, safe highlighting, duplicate IDs, and a clean import list.

Manual checks:

1. Add a task, refresh the page, and confirm it is still there.
2. Edit a task and confirm the details change.
3. Delete a task and confirm the prompt appears.
4. Sort in each direction.
5. Search `study|exam`, then try the invalid pattern `[`.
6. Export JSON and import the same file.
7. Import a malformed file and a file with duplicate IDs.
8. Move through the whole page using only the keyboard.
9. Resize the window to 360px, 768px, and 1024px.

