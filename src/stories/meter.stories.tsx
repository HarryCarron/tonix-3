import type { Meta, StoryObj } from "@storybook/react-vite";
import { Meter } from "@/components/controls/meter/Meter";

// self-contained demo signals - real callers wire getValue to a Tone.js
// analyser tap, MIDI velocity state, etc. (see repo issue #32)
function sineDemo(periodMs: number) {
  return () => (Math.sin((performance.now() / periodMs) * Math.PI * 2) + 1) / 2;
}

function spikeAndDecayDemo(intervalMs: number, decayPerMs: number) {
  let lastSpike = 0;
  let peak = 0;

  return () => {
    const now = performance.now();
    if (now - lastSpike > intervalMs) {
      lastSpike = now;
      peak = 0.4 + Math.random() * 0.6;
    }
    peak = Math.max(0, peak - decayPerMs * 16.6667);
    return peak;
  };
}

const meta = {
  component: Meter,
  title: "Meter",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A generic canvas bar meter for visualizing a live scalar " +
          "signal (audio level, MIDI velocity, envelope-driven amplitude, " +
          "etc). `getValue` is pulled once per animation frame rather " +
          "than passed as a prop value or React state, so a fast-changing " +
          "source never triggers a re-render - Meter has no idea what's " +
          "on the other end of it, and never imports Tone.js itself. It " +
          "renders exactly what `getValue()` returns each frame with no " +
          "built-in smoothing; any attack/decay shaping is the supplying " +
          "source's responsibility. Sizes itself to fill its parent " +
          "container (`w-full h-full`), measured once on mount.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 40, height: 160 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    getValue: sineDemo(1500),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fills from the bottom up, the default orientation - the shape " +
          "an audio-rate analyser tap on an ADSR-shaped signal would " +
          "naturally trace.",
      },
    },
  },
};

export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    getValue: sineDemo(1500),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, height: 24 }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Fills left to right instead of bottom-up.",
      },
    },
  },
};

export const SpikeAndDecay: Story = {
  args: {
    orientation: "vertical",
    getValue: spikeAndDecayDemo(900, 0.0018),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Simulates a MIDI-keypress-style source: a source-side jump to " +
          "a random velocity followed by its own decay, with no shaping " +
          "from Meter itself - the same component as Vertical, fed a " +
          "differently-shaped signal.",
      },
    },
  },
};
