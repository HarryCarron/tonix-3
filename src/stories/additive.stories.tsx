import type { Meta, StoryObj } from "@storybook/react-vite";
import Additive from "@/components/controls/additive/additive";

const meta = {
  component: Additive,
  title: "Additive",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "An additive-synthesis partial editor. In additive synthesis, a " +
          "complex tone is built by summing sine wave partials (harmonics), " +
          "each with its own independent amplitude — instead of shaping " +
          "one waveform with filters, you construct the timbre directly " +
          "from its amplitude spectrum. Each bar here is one partial's " +
          "amplitude (0–1); click and drag anywhere on the chart to set " +
          "the level under the cursor. **Randomize** scrambles every " +
          "partial's level, the **−**/**+** buttons remove or add a " +
          "partial (up to 32), and **Clear** resets to none. No audio " +
          "engine is wired up yet — this only edits the partial levels " +
          "visually.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320, height: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Additive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
