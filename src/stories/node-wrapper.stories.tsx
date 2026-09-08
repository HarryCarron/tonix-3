import type { Meta, StoryObj } from "@storybook/react-vite";
import { NodeWrapper } from "@/components/nodes/node-wrapper/NodeWrapper";
import { Polysynth } from "@/components/instruments/polysynth/Polysynth";
import { ConnectionsProvider } from "@/context/connections/ConnectionsContext";

const meta = {
  component: NodeWrapper,
  title: "NodeWrapper",
  tags: ["autodocs"],
  // NodeWrapper's terminals read from ConnectionsContext (normally provided
  // by World.tsx); outside that, dragging a terminal here is inert rather
  // than functional, since no viewport/camera is registered to convert
  // drag coordinates into content-space.
  decorators: [
    (Story) => (
      <ConnectionsProvider>
        <Story />
      </ConnectionsProvider>
    ),
  ],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The common title bar/chrome (rename input, mute/settings/close " +
          "buttons) placed around every node's content on the canvas in " +
          "`World.tsx`. This story wraps `Polysynth` to show it as it " +
          "actually appears there, rather than the bare panel shown in " +
          "`Polysynth`'s own story.",
      },
    },
  },
} satisfies Meta<typeof NodeWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WrappingPolysynth: Story = {
  args: {
    id: "polysynth-story",
    children: <Polysynth />,
  },
};
