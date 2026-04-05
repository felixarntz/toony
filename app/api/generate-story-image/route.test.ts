import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "ai";
import { POST } from "./route";

const mockGenerateText = vi.mocked(generateText);

describe("POST /api/generate-story-image", () => {
  it("returns generated story image", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "story123" }],
    } as never);

    const request = new Request("http://localhost/api/generate-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneDescription: "The hero enters the castle",
        styleDescription: "Ghibli Anime",
        settingDescription: "Medieval fantasy",
        locationName: "Castle entrance",
        locationDescription: "A grand castle entrance",
        locationImage: "base64data",
        characters: [],
        model: "google/gemini-3-pro-image",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("story123");
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: {
          google: {
            imageConfig: {
              aspectRatio: "1:1",
            },
            responseModalities: ["IMAGE"],
          },
        },
      })
    );
  });

  it("uses provided aspect ratio", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "story169" }],
    } as never);

    const request = new Request("http://localhost/api/generate-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneDescription: "A wide action shot",
        aspectRatio: "16:9",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("story169");
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

  it("returns 400 when scene description is missing", async () => {
    const request = new Request("http://localhost/api/generate-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        styleDescription: "Watercolor",
        settingDescription: "Fantasy world",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Scene description is required");
  });

  it("throws when provided aspect ratio is invalid", async () => {
    const request = new Request("http://localhost/api/generate-story-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sceneDescription: "A scene",
        aspectRatio: "2:3",
      }),
    });

    await expect(POST(request)).rejects.toThrowError("Invalid aspect ratio");
  });
});
