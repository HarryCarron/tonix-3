# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo actually contains **two independent npm/yarn projects** — do not mix their tooling:

- **root (`/`)** — the main app: a React + TypeScript + Vite synth/node-editor workspace. Uses `npm`.
- **`taskbox/`** — a separate Storybook sandbox (based on Chromatic's intro-to-storybook template), used to develop and preview individual controls (e.g. `RotaryControl`) in isolation. Uses `yarn` (yarn 4, `.yarnrc.yml`, `taskbox/yarn.lock`) and has its own `package.json`, `tsconfig*.json`, and `eslint` config. It imports components directly from `../../../src/...` in the root project (see `taskbox/src/stories/`), so it is a dev/preview harness for root's components, not a standalone app.

When a task only mentions "the app", "the editor", or "the workspace", it means the root project. When it mentions Storybook or stories, it means `taskbox/`.

## Commands

Root project (run from repo root):
```
npm run dev        # start Vite dev server
npm run build       # tsc -b + vite build
npm run lint        # eslint .
npm run preview      # preview production build
```

`taskbox/` (run from `taskbox/`, using yarn):
```
yarn storybook          # Storybook dev server on :6006
yarn build-storybook     # static Storybook build
yarn dev / yarn build / yarn preview   # taskbox's own throwaway Vite app
```
There is no test runner wired up in either project's `package.json` scripts (Storybook has `@storybook/addon-vitest`/vitest installed in `taskbox`, but no root-level test script exists yet).

## Architecture (root project)

The app is a node-based editor for building synth/audio patches on a large pannable/zoomable canvas ("world").

- **`App.tsx`** — top-level layout: a fixed-width `Menu` sidebar + the `Workspace`.
- **`components/editor/workspace/Workspace.tsx`** — the core canvas container. Wraps `World` in `react-zoom-pan-pinch`'s `TransformWrapper`/`TransformComponent` for pan/zoom, and overlays floating UI (`Tools`, `Navigator`) as absolutely-positioned siblings. Owns `editorTool` state (`EditorTool.add | pan | mag`, from `types/editor/EditorTools.tsx`) which gates panning (`TransformWrapper panning.disabled`) and drives cursor styling and the mag-zoom bounding-box tool.
- **`components/editor/world/World.tsx`** — the actual canvas content, a fixed-size square (`ENV.worldDims`, `src/env.ts`) containing absolutely-positioned nodes (each wrapped in `NodeWrapper`) plus an SVG dot-grid background.
- **Nodes** (`components/nodes/*`, e.g. `Keyboard`) and **instruments** (`components/instruments/*`, e.g. `Polysynth`) are the draggable content placed inside `World`. `NodeWrapper` provides the common title bar/chrome (rename input, mute/settings/close buttons) around any node's content. `utils/node-map.tsx` maps string node-type keys to their React components — this is the registry to extend when adding a new node type.
- **`utils/workspace/`** holds the imperative/vanilla-JS-style helpers that back the canvas, separate from React state:
  - `viewport.ts` — pure content-space ↔ viewport-space coordinate conversion given `{scale, positionX, positionY}` (the `react-zoom-pan-pinch` state shape).
  - `navigator.ts` (`NavigatorController`) — drives the mini-map (`components/editor/navigator/Navigator.tsx`): sizes the minimap world/camera `div`s off `ENV.worldDims` and a fixed `scaleVal`, and keeps them in sync via a `ResizeObserver` on the real world element.
  - `bounding-box-tool.ts` / `bounding-box.ts` — the drag-to-select-region tool used by the "mag" (zoom-to-region) editor tool; `BoundingBoxTool` listens for drag events via `utils/drag-and-drop.tsx` and reports the resulting `Rect` to a caller-supplied listener, while `BoundingBox` is the imperative DOM overlay it draws.
  - `patient-load.ts` (`patientLoad` singleton) — a tiny pub/sub-ish registry so components can register a "source" (e.g. the `react-zoom-pan-pinch` camera ref) by string id and other code can fetch it once available, decoupling init order between `Workspace` and things that need the camera ref before it exists.
- **`utils/drag-and-drop.tsx`** — a generic imperative mouse drag helper (`start`/`dragging`/`done` events) used by the bounding-box tool; not React-specific, attaches raw DOM listeners to a given host element.
- **`context/workspace/`** — `WorkspaceController`/`useWorkspaceControllerRef` context for exposing the world DOM ref down the tree; currently minimal (`worldRef` only).
- **`reducers/navigator.tsx`** — a reducer for navigator-related state (`nodeAreaDims`); note it isn't currently wired into a `useReducer` call anywhere obvious — check current usage before assuming it's live.
- Styling: Tailwind v4 (via `@tailwindcss/vite`, no separate `tailwind.config`) plus per-component `.css` files colocated with their `.tsx`. `components/ui/*` are shadcn/ui primitives (`components.json`: style "new-york", stone base color, no RSC).
- Path alias `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.json`).

### Coordinate model

Pan/zoom math is a recurring source of care in this codebase (see `todo.md` for an in-progress mouse-anchored-zoom refactor checklist). The intended model: `screen = world * zoom + pan`, i.e. `translate(pan) scale(zoom)`. When touching `utils/workspace/viewport.ts`, `Workspace.tsx`, or the `react-zoom-pan-pinch` integration, keep conversions centralized there rather than duplicating scale/position math inline.
