import type { OscWave } from "./oscWave";
import { DEFAULT_ADSR, type ADSR } from "@/components/controls/amp/types";

export interface OscillatorAudioState {
  wave: OscWave;
  enabled: boolean;
  // semitones (whole numbers) - converted to cents at the audio bridge
  detune: number;
  // normalized 0-1, same convention as RotaryControl's continuous mode
  phase: number;
  gain: number;
  pan: number;
}

export type OscillatorAudioStates = [
  OscillatorAudioState,
  OscillatorAudioState,
  OscillatorAudioState,
];

export interface PolysynthAudioState {
  oscillators: OscillatorAudioStates;
  envelope: ADSR;
}

const DEFAULT_OSCILLATOR_AUDIO_STATE: OscillatorAudioState = {
  wave: "sine",
  enabled: true,
  detune: 0,
  phase: 0.5,
  gain: 0.5,
  pan: 0.5,
};

export const DEFAULT_POLYSYNTH_AUDIO_STATE: PolysynthAudioState = {
  oscillators: [
    { ...DEFAULT_OSCILLATOR_AUDIO_STATE },
    { ...DEFAULT_OSCILLATOR_AUDIO_STATE },
    { ...DEFAULT_OSCILLATOR_AUDIO_STATE },
  ],
  envelope: DEFAULT_ADSR,
};
