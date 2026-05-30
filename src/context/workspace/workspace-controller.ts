import type { RefObject } from "react";

export interface WorkspaceController {
  worldRef: RefObject<HTMLDivElement> | undefined;
}
