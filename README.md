# CarLoaner

A simple car rental website for an agency in Algeria. Customers see which cars are available, the price per day in DA,
the deposit, the conditions and any known issues, with photos, and contact the agency by phone or WhatsApp
(payment in cash at pickup). French and Arabic.

Only the owner can add, edit or remove cars, change availability, upload photos and edit the agency info,
at `/admin`, with one password.

## Put it online (Netlify)

1. Netlify → Add new site → Import from GitHub → this repository (build settings are in `netlify.toml`).
2. Site configuration → Environment variables → add `OWNER_PASSWORD` (the owner's password), then redeploy.
3. Open `https://<your-site>.netlify.app/admin`, enter the password, and replace the example cars and agency info.

Data and photos are stored in Netlify Blobs (no database to manage). Photos are shrunk on the phone before upload.

## Run locally

```bash
npm install
npm run dev:full   # site + functions at http://localhost:8888 (put OWNER_PASSWORD in a .env file)
```
