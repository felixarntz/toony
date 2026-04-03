import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
  generateText: vi.fn(),
}));

import { generateText } from "ai";
import { POST } from "./route";

const mockGenerateText = vi.mocked(generateText);

describe("POST /api/generate-location-image", () => {
  it("returns generated image for location", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "abc123" }],
    } as never);

    const request = new Request(
      "http://localhost/api/generate-location-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationDescription: "A magical forest",
          styleDescription: "Watercolor",
          settingDescription: "Fantasy world",
          model: "google/gemini-3-pro-image",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.image).toBe("abc123");
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/gemini-3-pro-image",
        providerOptions: { google: { responseModalities: ["IMAGE"] } },
      })
    );
  });

  it("returns 400 when location description is missing", async () => {
    const request = new Request(
      "http://localhost/api/generate-location-image",
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
    expect(data.error).toBe("Location description is required");
  });

  it("returns 500 when no image is generated", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [],
    } as never);

    const request = new Request(
      "http://localhost/api/generate-location-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationDescription: "A castle",
          styleDescription: "",
          settingDescription: "",
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("No image was generated");
  });

  it("uses default model when none specified", async () => {
    mockGenerateText.mockResolvedValueOnce({
      files: [{ mediaType: "image/png", base64: "xyz" }],
    } as never);

    const request = new Request(
      "http://localhost/api/generate-location-image",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationDescription: "A river",
        }),
      }
    );

    await POST(request);

    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "google/gemini-3-pro-image",
      })
    );
  });
});
