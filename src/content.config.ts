import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tutorials = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/tutorials" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { tutorials };
