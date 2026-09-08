import type { Meta, StoryObj } from "@storybook/react-vite";
import RotaryControl, {
  type RotaryControlStage,
} from "@/components/controls/rotary-control/RotaryControl";

const meta = {
  component: RotaryControl,
  title: "Rotary Control",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A draggable rotary knob, in two modes. `continuous` (the " +
          "default) represents a free value between 0 and 1 — used " +
          "throughout `Polysynth`'s oscillator controls (phase, gain, " +
          "pan). `staged` instead snaps to a fixed list of labeled " +
          "stages, e.g. tempo-synced note subdivisions for `Delay`'s " +
          "Time knob. In both modes, click and drag vertically anywhere " +
          "on the page to change the value — dragging up increases it, " +
          "dragging down decreases it, and it clamps at both ends.",
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
    mode: {
      control: "radio",
      options: ["continuous", "staged"],
      description:
        "`continuous` for a free 0-1 value (default); `staged` to snap " +
        "to a fixed `stages` list instead.",
      table: {
        defaultValue: { summary: "continuous" },
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

const timeStages: RotaryControlStage[] = [
  { value: "1n", label: "1/1" },
  { value: "2n", label: "1/2" },
  { value: "4n", label: "1/4" },
  { value: "8n", label: "1/8" },
  { value: "16n", label: "1/16" },
  { value: "32n", label: "1/32" },
];

export const Staged: Story = {
  args: {
    mode: "staged",
    stages: timeStages,
    value: "8n",
  },
  parameters: {
    docs: {
      description: {
        story:
          "The same six note-subdivision stages `Delay`'s Time knob " +
          "uses. A small tick marks each stage's position on the track " +
          "(the current one bolded), and the readout shows its label " +
          "instead of a percentage. Drag still works the same way, but " +
          "the value quantizes to the nearest stage as you go rather " +
          "than moving freely.",
      },
    },
  },
};
