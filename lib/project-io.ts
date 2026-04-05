import { zipSync } from "fflate";
import { computeEdges, useFlowStore } from "@/lib/store";
import type { AppNode } from "@/lib/types";

interface ProjectData {
  globalSettings: {
    imageModel: string;
    videoModel: string;
  };
  nodes: AppNode[];
  version: 1;
}

export function serializeProject(): string {
  const { nodes, globalSettings } = useFlowStore.getState();
  const data: ProjectData = {
    version: 1,
    nodes,
    globalSettings,
  };
  return JSON.stringify(data, null, 2);
}

export function deserializeProject({ json }: { json: string }): void {
  const data = JSON.parse(json) as ProjectData;
  if (data.version !== 1) {
    throw new Error(`Unsupported project version: ${data.version}`);
  }
  if (!Array.isArray(data.nodes)) {
    throw new Error("Invalid project data: missing nodes array");
  }
  const edges = computeEdges(data.nodes);
  useFlowStore.setState({
    nodes: data.nodes,
    edges,
    globalSettings: data.globalSettings,
  });
}

export function downloadJson({
  content,
  filename,
}: {
  content: string;
  filename: string;
}): void {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function base64ToUint8Array({ base64 }: { base64: string }): Uint8Array {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

function stripDataUrlPrefix({ dataUrl }: { dataUrl: string }): string {
  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return dataUrl;
  }
  return dataUrl.slice(commaIndex + 1);
}

function getImageExtension({ dataUrl }: { dataUrl: string }): string {
  if (dataUrl.startsWith("data:image/png")) {
    return "png";
  }
  if (dataUrl.startsWith("data:image/webp")) {
    return "webp";
  }
  return "png";
}

interface AssetEntry {
  data: Uint8Array;
  path: string;
}

function imageAssetEntry({
  dataUrl,
  path,
}: {
  dataUrl: string;
  path: string;
}): AssetEntry {
  const ext = getImageExtension({ dataUrl });
  const raw = stripDataUrlPrefix({ dataUrl });
  return {
    path: `${path}.${ext}`,
    data: base64ToUint8Array({ base64: raw }),
  };
}

function collectStoryImageAssets(opts: {
  generatedImage: string | null;
  generatedImage16x9: string | null;
  nodeId: string;
}): AssetEntry[] {
  if (!(opts.generatedImage || opts.generatedImage16x9)) {
    return [];
  }

  const entries: AssetEntry[] = [];
  if (opts.generatedImage) {
    entries.push(
      imageAssetEntry({
        dataUrl: opts.generatedImage,
        path: `story-frames/${opts.nodeId}`,
      })
    );
  }
  if (opts.generatedImage16x9) {
    entries.push(
      imageAssetEntry({
        dataUrl: opts.generatedImage16x9,
        path: `story-frames-16x9/${opts.nodeId}`,
      })
    );
  }
  return entries;
}

function collectNodeAssets({ node }: { node: AppNode }): AssetEntry[] {
  switch (node.type) {
    case "location":
      if (node.data.generatedImage) {
        return [
          imageAssetEntry({
            dataUrl: node.data.generatedImage,
            path: `locations/${node.id}`,
          }),
        ];
      }
      return [];
    case "character": {
      const entries: AssetEntry[] = [];
      if (node.data.frontalImage) {
        entries.push(
          imageAssetEntry({
            dataUrl: node.data.frontalImage,
            path: `characters/${node.id}-front`,
          })
        );
      }
      if (node.data.sideImage) {
        entries.push(
          imageAssetEntry({
            dataUrl: node.data.sideImage,
            path: `characters/${node.id}-side`,
          })
        );
      }
      return entries;
    }
    case "storyImage":
      return collectStoryImageAssets({
        generatedImage: node.data.generatedImage,
        generatedImage16x9: node.data.generatedImage16x9,
        nodeId: node.id,
      });
    case "movie":
      if (node.data.generatedVideoUrl?.startsWith("data:")) {
        const raw = stripDataUrlPrefix({
          dataUrl: node.data.generatedVideoUrl,
        });
        return [
          {
            path: "movie/movie.mp4",
            data: base64ToUint8Array({ base64: raw }),
          },
        ];
      }
      return [];
    case "comicStrip": {
      const entries: AssetEntry[] = [];
      if (node.data.generatedPngUrl?.startsWith("data:image/")) {
        entries.push(
          imageAssetEntry({
            dataUrl: node.data.generatedPngUrl,
            path: "comic-strip/comic-strip",
          })
        );
      }
      if (node.data.generatedPdfUrl?.startsWith("data:application/pdf")) {
        const raw = stripDataUrlPrefix({
          dataUrl: node.data.generatedPdfUrl,
        });
        entries.push({
          path: "comic-strip/comic-strip.pdf",
          data: base64ToUint8Array({ base64: raw }),
        });
      }
      return entries;
    }
    default:
      return [];
  }
}

export function collectAssets({ nodes }: { nodes: AppNode[] }): AssetEntry[] {
  const assets: AssetEntry[] = [];
  for (const node of nodes) {
    assets.push(...collectNodeAssets({ node }));
  }
  return assets;
}

export function buildZipBlob({ assets }: { assets: AssetEntry[] }): Blob {
  const files: Record<string, Uint8Array> = {};
  for (const asset of assets) {
    files[asset.path] = asset.data;
  }
  const zipped = zipSync(files);
  return new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
}

export function downloadBlob({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
