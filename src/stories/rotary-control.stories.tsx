import type { Meta, StoryObj } from "@storybook/react-vite";
import RotaryControl from "@/components/controls/rotary-control/RotaryControl";

const meta = {
  component: RotaryControl,
  title: "Rotary Control",
  tags: ["autodocs"],
} satisfies Meta<typeof RotaryControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
