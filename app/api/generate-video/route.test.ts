import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/generate-video", () => ({
  generateVideo: vi.fn(),
}));

import { generateVideo } from "@/lib/generate-video";
import { POST } from "./route";

const mockGenerateVideo = vi.mocked(generateVideo);

describe("POST /api/generate-video", () => {
  it("returns video binary on success", async () => {
    const responseBody = new Uint8Array([1, 2, 3, 4]);
    mockGenerateVideo.mockResolvedValueOnce(
      new Response(responseBody.buffer as ArrayBuffer, {
        headers: { "Content-Type": "video/mp4" },
      })
    );

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
    expect(new Uint8Array(buffer)).toEqual(responseBody);

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
    mockGenerateVideo.mockResolvedValueOnce(
      Response.json({ error: "No video was generated" }, { status: 500 })
    );

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
    mockGenerateVideo.mockResolvedValueOnce(
      new Response(new Uint8Array([5, 6]).buffer as ArrayBuffer, {
        headers: { "Content-Type": "video/mp4" },
      })
    );

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

  it("propagates provider error status code and message", async () => {
    mockGenerateVideo.mockRejectedValueOnce(
      Object.assign(new Error("Prompt rejected by provider"), {
        statusCode: 422,
      })
    );

    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "img",
        sceneDescription: "scene",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data).toEqual({
      error: "Prompt rejected by provider",
      statusCode: 422,
    });
  });

  it("defaults to status 500 when provider error has no status code", async () => {
    mockGenerateVideo.mockRejectedValueOnce(new Error("Unexpected failure"));

    const request = new Request("http://localhost/api/generate-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "img",
        sceneDescription: "scene",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "Unexpected failure",
      statusCode: 500,
    });
  });
});
