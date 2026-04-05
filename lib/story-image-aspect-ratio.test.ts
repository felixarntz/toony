import { describe, expect, it } from "vitest";
import { getStoryImageAspectRatio } from "./story-image-aspect-ratio";

describe("getStoryImageAspectRatio", () => {
  it("returns the expected repeating pattern", () => {
    const actual = [0, 1, 2, 3, 4, 5, 6, 7].map((index) =>
      getStoryImageAspectRatio({ index })
    );

    expect(actual).toEqual([
      "16:9",
      "1:1",
      "1:1",
      "16:9",
      "16:9",
      "1:1",
      "1:1",
      "16:9",
    ]);
  });
});
