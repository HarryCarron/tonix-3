import * as Tone from "tone";
import {
  Monophonic,
  type MonophonicOptions,
} from "tone/build/esm/instrument/Monophonic.js";

export interface PolysynthOscillatorOptions {
  type: Tone.ToneOscillatorType;
  // degrees, 0-360
  phase: number;
  // additive/custom waveforms only
  partials?: number[];
  // cents - this oscillator's own fixed offset, independent of (and
  // additive with, via native AudioParam summation) the voice-level
  // shared `detune` Signal connected to every oscillator's detune param
  detune: number;
}

export interface PolysynthGainOptions {
  gain: number;
}

export interface PolysynthPanOptions {
  pan: number;
}

export interface PolysynthVoiceOptions extends MonophonicOptions {
  oscillator0: PolysynthOscillatorOptions;
  oscillator1: PolysynthOscillatorOptions;
  oscillator2: PolysynthOscillatorOptions;
  oscillator0Gain: PolysynthGainOptions;
  oscillator1Gain: PolysynthGainOptions;
  oscillator2Gain: PolysynthGainOptions;
  oscillator0Pan: PolysynthPanOptions;
  oscillator1Pan: PolysynthPanOptions;
  oscillator2Pan: PolysynthPanOptions;
  envelope: Partial<Tone.EnvelopeOptions>;
  // wiring, not a settable audio parameter - not part of getDefaults()
  // (Tone.Gain/Meter instances need a real context, unavailable in a
  // static method). When provided, every voice's oscillatorN output also
  // fans out here (in addition to its own mix bus), so a single shared
  // node per oscillator slot sees the combined signal of every currently
  // active voice for that oscillator - which is what a per-oscillator UI
  // meter on a polyphonic instrument actually wants to show.
  oscillator0MeterTap?: Tone.InputNode;
  oscillator1MeterTap?: Tone.InputNode;
  oscillator2MeterTap?: Tone.InputNode;
}

interface OscillatorChain {
  oscillator: Tone.Oscillator;
  gain: Tone.Gain;
  panner: Tone.Panner;
}

/**
 * A Monophonic voice for use with Tone.PolySynth, mixing 3 independently
 * configurable oscillators (type/phase/gain/pan) through one shared
 * amplitude envelope - matches the 3-oscillator layout of the Polysynth UI.
 * Tone has no stock voice for this (Tone.Synth is one oscillator per voice),
 * so this composes the mix bus by hand, the same way Tone's own multi-voice
 * instruments (e.g. DuoSynth) fan a shared frequency/detune Signal out to
 * several internal sources.
 */
export class PolysynthVoice extends Monophonic<PolysynthVoiceOptions> {
  readonly name: string = "PolysynthVoice";

  readonly frequency: Tone.Signal<"frequency">;
  readonly detune: Tone.Signal<"cents">;
  readonly envelope: Tone.AmplitudeEnvelope;

  readonly oscillator0: Tone.Oscillator;
  readonly oscillator1: Tone.Oscillator;
  readonly oscillator2: Tone.Oscillator;

  readonly oscillator0Gain: Tone.Gain;
  readonly oscillator1Gain: Tone.Gain;
  readonly oscillator2Gain: Tone.Gain;

  readonly oscillator0Pan: Tone.Panner;
  readonly oscillator1Pan: Tone.Panner;
  readonly oscillator2Pan: Tone.Panner;

  private readonly _mixBus: Tone.Gain;

  constructor(options?: Partial<PolysynthVoiceOptions>) {
    const opts = Object.assign(
      PolysynthVoice.getDefaults(),
      options,
    ) as PolysynthVoiceOptions;
    super(opts);

    this._mixBus = new Tone.Gain({ context: this.context });

    this.envelope = new Tone.AmplitudeEnvelope(
      Object.assign({ context: this.context }, opts.envelope),
    );
    this._mixBus.connect(this.envelope);
    this.envelope.connect(this.output);

    this.frequency = new Tone.Signal({
      context: this.context,
      units: "frequency",
      value: 440,
    });
    this.detune = new Tone.Signal({
      context: this.context,
      units: "cents",
      value: opts.detune,
    });

    // only one oscillator needs to report the voice as silent - all 3 are
    // stopped at the same scheduled time in _triggerEnvelopeRelease, so
    // oscillator0's onstop is a sufficient proxy for "this voice is done".
    // Without this, PolySynth never reclaims voices (see Synth.ts, which
    // does the same thing for its own single oscillator) and eventually
    // logs "Max polyphony exceeded. Note dropped."
    const osc0 = this._buildOscillatorChain(
      opts.oscillator0,
      opts.oscillator0Gain,
      opts.oscillator0Pan,
      () => this.onsilence(this),
      opts.oscillator0MeterTap,
    );
    const osc1 = this._buildOscillatorChain(
      opts.oscillator1,
      opts.oscillator1Gain,
      opts.oscillator1Pan,
      undefined,
      opts.oscillator1MeterTap,
    );
    const osc2 = this._buildOscillatorChain(
      opts.oscillator2,
      opts.oscillator2Gain,
      opts.oscillator2Pan,
      undefined,
      opts.oscillator2MeterTap,
    );

    this.oscillator0 = osc0.oscillator;
    this.oscillator0Gain = osc0.gain;
    this.oscillator0Pan = osc0.panner;

    this.oscillator1 = osc1.oscillator;
    this.oscillator1Gain = osc1.gain;
    this.oscillator1Pan = osc1.panner;

    this.oscillator2 = osc2.oscillator;
    this.oscillator2Gain = osc2.gain;
    this.oscillator2Pan = osc2.panner;
  }

  private _buildOscillatorChain(
    oscOptions: PolysynthOscillatorOptions,
    gainOptions: PolysynthGainOptions,
    panOptions: PolysynthPanOptions,
    onstop?: () => void,
    meterTap?: Tone.InputNode,
  ): OscillatorChain {
    // Oscillator's options type is a discriminated union keyed off a
    // literal `type`; ours is a plain widened ToneOscillatorType, so the
    // exact variant can't be resolved statically - it's a valid runtime
    // shape regardless of which wave type is picked.
    const oscillator = new Tone.Oscillator({
      context: this.context,
      type: oscOptions.type,
      phase: oscOptions.phase,
      detune: oscOptions.detune,
      ...(oscOptions.partials ? { partials: oscOptions.partials } : {}),
      ...(onstop ? { onstop } : {}),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const gain = new Tone.Gain({ context: this.context, gain: gainOptions.gain });
    const panner = new Tone.Panner({ context: this.context, pan: panOptions.pan });

    oscillator.chain(gain, panner, this._mixBus);
    if (meterTap) {
      panner.connect(meterTap);
    }
    this.frequency.connect(oscillator.frequency);
    // deliberately NOT connecting this.detune to oscillator.detune: Tone
    // treats connecting a Signal into another (already-independently-set)
    // Signal as "fully override the destination" - it permanently forces
    // the destination's own value to 0 (Param._fromType: "if it's
    // overridden, should only schedule 0s"), which would silently break
    // this oscillator's own per-oscillator `detune` option/setting below.
    // frequency avoids this because setNote() always writes through the
    // shared this.frequency, never oscillator.frequency directly - there's
    // no equivalent shared-detune write path here, so the voice-level
    // `detune` (Monophonic's abstract contract) stays a valid but inert
    // Signal for now; only the per-oscillator detune is wired to sound.
    return { oscillator, gain, panner };
  }

  static getDefaults(): PolysynthVoiceOptions {
    const defaultOscillator = (): PolysynthOscillatorOptions => ({
      type: "sine",
      phase: 0,
      detune: 0,
    });
    return Object.assign(Monophonic.getDefaults(), {
      oscillator0: defaultOscillator(),
      oscillator1: defaultOscillator(),
      oscillator2: defaultOscillator(),
      oscillator0Gain: { gain: 1 },
      oscillator1Gain: { gain: 1 },
      oscillator2Gain: { gain: 1 },
      oscillator0Pan: { pan: 0 },
      oscillator1Pan: { pan: 0 },
      oscillator2Pan: { pan: 0 },
      envelope: {
        attack: 0.1,
        decay: 0.2,
        sustain: 0.5,
        release: 0.3,
      },
    });
  }

  protected _triggerEnvelopeAttack(time: number, velocity: number): void {
    this.envelope.triggerAttack(time, velocity);
    this.oscillator0.start(time);
    this.oscillator1.start(time);
    this.oscillator2.start(time);
  }

  protected _triggerEnvelopeRelease(time: number): void {
    this.envelope.triggerRelease(time);
    const stopTime = time + this.toSeconds(this.envelope.release);
    this.oscillator0.stop(stopTime);
    this.oscillator1.stop(stopTime);
    this.oscillator2.stop(stopTime);
  }

  getLevelAtTime(time: Tone.Unit.Time): Tone.Unit.NormalRange {
    return this.envelope.getValueAtTime(this.toSeconds(time));
  }

  dispose(): this {
    super.dispose();
    this._mixBus.dispose();
    this.envelope.dispose();
    this.frequency.dispose();
    this.detune.dispose();
    this.oscillator0.dispose();
    this.oscillator1.dispose();
    this.oscillator2.dispose();
    this.oscillator0Gain.dispose();
    this.oscillator1Gain.dispose();
    this.oscillator2Gain.dispose();
    this.oscillator0Pan.dispose();
    this.oscillator1Pan.dispose();
    this.oscillator2Pan.dispose();
    return this;
  }
}
