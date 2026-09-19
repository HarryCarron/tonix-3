import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWorkspaceControllerRef } from "./workspace-context";

describe("useWorkspaceControllerRef", () => {
  it("throws when used outside a provider", () => {
    expect(() => renderHook(() => useWorkspaceControllerRef())).toThrow(
      "useWorkspaceControllerRef must be used within DomRefProvider",
    );
  });
});
