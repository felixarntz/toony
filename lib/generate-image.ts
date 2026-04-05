import type { GoogleLanguageModelOptions } from "@ai-sdk/google";
import type { Prompt } from "ai";
import { generateText } from "ai";

export async function generateImage(opts: {
  prompt: Prompt;
  model: string;
  aspectRatio?: NonNullable<
    GoogleLanguageModelOptions["imageConfig"]
  >["aspectRatio"];
}): Promise<Response> {
  const result = await generateText({
    model: opts.model,
    providerOptions: {
      google: {
        responseModalities: ["IMAGE"],
        imageConfig: {
          aspectRatio: opts.aspectRatio ?? "1:1",
        },
      } as GoogleLanguageModelOptions,
    },
    ...opts.prompt,
  });

  const imageFile = result.files?.find((f) =>
    f.mediaType?.startsWith("image/")
  );

  if (!imageFile) {
    return Response.json({ error: "No image was generated" }, { status: 500 });
  }

  return Response.json({ image: imageFile.base64 });
}
