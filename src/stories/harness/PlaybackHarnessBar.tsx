import { useEffect, useState } from "react";
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

// A slim transport header bar for Storybook harnesses that need a note
// source to drive a real audio bridge - same pattern-select + play/pause/
// stop/rewind controls as MidiBox, off the same useMidiPatternPlayer hook,
// just styled as a bar instead of a node card. Also loads a real .mid file
// (via @tonejs/midi) as an extra selectable pattern, alongside the
// hardcoded TEST_PATTERNS.
export function PlaybackHarnessBar({
  patterns = TEST_PATTERNS,
  onTrigger,
  patches,
  onPatchChange,
}: PlaybackHarnessBarProps) {
  const [importedMidi, setImportedMidi] = useState<LoadedMidiFile | null>(
    null,
  );
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
    loadMidiFilePattern(gypsyWomanMidiUrl, "Crystal Waters")
      .then((loaded) => {
        if (!cancelled) setImportedMidi(loaded);
      })
      .catch((error) => {
        console.error("Failed to load harness MIDI file:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allPatterns: MidiPattern[] = importedMidi
    ? [...patterns, importedMidi.pattern]
    : patterns;
  const labels = [
    ...patterns.map((_, index) => `Pattern ${index + 1}`),
    ...(importedMidi ? [importedMidi.name] : []),
  ];
  const loopLengths = [
    ...patterns.map(() => undefined),
    ...(importedMidi ? [importedMidi.loopLength] : []),
  ];
  const importedMidiIndex = patterns.length;

  const {
    patternIndex,
    setPatternIndex,
    transportState,
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
  } = useMidiPatternPlayer(allPatterns, onTrigger, loopLengths);

  // default to the imported song once it's loaded, rather than leaving
  // the hardcoded Pattern 1 selected
  useEffect(() => {
    if (importedMidi) {
      setPatternIndex(importedMidiIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMidi]);

  return (
    <div className="w-full h-12 bg-card border-b border-stone-300 flex items-center gap-2 px-3">
      <Select
        value={String(patternIndex)}
        onValueChange={(value) => setPatternIndex(Number(value))}
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
