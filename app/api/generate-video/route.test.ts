import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  experimental_generateVideo: vi.fn(),
}));

import { experimental_generateVideo } from "ai";
import { POST } from "./route";

const mockGenerateVideo = vi.mocked(experimental_generateVideo);

describe("POST /api/generate-video", () => {
  it("returns video binary on success", async () => {
    const videoData = new Uint8Array([1, 2, 3, 4]);
    mockGenerateVideo.mockResolvedValueOnce({
      video: { uint8Array: videoData, mediaType: "video/mp4" },
    } as never);

    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "base64img",
        sceneDescription: "A walk through the city",
        model: "google/veo-3.1-generate-001",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("video/mp4");

    const buffer = await response.arrayBuffer();
    expect(new Uint8Array(buffer)).toEqual(videoData);

    expect(mockGenerateVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/veo-3.1-generate-001",
        prompt: {
          image: "base64img",
          text: "A walk through the city",
        },
      })
    );
  });

  it("returns 400 when storyImageData is missing", async () => {
    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneDescription: "A walk",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Story image data is required");
  });

  it("returns 400 when sceneDescription is missing", async () => {
    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "img",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Scene description is required");
  });

  it("returns 500 when no video is generated", async () => {
    mockGenerateVideo.mockResolvedValueOnce({
      video: { uint8Array: null, mediaType: null },
    } as never);

    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "img",
        sceneDescription: "A scene",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("No video was generated");
  });

  it("uses default model when none specified", async () => {
    const videoData = new Uint8Array([5, 6]);
    mockGenerateVideo.mockResolvedValueOnce({
      video: { uint8Array: videoData, mediaType: "video/mp4" },
    } as never);

    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "img",
        sceneDescription: "scene",
      }),
    });

    await POST(request);

    expect(mockGenerateVideo).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/veo-3.1-generate-001",
      })
    );
  });
});
