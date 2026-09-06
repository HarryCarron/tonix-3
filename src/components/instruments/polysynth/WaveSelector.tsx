import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { PiWaveSquare, PiWaveSawtooth, PiWaveSine } from "react-icons/pi";
import { Input } from "@/components/ui/input";
import type { OscWave } from "./oscWave";

interface WaveSelectorProps {
  value: OscWave;
  onValueChange: (value: OscWave) => void;
}

export function WaveSelector({ value, onValueChange }: WaveSelectorProps) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as OscWave)}>
      <SelectTrigger className="w-full h-6 p-3">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Waveform</SelectLabel>
          <SelectItem value="sine">
            <PiWaveSine /> Sin
          </SelectItem>
          <SelectItem value="sawtooth">
            <PiWaveSawtooth /> Saw
          </SelectItem>
          <SelectItem value="square">
            <PiWaveSquare /> Srq
          </SelectItem>
          <SelectSeparator></SelectSeparator>
          <SelectItem value="additive">Add</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function WaveSelectorWithFreq({
  value,
  onValueChange,
}: WaveSelectorProps) {
  return (
    <>
      <WaveSelector value={value} onValueChange={onValueChange} />
      <Input className="mt-2 p-3 h-6" value={"0.00"} />
    </>
  );
}
