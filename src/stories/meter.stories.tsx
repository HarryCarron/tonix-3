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

// Mocks the shape of a real Tone.Meter/Analyser tap: a plain object
// exposing getValue(), the exact surface Meter's getValue prop expects to
// be wired to (see repo issue #32) - a stand-in for wiring up a real audio
// graph before one exists. Wanders toward a random target level with a
// little jitter, the way a live RMS reading off actual audio would.
function createMockMeterSource() {
  let lastTime = performance.now();
  let level = 0;
  let target = Math.random();

  return {
    getValue(): number {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (Math.random() < dt * 0.6) {
        target = Math.random();
      }
      level += (target - level) * Math.min(1, dt * 6);

      const jitter = (Math.random() - 0.5) * 0.05;
      return Math.min(1, Math.max(0, level + jitter));
    },
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
      <div style={{ width: 5, height: 160 }}>
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
      <div style={{ width: 240, height: 5 }}>
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

const mockMeterSource = createMockMeterSource();

export const MockSource: Story = {
  args: {
    orientation: "vertical",
    getValue: () => mockMeterSource.getValue(),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Wired to a standalone mock source object exposing getValue() " +
          "- the same surface a real Tone.Meter/Analyser tap presents - " +
          "so Meter's data contract can be exercised end-to-end (source " +
          "object in, canvas out) without any real audio graph wired up " +
          "yet. Swapping this for `() => toneMeterNode.getValue()` is the " +
          "entire integration once a real node exists.",
      },
    },
  },
};
