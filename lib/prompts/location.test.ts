import type { TextPart } from "ai";
import { describe, expect, it } from "vitest";
import { buildLocationPrompt } from "./location";

describe("buildLocationPrompt", () => {
  it("returns correct system instruction with style and setting", () => {
    const result = buildLocationPrompt({
      styleDescription: "Ghibli anime style",
      settingDescription: "A post-apocalyptic Tokyo",
      locationDescription: "An abandoned train station",
    });

    expect(result.system).toContain("Ghibli anime style");
    expect(result.system).toContain("A post-apocalyptic Tokyo");
    expect(result.system).toContain(
      "You are generating a reference image of a specific scene location for a visual story."
    );
  });

  it("returns a single user message with the location description", () => {
    const result = buildLocationPrompt({
      styleDescription: "Comic book style",
      settingDescription: "Medieval fantasy",
      locationDescription: "A bustling marketplace",
    });

    const messages = result.messages as NonNullable<typeof result.messages>;
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toHaveLength(1);
    expect(messages[0].content[0]).toEqual({
      type: "text",
      text: "A bustling marketplace",
    });
  });

  it("handles empty style and setting descriptions", () => {
    const result = buildLocationPrompt({
      styleDescription: "",
      settingDescription: "",
      locationDescription: "A dark cave",
    });

    expect(result.system).toContain(
      "You are generating a reference image of a specific scene location for a visual story."
    );
    const messages = result.messages as NonNullable<typeof result.messages>;
    expect((messages[0].content[0] as TextPart).text).toBe("A dark cave");
  });

  it("returns the correct shape with system and messages keys", () => {
    const result = buildLocationPrompt({
      styleDescription: "Watercolor",
      settingDescription: "Victorian England",
      locationDescription: "A foggy street",
    });

    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("messages");
    expect(typeof result.system).toBe("string");
    expect(Array.isArray(result.messages)).toBe(true);
  });
});
