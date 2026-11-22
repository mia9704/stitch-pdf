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

### Google AdSense Auto ads (optional)

Set your publisher ID in `.env` (see `.env.example`):

| Variable | Description |
| -------- | ----------- |
| `VITE_ADSENSE_CLIENT_ID` | Publisher ID (`ca-pub-…` or `pub-…`; normalized at build time) |

In AdSense, open **Ads → By site**, select your domain, and turn on **Auto ads** (choose which formats you want). The build injects the AdSense script and meta tag into `index.html`, and writes `ads.txt` to `dist/` so Google’s crawler can verify without running your React bundle.

Restart the dev server after changing `.env`. Ads usually do not show on `localhost` until your site is approved on the live domain.

#### If AdSense says it couldn’t verify your site

1. **Deploy a production build** — verification does not work on `localhost`. Run `npm run build` and host everything in `dist/`.
2. **Set env on the host** — `VITE_ADSENSE_CLIENT_ID` must be present **when you build** (Vercel/Netlify project env vars), not only in your laptop `.env`. Rebuild after setting it.
3. **Confirm the domain** — the URL in AdSense must match exactly (including `www` vs apex, and `https`).
4. **Check live HTML** — View Source on your homepage. You should see `google-adsense-account` meta and the `adsbygoogle.js?client=ca-pub-…` script in `<head>`.
5. **Check `https://yourdomain.com/ads.txt`** — it should list your `pub-…` line (generated at build time when the client ID env var is set).
6. In AdSense, try **Verify site** again after deploy, or use the **meta tag** / **ads.txt** verification option if offered.

`public/robots.txt` allows crawlers; do not block Google at the CDN or host level.

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
