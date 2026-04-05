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

function arrayBufferToBase64(opts: { arrayBuffer: ArrayBuffer }): string {
  const bytes = new Uint8Array(opts.arrayBuffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

async function blobToDataUrl({ blob }: { blob: Blob }): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = arrayBufferToBase64({ arrayBuffer });
  const mediaType = blob.type || "application/octet-stream";
  return `data:${mediaType};base64,${base64}`;
}

async function toSerializableNode({
  node,
}: {
  node: AppNode;
}): Promise<AppNode> {
  if (node.type !== "movie") {
    return node;
  }

  const videoUrl = node.data.generatedVideoUrl;
  if (!videoUrl?.startsWith("blob:")) {
    return node;
  }

  const response = await fetch(videoUrl);
  if (!response.ok) {
    return node;
  }

  const videoBlob = await response.blob();
  const dataUrl = await blobToDataUrl({ blob: videoBlob });

  return {
    ...node,
    data: {
      ...node.data,
      generatedVideoUrl: dataUrl,
    },
  };
}

export async function serializeProject(): Promise<string> {
  const { nodes, globalSettings } = useFlowStore.getState();
  const serializableNodes = await Promise.all(
    nodes.map(async (node) => await toSerializableNode({ node }))
  );
  const data: ProjectData = {
    version: 1,
    nodes: serializableNodes,
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

function normalizeNameToHyphenCase({ value }: { value: string }): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureUniqueFilePath(opts: {
  path: string;
  usedPaths: Set<string>;
}): string {
  if (!opts.usedPaths.has(opts.path)) {
    opts.usedPaths.add(opts.path);
    return opts.path;
  }

  const extensionIndex = opts.path.lastIndexOf(".");
  const hasExtension = extensionIndex > 0;
  const basePath = hasExtension
    ? opts.path.slice(0, extensionIndex)
    : opts.path;
  const extension = hasExtension ? opts.path.slice(extensionIndex) : "";

  let index = 2;
  while (true) {
    const nextPath = `${basePath}-${index}${extension}`;
    if (!opts.usedPaths.has(nextPath)) {
      opts.usedPaths.add(nextPath);
      return nextPath;
    }
    index += 1;
  }
}

function stripFileExtension({ path }: { path: string }): string {
  const extensionIndex = path.lastIndexOf(".");
  if (extensionIndex === -1) {
    return path;
  }
  return path.slice(0, extensionIndex);
}

export function collectAssets({ nodes }: { nodes: AppNode[] }): AssetEntry[] {
  const assets: AssetEntry[] = [];
  const usedPaths = new Set<string>();

  const locationNodes = nodes.filter((node) => node.type === "location");
  for (const node of locationNodes) {
    if (!node.data.generatedImage) {
      continue;
    }
    const normalized = normalizeNameToHyphenCase({ value: node.data.name });
    const baseName = normalized || "location";
    const path = ensureUniqueFilePath({
      path: `locations/${baseName}.${getImageExtension({ dataUrl: node.data.generatedImage })}`,
      usedPaths,
    });
    assets.push(
      imageAssetEntry({
        dataUrl: node.data.generatedImage,
        path: stripFileExtension({ path }),
      })
    );
  }

  const characterNodes = nodes.filter((node) => node.type === "character");
  for (const node of characterNodes) {
    const normalized = normalizeNameToHyphenCase({ value: node.data.name });
    const baseName = normalized || "character";

    if (node.data.frontalImage) {
      const path = ensureUniqueFilePath({
        path: `characters/${baseName}-front.${getImageExtension({ dataUrl: node.data.frontalImage })}`,
        usedPaths,
      });
      assets.push(
        imageAssetEntry({
          dataUrl: node.data.frontalImage,
          path: stripFileExtension({ path }),
        })
      );
    }

    if (node.data.sideImage) {
      const path = ensureUniqueFilePath({
        path: `characters/${baseName}-side.${getImageExtension({ dataUrl: node.data.sideImage })}`,
        usedPaths,
      });
      assets.push(
        imageAssetEntry({
          dataUrl: node.data.sideImage,
          path: stripFileExtension({ path }),
        })
      );
    }
  }

  const storyImageNodes = nodes.filter((node) => node.type === "storyImage");
  for (const [index, node] of storyImageNodes.entries()) {
    if (!node.data.generatedImage) {
      continue;
    }
    const storyNumber = String(index + 1).padStart(2, "0");
    const path = ensureUniqueFilePath({
      path: `story-frames/${storyNumber}.${getImageExtension({ dataUrl: node.data.generatedImage })}`,
      usedPaths,
    });
    assets.push(
      imageAssetEntry({
        dataUrl: node.data.generatedImage,
        path: stripFileExtension({ path }),
      })
    );
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
