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
      "You are generating a reference image of a location for a visual story. Generate a single image that depicts this location."
    );
  });

  it("returns a single user message with the location description", () => {
    const result = buildLocationPrompt({
      styleDescription: "Comic book style",
      settingDescription: "Medieval fantasy",
      locationDescription: "A bustling marketplace",
    });

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe("user");
    expect(result.messages[0].content).toHaveLength(1);
    expect(result.messages[0].content[0]).toEqual({
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
      "You are generating a reference image of a location for a visual story."
    );
    expect(result.messages[0].content[0].text).toBe("A dark cave");
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
