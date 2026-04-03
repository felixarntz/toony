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
    styleDescription,
    settingDescription,
    "You are generating a reference image of a location for a visual story. Generate a single image that depicts this location.",
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
