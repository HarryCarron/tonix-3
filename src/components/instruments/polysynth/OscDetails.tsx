import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PiWaveSquare, PiWaveSawtooth, PiWaveSine } from "react-icons/pi";
import { Waveform } from "@/components/controls/waveform/Waveform";
import Additive from "@/components/controls/additive/additive";
import Amp from "@/components/controls/amp/amp";
import type { OscDetailsView } from "./oscDetailsView";

interface OscDetailsProps {
  view: OscDetailsView;
  onViewChange: (view: OscDetailsView) => void;
}

export function OscDetails({ view, onViewChange }: OscDetailsProps) {
  return (
    <div className="mt-3 border-stone-300 border rounded-lg overflow-hidden">
      <div className="flex p-2">
        <Select
          value={view}
          onValueChange={(value) => onViewChange(value as OscDetailsView)}
        >
          <SelectTrigger className="w-full h-6 p-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="wave">
                <PiWaveSine /> Wave
              </SelectItem>
              <SelectItem value="envelope">
                <PiWaveSawtooth /> Envelope
              </SelectItem>
              <SelectItem value="additive">
                <PiWaveSquare /> Additive
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[130px] w-full d-flex bg-stone-100 border-t border-stone-300">
        {view === "wave" && <Waveform />}
        {view === "envelope" && <Amp />}
        {view === "additive" && <Additive />}
      </div>
    </div>
  );
}
