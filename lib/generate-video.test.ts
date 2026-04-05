import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  experimental_generateVideo: vi.fn(),
}));

import { experimental_generateVideo } from "ai";
import { generateVideo } from "@/lib/generate-video";

const mockGenerateVideoWithModel = vi.mocked(experimental_generateVideo);

describe("generateVideo", () => {
  it("returns binary response when generation succeeds", async () => {
    const videoData = new Uint8Array([1, 2, 3, 4]);
    mockGenerateVideoWithModel.mockResolvedValueOnce({
      video: { uint8Array: videoData, mediaType: "video/mp4" },
    } as never);

    const response = await generateVideo({
      model: "google/veo-3.1-generate-001",
      prompt: {
        image: "base64img",
        text: "A walk through the city",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");
    const body = await response.arrayBuffer();
    expect(new Uint8Array(body)).toEqual(videoData);
  });

  it("returns 500 json when no video is generated", async () => {
    mockGenerateVideoWithModel.mockResolvedValueOnce({
      video: { uint8Array: null, mediaType: null },
    } as never);

    const response = await generateVideo({
      model: "google/veo-3.1-generate-001",
      prompt: {
        image: "base64img",
        text: "A walk through the city",
      },
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("No video was generated");
  });
});
