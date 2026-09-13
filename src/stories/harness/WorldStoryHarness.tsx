import type { ReactNode } from "react";
import { WorldBackground } from "@/components/editor/world/WorldBackground";
import { PlaybackHarnessBar } from "./PlaybackHarnessBar";
import type { MidiPattern } from "@/components/nodes/midi-box/MidiPattern";
import type { MidiTriggerHandler } from "@/components/nodes/midi-box/useMidiPatternPlayer";

interface WorldStoryHarnessProps {
  children: ReactNode;
  patterns?: MidiPattern[];
  onTrigger?: MidiTriggerHandler;
}

// A Storybook harness for stories that need to look and feel like the real
// app's canvas (World's dot-grid backdrop) and need a note source to drive
// a real audio bridge (MidiBox's transport bar, without the node-card
// chrome). Not used by World.tsx itself - Storybook-only.
export function WorldStoryHarness({
  children,
  patterns,
  onTrigger,
}: WorldStoryHarnessProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <WorldBackground />
      <div className="relative flex flex-col h-full">
        <PlaybackHarnessBar patterns={patterns} onTrigger={onTrigger} />
        <div className="flex-1 flex items-center justify-center overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
