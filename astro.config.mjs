// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import sanity from "@sanity/astro";
import react from "@astrojs/react";
import { loadEnv } from "vite";

const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  integrations: [
    sanity({
      projectId: PUBLIC_SANITY_PROJECT_ID,
      dataset: PUBLIC_SANITY_DATASET,
      useCdn: false,
      apiVersion: "2026-06-17",
      stega: {
        studioUrl: "http://localhost:3333",
      },
    }),
    react(),
  ],
});
