import type { Meta, StoryObj } from "@storybook/react-vite";
import RotaryControl from "@/components/controls/rotary-control/RotaryControl";

const meta = {
  component: RotaryControl,
  title: "Rotary Control",
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
    },
  },
} satisfies Meta<typeof RotaryControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};
