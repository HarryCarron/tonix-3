import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEST_PATTERNS } from "@/components/nodes/midi-box/MidiPattern";
import type { MidiPattern } from "@/components/nodes/midi-box/MidiPattern";
import {
  useMidiPatternPlayer,
  type MidiTriggerHandler,
} from "@/components/nodes/midi-box/useMidiPatternPlayer";
import { loadMidiFilePattern, type LoadedMidiFile } from "./loadMidiFile";
import gypsyWomanMidiUrl from "../../../midi/Crystal Waters - Gypsy Woman.mid?url";
import swedenMidiUrl from "../../../midi/C418 - Sweden.mid?url";
import { FiPlay } from "react-icons/fi";
import { TbPlayerPause } from "react-icons/tb";
import type { PolysynthPreset } from "@/components/instruments/polysynth/polysynthPresets";
import type { PolysynthAudioState } from "@/components/instruments/polysynth/polysynthAudioState";

interface PlaybackHarnessBarProps {
  patterns?: MidiPattern[];
  onTrigger?: MidiTriggerHandler;
  // optional - only shown when both are provided, so this bar stays
  // usable for harnesses that have nothing to preset (e.g. no synth)
  patches?: PolysynthPreset[];
  onPatchChange?: (state: PolysynthAudioState) => void;
}

// real .mid files loaded as extra selectable patterns, alongside the
// hardcoded TEST_PATTERNS - Crystal Waters stays first/default; add more
// here as they show up in midi/
const IMPORTED_MIDI_SOURCES: { url: string; name: string }[] = [
  { url: gypsyWomanMidiUrl, name: "Crystal Waters" },
  { url: swedenMidiUrl, name: "Sweden" },
];

// selecting one of these songs resets the patch dropdown to the patch that
// best fits it, by patch name (looked up in `patches` at select-time)
const PATTERN_DEFAULT_PATCH: Record<string, string> = {
  "Crystal Waters": "Super Saw Lead",
  Sweden: "Soft Sine Pad",
};

// A slim transport header bar for Storybook harnesses that need a note
// source to drive a real audio bridge - same pattern-select + play/pause/
// stop/rewind controls as MidiBox, off the same useMidiPatternPlayer hook,
// just styled as a bar instead of a node card. Also loads real .mid files
// (via @tonejs/midi) as extra selectable patterns, alongside the
// hardcoded TEST_PATTERNS.
export function PlaybackHarnessBar({
  patterns = TEST_PATTERNS,
  onTrigger,
  patches,
  onPatchChange,
}: PlaybackHarnessBarProps) {
  const [importedMidiFiles, setImportedMidiFiles] = useState<
    LoadedMidiFile[]
  >([]);
  const [patchIndex, setPatchIndex] = useState(0);

  // the dropdown displays index 0 as selected from the start (it's the
  // initial state), but Radix's onValueChange only fires on an actual
  // value change - without this, picking the already-"selected" default
  // patch would silently do nothing the first time
  useEffect(() => {
    if (patches && patches.length > 0) {
      onPatchChange?.(patches[0].state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patches]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      IMPORTED_MIDI_SOURCES.map((source) =>
        loadMidiFilePattern(source.url, source.name),
      ),
    )
      .then((loaded) => {
        if (!cancelled) setImportedMidiFiles(loaded);
      })
      .catch((error) => {
        console.error("Failed to load harness MIDI files:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // memoized so these stay referentially stable across unrelated re-
  // renders (e.g. every audioState tick while dragging a Polysynth knob
  // re-renders this sibling component too) - useMidiPatternPlayer's effect
  // depends on patterns/loopLengths by reference, and a fresh array every
  // render was tearing down and rebuilding the still-playing Tone.Part on
  // every single config change, which is what was actually stalling
  // playback (not the Tone.PolySynth.set() calls themselves)
  const allPatterns: MidiPattern[] = useMemo(
    () => [...patterns, ...importedMidiFiles.map((f) => f.pattern)],
    [patterns, importedMidiFiles],
  );
  const labels = useMemo(
    () => [
      ...patterns.map((_, index) => `Pattern ${index + 1}`),
      ...importedMidiFiles.map((f) => f.name),
    ],
    [patterns, importedMidiFiles],
  );
  const loopLengths = useMemo(
    () => [
      ...patterns.map(() => undefined),
      ...importedMidiFiles.map((f) => f.loopLength),
    ],
    [patterns, importedMidiFiles],
  );
  // Crystal Waters is first in IMPORTED_MIDI_SOURCES, so it lands at this
  // index once loaded - stays the default even with more sources added
  const defaultImportedIndex = patterns.length;

  const applyPatternDefaultPatch = (label: string) => {
    const patchName = PATTERN_DEFAULT_PATCH[label];
    if (!patchName || !patches) return;
    const index = patches.findIndex((patch) => patch.name === patchName);
    if (index === -1) return;
    setPatchIndex(index);
    onPatchChange?.(patches[index].state);
  };

  const {
    patternIndex,
    setPatternIndex,
    transportState,
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
  } = useMidiPatternPlayer(allPatterns, onTrigger, loopLengths);

  // default to Crystal Waters once the imported songs are loaded, rather
  // than leaving the hardcoded Pattern 1 selected
  useEffect(() => {
    if (importedMidiFiles.length > 0) {
      setPatternIndex(defaultImportedIndex);
      applyPatternDefaultPatch(IMPORTED_MIDI_SOURCES[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMidiFiles]);

  return (
    <div className="w-full h-12 bg-card border-b border-stone-300 flex items-center gap-2 px-3">
      <Select
        value={String(patternIndex)}
        onValueChange={(value) => {
          const index = Number(value);
          setPatternIndex(index);
          applyPatternDefaultPatch(labels[index]);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a pattern" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pattern</SelectLabel>
            {labels.map((label, index) => (
              <SelectItem key={index} value={String(index)}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {patches && patches.length > 0 && (
        <Select
          value={String(patchIndex)}
          onValueChange={(value) => {
            const index = Number(value);
            setPatchIndex(index);
            onPatchChange?.(patches[index].state);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a patch" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Patch</SelectLabel>
              {patches.map((patch, index) => (
                <SelectItem key={index} value={String(index)}>
                  {patch.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      <div className="flex gap-[2px]">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlay}
          disabled={transportState === "playing"}
        >
          <FiPlay />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handlePause}
          disabled={transportState !== "playing"}
        >
          <TbPlayerPause />
        </Button>
        <Button
          variant="outline"
          onClick={handleStop}
          disabled={transportState === "stopped"}
        >
          Stop
        </Button>
        <Button variant="outline" onClick={handleRewind}>
          Rewind
        </Button>
      </div>
    </div>
  );
}
