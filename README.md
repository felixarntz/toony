# Toony - Work in Progress

AI-powered cartoon movie maker built with Next.js. Define your art style, characters, and locations, then compose story scenes that get turned into AI-generated images and videos — all through an intuitive node-based canvas.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffelixarntz%2Ftoony&env=AI_GATEWAY_API_KEY&envDescription=API%20key%20for%20AI%20Gateway%20(image%20and%20video%20generation))

Toony treats storytelling as a graph: connect style, character, location, and scene nodes on a canvas, and AI fills in the visuals. Change your art style from Ghibli to Pixar, swap a character, and every downstream image regenerates. Then it turns the story into a short movie.

## Features

- **Visual node canvas** — drag-and-drop workflow powered by React Flow with auto-layout
- **Style presets** — choose from Ghibli, Pixar, comic book, watercolor, and more
- **Location generation** — describe a scene and generate a background image with AI
- **Character portraits** — generate frontal and side-profile character reference sheets
- **Story image composition** — combine locations, characters, and scene descriptions into story frames
- **Movie generation** — stitch story images into animated clips, bringing static scenes to life
- **Export/Import** — save and load projects as ZIP files

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [React Flow](https://reactflow.dev) (node-based canvas)
- [AI SDK](https://ai-sdk.dev) with [AI Gateway](https://ai-sdk.dev/docs/ai-sdk-core/ai-gateway) (image and video generation)
- [Zustand](https://zustand-demo.pmnd.rs) (state management)
- [shadcn/ui](https://ui.shadcn.com) (UI components)
- [Tailwind CSS](https://tailwindcss.com) (styling)
- [Biome](https://biomejs.dev) (linting and formatting via Ultracite)

## Local Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/felixarntz/toony.git
   cd toony
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Copy the environment file and add your API key:

   ```bash
   cp .env.example .env.local
   ```

   Set `AI_GATEWAY_API_KEY` in `.env.local`.

4. Start the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) to start building your story.
