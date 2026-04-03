import { generateText } from "ai";
import { buildCharacterPrompt } from "@/lib/prompts/character";
import { buildLocationPrompt } from "@/lib/prompts/location";
import { buildStoryImagePrompt } from "@/lib/prompts/story-image";

interface PromptResult {
  messages: {
    role: "user";
    content: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    >;
  }[];
  system: string;
}

async function generateImage(opts: {
  prompt: PromptResult;
  model: string;
}): Promise<Response> {
  const result = await generateText({
    model: opts.model,
    providerOptions: {
      google: { responseModalities: ["IMAGE"] },
    },
    system: opts.prompt.system,
    messages: opts.prompt.messages,
  });

  const imageFile = result.files?.find((f) =>
    f.mediaType?.startsWith("image/")
  );

  if (!imageFile) {
    return Response.json({ error: "No image was generated" }, { status: 500 });
  }

  return Response.json({ image: imageFile.base64 });
}

function handleLocation(body: Record<string, unknown>): Response | null {
  if (!body.locationDescription) {
    return Response.json(
      { error: "Location description is required" },
      { status: 400 }
    );
  }

  return null;
}

function buildLocationPromptFromBody(
  body: Record<string, unknown>
): PromptResult {
  return buildLocationPrompt({
    styleDescription: (body.styleDescription as string) ?? "",
    settingDescription: (body.settingDescription as string) ?? "",
    locationDescription: body.locationDescription as string,
  });
}

function handleCharacterValidation(
  body: Record<string, unknown>
): Response | null {
  if (!body.characterDescription) {
    return Response.json(
      { error: "Character description is required" },
      { status: 400 }
    );
  }

  if (body.angle !== "frontal" && body.angle !== "side") {
    return Response.json(
      { error: "Angle must be 'frontal' or 'side'" },
      { status: 400 }
    );
  }

  return null;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { type } = body;
  const model = (body.model as string) ?? "google/gemini-3-pro-image";

  if (type === "location") {
    const validationError = handleLocation(body);
    if (validationError) {
      return validationError;
    }

    return generateImage({
      prompt: buildLocationPromptFromBody(body),
      model,
    });
  }

  if (type === "character") {
    const validationError = handleCharacterValidation(body);
    if (validationError) {
      return validationError;
    }

    return generateImage({
      prompt: buildCharacterPrompt({
        styleDescription: (body.styleDescription as string) ?? "",
        settingDescription: (body.settingDescription as string) ?? "",
        characterDescription: body.characterDescription as string,
        angle: body.angle as "frontal" | "side",
      }),
      model,
    });
  }

  if (type === "storyImage") {
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

  return Response.json({ error: "Unknown generation type" }, { status: 400 });
}
