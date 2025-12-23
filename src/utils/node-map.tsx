import type { ComponentType } from "react";
import Keyboard from "../components/nodes/keyboard/Keyboard";
import { Polysynth } from "../components/instruments/polysynth/Polysynth";

export type INodeMap = Record<string, ComponentType>;

export const NodeMap: INodeMap = {
  keyboard: Keyboard,
  polysynth: Polysynth,
};
