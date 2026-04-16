# Architecture

## Stack

Plain HTML/CSS/JS — no build step, no framework, no bundler. Files are served
directly via `python3 -m http.server 8080` (`make serve`).

- `assets/css/style.css` — single global stylesheet using CSS custom properties
  as a design token system
- `assets/js/main.js` — minimal JS: clipboard copy and smooth scroll only
- `assets/images/` — static images (e.g. TUI screenshot)

## Page Structure

Every page follows the same shell:

```
nav
  (page-hero | hero)     ← hero only on index.html; page-hero on inner pages
  section(s)
footer
```

Inner pages use `.page-hero` (smaller, with border-bottom) rather than the full
`.hero` used on `index.html`.

## Section Pattern

```html
<section class="section">          <!-- or section--alt for darker bg -->
  <div class="container">
    <div class="section__header">  <!-- h2 + p, margin-bottom: 4rem -->
      <h2>...</h2>
      <p>...</p>
    </div>
    <!-- content -->
  </div>
</section>
```

Use `section--alt` to alternate background colour between adjacent sections for
visual rhythm. Use a `section--{page}` modifier to override padding when the
page hero already provides top context (e.g. `section--install` reduces
padding-top from 6rem to 3rem and section__header margin-bottom from 4rem to
2rem).

## Footer Pinning

`body` is a flex column with `min-height: 100vh`. `.footer` has `margin-top:
auto` so it always sits at the bottom of the viewport on short pages.
