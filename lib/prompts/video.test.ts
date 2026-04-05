import { describe, expect, it } from "vitest";
import { buildVideoPrompt } from "./video";

describe("buildVideoPrompt", () => {
  it("returns prompt with image and text", () => {
    const result = buildVideoPrompt({
      storyImageData: "base64imagedata",
      sceneDescription: "The hero runs through the forest",
    });

    expect(typeof result.prompt).not.toBe("string");
    if (typeof result.prompt === "string") {
      throw new Error("Expected object prompt");
    }

    expect(result.prompt.image).toBe("base64imagedata");
    expect(result.prompt.text).toContain(
      "Generate a video based on the image."
    );
    expect(result.prompt.text).toContain(
      "For context, here is the original scene description used to generate the image: The hero runs through the forest"
    );
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

  it("includes scene description in video instructions", () => {
    const result = buildVideoPrompt({
      storyImageData: "img",
      sceneDescription: "Dramatic battle unfolds",
    });

    expect(typeof result.prompt).not.toBe("string");
    if (typeof result.prompt === "string") {
      throw new Error("Expected object prompt");
    }

    expect(result.prompt.text).toContain(
      "For context, here is the original scene description used to generate the image: Dramatic battle unfolds"
    );
  });
});
