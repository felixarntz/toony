import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "ai";
import { POST } from "./route";

const mockGenerateText = vi.mocked(generateText);

describe("POST /api/generate-character-image", () => {
  it("returns generated frontal image", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "front123" }],
    } as never);

    const request = new Request(
      "http://localhost/api/generate-character-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterDescription: "A brave knight",
          styleDescription: "Comic Book",
          settingDescription: "Medieval fantasy",
          model: "google/gemini-3-pro-image",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("front123");
  });

  it("returns generated side-view image using frontal reference", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "side123" }],
    } as never);

    const request = new Request(
      "http://localhost/api/generate-character-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterDescription: "A brave knight",
          frontalImage: "base64frontaldata",
          styleDescription: "Comic Book",
          settingDescription: "Medieval fantasy",
          model: "google/gemini-3-pro-image",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("side123");
  });

  it("returns 400 when character description is missing", async () => {
    const request = new Request(
      "http://localhost/api/generate-character-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleDescription: "Watercolor",
          settingDescription: "Fantasy world",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Character description is required");
  });

  it("returns normalized provider errors", async () => {
    mockGenerateText.mockRejectedValueOnce(
      Object.assign(new Error("Provider rejected character"), {
        statusCode: 503,
      })
    );

    const request = new Request(
      "http://localhost/api/generate-character-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterDescription: "A bard",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data).toEqual({
      error: "Provider rejected character",
      statusCode: 503,
    });
  });
});
