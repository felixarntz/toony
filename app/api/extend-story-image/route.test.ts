import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "ai";
import { POST } from "./route";

const mockGenerateText = vi.mocked(generateText);

describe("POST /api/extend-story-image", () => {
  it("returns extended story image", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "extended169" }],
    } as never);

    const request = new Request("http://localhost/api/extend-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "story-base64",
        sceneDescription: "A hero entering the scene",
        model: "google/gemini-3-pro-image",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("extended169");
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          google: {
            imageConfig: {
              aspectRatio: "16:9",
            },
            responseModalities: ["IMAGE"],
          },
        },
      })
    );
  });

  it("returns 400 when story image is missing", async () => {
    const request = new Request("http://localhost/api/extend-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneDescription: "A scene",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Story image data is required");
  });

  it("uses default model when none specified", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "extended-default-model" }],
    } as never);

    const request = new Request("http://localhost/api/extend-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "story-base64",
      }),
    });

    await POST(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/gemini-3-pro-image",
      })
    );
  });

  it("returns normalized provider errors", async () => {
    mockGenerateText.mockRejectedValueOnce(
      Object.assign(new Error("Provider rejected extension"), {
        statusCode: 409,
      })
    );

    const request = new Request("http://localhost/api/extend-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storyImageData: "story-base64",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data).toEqual({
      error: "Provider rejected extension",
      statusCode: 409,
    });
  });
});
