# Stitch PDF

Merge PDF files in the browser. Reorder whole documents or individual pages, then download a single combined PDF. Files never leave your device.

## Features

- **Local processing** — merging runs entirely in the browser with [pdf-lib](https://pdf-lib.js.org/)
- **Multiple uploads** — drag and drop or pick several PDFs at once
- **File order** — reorder documents before merging
- **Page order** — expand the queue to pages and rearrange (including across files), or drop individual pages
- **Download** — export as `*-stitched.pdf`

## Getting started

**Requirements:** Node.js 20+ (LTS recommended)

```bash
npm install
cp .env.example .env   # optional: Google AdSense
npm run dev
```

Open the URL Vite prints (usually [http://localhost:5173](http://localhost:5173)).

### Google AdSense (optional)

Ads load only when both variables are set in `.env` (see `.env.example`):

| Variable | Description |
| -------- | ----------- |
| `VITE_ADSENSE_CLIENT_ID` | Publisher ID (`ca-pub-…`) |
| `VITE_ADSENSE_SLOT` | Numeric ad unit slot from AdSense |

Restart the dev server after changing `.env`. The ad unit sits below the main controls (away from merge/download buttons). Unfilled or blank slots on `localhost` are normal until the site is approved and served on your production domain.

### Other scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run build`   | Production build to `dist/`    |
| `npm run preview` | Serve the production build locally |

Deploy the contents of `dist/` to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Project layout

```
src/
  App.tsx           UI: upload, reorder, merge
  lib/
    pdfPages.ts     Page extraction and ordered merge
    mergePdfs.ts    Merge whole files in sequence
```

## Limitations

- Password-protected or heavily encrypted PDFs may fail to load or merge
- Very large files are limited by browser memory
- Layout and fonts are preserved as pdf-lib allows; complex PDFs may not merge perfectly in edge cases

## License

Private project unless you add an open-source license.
