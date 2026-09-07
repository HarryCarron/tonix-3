import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MidiBox } from "@/components/nodes/midi-box/MidiBox";

function MidiBoxDemo() {
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="flex flex-col gap-3 items-center">
      <MidiBox
        onTrigger={(note, duration, time, velocity) => {
          const entry = `${note} · dur ${duration} · vel ${velocity.toFixed(2)} · t ${time.toFixed(2)}`;
          setLog((entries) => [entry, ...entries].slice(0, 8));
        }}
      />
      <div className="w-[280px] text-xs font-mono text-stone-500">
        {log.length === 0 ? (
          <span>Press play to trigger notes…</span>
        ) : (
          log.map((entry, i) => <div key={i}>{entry}</div>)
        )}
      </div>
    </div>
  );
}

const meta = {
  component: MidiBox,
  title: "MidiBox",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A MIDI source node: loops one of 5 hardcoded test patterns via " +
          "a `Tone.Part` with play/pause/stop/rewind transport controls, " +
          "and reports triggered notes through `onTrigger` (mirrors " +
          "`synth.triggerAttackRelease(note, duration, time, velocity)`). " +
          "Useful standalone in prod (canned patterns for demoing patches " +
          "or testing sounds without a keyboard) and as the MIDI-source " +
          "half of a stub-source → node → master-sink chain in other node " +
          "stories, so an instrument story never has to wire itself to " +
          "master directly. Not yet connected to anything via a real " +
          "patch cable — the node-graph/cable model is still to be " +
          "designed (see `Amp`/`Polysynth` for the same caveat).",
      },
    },
  },
} satisfies Meta<typeof MidiBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <MidiBoxDemo />,
};
