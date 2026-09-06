import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
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
        <span className="flex flex-col p-2">
          <span className="pix-font text-xl color-stone-200 flex justify-center">
            {number + 1}
          </span>
          <span className="flex-auto flex items-center justify-center">
            <Switch checked={enabled} onCheckedChange={onEnabledChange} />
          </span>
        </span>
        <span className="flex-auto">
          <ControlContainer label="Wave">
            <WaveSelectorWithFreq value={wave} onValueChange={onWaveChange} />
          </ControlContainer>
        </span>
        <span className="flex-auto"></span>
        <span>
          <ControlContainer label="Phase">
            <RotaryControl />
          </ControlContainer>
        </span>
        <span>
          <ControlContainer label="Gain">
            <RotaryControl />
          </ControlContainer>
        </span>
        <span>
          <ControlContainer label="Pan">
            <RotaryControl />
          </ControlContainer>
        </span>
      </div>
    </div>
  );
}
