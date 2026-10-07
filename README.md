# B360.ro

Site nou pentru B360 Producție publicitară (colantări auto, branding flote, vitrine, folie PPF), construit în Next.js 16 pe baza prototipului Figma și a fotografiilor din vechea temă WordPress.

## Comenzi

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm test               # teste Playwright (mobil + desktop); pornește singur serverul pe portul 3100
npm run import-images  # reimportă fotografiile din WordPress-ul local în public/ (WebP)
```

## Structură

- `app/` – paginile: Acasă, Despre noi, Servicii, Portofoliu, Cerere ofertă, Calculator, Contact
- `components/` – Header (meniul din Figma), BottomBar (bara roșie de pe mobil), Gallery, ContactCta
- `data/servicii.ts` – textele serviciilor; `data/lucrari.json` – galeria, generată de scriptul de import
- `lib/site.ts` – telefon, email, adresă, meniu
- `tests/` – teste end-to-end Playwright, rulate și în GitHub Actions

## De completat

- trimiterea formularelor pe email și prețurile din calculator (faza 4)
- detaliile PPF: marca foliei, garanția, pachetele
- recenzii reale (Google Business Profile) pentru secțiunea „Părerea clienților”
