import type { Meta, StoryObj } from "@storybook/react-vite";
import { Delay } from "@/components/effects/delay/Delay";

const meta = {
  component: Delay,
  title: "Delay",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A delay effect node: Time/Feedback/Wet knobs, following the " +
          "same `ControlContainer` + `RotaryControl` pattern used by " +
          "`Oscillator`'s knob row. Ported from `tonix-2-react`'s " +
          "`effects/ping-pong-delay` shell, rebuilt from scratch rather " +
          "than copied — the original's knobs were hardcoded to 0 and " +
          "never wired to its own state. This is a visual/state shell " +
          "only; no audio engine is wired up yet.",
      },
    },
  },
} satisfies Meta<typeof Delay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
