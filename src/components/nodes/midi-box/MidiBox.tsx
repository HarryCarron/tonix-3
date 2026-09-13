import { useRef } from "react";
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
import { TEST_PATTERNS } from "./MidiPattern";
import type { MidiPattern } from "./MidiPattern";
import {
  useMidiPatternPlayer,
  type MidiTriggerHandler,
} from "./useMidiPatternPlayer";
import { FiPlay } from "react-icons/fi";
import { TbPlayerPause } from "react-icons/tb";

export type { MidiTriggerHandler };

interface MidiBoxProps {
  patterns?: MidiPattern[];
  onTrigger?: MidiTriggerHandler;
}

// fast enough to read as a near-instant hit, not a synth-style release -
// just enough decay for the meter to feel alive rather than blinking
const METER_DECAY_PER_SECOND = 18;

export function MidiBox({ patterns = TEST_PATTERNS, onTrigger }: MidiBoxProps) {
  const meterSourceRef = useRef<ReturnType<
    typeof createSpikeMeterSource
  > | null>(null);
  if (!meterSourceRef.current) {
    meterSourceRef.current = createSpikeMeterSource(METER_DECAY_PER_SECOND);
  }

  const {
    patternIndex,
    setPatternIndex,
    transportState,
    handlePlay,
    handlePause,
    handleStop,
    handleRewind,
  } = useMidiPatternPlayer(patterns, (note, duration, time, velocity) => {
    meterSourceRef.current!.trigger(velocity);
    onTrigger?.(note, duration, time, velocity);
  });

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
