import { experimental_generateVideo as generateVideo } from "ai";
import { apiErrorToResponse } from "@/lib/api-error";
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
    const result = await generateVideo({
      model,
      prompt,
    });

    if (!result.video?.uint8Array) {
      return Response.json(
        { error: "No video was generated" },
        { status: 500 }
      );
    }

    return new Response(result.video.uint8Array.buffer as ArrayBuffer, {
      headers: {
        "Content-Type": result.video.mediaType ?? "video/mp4",
      },
    });
  } catch (error: unknown) {
    return apiErrorToResponse({
      error,
      fallbackMessage: "Video generation failed",
    });
  }
}
