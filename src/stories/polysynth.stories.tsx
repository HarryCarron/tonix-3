import type { Meta, StoryObj } from "@storybook/react-vite";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";

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
