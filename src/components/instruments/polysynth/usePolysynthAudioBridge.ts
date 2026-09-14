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

// only the fields that actually changed since the last *applied* state -
// same present-but-undefined landmine as buildOscillatorSetOptions above,
// so a leg the diff didn't touch must be absent from the object entirely,
// never set to undefined
function diffOscillatorOptions(
  next: OscillatorAudioState,
  prev: OscillatorAudioState | null,
) {
  const built = buildOscillatorSetOptions(next);
  return {
    oscillator:
      !prev ||
      prev.wave !== next.wave ||
      prev.detune !== next.detune ||
      prev.phase !== next.phase
        ? built.oscillator
        : undefined,
    gain:
      !prev || prev.enabled !== next.enabled || prev.gain !== next.gain
        ? built.gain
        : undefined,
    pan: !prev || prev.pan !== next.pan ? built.pan : undefined,
  };
}

function diffEnvelopeOptions(
  next: PolysynthAudioState["envelope"],
  prev: PolysynthAudioState["envelope"] | null,
): Partial<Tone.EnvelopeOptions> {
  const envelope: Partial<Tone.EnvelopeOptions> = {};
  if (!prev || prev.attack !== next.attack) {
    envelope.attack = next.attack * ENVELOPE_TIMELINE_SECONDS;
  }
  if (!prev || prev.attackCurve !== next.attackCurve) {
    envelope.attackCurve = mapCurveIndex(next.attackCurve, true);
  }
  if (!prev || prev.decay !== next.decay) {
    envelope.decay = next.decay * ENVELOPE_TIMELINE_SECONDS;
  }
  if (!prev || prev.decayCurve !== next.decayCurve) {
    envelope.decayCurve = mapCurveIndex(next.decayCurve, false);
  }
  if (!prev || prev.sustain !== next.sustain) {
    envelope.sustain = next.sustain;
  }
  if (!prev || prev.release !== next.release) {
    envelope.release = next.release * ENVELOPE_TIMELINE_SECONDS;
  }
  if (!prev || prev.releaseCurve !== next.releaseCurve) {
    envelope.releaseCurve = mapCurveIndex(next.releaseCurve, true);
  }
  return envelope;
}

// the full options object PolySynth.set() needs to bring every voice from
// `prev` (or its defaults, when null) to `next` - only the oscillator/
// envelope legs that actually changed are included
function buildSynthSetOptions(
  next: PolysynthAudioState,
  prev: PolysynthAudioState | null,
) {
  const [nextOsc0, nextOsc1, nextOsc2] = next.oscillators;
  const [prevOsc0, prevOsc1, prevOsc2] = prev?.oscillators ?? [
    null,
    null,
    null,
  ];

  const osc0 = diffOscillatorOptions(nextOsc0, prevOsc0);
  const osc1 = diffOscillatorOptions(nextOsc1, prevOsc1);
  const osc2 = diffOscillatorOptions(nextOsc2, prevOsc2);
  const envelope = diffEnvelopeOptions(next.envelope, prev?.envelope ?? null);

  return {
    ...(osc0.oscillator ? { oscillator0: osc0.oscillator } : {}),
    ...(osc0.gain ? { oscillator0Gain: osc0.gain } : {}),
    ...(osc0.pan ? { oscillator0Pan: osc0.pan } : {}),
    ...(osc1.oscillator ? { oscillator1: osc1.oscillator } : {}),
    ...(osc1.gain ? { oscillator1Gain: osc1.gain } : {}),
    ...(osc1.pan ? { oscillator1Pan: osc1.pan } : {}),
    ...(osc2.oscillator ? { oscillator2: osc2.oscillator } : {}),
    ...(osc2.gain ? { oscillator2Gain: osc2.gain } : {}),
    ...(osc2.pan ? { oscillator2Pan: osc2.pan } : {}),
    ...(Object.keys(envelope).length > 0 ? { envelope } : {}),
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

  const lastAppliedStateRef = useRef<PolysynthAudioState | null>(null);
  const pendingStateRef = useRef<PolysynthAudioState | null>(null);
  const applyRafRef = useRef<number | null>(null);

  // A continuous drag (a rotary knob, an envelope handle) can push
  // audioState updates far faster than PolySynth.set() can absorb - it
  // walks every pooled voice's full options tree synchronously on the main
  // thread, the same thread Tone's lookahead scheduler uses to fire the
  // MIDI Part's note callbacks on time. Flooding it competes with that
  // scheduling and surfaces as audible pauses in playback. Coalescing to
  // one flush per animation frame, applying only what changed since the
  // last flush, keeps that work bounded no matter how fast the UI fires.
  useEffect(() => {
    pendingStateRef.current = audioState;

    if (applyRafRef.current != null) return;

    applyRafRef.current = requestAnimationFrame(() => {
      applyRafRef.current = null;
      const next = pendingStateRef.current!;
      const options = buildSynthSetOptions(next, lastAppliedStateRef.current);
      if (Object.keys(options).length > 0) {
        synthRef.current!.set(options);
      }
      lastAppliedStateRef.current = next;
    });
  }, [audioState]);

  useEffect(() => {
    const synth = synthRef.current!;
    const taps = meterTapsRef.current!;
    return () => {
      if (applyRafRef.current != null) {
        cancelAnimationFrame(applyRafRef.current);
      }
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
