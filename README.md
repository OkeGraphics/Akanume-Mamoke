# Akanume Mamoke — Art Director Portfolio

A minimal, responsive two-page portfolio built with plain HTML, CSS and a small amount of JavaScript.

## Files

- `index.html` — Selected work, grouped into Flyers & Campaigns, Motion Design, Brand Design, and Documents Design.
- `about.html` — About, capabilities, approach, and CV download section.
- `css/style.css` — Layout, responsive styles, artwork specimens, and subtle interactions.
- `js/main.js` — Mobile navigation, reduced-motion-aware reveal transitions, and footer year.
- `assets/` — Place your CV PDF here.

## Run locally

Open `index.html` in a browser. For the most reliable local development experience, run a static server from this folder, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Before publishing

1. Replace the placeholder project specimens in `index.html` with real portfolio projects and accurate project details. The current artwork is made from CSS and HTML shapes as a layout guide, not presented as client work.
2. Add the final CV as `assets/cv.pdf`. The About page's Download CV button already points to that path.
3. Replace `hello@yourdomain.com` in both HTML files with the correct contact email.
4. Edit the biography and capability labels as needed to reflect verified experience and services.
5. Optional: replace the Google Fonts import with locally hosted fonts if you want to avoid external font requests.

## Interactions

- Small hover shifts and color transitions on links and project artwork.
- A restrained scroll reveal for selected sections.
- Compact mobile navigation with Escape-key support.
- `prefers-reduced-motion` support for visitors who request reduced motion.

No framework, package manager, build step, or external JavaScript library is required.
