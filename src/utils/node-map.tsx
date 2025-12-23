import type { ComponentType } from "react";
import Keyboard from "../components/nodes/keyboard/Keyboard";

export type INodeMap = Record<string, ComponentType>;

export const NodeMap: INodeMap = {
  keyboard: Keyboard,
};
