"use client";

import { Panel } from "@xyflow/react";
import { Clapperboard, Film, Images, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAX_CHARACTER_NODES,
  MAX_COMIC_STRIP_NODES,
  MAX_LOCATION_NODES,
  MAX_MOVIE_NODES,
  MAX_STORY_IMAGE_NODES,
  useFlowStore,
} from "@/lib/store";

export function AddNodePanel() {
  const addLocationNode = useFlowStore((s) => s.addLocationNode);
  const addCharacterNode = useFlowStore((s) => s.addCharacterNode);
  const addStoryImageNode = useFlowStore((s) => s.addStoryImageNode);
  const addMovieNode = useFlowStore((s) => s.addMovieNode);
  const addComicStripNode = useFlowStore((s) => s.addComicStripNode);
  const canAddStoryImage = useFlowStore((s) => s.canAddStoryImage);
  const canAddMovie = useFlowStore((s) => s.canAddMovie);
  const canAddComicStrip = useFlowStore((s) => s.canAddComicStrip);
  const locationCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "location").length
  );
  const characterCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "character").length
  );
  const storyImageCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "storyImage").length
  );
  const movieCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "movie").length
  );
  const comicStripCount = useFlowStore(
    (s) => s.nodes.filter((n) => n.type === "comicStrip").length
  );

  const locationLimitReached = locationCount >= MAX_LOCATION_NODES;
  const characterLimitReached = characterCount >= MAX_CHARACTER_NODES;
  const storyImageDisabled = !canAddStoryImage();
  const storyImageLimitReached = storyImageCount >= MAX_STORY_IMAGE_NODES;
  const movieDisabled = !canAddMovie();
  const movieLimitReached = movieCount >= MAX_MOVIE_NODES;
  const comicStripDisabled = !canAddComicStrip();
  const comicStripLimitReached = comicStripCount >= MAX_COMIC_STRIP_NODES;

  const storyImageTitle = (() => {
    if (storyImageLimitReached) {
      return `Maximum ${MAX_STORY_IMAGE_NODES} story images reached`;
    }
    if (storyImageDisabled) {
      return "Requires at least 1 completed Location and 1 completed Character";
    }
    return "Add Story Image node";
  })();

  const movieTitle = (() => {
    if (movieLimitReached) {
      return `Maximum ${MAX_MOVIE_NODES} movie reached`;
    }
    if (movieDisabled) {
      return "Requires at least 1 completed Story Image";
    }
    return "Add Movie node";
  })();

  const comicStripTitle = (() => {
    if (comicStripLimitReached) {
      return `Maximum ${MAX_COMIC_STRIP_NODES} comic strip reached`;
    }
    if (comicStripDisabled) {
      return "Requires at least 1 completed Story Image";
    }
    return "Add Comic Strip node";
  })();

  return (
    <Panel position="bottom-center">
      <div className="flex gap-1 rounded-lg border border-[var(--node-input-border)] bg-[var(--node-surface)] p-1.5 backdrop-blur-sm">
        <Button
          className="nodrag"
          disabled={locationLimitReached}
          onClick={addLocationNode}
          size="icon-sm"
          title={
            locationLimitReached
              ? `Maximum ${MAX_LOCATION_NODES} locations reached`
              : "Add Location node"
          }
          variant="outline"
        >
          <MapPin className="size-4" />
          <span className="sr-only">Location</span>
        </Button>
        <Button
          className="nodrag"
          disabled={characterLimitReached}
          onClick={addCharacterNode}
          size="icon-sm"
          title={
            characterLimitReached
              ? `Maximum ${MAX_CHARACTER_NODES} characters reached`
              : "Add Character node"
          }
          variant="outline"
        >
          <User className="size-4" />
          <span className="sr-only">Character</span>
        </Button>
        <Button
          className="nodrag"
          disabled={storyImageDisabled}
          onClick={addStoryImageNode}
          size="icon-sm"
          title={storyImageTitle}
          variant="outline"
        >
          <Film className="size-4" />
          <span className="sr-only">Story Image</span>
        </Button>
        <Button
          className="nodrag"
          disabled={comicStripDisabled}
          onClick={addComicStripNode}
          size="icon-sm"
          title={comicStripTitle}
          variant="outline"
        >
          <Images className="size-4" />
          <span className="sr-only">Comic Strip</span>
        </Button>
        <Button
          className="nodrag"
          disabled={movieDisabled}
          onClick={addMovieNode}
          size="icon-sm"
          title={movieTitle}
          variant="outline"
        >
          <Clapperboard className="size-4" />
          <span className="sr-only">Movie</span>
        </Button>
      </div>
    </Panel>
  );
}
