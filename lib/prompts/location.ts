interface LocationPromptInput {
  locationDescription: string;
  settingDescription: string;
  styleDescription: string;
}

interface ContentPart {
  text: string;
  type: "text";
}

interface LocationPromptOutput {
  messages: { role: "user"; content: ContentPart[] }[];
  system: string;
}

export function buildLocationPrompt({
  styleDescription,
  settingDescription,
  locationDescription,
}: LocationPromptInput): LocationPromptOutput {
  const systemParts = [
    "You are generating a reference image of a location for a visual story. Generate a single image that depicts this location.",
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
