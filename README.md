# The Addict — website

Restaurant website for **The Addict** (Lebanon). Visitors browse the menu, build their order (with combo and drink questions), and send it straight to the restaurant on WhatsApp (+961 71 181 987).

- Static site: plain HTML, CSS and JavaScript. **No backend, no database, no API keys, no npm dependencies.**
- Hosted on **Vercel**. Only the `public/` folder is published (set in `vercel.json`).
- Security headers (CSP, HSTS, X-Frame-Options and others) are set in `vercel.json`.

## Folder layout

```
public/                 <- everything the website serves
  index.html            <- generated from scripts/index.template.html (do not edit by hand)
  404.html
  assets/css/styles.css
  assets/js/            <- app.js (entry), data.js (MENU), store.js (cart), flow.js (combo/drink questions),
                           cart.js (order + WhatsApp message), menu.js, background.js, intro.js, ui.js, sheet.js
  assets/img/           <- logo.svg (vector logo), pattern.svg (moving food background)
  assets/fonts/         <- self-hosted Fredoka + Nunito (SIL Open Font License)
scripts/
  index.template.html   <- edit the page here
  build-html.py         <- inlines the logo into public/index.html
  security-check.sh     <- live security test against the deployed site
vercel.json             <- hosting config + security headers
```

## Updating the menu

All items, categories, prices, combo fries and drinks are in `public/assets/js/data.js`.
Every item has its name and description in **both languages**: `['English', 'عربي']`.
Prices are in **cents** (`950` = $9.50). Items with `combo: true` trigger the combo questions.
Tags (`offer`, `combo`, `new`, `best`) put an item in the **Addict Specialties** section.

## Languages (English / Arabic)

The site has two fully separate versions: English (left-to-right) and Arabic (right-to-left).
Visitors switch with the **EN | عربي** button in the top bar; the choice is remembered on their phone.
Direct links: `/?lang=en` and `/?lang=ar` (handy for Instagram bio or QR codes).
All button and screen texts are in `public/assets/js/i18n.js` (English block, then Arabic block).
The WhatsApp order message is written in the language the customer is using.

## Editing the page

Edit `scripts/index.template.html`, then run:

```bash
python3 scripts/build-html.py
```

## Run locally

```bash
python3 -m http.server 8080 --directory public
```

Open http://localhost:8080 (add `?intro=1` to replay the fire intro, it plays once per visit).

## Security check after each deploy

```bash
bash scripts/security-check.sh https://your-live-domain
```

See `docs/SECURITY-REVIEW.md` for the full pre-launch review.
