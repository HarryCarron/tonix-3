// replaces the legacy GlobalEventHandlers.initiate(onMouseMove): arms
// window-level mousemove tracking that removes itself after one mouseup
export function trackGlobalMouseMove(
  onMouseMove: (e: globalThis.MouseEvent) => void,
) {
  const stop = () => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", stop);
  };

  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", stop);
}
