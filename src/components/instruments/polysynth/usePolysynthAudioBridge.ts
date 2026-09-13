import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { PolysynthVoice } from "./PolysynthVoice";
import {
  DEFAULT_POLYSYNTH_AUDIO_STATE,
  type OscillatorAudioState,
  type PolysynthAudioState,
} from "./polysynthAudioState";

// Storybook-only: owns the one live Tone.PolySynth instance and the lifted
// Polysynth UI state, and keeps them in sync. Production Polysynth usage
// (World.tsx) never touches this - it stays fully uncontrolled/silent.

// Amp's attack/decay/release are 0-1 fractions of its own visual timeline,
// not seconds - this is the real-world length that timeline represents.
const ENVELOPE_TIMELINE_SECONDS = 2;

// the oscillator detune field is semitones (one whole number = one
// semitone) for the UI - Tone's own detune unit is cents (100 per semitone)
const CENTS_PER_SEMITONE = 100;

function mapWaveToOscillatorOptions(wave: OscillatorAudioState["wave"]): {
  type: Tone.ToneOscillatorType;
  partials?: number[];
} {
  if (wave === "additive") {
    // no real coefficients wired from the (currently unwired) Additive
    // view yet - a simple decaying harmonic series stands in for it
    return { type: "custom", partials: [1, 0.5, 0.33, 0.25, 0.2] };
  }
  return { type: wave };
}

// Amp's curve toggle cycles through 3 states uniformly for attack/decay/
// release, but Tone's decayCurve only supports linear/exponential (attack/
// release support a wider EnvelopeCurve set) - only the extended ones get
// a genuinely distinct 3rd shape, decay folds its 3rd state to exponential
function mapCurveIndex(index: number, extended: true): Tone.EnvelopeCurve;
function mapCurveIndex(index: number, extended: false): "linear" | "exponential";
function mapCurveIndex(index: number, extended: boolean): Tone.EnvelopeCurve {
  if (index <= 0) return "linear";
  if (index === 1) return "exponential";
  return extended ? "sine" : "exponential";
}

function buildOscillatorSetOptions(osc: OscillatorAudioState) {
  const { type, partials } = mapWaveToOscillatorOptions(osc.wave);
  return {
    // Tone's `.set()` walker treats a present-but-undefined key as a real
    // value to assign (Object.keys includes it), and Oscillator's own
    // `partials` setter doesn't tolerate undefined - only include the key
    // when there's a real array to set
    oscillator: {
      type,
      phase: osc.phase * 360,
      detune: osc.detune * CENTS_PER_SEMITONE,
      ...(partials ? { partials } : {}),
    },
    gain: { gain: osc.enabled ? osc.gain : 0 },
    pan: { pan: osc.pan * 2 - 1 },
  };
}

// one shared Meter per oscillator slot - every currently active voice's
// oscillatorN output fans into the same tap (see PolysynthVoice's
// oscillatorNMeterTap), so each meter reflects that oscillator's combined
// level across the whole (polyphonic) instrument, not just one voice
function createOscillatorMeterTaps() {
  return {
    oscillator0: new Tone.Meter({ normalRange: true }),
    oscillator1: new Tone.Meter({ normalRange: true }),
    oscillator2: new Tone.Meter({ normalRange: true }),
  };
}

function readMeter(meter: Tone.Meter): number {
  const value = meter.getValue();
  return typeof value === "number" ? value : (value[0] ?? 0);
}

// Meter itself renders getValue() raw every frame with no shaping by
// design (attack/decay shaping is the source's job) - Tone.Meter's own
// `smoothing` option only softens the decay side, so every note's attack
// still snaps instantly, reading as aggressive jumping on discrete note
// onsets. This eases both directions with a simple framerate-independent
// exponential approach, same dt-based idiom as the other meter sources
// in this codebase (e.g. spikeMeterSource, the mock meter demo sources).
function createSmoothedMeterReader(meter: Tone.Meter, rate = 8) {
  let smoothed = 0;
  let lastTime = performance.now();
  return () => {
    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    smoothed += (readMeter(meter) - smoothed) * Math.min(1, dt * rate);
    return smoothed;
  };
}

export function usePolysynthAudioBridge() {
  const meterTapsRef = useRef<ReturnType<
    typeof createOscillatorMeterTaps
  > | null>(null);
  if (!meterTapsRef.current) {
    meterTapsRef.current = createOscillatorMeterTaps();
  }

  const meterReadersRef = useRef<Array<() => number> | null>(null);
  if (!meterReadersRef.current) {
    const taps = meterTapsRef.current;
    meterReadersRef.current = [
      createSmoothedMeterReader(taps.oscillator0),
      createSmoothedMeterReader(taps.oscillator1),
      createSmoothedMeterReader(taps.oscillator2),
    ];
  }

  const synthRef = useRef<Tone.PolySynth<PolysynthVoice> | null>(null);
  if (!synthRef.current) {
    const taps = meterTapsRef.current;
    synthRef.current = new Tone.PolySynth(PolysynthVoice, {
      oscillator0MeterTap: taps.oscillator0,
      oscillator1MeterTap: taps.oscillator1,
      oscillator2MeterTap: taps.oscillator2,
    }).toDestination();
  }

  const [audioState, setAudioState] = useState<PolysynthAudioState>(
    DEFAULT_POLYSYNTH_AUDIO_STATE,
  );

  useEffect(() => {
    const synth = synthRef.current!;
    const [osc0, osc1, osc2] = audioState.oscillators.map(
      buildOscillatorSetOptions,
    );
    const envelope = audioState.envelope;

    synth.set({
      oscillator0: osc0.oscillator,
      oscillator0Gain: osc0.gain,
      oscillator0Pan: osc0.pan,
      oscillator1: osc1.oscillator,
      oscillator1Gain: osc1.gain,
      oscillator1Pan: osc1.pan,
      oscillator2: osc2.oscillator,
      oscillator2Gain: osc2.gain,
      oscillator2Pan: osc2.pan,
      envelope: {
        attack: envelope.attack * ENVELOPE_TIMELINE_SECONDS,
        attackCurve: mapCurveIndex(envelope.attackCurve, true),
        decay: envelope.decay * ENVELOPE_TIMELINE_SECONDS,
        decayCurve: mapCurveIndex(envelope.decayCurve, false),
        sustain: envelope.sustain,
        release: envelope.release * ENVELOPE_TIMELINE_SECONDS,
        releaseCurve: mapCurveIndex(envelope.releaseCurve, true),
      },
    });
  }, [audioState]);

  useEffect(() => {
    const synth = synthRef.current!;
    const taps = meterTapsRef.current!;
    return () => {
      synth.dispose();
      taps.oscillator0.dispose();
      taps.oscillator1.dispose();
      taps.oscillator2.dispose();
    };
  }, []);

  return {
    audioState,
    onAudioStateChange: setAudioState,
    trigger: (
      note: string,
      duration: string | number,
      time: number,
      velocity: number,
    ) => synthRef.current!.triggerAttackRelease(note, duration, time, velocity),
    getOscillatorLevel: (index: number) =>
      (meterReadersRef.current![index] ?? meterReadersRef.current![0])(),
  };
}
