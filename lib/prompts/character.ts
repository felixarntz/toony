import type { Prompt } from "ai";

interface CharacterPromptInput {
  characterDescription: string;
  settingDescription: string;
  styleDescription: string;
}

interface CharacterSideViewPromptInput {
  characterDescription: string;
  frontalImage: string;
  settingDescription: string;
  styleDescription: string;
}

export function buildCharacterPrompt({
  styleDescription,
  settingDescription,
  characterDescription,
}: CharacterPromptInput): Prompt {
  const systemParts = [
    "You are generating a full-body character reference image for a visual story. Generate a single frontal image of this character showing the ENTIRE body from head to toe. The background must be plain white — do not include any scenery, props, or environment. Only display the character.",
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
            text: `${characterDescription}\n\nDraw a full-body frontal view of the character facing the viewer. Show the entire character from head to toe.`,
          },
        ],
      },
    ],
  };
}

export function buildCharacterSideViewPrompt({
  styleDescription,
  settingDescription,
  characterDescription,
  frontalImage,
}: CharacterSideViewPromptInput): Prompt {
  const systemParts = [
    "You are generating a side-view version of an existing character reference image. Generate a single side-view image of this character from the left, showing the ENTIRE body from head to toe. The character must look exactly the same as in the provided frontal reference image — same outfit, proportions, colors, and style. The background must be plain white — do not include any scenery, props, or environment. Only display the character.",
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
            text: `${characterDescription}\n\nHere is the frontal reference image of this character. Generate a full-body side-view of the exact same character from the left. Maintain identical appearance, outfit, colors, and proportions.`,
          },
          {
            type: "image",
            image: frontalImage,
          },
        ],
      },
    ],
  };
}
