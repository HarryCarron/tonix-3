import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { PATTERN_LENGTH, TEST_PATTERNS } from "./MidiPattern";
import type { MidiNoteEvent, MidiPattern } from "./MidiPattern";

export type MidiTriggerHandler = (
  note: string,
  duration: string | number,
  time: number,
  velocity: number,
) => void;

export type TransportState = "stopped" | "playing" | "paused";

// Drives a looping Tone.Part over one of a set of hardcoded MIDI patterns,
// exposing transport controls - the logic behind MidiBox's UI, factored out
// so other note-source UIs (e.g. a Storybook playback harness) can reuse it
// without duplicating the Tone.Part/Transport wiring.
export function useMidiPatternPlayer(
  patterns: MidiPattern[] = TEST_PATTERNS,
  onTrigger?: MidiTriggerHandler,
  // per-pattern loop length (seconds or Tone time notation), parallel to
  // `patterns` - entries default to PATTERN_LENGTH ("1m") when omitted, so
  // existing callers (MidiBox) that only pass the hardcoded test patterns
  // are unaffected. A real imported song needs its own actual duration
  // here instead of a fixed one-measure loop.
  loopLengths?: Array<string | number | undefined>,
) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [transportState, setTransportState] =
    useState<TransportState>("stopped");

  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    const part = new Tone.Part<MidiNoteEvent>((time, event) => {
      const velocity = event.velocity ?? 0.8;
      onTriggerRef.current?.(event.note, event.duration, time, velocity);
    }, patterns[patternIndex]);
    part.loop = true;
    part.loopEnd = loopLengths?.[patternIndex] ?? PATTERN_LENGTH;
    part.start(0);

    return () => {
      part.dispose();
    };
  }, [patterns, patternIndex, loopLengths]);

  const handlePlay = async () => {
    await Tone.start();
    Tone.getTransport().start();
    setTransportState("playing");
  };

  const handlePause = () => {
    Tone.getTransport().pause();
    setTransportState("paused");
  };

  const handleStop = () => {
    Tone.getTransport().stop();
    setTransportState("stopped");
  };

  const handleRewind = () => {
    Tone.getTransport().position = 0;
  };

  return {
    patterns,
    patternIndex,
    setPatternIndex,
    transportState,
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
  };
}
