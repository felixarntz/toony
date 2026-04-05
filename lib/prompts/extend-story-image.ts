import type { ImagePart, Prompt, TextPart } from "ai";

export function buildExtendStoryImagePrompt(opts: {
  storyImageData: string;
  sceneDescription?: string;
}): Prompt {
  const contentParts: (TextPart | ImagePart)[] = [
    {
      type: "text",
      text: "Extend this story image to a widescreen frame while preserving all existing elements exactly as they are.",
    },
    {
      type: "image",
      image: opts.storyImageData,
    },
    {
      type: "text",
      text: "Do not alter characters, pose, clothing, scene objects, speech bubble text, or overall visual style. Keep the original frame content intact and only add natural surroundings to expand the canvas.",
    },
  ];

  if (opts.sceneDescription) {
    contentParts.push({
      type: "text",
      text: `Scene context: ${opts.sceneDescription}`,
    });
  }

  return {
    system:
      "You are extending a previously generated story frame. Preserve the original composition and content exactly while outpainting to a wider frame.",
    messages: [{ role: "user", content: contentParts }],
  };
}
