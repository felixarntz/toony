# Toony - Work in Progress

A visual canvas for crafting animated stories powered by AI. Define your art style, characters, and locations, then compose story scenes that get turned into AI-generated images and videos — all through an intuitive node-based editor.

## Why it's cool

Toony treats storytelling as a graph: connect style, character, location, and scene nodes on a canvas, and AI fills in the visuals. Change your art style from Ghibli to Pixar, swap a character, and every downstream image regenerates. It turns the creative pipeline from "prompt and pray" into something modular and composable.

## What it showcases

- **AI SDK** — uses the Vercel AI SDK for structured generation and streaming across multiple AI providers
- **AI Gateway** — routes model calls through the Vercel AI Gateway for unified access to image and video models
- **Advanced image generation** — produces character reference sheets, location art, and full story scenes with style-consistent prompts
- **Video generation** — stitches story images into animated clips, bringing static scenes to life
- **Node-based UI** — built on React Flow, giving users a visual, non-linear way to assemble stories

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to start building your story.

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffelixarntz%2Ftoony)
