import type { Meta, StoryObj } from "@storybook/react-vite";
import RotaryControl from "@/components/controls/rotary-control/RotaryControl";

const meta = {
  component: RotaryControl,
  title: "Rotary Control",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A draggable rotary knob representing a value between 0 and 1. " +
          "Click and drag vertically anywhere on the page to change the " +
          "value — dragging up increases it, dragging down decreases it, " +
          "and it clamps at both ends. Used throughout `Polysynth`'s " +
          "oscillator controls (phase, gain, pan).",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md"],
      description:
        "Visual size of the knob. `sm` (23px) is the default used inline " +
        "in dense control rows; `md` (40px) is for contexts where the " +
        "knob needs to be more prominent or easier to grab.",
      table: {
        defaultValue: { summary: "sm" },
      },
    },
  },
} satisfies Meta<typeof RotaryControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: "sm" },
  parameters: {
    docs: {
      description: {
        story: "The default size, used inline in Polysynth's oscillator rows.",
      },
    },
  },
};

export const Medium: Story = {
  args: { size: "md" },
  parameters: {
    docs: {
      description: {
        story: "A larger variant for standalone or more prominent placements.",
      },
    },
  },
};
