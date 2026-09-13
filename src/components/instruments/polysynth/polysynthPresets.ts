import { MAX_SUSTAIN_WIDTH } from "@/components/controls/amp/types";
import type { PolysynthAudioState } from "./polysynthAudioState";

export interface PolysynthPreset {
  name: string;
  state: PolysynthAudioState;
}

// A classic detuned-saw trance/supersaw lead: 3 sawtooths, oscillators 2/3
// detuned slightly off oscillator 1 for width/beating, fast-ish attack,
// short decay down to a moderate sustain level, and a longer release tail.
const SUPER_SAW_LEAD: PolysynthPreset = {
  name: "Super Saw Lead",
  state: {
    oscillators: [
      {
        wave: "sawtooth",
        enabled: true,
        detune: 0.0,
        phase: 0.64,
        gain: 0.24,
        pan: 0.5,
      },
      {
        wave: "sawtooth",
        enabled: true,
        detune: -12.05,
        phase: 0.3,
        gain: 0.24,
        pan: 0.5,
      },
      {
        wave: "sawtooth",
        enabled: true,
        detune: 0.12,
        phase: 0.5,
        gain: 0.24,
        pan: 0.5,
      },
    ],
    envelope: {
      attack: 0.02,
      attackCurve: 0, // LIN
      decay: 0.07,
      decayCurve: 1, // EXP
      sustain: 0.22,
      sustainWidth: MAX_SUSTAIN_WIDTH,
      release: 0.3,
      releaseCurve: 1, // EXP
    },
  },
};

export const POLYSYNTH_PRESETS: PolysynthPreset[] = [SUPER_SAW_LEAD];
