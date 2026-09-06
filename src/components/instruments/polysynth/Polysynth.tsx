import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import "./Polysynth.css";
import { Oscillator } from "./Oscillator";
import { OscDetails } from "./OscDetails";
import type { OscDetailsView } from "./oscDetailsView";
import type { OscWave } from "./oscWave";

const OSCILLATOR_IDS = ["osc1", "osc2", "osc3"];

export function Polysynth() {
  const [detailsView, setDetailsView] = useState<OscDetailsView>("additive");
  const [oscWaves, setOscWaves] = useState<OscWave[]>(
    OSCILLATOR_IDS.map(() => "sine"),
  );
  const [oscEnabled, setOscEnabled] = useState<boolean[]>(
    OSCILLATOR_IDS.map(() => true),
  );

  return (
    <Card className="py-3 px-0 w-[320px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Polysynth</span>
      </CardHeader>
      <CardContent className="px-3">
        <div>
          {OSCILLATOR_IDS.map((id, i) => (
            <Oscillator
              key={id}
              id={id}
              number={i}
              wave={oscWaves[i]}
              onWaveChange={(wave) =>
                setOscWaves((waves) =>
                  waves.map((w, index) => (index === i ? wave : w)),
                )
              }
              enabled={oscEnabled[i]}
              onEnabledChange={(enabled) =>
                setOscEnabled((states) =>
                  states.map((e, index) => (index === i ? enabled : e)),
                )
              }
            />
          ))}
        </div>
        <OscDetails view={detailsView} onViewChange={setDetailsView} />
      </CardContent>
    </Card>
  );
}
