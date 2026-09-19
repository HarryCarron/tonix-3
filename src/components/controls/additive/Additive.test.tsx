import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Additive from "./Additive";

function createFakeContext() {
  return {
    scale: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    rect: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
  };
}

describe("Additive", () => {
  let ctx: ReturnType<typeof createFakeContext>;

  beforeEach(() => {
    ctx = createFakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      ctx as unknown as CanvasRenderingContext2D,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draws one rect for the single initial partial", () => {
    render(<Additive />);
    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  it("adds a partial (and redraws) when + is clicked", async () => {
    const user = userEvent.setup();
    render(<Additive />);
    ctx.fillRect.mockClear();

    await user.click(screen.getAllByRole("button")[3]); // +

    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
  });

  it("removes a partial when - is clicked", async () => {
    const user = userEvent.setup();
    render(<Additive />);

    await user.click(screen.getAllByRole("button")[3]); // + -> 2 partials
    ctx.fillRect.mockClear();
    await user.click(screen.getAllByRole("button")[2]); // - -> back to 1

    expect(ctx.fillRect).toHaveBeenCalledTimes(1);
  });

  it("does not go below 0 partials when repeatedly clicking -", async () => {
    const user = userEvent.setup();
    render(<Additive />);

    await user.click(screen.getAllByRole("button")[2]); // - -> 0 partials
    ctx.fillRect.mockClear();
    await user.click(screen.getAllByRole("button")[2]); // - again, should be a no-op

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it("clears all partials when Clear is clicked", async () => {
    const user = userEvent.setup();
    render(<Additive />);
    ctx.fillRect.mockClear();

    await user.click(screen.getByText("Clear"));

    expect(ctx.fillRect).not.toHaveBeenCalled();
  });

  it("randomizes to a new partial count when Randomize is clicked", async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.5); // length = floor(0.5*32) = 16
    render(<Additive />);
    ctx.fillRect.mockClear();

    await user.click(screen.getByText("Randomize"));

    expect(ctx.fillRect).toHaveBeenCalledTimes(16);
  });
});
