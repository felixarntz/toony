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
  const systemParts = [
    "You are generating a story frame image for a visual story. Generate a single image that depicts the described scene.",
    `The image must adhere to the following style description for the overall story: ${styleDescription}`,
    `The story is set in this overall setting: ${settingDescription}`,
  ];

  const textLines = [
    `Scene location: ${locationName} — ${locationDescription}`,
    `Characters in this scene: ${characters.map((c) => `${c.name} — ${c.description}`).join("; ")}`,
    `Scene action: ${sceneDescription}`,
  ];

  if (previousFrameImage) {
    textLines.push(
      "This scene follows directly from the previous frame. Maintain visual continuity."
    );
  }

  const contentParts: (TextPart | ImagePart)[] = [
    { type: "text", text: textLines.join("\n") },
    { type: "image", image: locationImage },
  ];

  for (const character of characters) {
    contentParts.push({ type: "image", image: character.frontalImage });
    contentParts.push({ type: "image", image: character.sideImage });
  }

  if (previousFrameImage) {
    contentParts.push({ type: "image", image: previousFrameImage });
  }

  return {
    system: systemParts.join("\n\n"),
    messages: [{ role: "user", content: contentParts }],
  };
}

export type { CharacterRef, StoryImagePromptInput };
