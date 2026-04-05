import type { ImagePart, Prompt, TextPart } from "ai";

interface CharacterRef {
  description: string;
  frontalImage: string;
  name: string;
  sideImage: string;
}

interface StoryImagePromptInput {
  characters: CharacterRef[];
  locationDescription: string;
  locationImage: string;
  locationName: string;
  previousFrameImage?: string | null;
  sceneDescription: string;
  settingDescription: string;
  styleDescription: string;
}

export function buildStoryImagePrompt({
  styleDescription,
  settingDescription,
  locationName,
  locationDescription,
  locationImage,
  characters,
  sceneDescription,
  previousFrameImage,
}: StoryImagePromptInput): Prompt {
  const guidelines = [
    "Any text that a character is supposed to be saying should be included in a speech bubble next to them. If there is quoted dialogue in the scene description, you must use that dialogue exactly as is in the speech bubble.",
    "Make sure dimensions are realistic. Characters must not be disproportionately large or small compared to the location.",
  ];
  if (previousFrameImage) {
    guidelines.push(
      "Pay attention to consistency with the previous frame. Maintain visual continuity."
    );
  }

  const systemParts = [
    "You are generating a story frame image for a visual story. Generate a single image that depicts the described scene.",
    `The image must adhere to the following style description for the overall story: ${styleDescription}`,
    `The story is set in this overall setting: ${settingDescription}`,
    `The generated image must follow these guidelines:\n- ${guidelines.join("\n- ")}`,
  ];

  const contentParts: (TextPart | ImagePart)[] = [
    {
      type: "text",
      text: `Scene location: ${locationName} — ${locationDescription}\nHere is an image of the location:`,
    },
    { type: "image", image: locationImage },
  ];

  if (characters.length > 0) {
    contentParts.push({
      type: "text",
      text:
        characters.length > 1
          ? `There are ${characters.length} characters in this scene:`
          : "There is 1 character in this scene:",
    });

    for (const character of characters) {
      contentParts.push({
        type: "text",
        text: `Character: ${character.name} — ${character.description}\nHere are images of the character from the front and the side:`,
      });
      contentParts.push({ type: "image", image: character.frontalImage });
      contentParts.push({ type: "image", image: character.sideImage });
    }
  }

  contentParts.push({
    type: "text",
    text: `Scene action: ${sceneDescription}`,
  });

  if (previousFrameImage) {
    contentParts.push({
      type: "text",
      text: "This scene follows directly from the previous frame. Maintain visual continuity. Here is the image from the previous frame for reference:",
    });
    contentParts.push({ type: "image", image: previousFrameImage });
  }

  return {
    system: systemParts.join("\n\n"),
    messages: [{ role: "user", content: contentParts }],
  };
}

export type { CharacterRef, StoryImagePromptInput };
