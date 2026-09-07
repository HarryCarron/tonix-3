import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import "./Polysynth.css";
import { Oscillator } from "./Oscillator";
import { OscDetails } from "./OscDetails";
import type { OscDetailsView } from "./oscDetailsView";
import type { OscWave } from "./oscWave";
import { FaArrowLeft } from "react-icons/fa";

const OSCILLATOR_IDS = ["osc1", "osc2", "osc3"];

export function Polysynth() {
  const [detailsView, setDetailsView] = useState<OscDetailsView>("envelope");
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

          <div className="w-full py-3 border-b border-stone-200 pix-font flex align-center justify-center items-center gap-2 text-stone-700">
            <span>
              <FaArrowLeft />
            </span>
            <span>MASTER</span>
            <span>
              <FaArrowLeft />
            </span>
          </div>
        </div>
        <OscDetails view={detailsView} onViewChange={setDetailsView} />
      </CardContent>
    </Card>
  );
}
