import { apiErrorToResponse } from "@/lib/api-error";
import { generateVideo } from "@/lib/generate-video";
import { buildVideoPrompt } from "@/lib/prompts/video";

export async function POST(request: Request) {
  const body = await request.json();
  const { storyImageData, sceneDescription } = body;
  const model = (body.model as string) ?? "google/veo-3.1-generate-001";

  if (!storyImageData) {
    return Response.json(
      { error: "Story image data is required" },
      { status: 400 }
    );
  }

  if (!sceneDescription) {
    return Response.json(
      { error: "Scene description is required" },
      { status: 400 }
    );
  }

  const { prompt } = buildVideoPrompt({ storyImageData, sceneDescription });

  try {
    return await generateVideo({
      model,
      prompt,
    });
  } catch (error: unknown) {
    return apiErrorToResponse({
      error,
      fallbackMessage: "Video generation failed",
    });
  }
}
