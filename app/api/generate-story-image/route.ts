import { generateImage } from "@/lib/generate-image";
import { buildStoryImagePrompt } from "@/lib/prompts/story-image";

export async function POST(request: Request) {
  const body = await request.json();
  const model = (body.model as string) ?? "google/gemini-3-pro-image";

  if (!body.sceneDescription) {
    return Response.json(
      { error: "Scene description is required" },
      { status: 400 }
    );
  }

  return generateImage({
    prompt: buildStoryImagePrompt({
      styleDescription: (body.styleDescription as string) ?? "",
      settingDescription: (body.settingDescription as string) ?? "",
      locationName: (body.locationName as string) ?? "",
      locationDescription: (body.locationDescription as string) ?? "",
      locationImage: (body.locationImage as string) ?? "",
      characters: (body.characters as []) ?? [],
      sceneDescription: body.sceneDescription as string,
      previousFrameImage: (body.previousFrameImage as string) ?? null,
    }),
    model,
  });
}
