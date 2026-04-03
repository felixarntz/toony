import type { Prompt } from "ai";

interface LocationPromptInput {
  locationDescription: string;
  settingDescription: string;
  styleDescription: string;
}

export function buildLocationPrompt({
  styleDescription,
  settingDescription,
  locationDescription,
}: LocationPromptInput): Prompt {
  const systemParts = [
    "You are generating a reference image of a specific scene location for a visual story. The image must depict a concrete place where a scene could take place — for example, a ballroom inside of a castle, a meadow in front of a castle, or a narrow alley in a city. Do NOT depict an entire building or landmark from the outside (e.g. 'a castle' alone is too broad). Show only the environment — there must not be any characters or people in the image.",
    `The image must adhere to the following style description: ${styleDescription}`,
    `The location is part of this overall setting for the story: ${settingDescription}`,
  ];

  return {
    system: systemParts.join("\n\n"),
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: locationDescription }],
      },
    ],
  };
}
