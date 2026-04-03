import { generateText } from "ai";
import { buildLocationPrompt } from "@/lib/prompts/location";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, styleDescription, settingDescription, model } = body;

  if (type === "location") {
    const { locationDescription } = body;

    if (!locationDescription) {
      return Response.json(
        { error: "Location description is required" },
        { status: 400 }
      );
    }

    const prompt = buildLocationPrompt({
      styleDescription: styleDescription ?? "",
      settingDescription: settingDescription ?? "",
      locationDescription,
    });

    const result = await generateText({
      model: model ?? "google/gemini-3-pro-image",
      providerOptions: {
        google: { responseModalities: ["IMAGE"] },
      },
      system: prompt.system,
      messages: prompt.messages,
    });

    const imageFile = result.files?.find((f) =>
      f.mediaType?.startsWith("image/")
    );

    if (!imageFile) {
      return Response.json(
        { error: "No image was generated" },
        { status: 500 }
      );
    }

    return Response.json({ image: imageFile.base64 });
  }

  return Response.json({ error: "Unknown generation type" }, { status: 400 });
}
