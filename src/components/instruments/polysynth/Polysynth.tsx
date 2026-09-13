import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import "./Polysynth.css";
import { Oscillator } from "./Oscillator";
import { OscDetails } from "./OscDetails";
import type { OscDetailsView } from "./oscDetailsView";
import { FaArrowLeft } from "react-icons/fa";
import {
  DEFAULT_POLYSYNTH_AUDIO_STATE,
  type OscillatorAudioState,
  type OscillatorAudioStates,
  type PolysynthAudioState,
} from "./polysynthAudioState";

const OSCILLATOR_IDS = ["osc1", "osc2", "osc3"] as const;

interface PolysynthProps {
  // optionally-controlled: pass both to drive oscillator/envelope state
  // externally (e.g. a Storybook-only Tone.js audio bridge); omit both to
  // let Polysynth own its state internally - the production/World.tsx
  // usage, unaffected by any of this. Same convention as RotaryControl/Amp.
  audioState?: PolysynthAudioState;
  onAudioStateChange?: (state: PolysynthAudioState) => void;
  // per-oscillator level, from the same audio bridge that owns audioState -
  // omit for a silent meter (production/uncontrolled usage)
  getOscillatorMeterLevel?: (index: number) => number;
}

export function Polysynth({
  audioState,
  onAudioStateChange,
  getOscillatorMeterLevel,
}: PolysynthProps) {
  const [detailsView, setDetailsView] = useState<OscDetailsView>("envelope");
  const [internalAudioState, setInternalAudioState] =
    useState<PolysynthAudioState>(DEFAULT_POLYSYNTH_AUDIO_STATE);
  const state = audioState ?? internalAudioState;

  const updateState = (
    updater: (prev: PolysynthAudioState) => PolysynthAudioState,
  ) => {
    const next = updater(state);
    if (onAudioStateChange) {
      onAudioStateChange(next);
    } else {
      setInternalAudioState(next);
    }
  };

  const updateOscillator = (
    index: number,
    updater: (prev: OscillatorAudioState) => OscillatorAudioState,
  ) => {
    updateState((prev) => ({
      ...prev,
      oscillators: prev.oscillators.map((osc, i) =>
        i === index ? updater(osc) : osc,
      ) as OscillatorAudioStates,
    }));
  };

  return (
    <Card className="py-3 px-0 w-[340px]">
      <CardHeader>
        <span className="pix-font color-stone-500 text-4xl">Polysynth</span>
      </CardHeader>
      <CardContent className="px-3">
        <div>
          {OSCILLATOR_IDS.map((id, i) => {
            const osc = state.oscillators[i];
            return (
              <Oscillator
                key={id}
                id={id}
                number={i}
                wave={osc.wave}
                onWaveChange={(wave) =>
                  updateOscillator(i, (o) => ({ ...o, wave }))
                }
                enabled={osc.enabled}
                onEnabledChange={(enabled) =>
                  updateOscillator(i, (o) => ({ ...o, enabled }))
                }
                detune={osc.detune}
                onDetuneChange={(detune) =>
                  updateOscillator(i, (o) => ({ ...o, detune }))
                }
                phase={osc.phase}
                onPhaseChange={(phase) =>
                  updateOscillator(i, (o) => ({ ...o, phase }))
                }
                gain={osc.gain}
                onGainChange={(gain) =>
                  updateOscillator(i, (o) => ({ ...o, gain }))
                }
                pan={osc.pan}
                onPanChange={(pan) =>
                  updateOscillator(i, (o) => ({ ...o, pan }))
                }
                meterGetValue={
                  getOscillatorMeterLevel
                    ? () => getOscillatorMeterLevel(i)
                    : undefined
                }
              />
            );
          })}

          <div className="w-full py-3 border-b border-stone-200 pix-font flex align-center justify-center items-center gap-2 text-stone-700">
            <span>
              <FaArrowLeft />
            </span>
            <span>MASTER</span>
            <span>
              <FaArrowLeft />
            </span>
          </div>
        </div>
        <OscDetails
          view={detailsView}
          onViewChange={setDetailsView}
          envelope={state.envelope}
          onEnvelopeChange={(envelope) =>
            updateState((prev) => ({ ...prev, envelope }))
          }
        />
      </CardContent>
    </Card>
  );
}
