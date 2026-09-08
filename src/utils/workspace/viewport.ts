/**
 * Convert a point from content-space to viewport-space
 * @param contentX - x position in content coordinates
 * @param contentY - y position in content coordinates
 * @param state - react-zoom-pan-pinch state
 */
export function contentToViewport(
  contentX: number,
  contentY: number,
  state: { scale: number; positionX: number; positionY: number }
) {
  const { scale, positionX, positionY } = state;
  return {
    x: contentX * scale + positionX,
    y: contentY * scale + positionY,
  };
}

/**
 * Convert a point from viewport-space back to content-space
 */
export function viewportToContent(
  viewportX: number,
  viewportY: number,
  state: { scale: number; positionX: number; positionY: number }
) {
  const { scale, positionX, positionY } = state;
  return {
    x: (viewportX - positionX) / scale,
    y: (viewportY - positionY) / scale,
  };
}

/**
 * Convert a raw client (`event.clientX/clientY`) point to content-space.
 * `host` is the untransformed element the pan/zoom wrapper is mounted in
 * (its bounding rect is viewport-space's own origin), so subtracting its
 * rect turns a page coordinate into a viewport-space one `viewportToContent`
 * can consume.
 */
export function clientPointToContent(
  clientX: number,
  clientY: number,
  host: HTMLElement,
  state: { scale: number; positionX: number; positionY: number }
) {
  const hostRect = host.getBoundingClientRect();
  return viewportToContent(clientX - hostRect.left, clientY - hostRect.top, state);
}

/**
 * Convert the center of a rendered element to content-space, via the same
 * `host` + `state` as `clientPointToContent`. Useful for anchoring a visual
 * (e.g. a connection endpoint) to wherever a DOM element currently is.
 */
export function elementCenterToContent(
  el: HTMLElement,
  host: HTMLElement,
  state: { scale: number; positionX: number; positionY: number }
) {
  const rect = el.getBoundingClientRect();
  return clientPointToContent(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    host,
    state
  );
}
