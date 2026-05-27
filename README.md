# spektacular-website

The marketing site for [Spektacular](https://github.com/jumppad-labs/spektacular),
built with [Astro 5](https://astro.build/) (MDX) and
[Tailwind CSS v4](https://tailwindcss.com/).

## Prerequisites

- [Node.js](https://nodejs.org/) v22 or newer

## Local development

```
npm install   # one-time: installs Astro, Tailwind, and MDX
npm run dev   # starts the Astro dev server with HMR
```

Astro prints the local URL (typically `http://localhost:4321/`).

## Build

```
npm run build
```

Outputs the static site to `dist/`. The deploy workflow at
`.github/workflows/deploy.yml` runs the same command in CI and publishes
`dist/` to GitHub Pages on every push to `main`.
