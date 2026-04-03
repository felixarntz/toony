import { generateImage } from "@/lib/generate-image";
import { buildLocationPrompt } from "@/lib/prompts/location";

export async function POST(request: Request) {
  const body = await request.json();
  const model = (body.model as string) ?? "google/gemini-3-pro-image";

  if (!body.locationDescription) {
    return Response.json(
      { error: "Location description is required" },
      { status: 400 }
    );
  }

  return generateImage({
    prompt: buildLocationPrompt({
      styleDescription: (body.styleDescription as string) ?? "",
      settingDescription: (body.settingDescription as string) ?? "",
      locationDescription: body.locationDescription as string,
    }),
    model,
  });
}
