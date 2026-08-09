# Phoneefy — Merged App (Admin Panel + Shopkeeper/Customer App)

This is your two Phoneefy projects merged into **one app**, backed by a real
Supabase database (project `hdqmxlugdbwdcelweiof`). Nothing here is mock
data anymore for the core flow — admin creates shopkeepers, shopkeepers log
in and add real phones with real photo uploads, and those phones show up in
the public marketplace.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL:
- `/` → the customer + shopkeeper app (this is the "phoneefy" app)
- `/admin` → the Admin Panel

Your Supabase URL and public (anon) key are already in `.env`. The anon key
is safe to be public — all real protection happens via Row Level Security
policies and the two server-side functions described below.

## First-time setup — creating your admin account

1. Go to `/admin`
2. Since no admin exists yet, the login screen will show **"Create the admin
   account"** instead of a normal login form
3. Enter the email and password you want to use — this becomes the one
   permanent admin account. (This form only ever works once; after that it's
   a normal login screen.)

## How the core flow works now

**Admin adds a shopkeeper** (`/admin` → Shops → Register New Shop):
- You fill in shop name, owner, mobile number, address, etc.
- Submitting calls a secure Supabase Edge Function (`create-shopkeeper`)
  that creates a real login for the shopkeeper and generates a random
  temporary password
- You're shown that password once — copy it and send it to the shopkeeper
  (they log in with their **mobile number or Shop ID** + this password)

**Shopkeeper adds a phone** (main app → Shopkeeper Login → Dashboard → Add Phone):
- First login with the temp password forces them to set their own password
- The Add Phone form captures phone name, brand, model, **year**, IMEI,
  storage, RAM, **ROM**, color, condition, price, and photos
- Photos are uploaded for real to Supabase Storage (bucket `phone-images`,
  one private folder per shop)
- Saving inserts a real row into the `phones` table — it immediately shows
  up in the shopkeeper's own inventory, and (once its status is "available")
  in the public marketplace on the home/search screens

**Customers can create real accounts too** (landing page → Customer Login):
- Sign up with name, mobile number, and a password of their choosing —
  this is self-serve, no admin approval needed
- Stored in a real `customers` table in Supabase, linked to a real Supabase
  Auth login (password hashed and managed by Supabase, never stored in
  plain text anywhere)
- "Continue as Guest" skips all of this and goes straight to browsing, same
  as before — an account is optional, not required to browse or buy

## What's real vs. what's still a placeholder

Real and backed by Supabase: admin login/bootstrap, shopkeeper accounts,
shop directory, phone listings (create/edit/delete/mark sold), photo
uploads, password resets, access enable/disable, public browsing (home,
search, shop profiles, device details).

Still using local/mock data (not part of what you asked for, but left in
place so the UI doesn't break) — worth knowing about if you keep building:
- **Ratings** on shops are a flat placeholder (4.5) — there's no review
  system yet.
- **Distance** shown on shop cards is actually just the shop's city — there's
  no real geolocation.
- **IMEI/CEIR verification** pages simulate the check — real verification
  needs a paid third-party API (e.g. the government CEIR portal or a
  commercial IMEI-check API), which nobody had access to for this build.
- Admin's **Analytics/Complaints/Subscriptions/Notifications** pages still
  use illustrative numbers — the underlying tables for these don't exist yet.
- The shopkeeper's own **Profile/Settings/Offers** screens still use local
  mock data.

None of these affect the "admin adds shopkeepers → shopkeepers add phones →
data is stored in Supabase" flow you asked for — that part is fully real.

## Deploying

```bash
npm run build
```

This outputs a static site to `dist/` — deploy it anywhere that serves
static files (Vercel, Netlify, Replit, etc.). Because routing is done in
JavaScript (not server-side), make sure your host redirects all paths to
`index.html` (a "SPA fallback" / "rewrite all routes to /index.html" setting).

## Your Supabase project

- Tables: `profiles`, `shops`, `phones`, `customers` — all with Row Level Security
- Storage bucket: `phone-images` (public read, per-shop write access)
- Edge Functions: `bootstrap-admin`, `create-shopkeeper`,
  `reset-shopkeeper-password`, `customer-signup` — these hold the elevated
  permissions needed to create/reset accounts, so that power never lives in
  the browser code
