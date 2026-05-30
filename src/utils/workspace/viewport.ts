/**
 * Convert a point from content-space to viewport-space
 * @param contentX - x position in content coordinates
 * @param contentY - y position in content coordinates
 * @param state - react-zoom-pan-pinch state
 */
function contentToViewport(
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
function viewportToContent(
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
