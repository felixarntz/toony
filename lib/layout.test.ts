import { describe, expect, it } from "vitest";
import {
  computeLayoutPositions,
  computeNodePosition,
  resolveOverlap,
} from "./layout";
import type { AppNode } from "./types";

function makeNode(opts: {
  id: string;
  type: string;
  measuredHeight?: number;
  measuredWidth?: number;
}): AppNode {
  const node = {
    id: opts.id,
    type: opts.type,
    position: { x: 0, y: 0 },
    data: {},
  } as AppNode;

  if (opts.measuredWidth || opts.measuredHeight) {
    node.measured = {
      width: opts.measuredWidth,
      height: opts.measuredHeight,
    };
  }

  return node;
}

function getPos(opts: {
  positions: Map<string, { x: number; y: number }>;
  id: string;
}): { x: number; y: number } {
  const pos = opts.positions.get(opts.id);
  if (!pos) {
    throw new Error(`Position not found for node ${opts.id}`);
  }
  return pos;
}

describe("computeLayoutPositions", () => {
  it("positions style and setting side by side on row 1", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const stylePos = getPos({ positions, id: "style" });
    const settingPos = getPos({ positions, id: "setting" });
    expect(stylePos.y).toBe(settingPos.y);
    expect(settingPos.x).toBeGreaterThan(stylePos.x);
  });

  it("positions location nodes on row 2 below style/setting", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const stylePos = getPos({ positions, id: "style" });
    const locPos = getPos({ positions, id: "location-1" });
    expect(locPos.y).toBeGreaterThan(stylePos.y);
  });

  it("positions character nodes on same row as location nodes", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location" }),
      makeNode({ id: "character-1", type: "character" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const locPos = getPos({ positions, id: "location-1" });
    const charPos = getPos({ positions, id: "character-1" });
    expect(locPos.y).toBe(charPos.y);
    expect(charPos.x).toBeGreaterThan(locPos.x);
  });

  it("positions story image nodes on row 3 below locations/characters", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location" }),
      makeNode({ id: "character-1", type: "character" }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const charPos = getPos({ positions, id: "character-1" });
    const siPos = getPos({ positions, id: "storyImage-1" });
    expect(siPos.y).toBeGreaterThan(charPos.y);
  });

  it("positions movie node on row 4 below story images", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
      makeNode({ id: "movie", type: "movie" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const siPos = getPos({ positions, id: "storyImage-1" });
    const moviePos = getPos({ positions, id: "movie" });
    expect(moviePos.y).toBeGreaterThan(siPos.y);
  });

  it("positions comic strip node on row 4 below story images", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
      makeNode({ id: "comic-strip-1", type: "comicStrip" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const siPos = getPos({ positions, id: "storyImage-1" });
    const comicPos = getPos({ positions, id: "comic-strip-1" });
    expect(comicPos.y).toBeGreaterThan(siPos.y);
  });

  it("places multiple story images side by side", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
      makeNode({ id: "storyImage-2", type: "storyImage" }),
      makeNode({ id: "storyImage-3", type: "storyImage" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const si1 = getPos({ positions, id: "storyImage-1" });
    const si2 = getPos({ positions, id: "storyImage-2" });
    const si3 = getPos({ positions, id: "storyImage-3" });
    expect(si1.y).toBe(si2.y);
    expect(si2.y).toBe(si3.y);
    expect(si2.x).toBeGreaterThan(si1.x);
    expect(si3.x).toBeGreaterThan(si2.x);
  });

  it("places multiple locations and characters side by side on row 2", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location" }),
      makeNode({ id: "location-2", type: "location" }),
      makeNode({ id: "character-1", type: "character" }),
      makeNode({ id: "character-2", type: "character" }),
      makeNode({ id: "character-3", type: "character" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const loc1 = getPos({ positions, id: "location-1" });
    const loc2 = getPos({ positions, id: "location-2" });
    const char1 = getPos({ positions, id: "character-1" });
    const char2 = getPos({ positions, id: "character-2" });
    const char3 = getPos({ positions, id: "character-3" });

    expect(loc1.y).toBe(loc2.y);
    expect(loc1.y).toBe(char1.y);
    expect(char1.y).toBe(char2.y);
    expect(char2.y).toBe(char3.y);

    expect(loc2.x).toBeGreaterThan(loc1.x);
    expect(char1.x).toBeGreaterThan(loc2.x);
    expect(char2.x).toBeGreaterThan(char1.x);
    expect(char3.x).toBeGreaterThan(char2.x);
  });

  it("handles empty nodes array", () => {
    const positions = computeLayoutPositions({ nodes: [] });
    expect(positions.size).toBe(0);
  });

  it("skips empty rows", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const stylePos = getPos({ positions, id: "style" });
    const siPos = getPos({ positions, id: "storyImage-1" });
    expect(siPos.y).toBeGreaterThan(stylePos.y);
    expect(siPos.y).toBe(272);
  });

  it("uses measured story image height to place terminal row without overlap", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({
        id: "storyImage-1",
        type: "storyImage",
        measuredHeight: 680,
      }),
      makeNode({ id: "comic-strip-1", type: "comicStrip" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const siPos = getPos({ positions, id: "storyImage-1" });
    const comicPos = getPos({ positions, id: "comic-strip-1" });
    expect(comicPos.y).toBe(siPos.y + 680 + 12 + 60);
  });

  it("uses tallest measured node in location and character row", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location", measuredHeight: 420 }),
      makeNode({ id: "character-1", type: "character", measuredHeight: 640 }),
      makeNode({ id: "storyImage-1", type: "storyImage" }),
    ];
    const positions = computeLayoutPositions({ nodes });

    const row2Pos = getPos({ positions, id: "location-1" });
    const storyPos = getPos({ positions, id: "storyImage-1" });
    expect(storyPos.y).toBe(row2Pos.y + 640 + 12 + 60);
  });
});

describe("computeNodePosition", () => {
  it("returns position for a specific node", () => {
    const nodes: AppNode[] = [
      makeNode({ id: "style", type: "style" }),
      makeNode({ id: "setting", type: "setting" }),
      makeNode({ id: "location-1", type: "location" }),
    ];
    const pos = computeNodePosition({ nodes, nodeId: "location-1" });
    expect(pos.y).toBeGreaterThan(0);
  });

  it("returns {0,0} for unknown node id", () => {
    const nodes: AppNode[] = [makeNode({ id: "style", type: "style" })];
    const pos = computeNodePosition({ nodes, nodeId: "nonexistent" });
    expect(pos).toEqual({ x: 0, y: 0 });
  });
});

describe("resolveOverlap", () => {
  function makeNodeAt(opts: {
    id: string;
    type: string;
    x: number;
    y: number;
  }): AppNode {
    return {
      id: opts.id,
      type: opts.type,
      position: { x: opts.x, y: opts.y },
      data: {},
    } as AppNode;
  }

  it("returns null when no overlap", () => {
    const nodeA = makeNodeAt({ id: "a", type: "location", x: 0, y: 0 });
    const nodeB = makeNodeAt({ id: "b", type: "location", x: 500, y: 0 });

    const result = resolveOverlap({
      movedNode: nodeA,
      nodes: [nodeA, nodeB],
    });
    expect(result).toBeNull();
  });

  it("pushes node apart when overlapping", () => {
    const nodeA = makeNodeAt({ id: "a", type: "location", x: 100, y: 0 });
    const nodeB = makeNodeAt({ id: "b", type: "location", x: 110, y: 0 });

    const result = resolveOverlap({
      movedNode: nodeA,
      nodes: [nodeA, nodeB],
    });
    expect(result).not.toBeNull();
    expect(result?.x).toBeLessThan(nodeB.position.x);
  });

  it("maintains gap between pushed nodes", () => {
    const nodeA = makeNodeAt({ id: "a", type: "style", x: 0, y: 0 });
    const nodeB = makeNodeAt({ id: "b", type: "style", x: 10, y: 0 });

    const result = resolveOverlap({
      movedNode: nodeA,
      nodes: [nodeA, nodeB],
    });
    expect(result).not.toBeNull();
  });
});
