import { describe, expect, it } from "vitest";
import { NodeMap } from "./node-map";
import Keyboard from "@/components/nodes/keyboard/Keyboard";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";
import { MidiBox } from "@/components/nodes/midi-box/MidiBox";
import { Filter } from "@/components/effects/filter/Filter";
import { Delay } from "@/components/effects/delay/Delay";

describe("NodeMap", () => {
  it("maps each node-type key to its component", () => {
    expect(NodeMap.keyboard).toBe(Keyboard);
    expect(NodeMap.polysynth).toBe(Polysynth);
    expect(NodeMap.midiBox).toBe(MidiBox);
    expect(NodeMap.filter).toBe(Filter);
    expect(NodeMap.delay).toBe(Delay);
  });

  it("has no unexpected extra entries", () => {
    expect(Object.keys(NodeMap).sort()).toEqual(
      ["delay", "filter", "keyboard", "midiBox", "polysynth"].sort(),
    );
  });
});
