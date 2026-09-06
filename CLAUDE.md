# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Single project, single `npm` toolchain — a React + TypeScript + Vite synth/node-editor workspace. Storybook is not a separate app: it's wired directly into this `package.json`/`node_modules`, configured via root `.storybook/main.ts` + `preview.ts`, with stories living in `src/stories/` and importing components with the normal `@/*` alias (e.g. `@/components/controls/rotary-control/RotaryControl`). There used to be a standalone `taskbox/` Storybook sandbox (separate `yarn` project, own `node_modules`) — it was deleted in favor of this in-project setup; don't recreate that split.

## Commands

```
npm run dev            # start Vite dev server
npm run build            # tsc -b + vite build
npm run lint             # eslint .
npm run preview           # preview production build
npm run storybook         # Storybook dev server on :6006
npm run build-storybook    # static Storybook build
```
There is no test runner wired up yet.

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

### Audio engine

Sound is not implemented yet — `Polysynth` and `Keyboard` are currently visual mockups only, with no audio wiring or node-graph/patch-cable model. When implementing audio, use **Tone.js** as the layer on top of the Web Audio API (not raw `AudioContext`/`AudioNode`s directly) — e.g. `Tone.PolySynth`, `Tone.Oscillator`, `Tone.Transport`. `tone` is not yet in `package.json`; add it when audio work begins.

**Planned injection/bootstrap pattern (agreed, not yet built):** an `AudioEngine` facade class will own `Tone.getContext()`, the master bus, and any internal routing/config the user doesn't control directly — node components must go through this facade rather than importing `Tone` themselves. It's a two-state object:
- **Constructed** — the facade exists and is safe to hand out. Register it via the existing `patientLoad` singleton (`utils/workspace/patient-load.ts`) as soon as it's built at app bootstrap: `patientLoad.setSource("audioEngine", engine)`. Node components fetch it with `patientLoad.getSource("audioEngine", ...)`, the same pattern already used for the `"camera"` ref in `Workspace.tsx` — this only means "the object exists," not "audio can play."
- **Running** — the underlying `AudioContext` must be resumed via `Tone.start()` inside a real user-gesture handler (browser autoplay policy; cannot be done at page load). This readiness state is the engine's own concern, not `patientLoad`'s — expose it as something like `engine.ready` / `engine.whenReady()`, checked by nodes after they've already obtained the reference. The first pointer interaction on the canvas (`Workspace`'s existing pointer handling via `DragAndDrop`) is the natural place to call `engine.start()`.

Do not overload `patientLoad`'s existence-based semantics to also mean "ready to play" — keep the two states separate.

### Processing workload & scheduling considerations

Once audio, canvas animation, and drag-and-drop are all live together, treat them as running on distinct clocks rather than one shared render loop:

- **Three clocks, kept decoupled.** Audio timing (`Tone.Transport`, the Web Audio clock) must not be driven off React state or `rAF` — it schedules ahead of time and stays sample-accurate even if the UI thread stutters. Drag-and-drop already runs as raw DOM listeners outside React (`utils/drag-and-drop.tsx`), and pan/zoom is a single imperative transform via `react-zoom-pan-pinch` — neither should be routed through React state per frame. Anything that needs a visual to track audio precisely (a playhead, gain meter, note-on highlight) should bridge the two clocks explicitly via `Tone.Draw.schedule`, not a free-running `rAF`/`setInterval` guess.
- **Main-thread frame budget, not raw CPU, is the scarce resource.** React reconciliation, layout, paint, and input handling all share one budget. Web Workers can't touch the DOM, so they don't help with paint/DOM cost — only with genuinely heavy off-DOM computation (e.g. custom envelope/FFT math), and even then only the final value gets posted back for rendering. For audio-thread-accurate computation, prefer an `AudioWorklet` over a generic worker.
- **Not everything needs the same update rate.** Node chrome (rename/mute/settings) is event-driven and rare; pan/zoom is per-frame but cheap; audio-reactive visuals need frame-rate updates gated to the audio clock; actual audio events are scheduled well ahead of playback, not per-frame at all. Don't reach for one blanket optimization (workers, virtualization) without noting which tier a given animation actually falls in.
- **Prefer platform paint isolation over hand-rolled virtualization.** `content-visibility`/`contain`/`will-change` on node containers get most of the "don't repaint the whole world for one moving part" benefit for free. Avoid schemes like screenshotting the world and unmounting components underneath during playback — the screenshot step itself is expensive (worst possible time to introduce a hitch) and creates a freeze/thaw resync problem on any mid-playback interaction. Only worth revisiting if profiling shows the cost is React/memory from having many nodes mounted, not paint — and viewport-based virtualization is a smaller lift than rasterize-on-playback.
- **Cleanup discipline matters more here than in typical React apps.** Undisposed Tone.js nodes/analysers/listeners leak and eventually cause GC pauses, which are worse here because a pause can visibly desync audio-reactive UI from the audio itself.
- **Backgrounded tabs desync visuals, not audio.** `rAF` throttles when the tab isn't visible but the Web Audio clock doesn't stop, so anything tracking playback needs an explicit resync on `visibilitychange` rather than assuming animation and audio drift together.
- **Sequencing:** since the node-graph/`AudioEngine` facade isn't built yet, prioritize establishing these separations (imperative updates for high-frequency values, `Tone.Draw` as the audio↔visual bridge) as house style now, rather than pre-building workers or virtualization for load that hasn't been profiled.

### Coordinate model

Pan/zoom math is a recurring source of care in this codebase (see `todo.md` for an in-progress mouse-anchored-zoom refactor checklist). The intended model: `screen = world * zoom + pan`, i.e. `translate(pan) scale(zoom)`. When touching `utils/workspace/viewport.ts`, `Workspace.tsx`, or the `react-zoom-pan-pinch` integration, keep conversions centralized there rather than duplicating scale/position math inline.
