# Polysynth Real-Audio Wiring — Progress / Wrinkles

Storybook-only: `Polysynth` stays audio-agnostic (no `Tone` import in the
component itself); a story-level "bridge" owns the live Tone graph and
lifted state, and mirrors it down into `<Polysynth>` as controlled props.
Production usage (`<Polysynth />` in `World.tsx`, no props) must stay
exactly as it is today — uncontrolled, silent, unaffected.

## Done

- [x] `PolysynthVoice` (`src/components/instruments/polysynth/PolysynthVoice.ts`):
      a `Tone.Monophonic` subclass usable as `new Tone.PolySynth(PolysynthVoice)`.
      3 independent oscillators (type/phase each, own gain + pan), summed
      through one shared `AmplitudeEnvelope`. Settable the idiomatic Tone
      way: `synth.set({ oscillator0: {type, phase}, oscillator0Gain: {gain},
      oscillator0Pan: {pan}, envelope: {...} })`.
- [x] Verified with an offline render (not just a type-check) that it
      actually produces non-silent audio for triggered notes/chords.
- [x] Lifted Phase/Gain/Pan (`Oscillator.tsx`) and ADSR+curves (`Amp.tsx`)
      up to `Polysynth`-level state, matching the existing `wave`/`enabled`
      pattern. `Polysynth` now takes optional `audioState`/
      `onAudioStateChange` props (same optionally-controlled convention as
      `RotaryControl`/`Amp`) — omit both and it behaves exactly as before
      (verified: pixel-identical default render, and `<Polysynth />` with
      no props still type-checks/renders for `World.tsx`). `Amp` itself is
      now optionally-controlled the same way (`value`/`onChange`), with its
      default ADSR moved to `amp/types.ts` (`DEFAULT_ADSR`) so both Amp's
      own fallback and Polysynth's lifted default use the same literal
      values, no drift.
- [x] Verified Phase/Gain/Pan are now genuinely live (not just visually
      unchanged) — simulated a drag on oscillator 1's Phase knob via
      Playwright, confirmed its readout moved 50→100 while oscillators 2/3
      and the other knobs stayed untouched.
- [x] **`usePolysynthAudioBridge`** (`usePolysynthAudioBridge.ts`): owns
      one `Tone.PolySynth(PolysynthVoice).toDestination()`, mirrors
      `PolysynthAudioState` into `.set(...)` via effect, exposes
      `{audioState, onAudioStateChange, trigger}`. Resolved all 3 open
      mapping decisions inline:
      wave `"additive"` → `type: "custom"` + a fixed decaying-harmonics
      `partials` array; curve index `0|1|2` → `"linear"/"exponential"`,
      with a 3rd distinct `"sine"` shape only where Tone's type allows it
      (attack/release — `decayCurve` is restricted to linear/exponential,
      so its 3rd index folds to `"exponential"`); envelope timeline
      fractions × a fixed `ENVELOPE_TIMELINE_SECONDS = 2`.
- [x] New story `Polysynth/LiveWithMidiBox` (`polysynth.stories.tsx`):
      `MidiBox` → bridge → controlled `<Polysynth>`, both components
      unmodified from their standalone versions.
- [x] Verified this is actually live, not just error-free — patched the
      real Web Audio API (`AudioContext`/`OscillatorNode.prototype.start`)
      before page load and confirmed clicking MidiBox's Play produced 15
      new oscillator starts (5 notes × 3 oscillators) and 2
      `AudioContext.resume()` calls in the browser, driven end-to-end
      through the actual UI.
- [x] Wired the numeric input under each oscillator's Wave selector
      (`WaveSelector.tsx`'s `WaveSelectorWithFreq`) as **detune** — was
      hardcoded `value={"0.00"}` with no `onChange`, now a real controlled
      per-oscillator field threaded through `Oscillator` → `Polysynth`'s
      lifted state → the bridge's `.set()` payload, landing on each
      oscillator's own `detune`. UI/state unit is **semitones** (whole
      number = one semitone, matches user expectation for "harmonizing");
      converted to cents (`× 100`) only at the bridge boundary
      (`CENTS_PER_SEMITONE` in `usePolysynthAudioBridge.ts`) — same
      pattern as the envelope's timeline-fraction→seconds conversion.
      Verified end-to-end through the real story: typing `7` into
      oscillator 2's field produced `detune: 700` in the actual `.set()`
      payload sent to the live Tone graph.
      See the two bugs below — the first version of this appeared to work
      (typed values stuck, no errors) but silently did nothing to the
      actual sound, for a completely different reason than the units bug.

## Bugs found + fixed during bridge verification

- Tone's `.set()` walker treats a *present-but-`undefined`* object key as
  a real value to assign (`Object.keys` includes it regardless of value),
  and `Oscillator`'s `partials` setter doesn't null-check — passing
  `partials: undefined` for non-additive waves crashed with `Cannot read
  properties of undefined (reading 'length')`. Fixed by conditionally
  omitting the key entirely (both in the bridge's `.set()` call and in
  `PolysynthVoice`'s own constructor path, which had the same latent risk
  even though it happened not to be exercised by the earlier smoke test).
- **"Max polyphony exceeded. Note dropped."** (found via user report, not
  automated testing): `PolysynthVoice` never called `this.onsilence(this)`,
  so `PolySynth` never returned any voice to its available-voice pool —
  every triggered note permanently allocated a brand new voice until
  `maxPolyphony` (32) was exhausted, then silently dropped notes forever
  after. Root cause: Tone's built-in voices (see `Synth.ts`) wire
  `onstop: () => this.onsilence(this)` into their oscillator's
  constructor options - `Oscillator` fires `onstop` off the underlying
  native node's `onended` event once its scheduled `.stop()` completes.
  `PolysynthVoice` never wired this at all. Fixed by wiring `onstop` on
  `oscillator0` only (all 3 oscillators are stopped at the same scheduled
  time in `_triggerEnvelopeRelease`, so one is a sufficient proxy for
  "this voice is done"). Verified with a repro that isn't just "no
  errors": triggered 60 sequential notes and counted actual
  `PolySynth._voices.length` plus literal "Max polyphony exceeded"
  warnings — confirmed 28 warnings + `voiceCount=32` with the fix
  disabled, 0 warnings + `voiceCount=3` with it enabled (voices reused
  instead of endlessly allocated).
- **Per-oscillator detune silently did nothing** (found via user report:
  "doesn't seem to be detuning... it should be harmonising"): each
  oscillator's `detune` was connected from the voice-level shared
  `this.detune` Signal (`this.detune.connect(oscillator.detune)`), which
  seemed reasonable for note-level detune - but `oscillator.detune` is
  itself a `Tone.Signal`, not a raw native `AudioParam`. Tone's
  `connectSignal` treats connecting *into* a `Signal`/`Param` as a full
  override: it permanently forces that destination to schedule 0
  regardless of what's written to it afterward
  (`Param.ts` `_fromType`: *"if it's overridden, should only schedule
  0s"*). So every subsequent `.set({oscillatorN: {detune}})` (or even
  `.value =` directly) silently no-opped - no error, no warning, `type`/
  `phase` on the same object updated fine, only `detune` was dead.
  Root-caused with an isolation story: bare `Oscillator.set({detune})`
  worked (700 → 700), the same call through `PolysynthVoice`'s nested
  `oscillator1.set()` didn't (700 → 0), and calling `.set()` *directly*
  on the already-connected oscillator failed identically (777 → 0) -
  proving the connection itself, not the nesting or the walker, was the
  cause. `frequency` avoids this because `setNote()` (inherited from
  `Monophonic`) always writes through the shared `this.frequency`, never
  `oscillator.frequency` directly - there's no equivalent write path for
  detune, since it's meant to be independent per-oscillator. Fixed by
  removing the `this.detune.connect(oscillator.detune)` wiring entirely;
  each oscillator's `detune` is now set only via its own constructor
  option / `.set()` field, with nothing connected into it to override it.
  Net effect: the voice-level `detune` Signal (required by `Monophonic`'s
  abstract contract) is still a valid, settable property, but is now
  inert - `PolySynth.set({detune: X})` note-wide detuning isn't wired to
  affect sound. Nothing in this UI currently calls that, so not a
  regression, just a documented gap.
- [x] Wired each oscillator's `Meter` to real per-oscillator level (was a
      permanent `getValue={() => 0}` stub). `PolysynthVoice` gained an
      optional `oscillatorNMeterTap` per oscillator - a shared `Tone.Meter`
      (one per oscillator *slot*, owned by the bridge, not per-voice) that
      every currently active voice's post-pan oscillatorN signal fans into
      in addition to its own mix bus. Since `PolySynth` pools many voice
      instances (one per held note), tapping one voice wouldn't reflect
      the instrument's real polyphonic output - summing all active voices'
      same-slot signal into one shared meter is what a per-oscillator UI
      meter on a polyphonic synth actually needs to show. Bridge exposes
      `getOscillatorLevel(index)`; `Polysynth` takes an optional
      `getOscillatorMeterLevel` prop threaded to each `Oscillator`'s
      `meterGetValue` (defaults to a silent `() => 0`, so production/
      uncontrolled usage is unaffected). Verified two ways, not just "it
      moved": captured a 12-frame sequence during playback showing the
      meter genuinely rising/falling with the music (not flat), then
      disabled oscillator 2 mid-playback and confirmed *only* its meter
      went fully silent across all 12 frames while oscillators 1 and 3
      kept responding normally to the same notes.
- [x] Smoothed the oscillator meters after user feedback that they jumped
      "aggressively" — `Tone.Meter`'s own `smoothing` only eases the decay
      side, so every note's attack still snapped instantly (`Meter`'s own
      contract is "no shaping, that's the source's job", so the fix
      belongs in the bridge, not the shared component). Added
      `createSmoothedMeterReader` in `usePolysynthAudioBridge.ts` - a
      framerate-independent exponential approach in both directions, same
      dt-based idiom as the other meter sources in this codebase. Verified
      with a 12-frame sequence showing gradual easing between frames
      instead of instant jumps to wildly different heights.
- [x] Made "Crystal Waters" the default pattern selection (was always
      Pattern 1) — the dropdown displays index 0 as selected before the
      async MIDI load even resolves, so once it loads, an effect now
      explicitly re-selects its (now-appended) index.
- [x] Added a **Patch** dropdown to `PlaybackHarnessBar` — the second
      piece of a working preset system, not just the UI: `polysynthPresets.ts`
      holds named `PolysynthAudioState` objects (first one, "Super Saw
      Lead", built from real user-specified values: 3 detuned saws +
      a sharp/short envelope), and picking one calls `onPatchChange`
      (threaded `WorldStoryHarness` → `PlaybackHarnessBar`, wired to the
      bridge's `onAudioStateChange` in the story) - no new plumbing needed
      on `Polysynth`'s side since the controlled `audioState` prop already
      accepts a full replacement object.
- [x] Found and fixed the same "default-selected but never applied" bug a
      second time, this time for patches: Radix's `onValueChange` only
      fires on an actual value *change*, so a dropdown whose state already
      defaults to the one-and-only preset's index never fires it on
      selection - re-picking "Super Saw Lead" was a visible no-op even
      though the trigger displayed it as selected. Fixed by explicitly
      calling `onPatchChange` once when `patches` becomes available,
      rather than relying on the Select firing on mount. Verified the
      patch's oscillator/envelope values render exactly as specified
      (Saw/64/24/50/0.00, Saw/30/24/50/-12.05, Saw/50/24/50/0.12, "2% LIN
      7% EXP 22% LIN 30% EXP") immediately on load, with no manual
      reselection needed, and that real audio still plays (150 new
      oscillator starts over 2s) with the preset active.
- [x] Generalized `PlaybackHarnessBar` from one hardcoded imported `.mid`
      file (Crystal Waters) to a list (`IMPORTED_MIDI_SOURCES`), and added
      a second real source, `midi/C418 - Sweden.mid` ("Sweden"). State
      changed from a single `LoadedMidiFile | null` to `LoadedMidiFile[]`,
      loaded via one `Promise.all`; the `allPatterns`/`labels`/
      `loopLengths` memos now spread over the array instead of a single
      ternary. Crystal Waters stays first in the source list and thus
      keeps the default-selected index. Verified both entries appear in
      the Pattern dropdown, Crystal Waters is still selected by default,
      and selecting Sweden actually plays real audio (31 real oscillator
      starts over 3s, 0 page errors).

## Bugs found + fixed post-merge

- **PR #34 ("fix playback stalling on config changes during playback")
  did not actually fix the reported bug**, despite its description and
  being merged to `main`. Verified with a Playwright stress test
  (rapid-drag a knob during playback while patching
  `OscillatorNode.prototype.start` and `Tone.PolySynth.prototype.set` to
  log real timing): PR #34's targeted fix (rAF-coalesced, diffed
  `PolySynth.set()` calls in `usePolysynthAudioBridge.ts`) works
  correctly — calls fire fast (<0.2ms) with no gaps — but note onsets
  still stalled for multiple seconds during a drag. Real root cause was
  unrelated to PR #34: `PlaybackHarnessBar` rebuilt `allPatterns`/
  `loopLengths` as brand-new array literals on every render, and
  `useMidiPatternPlayer`'s effect depends on them by reference — every
  sibling re-render during a knob drag (the bar isn't memoized, and
  `audioState` updates on every drag tick) tore down and rebuilt the
  still-playing `Tone.Part`. Confirmed via a temporary source-level
  `console.log` showing ~1:1 Part rebuilds to drag-move events (reusing
  `Tone.PolySynth.prototype.set` monkeypatching didn't work for `Tone.Part`
  — ES module namespace exports like `Tone.Part = ...` are read-only and
  silently no-op). Fixed by wrapping `allPatterns`/`labels`/`loopLengths`
  in `useMemo` keyed on `[patterns, importedMidi(Files)]` in
  `PlaybackHarnessBar.tsx`. Re-verified: `Tone.Part.prototype.start` now
  fires exactly once regardless of drag activity, and note-onset gaps
  stay clean (~500ms, plus one consistent ~1330ms startup gap present
  identically before and after the fix — confirmed to be normal
  transport-startup latency, not a regression).

## Wrinkles / things to watch

- `Tone.Monophonic`/`Tone.Instrument` are **not** in Tone's public export
  barrel (only concrete synths like `Synth`/`DuoSynth` are). Had to import
  `Monophonic` from Tone's internal build path
  (`tone/build/esm/instrument/Monophonic.js`). Works today (no `exports`
  map restricting it, pinned at `tone@15.1.22`), but will need re-checking
  on any Tone version bump.
- `Tone.Oscillator`'s constructor type is a discriminated union keyed off
  a *literal* `type`. Since our oscillator options use the widened
  `ToneOscillatorType`, the exact overload can't resolve statically —
  cast to `any` at construction in `PolysynthVoice._buildOscillatorChain`.
- The UI's 4th wave option, `"additive"` (`oscWave.ts`), has no direct
  Tone equivalent — mapped to `type: "custom"` + a fixed default
  `partials` array in the bridge. Not pulling real coefficients from the
  (still-unwired) `Additive` view, so all 3 oscillators sound identical
  when set to "additive" regardless of that view's own display.
- `Amp`'s `attack`/`decay`/`release`/`sustainWidth` are **not seconds** —
  they're normalized 0-1 fractions of the editor's visual timeline width.
  The bridge multiplies by a fixed `ENVELOPE_TIMELINE_SECONDS = 2` — an
  arbitrary but reasonable choice, not derived from anything; worth
  tuning by ear later.
- Amp's curve fields are indices `0|1|2`; only attack/release get a truly
  distinct 3rd shape (`"sine"`) since Tone restricts `decayCurve` to
  linear/exponential — also an arbitrary-but-reasonable pick, not a
  precise recreation of what the 3 visual curve shapes are supposed to be.

## Remaining / nice-to-haves (not blocking)

- No one has actually *listened* to this yet — all verification so far is
  automated (offline render peak/rms, and counting real oscillator
  starts/AudioContext.resume calls via a patched Web Audio API in a
  headless browser). Worth a real ears-on pass to judge the additive
  partials, curve mapping, and timeline-seconds choices above, all of
  which were picked for plausibility, not tuned by listening.
- `Additive` view stays fully disconnected — no coefficients flow from it
  into the bridge's `partials` array.
- Master output level: there's a "MASTER" divider row in `Polysynth`'s
  markup but no actual control behind it; the bridge has no
  master-gain/volume concept at all right now (relies on `PolySynth`'s
  default output level as-is).
