import * as Tone from "tone";
import type { FilterType, FilterValue } from "./types";

// audible range the curve is plotted over
export const FREQ_MIN = 20;
export const FREQ_MAX = 20000;

// resonance range mapped from the Q knob's 0-1 value
const Q_MIN = 0.1;
const Q_MAX = 20;

// display range of the plotted curve, in dB
export const DB_MIN = -24;
export const DB_MAX = 24;

export const RESPONSE_SAMPLES = 256;

const FILTER_TYPE_MAP: Record<FilterType, BiquadFilterType> = {
  LP: "lowpass",
  HP: "highpass",
  BP: "bandpass",
};

// freq is stored as a 0-1 "normalized" value (driven by the knob and the
// curve drag handle alike) that IS its log position - 0 = FREQ_MIN,
// 1 = FREQ_MAX - so plotting samples at equal normalized steps already
// gives a correct log-frequency x-axis
export function normToHz(norm: number): number {
  return FREQ_MIN * Math.pow(FREQ_MAX / FREQ_MIN, norm);
}

export function hzToNorm(hz: number): number {
  return Math.log(hz / FREQ_MIN) / Math.log(FREQ_MAX / FREQ_MIN);
}

export function normToQ(norm: number): number {
  return Q_MIN * Math.pow(Q_MAX / Q_MIN, norm);
}

// gain isn't exposed to the user - it only affects peaking/shelf types in
// the real BiquadFilterNode, and LP/HP/BP (the only types offered) ignore
// it entirely, so it's fixed rather than backed by a control
function createFilterNode(filterValues: FilterValue): BiquadFilterNode {
  const filter = Tone.getContext().createBiquadFilter();
  filter.type = FILTER_TYPE_MAP[filterValues.type];
  filter.frequency.value = normToHz(filterValues.freq);
  filter.Q.value = normToQ(filterValues.q);
  filter.gain.value = 0;
  return filter;
}

// magnitude -> dB, using the browser's real BiquadFilterNode.getFrequencyResponse
// (via Tone's shared context) rather than a hand-derived curve shape, so LP/HP/BP
// each render their actual frequency response
export function getFilterResponseDb(
  filterValues: FilterValue,
  sampleCount = RESPONSE_SAMPLES,
): Float32Array {
  const freqs = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    freqs[i] = normToHz(i / (sampleCount - 1));
  }

  const magnitude = new Float32Array(sampleCount);
  const phase = new Float32Array(sampleCount);
  createFilterNode(filterValues).getFrequencyResponse(freqs, magnitude, phase);

  return magnitude.map((m) => 20 * Math.log10(Math.max(m, 1e-6)));
}

// 4 evenly log-spaced reference points across the plotted range - 20/200/2k/20k
export const FREQ_AXIS_TICKS = [
  { hz: 20, label: "20Hz" },
  { hz: 200, label: "200Hz" },
  { hz: 2000, label: "2kHz" },
  { hz: 20000, label: "20kHz" },
];
