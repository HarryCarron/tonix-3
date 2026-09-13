import { Midi } from "@tonejs/midi";
import type { MidiPattern } from "@/components/nodes/midi-box/MidiPattern";

export interface LoadedMidiFile {
  name: string;
  pattern: MidiPattern;
  // seconds - the file's own real length, not a musical-bar loop like the
  // hardcoded TEST_PATTERNS use
  loopLength: number;
}

// Parses a .mid file into the same {time, note, duration, velocity} shape
// TEST_PATTERNS already uses, so it can be fed straight into a Tone.Part
// the same way. @tonejs/midi's own Note.time/duration are already in
// seconds (not bars:beats:sixteenths like the hardcoded patterns), which
// Tone.Part accepts natively as plain numbers.
export async function loadMidiFilePattern(
  url: string,
  // overrides the file's own embedded track name (e.g. an instrument/patch
  // name like "Clean Guitar") when a more meaningful label is wanted
  nameOverride?: string,
): Promise<LoadedMidiFile> {
  const midi = await Midi.fromUrl(url);

  const pattern: MidiPattern = midi.tracks.flatMap((track) =>
    track.notes.map((note) => ({
      time: note.time,
      note: note.name,
      duration: note.duration,
      velocity: note.velocity,
    })),
  );

  return {
    name: nameOverride || midi.name || "Imported MIDI",
    pattern,
    loopLength: midi.duration,
  };
}
