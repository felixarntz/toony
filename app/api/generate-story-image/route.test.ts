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
});
