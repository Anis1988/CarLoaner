# Working on this repo

- Car rental website for Algeria: French and Arabic (right-to-left), prices in DA, payment in cash. Keep both languages in `src/lib/i18n.ts` in sync.
- Show money with `<Money>` (keeps numbers left-to-right inside Arabic).
- Only the owner can change data: every write goes through `netlify/functions/admin.ts` with the owner's session token. The owner sets their own password with `OWNER_SETUP_CODE` (only a scrypt hash is stored, `netlify/lib/auth.ts`).
- Light and dark mode: every colour needs a `dark:` version. Keep animations behind `prefers-reduced-motion`.
- Push directly to `main` (the owner deploys from it via Netlify).
- Do not add automated tests unless asked.
- New features: describe them and get the owner's OK before building. Bug fixes can go straight in.
- Phone-friendly is required: check a 390px-wide layout (in French and Arabic) for any UI change.
