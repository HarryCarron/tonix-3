import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ControlContainer } from "@/components/instruments/polysynth/ControlContainer";
import RotaryControl, {
  type RotaryControlStage,
} from "@/components/controls/rotary-control/RotaryControl";
import type { DelayValue } from "./types";

// straight note subdivisions - dotted/triplet variants aren't offered yet
const TIME_STAGES: RotaryControlStage[] = [
  { value: "1n", label: "1/1" },
  { value: "2n", label: "1/2" },
  { value: "4n", label: "1/4" },
  { value: "8n", label: "1/8" },
  { value: "16n", label: "1/16" },
  { value: "32n", label: "1/32" },
];

export function Delay() {
  const [delayValues, setDelayValues] = useState<DelayValue>({
    time: "8n",
    feedback: 0.5,
    wet: 0.5,
  });

  const setTime = (time: string) =>
    setDelayValues((state) => ({ ...state, time }));

  const setFeedback = (feedback: number) =>
    setDelayValues((state) => ({ ...state, feedback }));

  const setWet = (wet: number) => setDelayValues((state) => ({ ...state, wet }));

  return (
    <Card className="delay py-3 px-0 w-[220px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Delay</span>
      </CardHeader>
      <CardContent className="px-3 flex gap-2 justify-center">
        <ControlContainer label="Time">
          <RotaryControl
            mode="staged"
            stages={TIME_STAGES}
            value={delayValues.time}
            onChange={setTime}
          />
        </ControlContainer>
        <ControlContainer label="Feedback">
          <RotaryControl value={delayValues.feedback} onChange={setFeedback} />
        </ControlContainer>
        <ControlContainer label="Wet">
          <RotaryControl value={delayValues.wet} onChange={setWet} />
        </ControlContainer>
      </CardContent>
    </Card>
  );
}

export default Delay;
