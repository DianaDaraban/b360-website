# B360 website

Website for **B360**, the brand of Red Division SRL, an advertising production company in Bucharest
specialised in vehicle wraps, fleet branding, window graphics, printed wallpaper and paint protection
film. It replaces the company's old WordPress theme and was built from a Figma prototype.

**Live preview:** https://b360-two.vercel.app

## Highlights

- **Interactive wrap calculator**: choose a body type and click the panels of a real car photo
  (left, right and top views) to mark them for a full wrap, lettering or wrap with logo. Panel
  outlines were traced on the photos with a watershed segmentation script (`scripts/segment_panels.py`).
- **Project gallery**: 350+ photos grouped into projects, with collage tiles, category and client
  filters (kept in the URL) and a lightbox that walks through each project.
- **Quote and contact forms**: multi-step quote form with file upload, spam protection
  (honeypot + minimum fill time) and email delivery through the Resend API (`app/api/form`).
- **Service pages** generated from typed data (`data/servicii.ts`) with FAQ structured data for SEO.
- **Brand language in CSS**: peel-off sticker buttons, scroll-snapped sections, animated titles,
  diagonal-cut icons; responsive down to small phones.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · Playwright · Vercel

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
npm test             # Playwright end-to-end tests (mobile + desktop), starts its own server on port 3100
```

The forms need these environment variables (set in Vercel, never committed):

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key |
| `FORM_TO` | address that receives the form submissions |
| `FORM_FROM` | sender address on a domain verified in Resend |

## Project structure

```
app/          pages (home, about, services, portfolio, quote, calculator, contact, privacy) and the form API route
components/   header, gallery, calculator, forms, icons and other UI pieces
data/         services, gallery projects, clients and calculator data
lib/          company details, contact data and navigation
scripts/      image import and the panel segmentation for the calculator
tests/        Playwright end-to-end tests
```

## Content

The code is open for reference. Photos, logos and texts belong to Red Division SRL / B360 and their
clients and may not be reused.
