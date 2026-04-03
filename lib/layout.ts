import type { AppNode } from "@/lib/types";

const NODE_WIDTHS: Record<string, number> = {
  style: 288,
  setting: 288,
  location: 320,
  character: 320,
  storyImage: 384,
  movie: 384,
};

const ROW_GAP = 100;
const COL_GAP = 40;

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
      const nodesOfType = opts.nodes.filter((n) => n.type === entry.nodeType);
      for (const node of nodesOfType) {
        positions.set(node.id, { x: Math.round(x), y });
        x += w + COL_GAP;
      }
      maxHeight = Math.max(maxHeight, 300);
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
