import { createContext, useContext } from "react";
import type { WorkspaceController } from "./workspace-controller";

const DomRefContext = createContext<WorkspaceController | null>(null);

export const useWorkspaceControllerRef = () => {
  const ctx = useContext(DomRefContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceControllerRef must be used within DomRefProvider",
    );
  }
  return ctx;
};
