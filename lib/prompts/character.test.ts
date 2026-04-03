import type { TextPart } from "ai";
import { describe, expect, it } from "vitest";
import {
  buildCharacterPrompt,
  buildCharacterSideViewPrompt,
} from "./character";

describe("buildCharacterPrompt", () => {
  it("returns correct system instruction for frontal view", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Ghibli anime style",
      settingDescription: "A post-apocalyptic Tokyo",
      characterDescription: "A young girl with red hair",
    });

    expect(result.system).toContain("Ghibli anime style");
    expect(result.system).toContain("A post-apocalyptic Tokyo");
    expect(result.system).toContain(
      "You are generating a full-body character reference image for a visual story."
    );
    expect(result.system).toContain("frontal");
    expect(result.system).toContain("plain white");
  });

  it("includes frontal instruction in user message", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Watercolor",
      settingDescription: "Victorian England",
      characterDescription: "A detective with a monocle",
    });

    const messages = result.messages as NonNullable<typeof result.messages>;
    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");
    expect(messages[0].content).toHaveLength(1);
    expect((messages[0].content[0] as TextPart).text).toContain(
      "A detective with a monocle"
    );
    expect((messages[0].content[0] as TextPart).text).toContain(
      "full-body frontal view"
    );
  });

  it("handles empty style and setting descriptions", () => {
    const result = buildCharacterPrompt({
      styleDescription: "",
      settingDescription: "",
      characterDescription: "A warrior",
    });

    expect(result.system).toContain(
      "You are generating a full-body character reference image for a visual story."
    );
    const messages = result.messages as NonNullable<typeof result.messages>;
    expect((messages[0].content[0] as TextPart).text).toContain("A warrior");
  });

  it("returns the correct shape with system and messages keys", () => {
    const result = buildCharacterPrompt({
      styleDescription: "Manga",
      settingDescription: "Modern Tokyo",
      characterDescription: "A school student",
    });

    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("messages");
    expect(typeof result.system).toBe("string");
    expect(Array.isArray(result.messages)).toBe(true);
  });
});

describe("buildCharacterSideViewPrompt", () => {
  it("returns correct system instruction for side view", () => {
    const result = buildCharacterSideViewPrompt({
      styleDescription: "Comic book style",
      settingDescription: "Medieval fantasy",
      characterDescription: "A tall knight in armor",
      frontalImage: "base64data",
    });

    expect(result.system).toContain("side-view");
    expect(result.system).toContain("Comic book style");
    expect(result.system).toContain("Medieval fantasy");
    expect(result.system).toContain("plain white");
    expect(result.system).toContain("frontal reference image");
  });

  it("includes frontal image as context in user message", () => {
    const result = buildCharacterSideViewPrompt({
      styleDescription: "Pixel art",
      settingDescription: "Space station",
      characterDescription: "An android with glowing eyes",
      frontalImage: "frontbase64",
    });

    const messages = result.messages as NonNullable<typeof result.messages>;
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toHaveLength(2);
    expect((messages[0].content[0] as TextPart).text).toContain(
      "An android with glowing eyes"
    );
    expect((messages[0].content[0] as TextPart).text).toContain(
      "full-body side-view"
    );
    expect(messages[0].content[1]).toEqual({
      type: "image",
      image: "frontbase64",
    });
  });
});
