import type { AppNode } from "@/lib/types";

export const NODE_WIDTHS: Record<string, number> = {
  style: 288,
  setting: 288,
  location: 320,
  character: 320,
  storyImage: 384,
  movie: 384,
};

export const NODE_HEIGHTS: Record<string, number> = {
  style: 200,
  setting: 200,
  location: 400,
  character: 500,
  storyImage: 550,
  movie: 350,
};

const ROW_GAP = 60;
const COL_GAP = 40;
export const NODE_GAP = COL_GAP;

const ROW_ORDER: string[][] = [
  ["style", "setting"],
  ["location", "character"],
  ["storyImage"],
  ["movie"],
];

interface RowEntry {
  count: number;
  nodeType: string;
}

function buildRowEntries(opts: { nodes: AppNode[] }): RowEntry[][] {
  return ROW_ORDER.map((typeGroup) =>
    typeGroup
      .map((nodeType) => ({
        nodeType,
        count: opts.nodes.filter((n) => n.type === nodeType).length,
      }))
      .filter((entry) => entry.count > 0)
  );
}

function computeRowWidth(opts: { entries: RowEntry[] }): number {
  let total = 0;
  for (const entry of opts.entries) {
    const w = NODE_WIDTHS[entry.nodeType] ?? 320;
    total += w * entry.count + COL_GAP * (entry.count - 1);
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
 * Row 4: Movie node
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
      const w = NODE_WIDTHS[entry.nodeType] ?? 320;
      const h = NODE_HEIGHTS[entry.nodeType] ?? 300;
      const nodesOfType = opts.nodes.filter((n) => n.type === entry.nodeType);
      for (const node of nodesOfType) {
        positions.set(node.id, { x: Math.round(x), y });
        x += w + COL_GAP;
      }
      maxHeight = Math.max(maxHeight, h);
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
