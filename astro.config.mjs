import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import astroExpressiveCode from "astro-expressive-code";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://spektacular.dev",
  // astroExpressiveCode must come before mdx() so it processes fenced code
  // blocks in .mdx files before MDX hands them off.
  integrations: [astroExpressiveCode(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
