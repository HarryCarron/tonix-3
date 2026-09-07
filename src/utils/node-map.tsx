import type { ComponentType } from "react";
import Keyboard from "../components/nodes/keyboard/Keyboard";
import { Polysynth } from "../components/instruments/polysynth/Polysynth";
import { MidiBox } from "../components/nodes/midi-box/MidiBox";
import { Filter } from "../components/effects/filter/Filter";

export type INodeMap = Record<string, ComponentType>;

export const NodeMap: INodeMap = {
  keyboard: Keyboard,
  polysynth: Polysynth,
  midiBox: MidiBox,
  filter: Filter,
};
