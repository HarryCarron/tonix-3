import { act, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Connections } from "./Connections";
import {
  ConnectionsProvider,
  useConnections,
} from "@/context/connections/ConnectionsContext";

function Driver({ onReady }: { onReady: (api: ReturnType<typeof useConnections>) => void }) {
  const api = useConnections();
  onReady(api);
  return null;
}

function renderConnections() {
  let api!: ReturnType<typeof useConnections>;
  const utils = render(
    <ConnectionsProvider>
      <Driver onReady={(a) => (api = a)} />
      <Connections />
    </ConnectionsProvider>,
  );
  return { ...utils, getApi: () => api };
}

describe("Connections", () => {
  it("renders nothing when there are no connections or in-progress attempt", () => {
    const { container } = renderConnections();
    expect(container.querySelectorAll("path")).toHaveLength(0);
  });

  it("draws a path for each committed connection", () => {
    const { container, getApi } = renderConnections();

    act(() => getApi().beginAttempt("node-1", { x: 0, y: 0 }));
    act(() => getApi().commitAttempt({ x: 10, y: 10 }));

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    expect(paths[0]).not.toHaveAttribute("stroke-dasharray");
  });

  it("draws a dashed path for the in-progress attempt", () => {
    const { container, getApi } = renderConnections();

    act(() => getApi().beginAttempt("node-1", { x: 0, y: 0 }));
    act(() => getApi().updateAttempt({ x: 20, y: 20 }));

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(1);
    expect(paths[0]).toHaveAttribute("stroke-dasharray", "4 3");
  });

  it("removes the attempt path once cancelled", () => {
    const { container, getApi } = renderConnections();

    act(() => getApi().beginAttempt("node-1", { x: 0, y: 0 }));
    act(() => getApi().cancelAttempt());

    expect(container.querySelectorAll("path")).toHaveLength(0);
  });
});
