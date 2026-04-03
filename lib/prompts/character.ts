type CharacterAngle = "frontal" | "side";

interface CharacterPromptInput {
  angle: CharacterAngle;
  characterDescription: string;
  settingDescription: string;
  styleDescription: string;
}

interface ContentPart {
  text: string;
  type: "text";
}

interface CharacterPromptOutput {
  messages: { role: "user"; content: ContentPart[] }[];
  system: string;
}

const ANGLE_LABELS: Record<CharacterAngle, string> = {
  frontal: "frontal",
  side: "side-view",
};

const ANGLE_INSTRUCTIONS: Record<CharacterAngle, string> = {
  frontal: "Draw a frontal portrait facing the viewer.",
  side: "Draw a side-view portrait from the left.",
};

export function buildCharacterPrompt({
  styleDescription,
  settingDescription,
  characterDescription,
  angle,
}: CharacterPromptInput): CharacterPromptOutput {
  const angleLabel = ANGLE_LABELS[angle];
  const angleInstruction = ANGLE_INSTRUCTIONS[angle];

  const systemParts = [
    `You are generating a character reference portrait for a visual story. Generate a single ${angleLabel} portrait of this character.`,
    `The image must adhere to the following style description: ${styleDescription}`,
    `The character will be part of a story in this overall setting: ${settingDescription}`,
  ];

  return {
    system: systemParts.join("\n\n"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${characterDescription}\n\n${angleInstruction}`,
          },
        ],
      },
    ],
  };
}
