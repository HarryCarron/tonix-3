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

export function usePolysynthAudioBridge() {
  const synthRef = useRef<Tone.PolySynth<PolysynthVoice> | null>(null);
  if (!synthRef.current) {
    synthRef.current = new Tone.PolySynth(PolysynthVoice).toDestination();
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
    return () => {
      synth.dispose();
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
  };
}
