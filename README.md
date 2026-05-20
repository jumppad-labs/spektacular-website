# spektacular-website

The marketing site for [Spektacular](https://github.com/jumppad-labs/spektacular),
built with [Hugo](https://gohugo.io/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) v0.161.0 or newer
- [Node.js](https://nodejs.org/) v20 or newer (for the Tailwind CLI)

## Local development

```
make install   # one-time: installs Tailwind via npm
make serve     # starts hugo server with live reload
```

Hugo prints the local URL (typically `http://localhost:1313/`).

## Build

```
make build
```

Outputs the static site to `public/`. The deploy workflow at
`.github/workflows/deploy.yml` runs the same command in CI and publishes
`public/` to GitHub Pages on every push to `main`.
