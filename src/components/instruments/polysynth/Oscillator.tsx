import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
import { Meter } from "@/components/controls/meter/Meter";
import { Switch } from "@/components/ui/switch";
import { ControlContainer } from "./ControlContainer";
import { WaveSelectorWithFreq } from "./WaveSelector";
import type { OscWave } from "./oscWave";

interface OscillatorProps {
  id: string;
  number: number;
  wave: OscWave;
  onWaveChange: (wave: OscWave) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export function Oscillator({
  id,
  number,
  wave,
  onWaveChange,
  enabled,
  onEnabledChange,
}: OscillatorProps) {
  return (
    <div id={id} className="w-full py-3 border-b border-stone-200">
      <div className="flex gap-1">
        <div className="flex flex-col p-2">
          <div className="pix-font text-xl color-stone-200 flex justify-center">
            {number + 1}
          </div>
          <div className="flex-auto flex items-center justify-center">
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </div>
        </div>
        <div className="w-[100px]">
          <ControlContainer label="Wave">
            <WaveSelectorWithFreq value={wave} onValueChange={onWaveChange} />
          </ControlContainer>
        </div>
        <div className="flex-auto"></div>
        <div className="flex-1">
          <ControlContainer label="Phase">
            <RotaryControl />
          </ControlContainer>
        </div>
        <div className="flex-1">
          <ControlContainer label="Gain">
            <RotaryControl />
          </ControlContainer>
        </div>
        <div className="flex-1">
          <ControlContainer label="Pan">
            <RotaryControl />
          </ControlContainer>
        </div>

        <div className="w-[20px]">
          <ControlContainer>
            <div className="h-[75px]">
              <Meter orientation="vertical" getValue={() => 0} />
            </div>
          </ControlContainer>
        </div>
      </div>
    </div>
  );
}
