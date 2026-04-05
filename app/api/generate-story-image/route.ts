import { generateImage } from "@/lib/generate-image";
import { buildStoryImagePrompt } from "@/lib/prompts/story-image";

function parseAspectRatio(opts: {
  value: unknown;
}): "1:1" | "16:9" | undefined {
  if (opts.value === undefined || opts.value === null) {
    return undefined;
  }

  if (opts.value === "1:1" || opts.value === "16:9") {
    return opts.value;
  }

  throw new Error("Invalid aspect ratio");
}

export async function POST(request: Request) {
  const body = await request.json();
  const model = (body.model as string) ?? "google/gemini-3-pro-image";
  const aspectRatio = parseAspectRatio({ value: body.aspectRatio });

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
    aspectRatio,
    model,
  });
}
