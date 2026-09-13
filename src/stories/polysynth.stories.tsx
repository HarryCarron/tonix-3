import type { Meta, StoryObj } from "@storybook/react-vite";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";
import { usePolysynthAudioBridge } from "@/components/instruments/polysynth/usePolysynthAudioBridge";
import { MidiBox } from "@/components/nodes/midi-box/MidiBox";

const meta = {
  component: Polysynth,
  title: "Polysynth",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A polyphonic synthesizer instrument panel: three oscillators, " +
          "each with a wave-shape selector and `RotaryControl`s for phase, " +
          "gain and pan, plus a waveform display panel. This is a visual " +
          "and interaction shell only — no audio engine is wired up yet " +
          "(the planned audio layer is Tone.js on top of the Web Audio " +
          "API); nothing here produces sound.",
      },
    },
  },
} satisfies Meta<typeof Polysynth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "The full Polysynth panel with its three oscillators.",
      },
    },
  },
};

function LiveWithMidiBoxDemo() {
  const { audioState, onAudioStateChange, trigger } =
    usePolysynthAudioBridge();

  return (
    <div className="flex gap-4 items-start">
      <MidiBox
        onTrigger={(note, duration, time, velocity) =>
          trigger(note, duration, time, velocity)
        }
      />
      <Polysynth
        audioState={audioState}
        onAudioStateChange={onAudioStateChange}
      />
    </div>
  );
}

export const LiveWithMidiBox: Story = {
  // args are unused - LiveWithMidiBoxDemo owns audioState itself - but
  // Story's type requires them since Polysynth has no required props
  args: {},
  render: () => <LiveWithMidiBoxDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "The one place Polysynth actually makes sound: a real " +
          "`Tone.PolySynth(PolysynthVoice)` (see `PolysynthVoice.ts`) " +
          "routed straight to `Tone.Destination`, driven by MidiBox's " +
          "note events and this Polysynth panel's own controls via " +
          "`usePolysynthAudioBridge`. Press Play on MidiBox, then turn " +
          "the oscillator/envelope controls while it's playing - both " +
          "components are otherwise completely unmodified from their " +
          "standalone versions. This wiring is Storybook-only; " +
          "`<Polysynth />` in the real app (`World.tsx`) has none of it " +
          "and stays silent.",
      },
    },
  },
};
