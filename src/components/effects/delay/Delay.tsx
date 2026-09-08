import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ControlContainer } from "@/components/instruments/polysynth/ControlContainer";
import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
import type { DelayValue } from "./types";

export function Delay() {
  const [delayValues, setDelayValues] = useState<DelayValue>({
    time: 0.5,
    feedback: 0.5,
    wet: 0.5,
  });

  const setValue = (key: keyof DelayValue) => (value: number) =>
    setDelayValues((state) => ({ ...state, [key]: value }));

  return (
    <Card className="delay py-3 px-0 w-[220px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Delay</span>
      </CardHeader>
      <CardContent className="px-3 flex gap-2 justify-center">
        <ControlContainer label="Time">
          <RotaryControl
            value={delayValues.time}
            onChange={setValue("time")}
          />
        </ControlContainer>
        <ControlContainer label="Feedback">
          <RotaryControl
            value={delayValues.feedback}
            onChange={setValue("feedback")}
          />
        </ControlContainer>
        <ControlContainer label="Wet">
          <RotaryControl value={delayValues.wet} onChange={setValue("wet")} />
        </ControlContainer>
      </CardContent>
    </Card>
  );
}

export default Delay;
