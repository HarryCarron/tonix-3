import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import type { ComponentType } from "react";
import { Switch } from "@/components/ui/switch";

export function Polysynth() {
  return (
    <Card className="py-3 px-0 w-[320px]">
      <CardHeader>
        <span className="title color-stone-500 text-4xl">Polysynth</span>
      </CardHeader>
      <CardContent className="px-3">
        <div>
          {["osc1", "osc2", "osc3"].map((id, i) => {
            return Oscillator(id, i);
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function Oscillator(id: string, number: number) {
  return (
    <div id={id} className="w-full py-3 border-b border-stone-200">
      <div className="flex gap-1">
        <span className="flex flex-col p-2">
          <span className="osc-num text-xl color-stone-200 flex justify-center">
            {number + 1}
          </span>
          <span className="flex-auto flex items-center justify-center">
            <Switch></Switch>
          </span>
        </span>
        <span className="flex-auto">
          {ControlContainer("Wave", WaveSelectorTemp)}
        </span>
        <span className="flex-auto"></span>
        <span>{ControlContainer("Phase", RotaryControl)}</span>
        <span>{ControlContainer("Gain", RotaryControl)}</span>
        <span>{ControlContainer("Pan", RotaryControl)}</span>
      </div>
    </div>
  );
}

function WaveSelectorTemp() {
  return (
    <>
      {WaveSelector()}

      <Input className="mt-2 p-3 h-6" value={"0.00"} />
    </>
  );
}

function ControlContainer(label: string, ControlTmp: ComponentType) {
  return (
    <span className="p-2 border border-stone-200 rounded-md flex flex-col h-full">
      <div className="flex justify-center font-500 mb-2 color-stone-500">
        {label}
      </div>
      <div>
        <ControlTmp />
      </div>
    </span>
  );
}

function WaveSelector() {
  return (
    <Select>
      <SelectTrigger className="w-full h-6 p-3">
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
