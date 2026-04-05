import type { GenerateVideoPrompt } from "ai";
import { experimental_generateVideo as generateVideoWithModel } from "ai";

export async function generateVideo(opts: {
  model: string;
  prompt: GenerateVideoPrompt;
}): Promise<Response> {
  const result = await generateVideoWithModel({
    model: opts.model,
    prompt: opts.prompt,
    aspectRatio: "16:9",
  });

  if (!result.video?.uint8Array) {
    return Response.json({ error: "No video was generated" }, { status: 500 });
  }

  return new Response(result.video.uint8Array.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": result.video.mediaType ?? "video/mp4",
    },
  });
}
