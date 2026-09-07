import type { Meta, StoryObj } from "@storybook/react-vite";
import { Filter } from "@/components/effects/filter/Filter";

const meta = {
  component: Filter,
  title: "Filter",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A filter effect node: drag the handle on the curve (or use the " +
          "Freq/Gain/Q knobs) to shape it, and pick LP/HP/BP from the type " +
          "dropdown. Ported from `tonix-2-react`'s `effects/filter` onto " +
          "this project's conventions (`RotaryControl`, shadcn `Select`, " +
          "the shared `CanvasUtilities` + SVG-interaction-layer pattern " +
          "`Amp` established). This is a visual and interaction shell " +
          "only — no audio engine is wired up yet, and the type selector " +
          "doesn't yet change the drawn curve shape (it didn't in the " +
          "original either).",
      },
    },
  },
} satisfies Meta<typeof Filter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
