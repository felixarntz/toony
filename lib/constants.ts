import type { StylePreset } from "@/lib/types";

export const STYLE_PRESET_LABELS: Record<StylePreset, string> = {
  "ghibli-anime": "Ghibli Anime",
  "pixar-3d": "Pixar 3D",
  "comic-book": "Comic Book",
  watercolor: "Watercolor",
  "retro-cartoon": "Retro Cartoon",
  manga: "Manga",
  "oil-painting": "Oil Painting",
  "pixel-art": "Pixel Art",
  "paper-cutout": "Paper Cutout",
  claymation: "Claymation",
  "wes-anderson-film": "Wes Anderson Film",
  "zack-snyder-film": "Zack Snyder Film",
  "sin-city-noir": "Sin City Noir",
  custom: "Custom",
};

export const STYLE_PRESET_DESCRIPTIONS: Record<
  Exclude<StylePreset, "custom">,
  string
> = {
  "ghibli-anime":
    "Studio Ghibli-inspired anime with soft watercolor textures, warm natural lighting, detailed pastoral backgrounds, expressive character designs with large eyes, gentle color palette with lush greens and sky blues, hand-painted aesthetic with visible brush texture.",
  "pixar-3d":
    "Pixar-style 3D rendering with smooth subsurface scattering on skin, vibrant saturated colors, exaggerated proportions, cinematic lighting with soft shadows, detailed textures and materials, warm and appealing character designs with expressive faces.",
  "comic-book":
    "Bold ink outlines, Ben-Day dots, dynamic panel-style compositions, high contrast with flat color fills, action lines and motion effects, dramatic foreshortening, speech bubble-ready compositions with strong graphic impact.",
  watercolor:
    "Delicate watercolor painting with visible brush strokes, soft color bleeds, paper texture, muted palette with occasional vibrant accents, gentle washes of color, organic flowing edges, translucent layered pigments.",
  "retro-cartoon":
    "Classic Hanna-Barbera/Looney Tunes style with thick outlines, limited cel-shading, exaggerated squash-and-stretch, simple flat backgrounds, bold primary colors, rubber-hose animation aesthetic, playful and energetic compositions.",
  manga:
    "Japanese manga style in black and white with screen tones, dramatic speed lines, detailed crosshatching, expressive exaggerated emotions, dynamic panel compositions, high contrast ink work, distinctive large-eyed character designs.",
  "oil-painting":
    "Rich oil painting with visible impasto brushwork, deep chiaroscuro lighting, Renaissance-inspired composition, warm earth tones, dramatic light and shadow interplay, textured canvas feel, classical painterly technique.",
  "pixel-art":
    "Retro pixel art with a limited 16-bit color palette, clean pixel-perfect edges, dithering for gradients, nostalgic game-inspired aesthetic, chunky character sprites, tiled backgrounds, crisp geometric shapes.",
  "paper-cutout":
    "Layered paper cutout style with visible paper textures, subtle drop shadows between layers, flat geometric shapes, craft-like handmade feel, torn and cut edges, collage-inspired compositions, tactile material quality.",
  claymation:
    "Stop-motion claymation look with visible fingerprint textures on surfaces, slightly uneven proportions, warm soft lighting, matte material finish, rounded organic shapes, subtle surface imperfections, miniature set aesthetic.",
  "wes-anderson-film":
    "Wes Anderson cinematic style with perfectly symmetrical compositions, pastel color palette, flat frontal framing, whimsical set design, vintage typography elements, meticulous production design, deadpan character staging.",
  "zack-snyder-film":
    "Zack Snyder cinematic style with desaturated cool tones, dramatic slow-motion compositions, high contrast backlighting, epic wide-angle perspectives, rain and particle effects, muscular heroic figures, operatic visual intensity.",
  "sin-city-noir":
    "Sin City neo-noir style with stark black and white high contrast, selective color splashes of red and yellow, heavy shadows, rain-soaked urban settings, graphic novel composition, hard-boiled character silhouettes, dramatic angular lighting.",
};
