import RotaryControl from "@/components/controls/rotary-control/RotaryControl";
import { Waveform } from "@/components/controls/waveform/Waveform";
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
import { PiWaveSquare, PiWaveSawtooth, PiWaveSine } from "react-icons/pi";
import Additive from "@/components/controls/additive/additive";

export function Polysynth() {
  return (
    <Card className="py-3 px-0 w-[320px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Polysynth</span>
      </CardHeader>
      <CardContent className="px-3">
        <div>
          {["osc1", "osc2", "osc3"].map((id, i) => {
            return Oscillator(id, i);
          })}
        </div>
        {OscDetails()}
      </CardContent>
    </Card>
  );
}

function Oscillator(id: string, number: number) {
  return (
    <div id={id} className="w-full py-3 border-b border-stone-200">
      <div className="flex gap-1">
        <span className="flex flex-col p-2">
          <span className="pix-font text-xl color-stone-200 flex justify-center">
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
          <SelectItem value="apple">
            <PiWaveSine /> Sin
          </SelectItem>
          <SelectItem value="banana">
            <PiWaveSawtooth /> Saw
          </SelectItem>
          <SelectItem value="b">
            <PiWaveSquare /> Srq
          </SelectItem>
          <SelectSeparator></SelectSeparator>
          <SelectItem value="blueberry">Add</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function OscDetails() {
  return (
    <div className="mt-3 border-stone-300 border rounded-lg overflow-hidden">
      <div className="flex p-2">
        <Select>
          <SelectTrigger className="w-full h-6 p-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="apple">
                <PiWaveSine /> Wave
              </SelectItem>
              <SelectItem value="banana">
                <PiWaveSawtooth /> Envelope
              </SelectItem>
              <SelectItem value="b">
                <PiWaveSquare /> Additive
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[130px] w-full d-flex bg-stone-100 border-t border-stone-300">
        {/* <Waveform /> */}
        <Additive />
      </div>
    </div>
  );
}
