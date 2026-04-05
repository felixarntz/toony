import type { GenerateVideoPrompt } from "ai";

interface VideoPromptInput {
  sceneDescription: string;
  storyImageData: string;
}

interface VideoPrompt {
  prompt: GenerateVideoPrompt;
}

export function buildVideoPrompt({
  storyImageData,
  sceneDescription,
}: VideoPromptInput): VideoPrompt {
  const text = `Generate a video based on the image.
Add appropriate motion to the characters and other elements in the image as appropriate.
Keep the camera angle the same as in the image, only add minimal panning or zooming if it helps to make the video more engaging.
Maintain all speech bubbles from the characters with the text exactly as it is in the image. Do not introduce any other dialogue or story elements.
For context, here is the original scene description used to generate the image: ${sceneDescription}`;

  return {
    prompt: {
      image: storyImageData,
      text,
    },
  };
}

export type { VideoPrompt, VideoPromptInput };
