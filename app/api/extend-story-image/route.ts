import { apiErrorToResponse } from "@/lib/api-error";
import { generateImage } from "@/lib/generate-image";
import { buildExtendStoryImagePrompt } from "@/lib/prompts/extend-story-image";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const model = (body.model as string) ?? "google/gemini-3-pro-image";
    const storyImageData = (body.storyImageData as string) ?? "";

    if (!storyImageData) {
      return Response.json(
        { error: "Story image data is required" },
        { status: 400 }
      );
    }

    return await generateImage({
      prompt: buildExtendStoryImagePrompt({
        storyImageData,
        sceneDescription: (body.sceneDescription as string) ?? "",
      }),
      model,
      aspectRatio: "16:9",
    });
  } catch (error: unknown) {
    return apiErrorToResponse({
      error,
      fallbackMessage: "Story image extension failed",
    });
  }
}
