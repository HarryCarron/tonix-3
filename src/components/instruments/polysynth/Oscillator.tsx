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
  // semitones (whole numbers) - converted to cents at the audio bridge
  detune: number;
  onDetuneChange: (detune: number) => void;
  // normalized 0-1, same convention as RotaryControl's continuous mode
  phase: number;
  onPhaseChange: (phase: number) => void;
  gain: number;
  onGainChange: (gain: number) => void;
  pan: number;
  onPanChange: (pan: number) => void;
}

export function Oscillator({
  id,
  number,
  wave,
  onWaveChange,
  enabled,
  onEnabledChange,
  detune,
  onDetuneChange,
  phase,
  onPhaseChange,
  gain,
  onGainChange,
  pan,
  onPanChange,
}: OscillatorProps) {
  return (
    <div id={id} className="w-full py-3 border-b border-stone-300">
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
            <WaveSelectorWithFreq
              value={wave}
              onValueChange={onWaveChange}
              detune={detune}
              onDetuneChange={onDetuneChange}
            />
          </ControlContainer>
        </div>
        <div className="flex-auto"></div>
        <div className="flex-1">
          <ControlContainer label="Phase">
            <RotaryControl value={phase} onChange={onPhaseChange} />
          </ControlContainer>
        </div>
        <div className="flex-1">
          <ControlContainer label="Gain">
            <RotaryControl value={gain} onChange={onGainChange} />
          </ControlContainer>
        </div>
        <div className="flex-1">
          <ControlContainer label="Pan">
            <RotaryControl value={pan} onChange={onPanChange} />
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
