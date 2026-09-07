import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { PATTERN_LENGTH, TEST_PATTERNS } from "./MidiPattern";
import type { MidiNoteEvent, MidiPattern } from "./MidiPattern";

export type MidiTriggerHandler = (
  note: string,
  duration: string | number,
  time: number,
  velocity: number,
) => void;

interface MidiBoxProps {
  patterns?: MidiPattern[];
  onTrigger?: MidiTriggerHandler;
}

type TransportState = "stopped" | "playing" | "paused";

export function MidiBox({ patterns = TEST_PATTERNS, onTrigger }: MidiBoxProps) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [transportState, setTransportState] = useState<TransportState>("stopped");

  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  useEffect(() => {
    const part = new Tone.Part<MidiNoteEvent>((time, event) => {
      onTriggerRef.current?.(
        event.note,
        event.duration,
        time,
        event.velocity ?? 0.8,
      );
    }, patterns[patternIndex]);
    part.loop = true;
    part.loopEnd = PATTERN_LENGTH;
    part.start(0);

    return () => {
      part.dispose();
    };
  }, [patterns, patternIndex]);

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

  return (
    <Card className="py-3 px-0 w-[280px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">MidiBox</span>
      </CardHeader>
      <CardContent className="px-3 flex flex-col gap-3">
        <Select
          value={String(patternIndex)}
          onValueChange={(value) => setPatternIndex(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a pattern" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Pattern</SelectLabel>
              {patterns.map((_, index) => (
                <SelectItem key={index} value={String(index)}>
                  Pattern {index + 1}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex gap-[2px]">
          <Button
            variant="outline"
            className="grow"
            onClick={handlePlay}
            disabled={transportState === "playing"}
          >
            Play
          </Button>
          <Button
            variant="outline"
            className="grow"
            onClick={handlePause}
            disabled={transportState !== "playing"}
          >
            Pause
          </Button>
          <Button
            variant="outline"
            className="grow"
            onClick={handleStop}
            disabled={transportState === "stopped"}
          >
            Stop
          </Button>
          <Button variant="outline" className="grow" onClick={handleRewind}>
            Rewind
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
