import type { AppNode } from "@/lib/types";

export const NODE_WIDTHS: Record<string, number> = {
  style: 288,
  setting: 288,
  location: 320,
  character: 320,
  storyImage: 384,
  movie: 384,
  comicStrip: 384,
};

export const NODE_HEIGHTS: Record<string, number> = {
  style: 200,
  setting: 200,
  location: 400,
  character: 500,
  storyImage: 550,
  movie: 350,
  comicStrip: 440,
};

const ROW_GAP = 60;
const COL_GAP = 40;
export const NODE_GAP = COL_GAP;

const ROW_ORDER: string[][] = [
  ["style", "setting"],
  ["location", "character"],
  ["storyImage"],
  ["movie", "comicStrip"],
];

interface RowEntry {
  nodes: AppNode[];
}

function buildRowEntries(opts: { nodes: AppNode[] }): RowEntry[][] {
  return ROW_ORDER.map((typeGroup) =>
    typeGroup
      .map((nodeType) => {
        const nodes = opts.nodes.filter((n) => n.type === nodeType);
        return { nodes };
      })
      .filter((entry) => entry.nodes.length > 0)
  );
}

const ROW_HEIGHT_BUFFER = 12;

function getNodeWidth(opts: { node: AppNode }): number {
  const measuredWidth = opts.node.measured?.width;
  if (typeof measuredWidth === "number" && measuredWidth > 0) {
    return measuredWidth;
  }
  return NODE_WIDTHS[opts.node.type ?? ""] ?? 320;
}

function getNodeHeight(opts: { node: AppNode }): number {
  const measuredHeight = opts.node.measured?.height;
  if (typeof measuredHeight === "number" && measuredHeight > 0) {
    return measuredHeight;
  }
  return NODE_HEIGHTS[opts.node.type ?? ""] ?? 300;
}

function computeRowWidth(opts: { entries: RowEntry[] }): number {
  let total = 0;
  for (const entry of opts.entries) {
    const typeWidth = entry.nodes.reduce(
      (sum, node) => sum + getNodeWidth({ node }),
      0
    );
    total += typeWidth + COL_GAP * (entry.nodes.length - 1);
  }
  if (opts.entries.length > 1) {
    total += COL_GAP * (opts.entries.length - 1);
  }
  return total;
}

/**
 * Computes position for every node based on type hierarchy.
 * Row 1: Style + Setting
 * Row 2: Location nodes + Character nodes
 * Row 3: Story Image nodes
 * Row 4: Movie + Comic Strip nodes
 *
 * Nodes within each row are centered relative to the widest row.
 */
export function computeLayoutPositions(opts: {
  nodes: AppNode[];
}): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const rowEntries = buildRowEntries({ nodes: opts.nodes });

  const maxRowWidth = Math.max(
    ...rowEntries.map((entries) => computeRowWidth({ entries })),
    0
  );

  let y = 0;
  for (const entries of rowEntries) {
    if (entries.length === 0) {
      continue;
    }

    const rowWidth = computeRowWidth({ entries });
    let x = (maxRowWidth - rowWidth) / 2;

    let maxHeight = 0;
    for (const entry of entries) {
      for (const node of entry.nodes) {
        const w = getNodeWidth({ node });
        const h = getNodeHeight({ node });
        positions.set(node.id, { x: Math.round(x), y });
        x += w + COL_GAP;
        maxHeight = Math.max(maxHeight, h + ROW_HEIGHT_BUFFER);
      }
    }

    y += maxHeight + ROW_GAP;
  }

  return positions;
}

export function computeNodePosition(opts: {
  nodes: AppNode[];
  nodeId: string;
}): { x: number; y: number } {
  const positions = computeLayoutPositions({ nodes: opts.nodes });
  return positions.get(opts.nodeId) ?? { x: 0, y: 0 };
}

interface Rect {
  height: number;
  width: number;
  x: number;
  y: number;
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function nodeToRect(node: AppNode): Rect {
  return {
    x: node.position.x,
    y: node.position.y,
    width: NODE_WIDTHS[node.type ?? ""] ?? 320,
    height: NODE_HEIGHTS[node.type ?? ""] ?? 300,
  };
}

function pushApart(moved: Rect, other: Rect): void {
  const overlapX =
    Math.min(moved.x + moved.width, other.x + other.width) -
    Math.max(moved.x, other.x);
  const overlapY =
    Math.min(moved.y + moved.height, other.y + other.height) -
    Math.max(moved.y, other.y);

  if (overlapX < overlapY) {
    moved.x =
      moved.x < other.x
        ? other.x - moved.width - NODE_GAP
        : other.x + other.width + NODE_GAP;
  } else {
    moved.y =
      moved.y < other.y
        ? other.y - moved.height - NODE_GAP
        : other.y + other.height + NODE_GAP;
  }
}

export function resolveOverlap(opts: {
  movedNode: AppNode;
  nodes: AppNode[];
}): { x: number; y: number } | null {
  const movedRect = nodeToRect(opts.movedNode);
  let hasOverlap = false;

  for (const other of opts.nodes) {
    if (other.id === opts.movedNode.id) {
      continue;
    }
    const otherRect = nodeToRect(other);
    if (rectsOverlap(movedRect, otherRect)) {
      hasOverlap = true;
      pushApart(movedRect, otherRect);
    }
  }

  return hasOverlap
    ? { x: Math.round(movedRect.x), y: Math.round(movedRect.y) }
    : null;
}
