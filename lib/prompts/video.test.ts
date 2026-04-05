import { describe, expect, it } from "vitest";
import { buildVideoPrompt } from "./video";

describe("buildVideoPrompt", () => {
  it("returns prompt with image and text", () => {
    const result = buildVideoPrompt({
      storyImageData: "base64imagedata",
      sceneDescription: "The hero runs through the forest",
    });

    expect(result).toEqual({
      prompt: {
        image: "base64imagedata",
        text: "The hero runs through the forest",
      },
    });
  });

  it("passes through image data unchanged", () => {
    const result = buildVideoPrompt({
      storyImageData: "abc123xyz",
      sceneDescription: "A quiet scene",
    });

    expect(typeof result.prompt).not.toBe("string");
    if (typeof result.prompt === "string") {
      throw new Error("Expected object prompt");
    }

    expect(result.prompt.image).toBe("abc123xyz");
  });

  it("passes through scene description unchanged", () => {
    const result = buildVideoPrompt({
      storyImageData: "img",
      sceneDescription: "Dramatic battle unfolds",
    });

    expect(typeof result.prompt).not.toBe("string");
    if (typeof result.prompt === "string") {
      throw new Error("Expected object prompt");
    }

    expect(result.prompt.text).toBe("Dramatic battle unfolds");
  });
});
