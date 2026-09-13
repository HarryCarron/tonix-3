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
import { Meter } from "@/components/controls/meter/Meter";
import { createSpikeMeterSource } from "@/components/controls/meter/spikeMeterSource";
import { PATTERN_LENGTH, TEST_PATTERNS } from "./MidiPattern";
import type { MidiNoteEvent, MidiPattern } from "./MidiPattern";
import { FiPlay } from "react-icons/fi";
import { TbPlayerPause } from "react-icons/tb";

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

// fast enough to read as a near-instant hit, not a synth-style release -
// just enough decay for the meter to feel alive rather than blinking
const METER_DECAY_PER_SECOND = 18;

export function MidiBox({ patterns = TEST_PATTERNS, onTrigger }: MidiBoxProps) {
  const [patternIndex, setPatternIndex] = useState(0);
  const [transportState, setTransportState] =
    useState<TransportState>("stopped");

  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  const meterSourceRef = useRef<ReturnType<
    typeof createSpikeMeterSource
  > | null>(null);
  if (!meterSourceRef.current) {
    meterSourceRef.current = createSpikeMeterSource(METER_DECAY_PER_SECOND);
  }

  useEffect(() => {
    const part = new Tone.Part<MidiNoteEvent>((time, event) => {
      const velocity = event.velocity ?? 0.8;
      meterSourceRef.current!.trigger(velocity);
      onTriggerRef.current?.(event.note, event.duration, time, velocity);
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
      <CardContent className="px-3 relative">
        <div className="flex flex-col gap-3 pr-4">
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
            {/* <Button
              variant="outline"
              className="grow"
              onClick={handlePlay}
              disabled={transportState === "playing"}
            >
              Play
            </Button> */}

            <Button
              variant="outline"
              size="icon"
              onClick={handlePlay}
              disabled={transportState === "playing"}
            >
              <FiPlay />
            </Button>

            {/* <Button
              variant="outline"
              className="grow"
              onClick={handlePause}
              disabled={transportState !== "playing"}
            >
              Pause
            </Button> */}

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
        </div>
        <div className="absolute top-0 right-0 bottom-0" style={{ width: 5 }}>
          <Meter
            orientation="vertical"
            getValue={() => meterSourceRef.current!.getValue()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
