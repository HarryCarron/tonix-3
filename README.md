# tonix-3

A node-based synth/audio patch editor: a large pannable, zoomable canvas ("world") on which you place instrument and control nodes (keyboard, polysynth, etc.) and wire them up, similar in spirit to tools like Max/MSP or Pure Data but built for the web.

## Tech stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4 (via `@tailwindcss/vite`, no separate config file)
- [`react-zoom-pan-pinch`](https://github.com/BetterTyped/react-zoom-pan-pinch) for canvas pan/zoom
- [shadcn/ui](https://ui.shadcn.com/) primitives (style: "new-york", base color: stone)

## Getting started

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build     # tsc -b + vite build
npm run lint       # eslint .
npm run preview     # preview a production build
```

## Project structure

This repo contains two independent projects:

- **root (`/`)** — the app itself, described above.
- **`taskbox/`** — a separate Storybook sandbox (based on Chromatic's intro-to-storybook template) used to develop and preview individual controls in isolation. It has its own `package.json` and uses `yarn`, and imports components directly from the root project's `src/`. See `taskbox/README.md` for details.

### Root project layout

```
src/
  components/
    editor/       # Workspace, World (canvas), Menu, Tools, Navigator, viewport tools
    nodes/        # Draggable node chrome + node types (e.g. Keyboard)
    instruments/   # Instrument implementations (e.g. Polysynth)
    controls/      # Reusable UI controls (rotary control, sliders, etc.)
    ui/           # shadcn/ui primitives
  context/workspace/  # Workspace controller context (world DOM ref)
  reducers/       # State reducers (e.g. navigator)
  utils/
    workspace/     # Imperative canvas helpers: viewport math, minimap, bounding-box tool, patient-load registry
    node-map.tsx    # Registry mapping node-type keys to components
    drag-and-drop.tsx # Generic imperative drag helper
  types/         # Shared type/enum definitions (e.g. EditorTool)
  env.ts         # Global constants (e.g. world size)
```

### Core concepts

- **World** — a fixed-size square canvas (`ENV.worldDims` in `src/env.ts`) containing absolutely-positioned nodes and a dot-grid background.
- **Workspace** — wraps `World` in `react-zoom-pan-pinch` for pan/zoom, and overlays floating UI (tool selector, minimap navigator) on top.
- **Editor tools** — `add`, `pan`, and `mag` (zoom-to-region via a drag-to-select bounding box), selected via the toolbar and driving canvas behavior/cursor.
- **Nodes & instruments** — draggable content placed on the canvas, wrapped in common `NodeWrapper` chrome (title, mute/settings/close controls). New node types are registered in `utils/node-map.tsx`.
- **Navigator** — a minimap driven by `NavigatorController`, kept in sync with the real world size via a `ResizeObserver`.

See `todo.md` for the in-progress mouse-anchored pan/zoom refactor checklist.
