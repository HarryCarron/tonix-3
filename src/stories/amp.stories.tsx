import type { Meta, StoryObj } from "@storybook/react-vite";
import Amp from "@/components/controls/amp/amp";

const meta = {
  component: Amp,
  title: "Amp",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An ADSR (Attack / Decay / Sustain / Release) envelope editor. " +
          "Drag the handle at the end of each stage to reshape it; click " +
          "a stage's filled area to cycle its curve between linear, " +
          "exponential and cosine. The four `RotaryControl`s below are " +
          "currently visual placeholders — `RotaryControl` doesn't have a " +
          "controlled-value prop yet, so they aren't wired to the " +
          "envelope's actual attack/decay/sustain/release values. No " +
          "audio engine is wired up yet either — this only edits the " +
          "envelope shape visually.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 220 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Amp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
