import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import "./Polysynth.css";
import { Input } from "@/components/ui/input";

export function Polysynth() {
  return (
    <Card className="py-3 px-0">
      <CardHeader>
        <span className="title color-stone-600 text-2xl">Polysynth</span>
      </CardHeader>
      <CardContent className="px-3">
        <div>
          {["osc1", "osc2", "osc3"].map((id) => {
            return Oscillator(id);
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Oscillator(id: string) {
  return (
    <div id={id} className="w-full py-3 border-b border-stone-200">
      <div className="flex">
        <span className="w-[60px] mr-2">
          <div className="flex justify-center">Wave</div>
          <div>
            {WaveSelector()}

            <Input value={"0.00"} />
          </div>
        </span>

        <span className="flex-auto"></span>
        <span className="flex gap-1">
          <span className="p-2 border border-stone-200 rounded-md">
            <div className="flex justify-center">Phase</div>
            <div>
              <RotaryControl />
            </div>
          </span>
          <span className="p-2 border border-stone-200 rounded-md">
            <div className="flex justify-center">Gain</div>
            <div>
              <RotaryControl />
            </div>
          </span>
          <span className="p-2 border border-stone-200 rounded-md">
            <div className="flex justify-center">Pan</div>
            <div>
              <RotaryControl />
            </div>
          </span>
        </span>
      </div>
    </div>
  );
}

function WaveSelector() {
  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Waveform</SelectLabel>
          <SelectItem value="apple">Sin</SelectItem>
          <SelectItem value="banana">Saw</SelectItem>
          <SelectItem value="b">Srq</SelectItem>
          <SelectSeparator></SelectSeparator>
          <SelectItem value="blueberry">Add</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
