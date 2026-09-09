// A decaying-peak source for event-driven signals that have no continuous
// audio-rate signal to tap (a MIDI/keyboard note-on, a UI trigger) - call
// trigger() whenever the event fires, and getValue() is what Meter polls.
// Meter itself never owns this shaping (see repo issue #32); this is the
// generic version of that shaping logic, reusable by any discrete source.
export function createSpikeMeterSource(decayPerSecond = 1.2) {
  let peak = 0;
  let lastTime = performance.now();

  return {
    trigger(velocity: number) {
      peak = Math.max(peak, velocity);
    },
    getValue(): number {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      peak = Math.max(0, peak - decayPerSecond * dt);
      return peak;
    },
  };
}
