const STORY_IMAGE_ASPECT_RATIO_PATTERN = [
  "16:9",
  "1:1",
  "1:1",
  "16:9",
] as const;

export type StoryImageAspectRatio =
  (typeof STORY_IMAGE_ASPECT_RATIO_PATTERN)[number];

export function getStoryImageAspectRatio(opts: {
  index: number;
}): StoryImageAspectRatio {
  if (opts.index < 0) {
    return STORY_IMAGE_ASPECT_RATIO_PATTERN[0];
  }

  return STORY_IMAGE_ASPECT_RATIO_PATTERN[
    opts.index % STORY_IMAGE_ASPECT_RATIO_PATTERN.length
  ];
}
