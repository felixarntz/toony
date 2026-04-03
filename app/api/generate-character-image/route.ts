import { generateImage } from "@/lib/generate-image";
import {
  buildCharacterPrompt,
  buildCharacterSideViewPrompt,
} from "@/lib/prompts/character";

export async function POST(request: Request) {
  const body = await request.json();
  const model = (body.model as string) ?? "google/gemini-3-pro-image";

  if (!body.characterDescription) {
    return Response.json(
      { error: "Character description is required" },
      { status: 400 }
    );
  }

  if (body.frontalImage) {
    return generateImage({
      prompt: buildCharacterSideViewPrompt({
        styleDescription: (body.styleDescription as string) ?? "",
        settingDescription: (body.settingDescription as string) ?? "",
        characterDescription: body.characterDescription as string,
        frontalImage: body.frontalImage as string,
      }),
      model,
    });
  }

  return generateImage({
    prompt: buildCharacterPrompt({
      styleDescription: (body.styleDescription as string) ?? "",
      settingDescription: (body.settingDescription as string) ?? "",
      characterDescription: body.characterDescription as string,
    }),
    model,
  });
}
