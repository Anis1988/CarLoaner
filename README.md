# CarLoaner

A simple car rental website for an agency in Algeria. Customers see which cars are available, the price per day in DA,
the deposit, the conditions and any known issues, with photos, and contact the agency by phone or WhatsApp
(payment in cash at pickup). French and Arabic.

Only the owner can add, edit or remove cars, change availability, upload photos and edit the agency info.
They open it with the 🔑 button (or `/admin`) and choose **their own password**: only a scrambled (scrypt) version is
stored, so nobody else can read it. Light and dark mode, phone-first design.

The owner manages everything from the admin page, with no developer needed:
- **Agence**: name, city, phone, WhatsApp, address, opening hours and rules.
- **Mon site**: logo, banner title and text, Google Maps link (shown as an "Itinéraire" button), e-mail, Facebook and Instagram.

Every text has an optional Arabic version. When it is left empty, Arabic visitors see the French text.

## Put it online (Netlify)

1. Netlify → Add new site → Import from GitHub → this repository (build settings are in `netlify.toml`).
2. Site configuration → Environment variables → add `OWNER_SETUP_CODE` (any code you make up), then redeploy.
3. Give the owner the site address and the setup code. They tap 🔑, enter the code, and choose their own password.
   If they forget it, "Mot de passe oublié ?" + the same setup code lets them choose a new one.
   To stop the code from being reused, change it in Netlify afterwards (the owner's password keeps working).

Data and photos are stored in Netlify Blobs (no database to manage). Photos are shrunk on the phone before upload.

## Run locally

```bash
npm install
npm run dev:full   # site + functions at http://localhost:8888 (put OWNER_SETUP_CODE in a .env file)
```
