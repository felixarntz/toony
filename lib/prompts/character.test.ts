import { describe, expect, it } from "vitest";
import { buildCharacterPrompt } from "./character";

describe("buildCharacterPrompt", () => {
  it("returns correct system instruction for frontal angle", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Ghibli anime style",
      settingDescription: "A post-apocalyptic Tokyo",
      characterDescription: "A young girl with red hair",
      angle: "frontal",
    });

    expect(result.system).toContain("Ghibli anime style");
    expect(result.system).toContain("A post-apocalyptic Tokyo");
    expect(result.system).toContain(
      "You are generating a character reference portrait for a visual story. Generate a single frontal portrait of this character."
    );
  });

  it("returns correct system instruction for side angle", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Comic book style",
      settingDescription: "Medieval fantasy",
      characterDescription: "A tall knight in armor",
      angle: "side",
    });

    expect(result.system).toContain("Comic book style");
    expect(result.system).toContain("Medieval fantasy");
    expect(result.system).toContain(
      "You are generating a character reference portrait for a visual story. Generate a single side-view portrait of this character."
    );
  });

  it("includes frontal angle instruction in user message", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Watercolor",
      settingDescription: "Victorian England",
      characterDescription: "A detective with a monocle",
      angle: "frontal",
    });

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe("user");
    expect(result.messages[0].content).toHaveLength(1);
    expect(result.messages[0].content[0].text).toContain(
      "A detective with a monocle"
    );
    expect(result.messages[0].content[0].text).toContain(
      "Draw a frontal portrait facing the viewer."
    );
  });

  it("includes side angle instruction in user message", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Pixel art",
      settingDescription: "Space station",
      characterDescription: "An android with glowing eyes",
      angle: "side",
    });

    expect(result.messages[0].content[0].text).toContain(
      "An android with glowing eyes"
    );
    expect(result.messages[0].content[0].text).toContain(
      "Draw a side-view portrait from the left."
    );
  });

  it("handles empty style and setting descriptions", () => {
    const result = buildCharacterPrompt({
      styleDescription: "",
      settingDescription: "",
      characterDescription: "A warrior",
      angle: "frontal",
    });

    expect(result.system).toContain(
      "You are generating a character reference portrait for a visual story."
    );
    expect(result.messages[0].content[0].text).toContain("A warrior");
  });

  it("returns the correct shape with system and messages keys", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Manga",
      settingDescription: "Modern Tokyo",
      characterDescription: "A school student",
      angle: "frontal",
    });

    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("messages");
    expect(typeof result.system).toBe("string");
    expect(Array.isArray(result.messages)).toBe(true);
  });
});
