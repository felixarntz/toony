"use client";

import { Panel } from "@xyflow/react";
import { Clapperboard, Film, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MAX_CHARACTER_NODES,
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
  const canAddStoryImage = useFlowStore((s) => s.canAddStoryImage);
  const canAddMovie = useFlowStore((s) => s.canAddMovie);
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

  const locationLimitReached = locationCount >= MAX_LOCATION_NODES;
  const characterLimitReached = characterCount >= MAX_CHARACTER_NODES;
  const storyImageDisabled = !canAddStoryImage();
  const storyImageLimitReached = storyImageCount >= MAX_STORY_IMAGE_NODES;
  const movieDisabled = !canAddMovie();
  const movieLimitReached = movieCount >= MAX_MOVIE_NODES;

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

  return (
    <Panel position="top-right">
      <div className="flex gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-lg">
        <Button
          className="nodrag"
          disabled={locationLimitReached}
          onClick={addLocationNode}
          size="sm"
          title={
            locationLimitReached
              ? `Maximum ${MAX_LOCATION_NODES} locations reached`
              : "Add Location node"
          }
          variant="outline"
        >
          <MapPin className="size-3" />
          Location{" "}
          {locationLimitReached && `(${locationCount}/${MAX_LOCATION_NODES})`}
        </Button>
        <Button
          className="nodrag"
          disabled={characterLimitReached}
          onClick={addCharacterNode}
          size="sm"
          title={
            characterLimitReached
              ? `Maximum ${MAX_CHARACTER_NODES} characters reached`
              : "Add Character node"
          }
          variant="outline"
        >
          <User className="size-3" />
          Character{" "}
          {characterLimitReached &&
            `(${characterCount}/${MAX_CHARACTER_NODES})`}
        </Button>
        <Button
          className="nodrag"
          disabled={storyImageDisabled}
          onClick={addStoryImageNode}
          size="sm"
          title={storyImageTitle}
          variant="outline"
        >
          <Film className="size-3" />
          Story Image{" "}
          {storyImageLimitReached &&
            `(${storyImageCount}/${MAX_STORY_IMAGE_NODES})`}
        </Button>
        <Button
          className="nodrag"
          disabled={movieDisabled}
          onClick={addMovieNode}
          size="sm"
          title={movieTitle}
          variant="outline"
        >
          <Clapperboard className="size-3" />
          Movie {movieLimitReached && `(${movieCount}/${MAX_MOVIE_NODES})`}
        </Button>
      </div>
    </Panel>
  );
}
