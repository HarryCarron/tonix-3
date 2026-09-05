import type { Meta, StoryObj } from "@storybook/react-vite";
import { Waveform } from "@/components/controls/waveform/Waveform";

const meta = {
  component: Waveform,
  title: "Waveform",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A static, idealized sine-wave visualization drawn as an SVG " +
          "path — it is not connected to a live audio signal. Used as a " +
          "placeholder inside `Polysynth`'s oscillator detail panel until " +
          "an audio engine exists to feed it a real sampled waveform " +
          "(e.g. via Tone.js's `Waveform`/`Analyser` nodes).",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300, height: 160 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Waveform>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
