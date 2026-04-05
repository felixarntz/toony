"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";
import { Download, FileImage, FileText, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import { PDFDocument } from "pdf-lib";
import { useCallback, useMemo } from "react";
import { RemoveNodeButton } from "@/components/canvas/remove-node-button";
import { Button } from "@/components/ui/button";
import { useFlowStore } from "@/lib/store";
import type { ComicStripNodeType, StoryImageNodeData } from "@/lib/types";

const MAX_COMIC_FRAMES = 6;
const PANELS_PER_ROW = 2;
const PANEL_HEIGHT = 900;
const PANEL_BORDER_WIDTH = 16;
const PANEL_GAP = 24;
const CANVAS_PADDING = 28;

interface ComicImageSource {
  src: string;
}

interface FittedRect {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface PanelSize {
  panelHeight: number;
  panelWidth: number;
}

interface ComicPanelLayout {
  image: HTMLImageElement;
  panelHeight: number;
  panelWidth: number;
  panelX: number;
  panelY: number;
}

interface ComicStripLayout {
  canvasHeight: number;
  canvasWidth: number;
  panels: ComicPanelLayout[];
}

interface ImageDimensions {
  height: number;
  width: number;
}

function ensureDataImageUrl(opts: { value: string }): string {
  if (opts.value.startsWith("data:image/")) {
    return opts.value;
  }
  return `data:image/png;base64,${opts.value}`;
}

function loadImageElement(opts: { src: string }): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load comic panel image"));
    image.src = opts.src;
  });
}

export function fitImageInPanel(opts: {
  imageHeight: number;
  imageWidth: number;
  panelHeight: number;
  panelWidth: number;
  panelX: number;
  panelY: number;
}): FittedRect {
  const scale = Math.min(
    opts.panelWidth / opts.imageWidth,
    opts.panelHeight / opts.imageHeight
  );
  const width = opts.imageWidth * scale;
  const height = opts.imageHeight * scale;
  const x = opts.panelX + (opts.panelWidth - width) / 2;
  const y = opts.panelY + (opts.panelHeight - height) / 2;

  return { x, y, width, height };
}

export function getPanelSizeFromFrame(opts: {
  imageHeight: number;
  imageWidth: number;
}): PanelSize {
  const panelHeight = PANEL_HEIGHT;
  const frameAspectRatio =
    opts.imageHeight > 0 ? opts.imageWidth / opts.imageHeight : 1;

  return {
    panelHeight,
    panelWidth: Math.round(panelHeight * frameAspectRatio),
  };
}

export function getImageDimensionsFromPngDataUrl(opts: {
  dataUrl: string;
}): ImageDimensions | null {
  const [header, base64] = opts.dataUrl.split(",", 2);
  if (!(header?.startsWith("data:image/png;base64") && base64)) {
    return null;
  }

  const bytes = Uint8Array.from(
    Array.from(atob(base64), (c) => c.charCodeAt(0))
  );
  const hasIhdrChunk =
    bytes[12] === 73 &&
    bytes[13] === 72 &&
    bytes[14] === 68 &&
    bytes[15] === 82;
  if (bytes.length < 24 || !hasIhdrChunk) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export function buildComicStripLayout(opts: {
  images: HTMLImageElement[];
}): ComicStripLayout {
  const panelSpecs = opts.images.map((image, index) => {
    const row = Math.floor(index / PANELS_PER_ROW);
    const col = index % PANELS_PER_ROW;
    const { panelWidth, panelHeight } = getPanelSizeFromFrame({
      imageWidth: image.width,
      imageHeight: image.height,
    });

    return { row, col, panelWidth, panelHeight, image };
  });

  const rowHeights = panelSpecs.reduce<Map<number, number>>((acc, spec) => {
    const current = acc.get(spec.row) ?? 0;
    acc.set(spec.row, Math.max(current, spec.panelHeight));
    return acc;
  }, new Map());

  const rows = Math.ceil(opts.images.length / PANELS_PER_ROW);
  const rowOffsets = new Map<number, number>();
  let totalPanelHeight = 0;

  for (let row = 0; row < rows; row++) {
    rowOffsets.set(row, totalPanelHeight);
    totalPanelHeight += rowHeights.get(row) ?? 0;
  }

  const panels = panelSpecs.map((spec) => {
    const rowSpecs = panelSpecs.filter(
      (panelSpec) => panelSpec.row === spec.row
    );
    const panelX =
      CANVAS_PADDING +
      rowSpecs
        .filter((panelSpec) => panelSpec.col < spec.col)
        .reduce((acc, panelSpec) => acc + panelSpec.panelWidth + PANEL_GAP, 0);
    const panelY =
      CANVAS_PADDING +
      (rowOffsets.get(spec.row) ?? 0) +
      spec.row * PANEL_GAP +
      ((rowHeights.get(spec.row) ?? spec.panelHeight) - spec.panelHeight) / 2;

    return {
      image: spec.image,
      panelHeight: spec.panelHeight,
      panelWidth: spec.panelWidth,
      panelX,
      panelY,
    };
  });

  const rowWidths = Array.from({ length: rows }, (_, row) => {
    const specs = panelSpecs.filter((spec) => spec.row === row);
    const panelWidths = specs.reduce((acc, spec) => acc + spec.panelWidth, 0);
    const gaps = Math.max(0, specs.length - 1) * PANEL_GAP;
    return panelWidths + gaps;
  });
  const canvasWidth = Math.max(...rowWidths, 0) + CANVAS_PADDING * 2;
  const canvasHeight =
    totalPanelHeight + Math.max(0, rows - 1) * PANEL_GAP + CANVAS_PADDING * 2;

  return { panels, canvasWidth, canvasHeight };
}

function dataUrlToUint8Array(opts: { dataUrl: string }): Uint8Array {
  const base64 = opts.dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function uint8ArrayToBase64(opts: { bytes: Uint8Array }): string {
  let binary = "";

  for (const byte of opts.bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function downloadFromDataUrl(opts: {
  dataUrl: string;
  filename: string;
}): void {
  const link = document.createElement("a");
  link.href = opts.dataUrl;
  link.download = opts.filename;
  link.click();
}

async function renderComicStripPng(opts: {
  frames: ComicImageSource[];
}): Promise<string> {
  const loadedFrames = await Promise.all(
    opts.frames.map(({ src }) => loadImageElement({ src }))
  );
  const { panels, canvasWidth, canvasHeight } = buildComicStripLayout({
    images: loadedFrames,
  });

  const canvas = document.createElement("canvas");
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Failed to initialize comic-strip canvas context");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  for (const panel of panels) {
    context.fillStyle = "#ffffff";
    context.fillRect(
      panel.panelX,
      panel.panelY,
      panel.panelWidth,
      panel.panelHeight
    );

    context.save();
    context.beginPath();
    context.rect(
      panel.panelX,
      panel.panelY,
      panel.panelWidth,
      panel.panelHeight
    );
    context.clip();

    const fitted = fitImageInPanel({
      imageHeight: panel.image.height,
      imageWidth: panel.image.width,
      panelHeight: panel.panelHeight,
      panelWidth: panel.panelWidth,
      panelX: panel.panelX,
      panelY: panel.panelY,
    });
    context.drawImage(
      panel.image,
      fitted.x,
      fitted.y,
      fitted.width,
      fitted.height
    );
    context.restore();

    context.lineWidth = PANEL_BORDER_WIDTH;
    context.strokeStyle = "#000000";
    context.strokeRect(
      panel.panelX,
      panel.panelY,
      panel.panelWidth,
      panel.panelHeight
    );
  }

  return canvas.toDataURL("image/png");
}

async function renderComicStripPdf(opts: {
  pngDataUrl: string;
}): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const pngBytes = dataUrlToUint8Array({ dataUrl: opts.pngDataUrl });
  const embeddedImage = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: embeddedImage.width,
    height: embeddedImage.height,
  });

  const pdfBytes = await pdfDoc.save();
  const base64 = uint8ArrayToBase64({ bytes: pdfBytes });
  return `data:application/pdf;base64,${base64}`;
}

export function ComicStripNode({ id, data }: NodeProps<ComicStripNodeType>) {
  const removeComicStripNode = useFlowStore((s) => s.removeComicStripNode);
  const setComicStripGeneratedPngUrl = useFlowStore(
    (s) => s.setComicStripGeneratedPngUrl
  );
  const setComicStripGeneratedPdfUrl = useFlowStore(
    (s) => s.setComicStripGeneratedPdfUrl
  );
  const setComicStripIsGenerating = useFlowStore(
    (s) => s.setComicStripIsGenerating
  );
  const nodes = useFlowStore((s) => s.nodes);
  const previewImageDimensions = useMemo(() => {
    if (!data.generatedPngUrl) {
      return null;
    }

    return getImageDimensionsFromPngDataUrl({ dataUrl: data.generatedPngUrl });
  }, [data.generatedPngUrl]);

  const completedStoryImages = nodes
    .filter(
      (n) =>
        n.type === "storyImage" &&
        (n.data as StoryImageNodeData).generatedImage !== null
    )
    .slice(0, MAX_COMIC_FRAMES);

  const handleGenerate = useCallback(async () => {
    if (completedStoryImages.length === 0 || data.isGenerating) {
      return;
    }

    setComicStripIsGenerating({ nodeId: id, isGenerating: true });

    try {
      const frames = completedStoryImages.map((node) => {
        const storyData = node.data as StoryImageNodeData;

        return {
          src: ensureDataImageUrl({ value: storyData.generatedImage ?? "" }),
        };
      });

      const pngDataUrl = await renderComicStripPng({ frames });
      const pdfDataUrl = await renderComicStripPdf({ pngDataUrl });

      setComicStripGeneratedPngUrl({ nodeId: id, url: pngDataUrl });
      setComicStripGeneratedPdfUrl({ nodeId: id, url: pdfDataUrl });
    } catch {
      setComicStripGeneratedPngUrl({ nodeId: id, url: null });
      setComicStripGeneratedPdfUrl({ nodeId: id, url: null });
    } finally {
      setComicStripIsGenerating({ nodeId: id, isGenerating: false });
    }
  }, [
    completedStoryImages,
    data.isGenerating,
    id,
    setComicStripGeneratedPdfUrl,
    setComicStripGeneratedPngUrl,
    setComicStripIsGenerating,
  ]);

  const handleDownloadPng = useCallback(() => {
    if (!data.generatedPngUrl) {
      return;
    }
    downloadFromDataUrl({
      dataUrl: data.generatedPngUrl,
      filename: "comic-strip.png",
    });
  }, [data.generatedPngUrl]);

  const handleDownloadPdf = useCallback(() => {
    if (!data.generatedPdfUrl) {
      return;
    }
    downloadFromDataUrl({
      dataUrl: data.generatedPdfUrl,
      filename: "comic-strip.pdf",
    });
  }, [data.generatedPdfUrl]);

  return (
    <div className="relative w-96 overflow-hidden rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)]">
      <Handle
        position={Position.Top}
        style={{ background: "var(--node-comic-strip)" }}
        type="target"
      />
      <div
        className="h-0.5"
        style={{ background: "var(--node-comic-strip)" }}
      />
      <div className="p-4">
        <RemoveNodeButton
          onClick={() => removeComicStripNode({ nodeId: id })}
        />
        <div
          className="mb-3 font-medium text-xs uppercase tracking-widest"
          style={{ color: "var(--node-comic-strip)" }}
        >
          Comic Strip
        </div>

        {data.isGenerating && (
          <div className="mb-3 flex items-center justify-center gap-2 py-2 text-muted-foreground text-xs">
            <Loader2 className="size-3 animate-spin" />
            Composing strip...
          </div>
        )}

        {!data.isGenerating && data.generatedPngUrl && (
          <div className="nodrag mb-3 overflow-hidden rounded border border-[var(--node-input-border)] bg-white p-2">
            <Image
              alt="Generated comic strip"
              className="w-full rounded"
              height={previewImageDimensions?.height ?? 1}
              src={data.generatedPngUrl}
              unoptimized
              width={previewImageDimensions?.width ?? 1}
            />
          </div>
        )}

        <div className="mb-2 text-muted-foreground text-xs">
          {completedStoryImages.length} completed story image
          {completedStoryImages.length === 1 ? "" : "s"} available
        </div>

        <Button
          className="nodrag mb-2 w-full"
          disabled={completedStoryImages.length === 0 || data.isGenerating}
          onClick={handleGenerate}
          size="sm"
        >
          {data.isGenerating ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Sparkles className="size-3" />
          )}
          {data.isGenerating ? "Generating..." : "Generate Comic Strip"}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button
            className="nodrag"
            disabled={!data.generatedPngUrl}
            onClick={handleDownloadPng}
            size="sm"
            variant="outline"
          >
            <FileImage className="size-3" />
            PNG
          </Button>
          <Button
            className="nodrag"
            disabled={!data.generatedPdfUrl}
            onClick={handleDownloadPdf}
            size="sm"
            variant="outline"
          >
            <FileText className="size-3" />
            PDF
          </Button>
        </div>

        {(data.generatedPngUrl || data.generatedPdfUrl) && (
          <div className="mt-2 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-1">
              <Download className="size-3" />
              Combined asset ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
