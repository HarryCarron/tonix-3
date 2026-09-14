import { beforeEach, describe, expect, it, vi } from "vitest";
import { patientLoad } from "./patient-load";

// patientLoad is a module-level singleton, so give each test a fresh id to
// avoid state bleeding between tests.
let idCounter = 0;
const uniqueId = () => `source-${idCounter++}`;

describe("patientLoad", () => {
  let id: string;

  beforeEach(() => {
    id = uniqueId();
  });

  it("calls the getter immediately if the source is already set", () => {
    patientLoad.setSource(id, "value");
    const getter = vi.fn();

    patientLoad.getSource(id, getter);

    expect(getter).toHaveBeenCalledWith("value");
  });

  it("defers the getter until the source is set", () => {
    const getter = vi.fn();

    patientLoad.getSource(id, getter);
    expect(getter).not.toHaveBeenCalled();

    patientLoad.setSource(id, "late-value");
    expect(getter).toHaveBeenCalledWith("late-value");
  });

  it("only resolves the most recently registered awaiting getter for an id", () => {
    const first = vi.fn();
    const second = vi.fn();

    patientLoad.getSource(id, first);
    patientLoad.getSource(id, second);
    patientLoad.setSource(id, "value");

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith("value");
  });

  it("does not replay a resolved getter on a later setSource call", () => {
    const getter = vi.fn();

    patientLoad.getSource(id, getter);
    patientLoad.setSource(id, "first");
    patientLoad.setSource(id, "second");

    expect(getter).toHaveBeenCalledTimes(1);
    expect(getter).toHaveBeenCalledWith("first");
  });
});
