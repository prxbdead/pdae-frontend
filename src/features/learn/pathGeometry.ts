export const NODE_ROW_HEIGHT = 116;
export const CHEST_HEIGHT = 76;
export const PATH_AMPLITUDE = 72;

/**
 * Alternate the nodes left/right of centre. The curve's cubic control points
 * turn each swing into a smooth sweep rather than a straight zigzag.
 */
export function nodeOffsetX(index: number): number {
  return (index % 2 === 0 ? -1 : 1) * PATH_AMPLITUDE;
}

export function nodeCenterY(index: number): number {
  return (
    index * NODE_ROW_HEIGHT +
    NODE_ROW_HEIGHT / 2 +
    Math.floor(index / 4) * CHEST_HEIGHT
  );
}

export function nodesHeight(count: number): number {
  return count * NODE_ROW_HEIGHT + Math.floor(count / 4) * CHEST_HEIGHT;
}
