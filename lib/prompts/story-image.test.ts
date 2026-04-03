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

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe("user");

    const textPart = result.messages[0].content[0];
    expect(textPart.type).toBe("text");
    expect("text" in textPart && textPart.text).toContain(
      "Scene location: Abandoned Station — A crumbling train station overgrown with vines"
    );
    expect("text" in textPart && textPart.text).toContain(
      "Characters in this scene: Hana — A young girl with red hair"
    );
    expect("text" in textPart && textPart.text).toContain(
      "Scene action: Hana walks through the station"
    );
  });

  it("includes location image as second content part", () => {
    const result = buildStoryImagePrompt(baseInput);

    const imagePart = result.messages[0].content[1];
    expect(imagePart.type).toBe("image");
    expect("image" in imagePart && imagePart.image).toBe("location-base64");
  });

  it("includes character frontal and side images after location image", () => {
    const result = buildStoryImagePrompt(baseInput);

    const frontalPart = result.messages[0].content[2];
    expect(frontalPart.type).toBe("image");
    expect("image" in frontalPart && frontalPart.image).toBe(
      "hana-frontal-base64"
    );

    const sidePart = result.messages[0].content[3];
    expect(sidePart.type).toBe("image");
    expect("image" in sidePart && sidePart.image).toBe("hana-side-base64");
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

    const content = result.messages[0].content;
    expect(content).toHaveLength(6);
    expect(content[0].type).toBe("text");
    expect(content[1].type).toBe("image");
    expect("image" in content[2] && content[2].image).toBe("hana-frontal");
    expect("image" in content[3] && content[3].image).toBe("hana-side");
    expect("image" in content[4] && content[4].image).toBe("kenji-frontal");
    expect("image" in content[5] && content[5].image).toBe("kenji-side");

    const textPart = content[0];
    expect("text" in textPart && textPart.text).toContain(
      "Hana — A young girl with red hair; Kenji — A tall warrior"
    );
  });

  it("does not include previous frame text or image when not provided", () => {
    const result = buildStoryImagePrompt(baseInput);

    const textPart = result.messages[0].content[0];
    expect("text" in textPart && textPart.text).not.toContain("previous frame");

    expect(result.messages[0].content).toHaveLength(4);
  });

  it("includes previous frame image and continuity text when provided", () => {
    const result = buildStoryImagePrompt({
      ...baseInput,
      previousFrameImage: "prev-frame-base64",
    });

    const textPart = result.messages[0].content[0];
    expect("text" in textPart && textPart.text).toContain(
      "This scene follows directly from the previous frame. Maintain visual continuity."
    );

    const content = result.messages[0].content;
    expect(content).toHaveLength(5);

    const lastPart = content[4];
    expect(lastPart.type).toBe("image");
    expect("image" in lastPart && lastPart.image).toBe("prev-frame-base64");
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
