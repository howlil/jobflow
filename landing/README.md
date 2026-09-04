# Jobflow Landing

Standalone marketing site for Jobflow, built with Astro and Tailwind CSS.

## Development

```bash
cd landing
pnpm install
pnpm dev
```

Production build:

```bash
pnpm build
```

## Design contract

The landing page mirrors the canonical Jobflow tokens from `../.agents/DESIGN.md` rather than defining a separate brand palette:

- monochrome surfaces and actions by default;
- semantic color only for meaningful state;
- 1px structural strokes;
- 6px controls and 8px overlay geometry;
- Inter/system sans with IBM Plex Mono/system mono for technical labels;
- no gradients, glassmorphism, decorative card stacks, or invented social proof.

The site honors the existing light and dark token sets through `prefers-color-scheme`.
