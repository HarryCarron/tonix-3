import type { Meta, StoryObj } from "@storybook/react-vite";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";
import { usePolysynthAudioBridge } from "@/components/instruments/polysynth/usePolysynthAudioBridge";
import { WorldStoryHarness } from "./harness/WorldStoryHarness";

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

function LiveInWorldHarnessDemo() {
  const { audioState, onAudioStateChange, trigger } =
    usePolysynthAudioBridge();

  return (
    <WorldStoryHarness onTrigger={trigger}>
      <Polysynth
        audioState={audioState}
        onAudioStateChange={onAudioStateChange}
      />
    </WorldStoryHarness>
  );
}

export const LiveInWorldHarness: Story = {
  // args are unused - LiveInWorldHarnessDemo owns audioState itself - but
  // Story's type requires them since Polysynth has no required props
  args: {},
  render: () => <LiveInWorldHarnessDemo />,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The one place Polysynth actually makes sound: a real " +
          "`Tone.PolySynth(PolysynthVoice)` (see `PolysynthVoice.ts`) " +
          "routed straight to `Tone.Destination`. `WorldStoryHarness` " +
          "(see `harness/WorldStoryHarness.tsx`) provides the note " +
          "source - the same transport bar/pattern-select and " +
          "`useMidiPatternPlayer` hook MidiBox itself uses, just without " +
          "the node-card chrome - on top of World's own dot-grid " +
          "backdrop, so this reads like the real canvas rather than a " +
          "bare component on a white page. Press Play in the header bar, " +
          "then turn Polysynth's oscillator/envelope controls while it's " +
          "playing. This wiring is Storybook-only; `<Polysynth />` in the " +
          "real app (`World.tsx`) has none of it and stays silent.",
      },
    },
  },
};
