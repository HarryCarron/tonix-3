import { describe, expect, it } from "vitest";
import { POLYSYNTH_PRESETS } from "./polysynthPresets";

describe("POLYSYNTH_PRESETS", () => {
  it("includes the Super Saw Lead preset with 3 enabled sawtooth oscillators", () => {
    const preset = POLYSYNTH_PRESETS.find((p) => p.name === "Super Saw Lead");
    expect(preset).toBeDefined();
    expect(preset!.state.oscillators).toHaveLength(3);
    preset!.state.oscillators.forEach((osc) => {
      expect(osc.wave).toBe("sawtooth");
      expect(osc.enabled).toBe(true);
    });
  });

  it("keeps every preset's envelope fields within [0, 1] except detune/curve indices", () => {
    for (const preset of POLYSYNTH_PRESETS) {
      const { attack, decay, sustain, release } = preset.state.envelope;
      for (const value of [attack, decay, sustain, release]) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }
    }
  });
});
