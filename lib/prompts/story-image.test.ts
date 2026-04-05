import type { ImagePart, TextPart } from "ai";
import { describe, expect, it } from "vitest";
import { buildStoryImagePrompt } from "./story-image";

const baseInput = {
  styleDescription: "Ghibli anime style",
  settingDescription: "A post-apocalyptic Tokyo",
  locationName: "Abandoned Station",
  locationDescription: "A crumbling train station overgrown with vines",
  locationImage: "location-base64",
  characters: [
    {
      name: "Hana",
      description: "A young girl with red hair",
      frontalImage: "hana-frontal-base64",
      sideImage: "hana-side-base64",
    },
  ],
  sceneDescription: "Hana walks through the station",
};

describe("buildStoryImagePrompt", () => {
  it("returns correct system instruction with style, setting, and task description", () => {
    const result = buildStoryImagePrompt(baseInput);

    expect(result.system).toContain("Ghibli anime style");
    expect(result.system).toContain("A post-apocalyptic Tokyo");
    expect(result.system).toContain(
      "You are generating a story frame image for a visual story. Generate a single image that depicts the described scene."
    );
  });

  it("returns a single user message with correct text content", () => {
    const result = buildStoryImagePrompt(baseInput);
    const messages = result.messages as NonNullable<typeof result.messages>;

    expect(messages).toHaveLength(1);
    expect(messages[0].role).toBe("user");

    const textPart = messages[0].content[0] as TextPart;
    expect(textPart.type).toBe("text");
    expect(textPart.text).toContain(
      "Scene location: Abandoned Station — A crumbling train station overgrown with vines"
    );
    const characterSummaryPart = messages[0].content[2] as TextPart;
    expect(characterSummaryPart.type).toBe("text");
    expect(characterSummaryPart.text).toContain(
      "There is 1 character in this scene:"
    );
    const characterPart = messages[0].content[3] as TextPart;
    expect(characterPart.type).toBe("text");
    expect(characterPart.text).toContain(
      "Character: Hana — A young girl with red hair"
    );
    const actionPart = messages[0].content[6] as TextPart;
    expect(actionPart.type).toBe("text");
    expect(actionPart.text).toContain(
      "Scene action: Hana walks through the station"
    );
  });

  it("includes location image as second content part", () => {
    const result = buildStoryImagePrompt(baseInput);
    const messages = result.messages as NonNullable<typeof result.messages>;

    const imagePart = messages[0].content[1] as ImagePart;
    expect(imagePart.type).toBe("image");
    expect(imagePart.image).toBe("location-base64");
  });

  it("includes character frontal and side images after location image", () => {
    const result = buildStoryImagePrompt(baseInput);
    const messages = result.messages as NonNullable<typeof result.messages>;

    const frontalPart = messages[0].content[4] as ImagePart;
    expect(frontalPart.type).toBe("image");
    expect(frontalPart.image).toBe("hana-frontal-base64");

    const sidePart = messages[0].content[5] as ImagePart;
    expect(sidePart.type).toBe("image");
    expect(sidePart.image).toBe("hana-side-base64");
  });

  it("handles multiple characters with correct image ordering", () => {
    const result = buildStoryImagePrompt({
      ...baseInput,
      characters: [
        {
          name: "Hana",
          description: "A young girl with red hair",
          frontalImage: "hana-frontal",
          sideImage: "hana-side",
        },
        {
          name: "Kenji",
          description: "A tall warrior",
          frontalImage: "kenji-frontal",
          sideImage: "kenji-side",
        },
      ],
    });

    const content = (result.messages as NonNullable<typeof result.messages>)[0]
      .content;
    expect(content).toHaveLength(10);
    expect((content[0] as TextPart).type).toBe("text");
    expect((content[1] as ImagePart).type).toBe("image");
    expect((content[4] as ImagePart).image).toBe("hana-frontal");
    expect((content[5] as ImagePart).image).toBe("hana-side");
    expect((content[7] as ImagePart).image).toBe("kenji-frontal");
    expect((content[8] as ImagePart).image).toBe("kenji-side");

    const textPart = content[2] as TextPart;
    expect(textPart.text).toContain("There are 2 characters in this scene:");
  });

  it("does not include previous frame text or image when not provided", () => {
    const result = buildStoryImagePrompt(baseInput);
    const messages = result.messages as NonNullable<typeof result.messages>;

    const textPart = messages[0].content[6] as TextPart;
    expect(textPart.text).not.toContain("previous frame");

    expect(messages[0].content).toHaveLength(7);
  });

  it("includes previous frame image and continuity text when provided", () => {
    const result = buildStoryImagePrompt({
      ...baseInput,
      previousFrameImage: "prev-frame-base64",
    });

    const messages = result.messages as NonNullable<typeof result.messages>;
    const textPart = messages[0].content[7] as TextPart;
    expect(textPart.text).toContain(
      "This scene follows directly from the previous frame. Maintain visual continuity."
    );

    const content = messages[0].content;
    expect(content).toHaveLength(9);

    const lastPart = content[8] as ImagePart;
    expect(lastPart.type).toBe("image");
    expect(lastPart.image).toBe("prev-frame-base64");
  });

  it("returns the correct shape with system and messages keys", () => {
    const result = buildStoryImagePrompt(baseInput);

    expect(result).toHaveProperty("system");
    expect(result).toHaveProperty("messages");
    expect(typeof result.system).toBe("string");
    expect(Array.isArray(result.messages)).toBe(true);
  });

  it("handles empty style and setting descriptions", () => {
    const result = buildStoryImagePrompt({
      ...baseInput,
      styleDescription: "",
      settingDescription: "",
    });

    expect(result.system).toContain(
      "You are generating a story frame image for a visual story."
    );
  });
});
