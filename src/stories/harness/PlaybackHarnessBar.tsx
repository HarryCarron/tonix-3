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

interface PlaybackHarnessBarProps {
  patterns?: MidiPattern[];
  onTrigger?: MidiTriggerHandler;
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
}: PlaybackHarnessBarProps) {
  const [importedMidi, setImportedMidi] = useState<LoadedMidiFile | null>(
    null,
  );

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

  const {
    patternIndex,
    setPatternIndex,
    transportState,
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
  } = useMidiPatternPlayer(allPatterns, onTrigger, loopLengths);

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
