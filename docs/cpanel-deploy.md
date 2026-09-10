# Deploy on Iranian cPanel — ONE GOOD

ZarinPal asked you to finish a **complete Persian site with real services and prices** before approving the gateway. Content for that is in the repo (campaigns, `/packages`, about, contact, transparency).

## Important reality check

This app is **Next.js + PostgreSQL + Node**, not WordPress/PHP.

| cPanel type | Can it run this? |
| --- | --- |
| Shared cPanel (only PHP + MySQL) | **No** for production |
| cPanel + **Node.js Selector** + **PostgreSQL** | Possible |
| VPS / cloud (Arvan, Liara, …) | **Recommended** |

If your host only gives PHP/MySQL, ask them for:
1. Node.js 20+ (or 22)
2. PostgreSQL 14+ (or managed Postgres)
3. Ability to run a long-lived Node process / Passenger / PM2

Otherwise keep cPanel for **domain + DNS + email**, and put the app on a small VPS.

---

## A) What to do with project files

### On your computer

```bash
cd E:\keeperofthegoods
cp .env.example .env
# edit .env (see below)
npm install
npx prisma db push
npm run db:seed
npm run build
```

### Upload options

**Option 1 — Git on server (best)**  
SSH into host → clone repo → install → build → start.

**Option 2 — Upload build**  
Upload the whole project (or zip without `node_modules`), then on server:

```bash
npm ci
npx prisma generate
npx prisma db push
npm run db:seed
npm run build
npm run start
```

Do **not** upload your local `.env` with secrets to a public folder. Put `.env` outside `public_html` if possible.

### Env values (production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
AUTH_SECRET=long-random-string-at-least-32-chars
AUTH_URL=https://YOUR-DOMAIN.ir
PAYMENT_GATEWAY=mock
ZARINPAL_MERCHANT_ID=
ZARINPAL_SANDBOX=true
CRON_SECRET=another-long-secret
STORAGE_DRIVER=local
```

Keep `PAYMENT_GATEWAY=mock` until ZarinPal approves. Then switch to `zarinpal`.

`AUTH_URL` **must** be your real HTTPS domain (this is what OpenGraph and callbacks use).

---

## B) Database

1. In cPanel / host panel: create **PostgreSQL** database + user (not MySQL).
2. Put connection string in `DATABASE_URL`.
3. On server:

```bash
npx prisma db push
# or: npx prisma migrate deploy
npm run db:seed
```

Seed creates:
- Admin: `owner@hafez.local` / `ChangeMeOwner!234` → **change immediately**
- Published campaigns with item prices (collected = 0 until real donations)
- No fake stats / donations / testimonials

4. Open `https://YOUR-DOMAIN.ir/admin/login` and change password.
5. Check:
   - `/` homepage
   - `/packages` (prices — important for ZarinPal)
   - `/campaigns` and each campaign with item table
   - `/about` `/contact` `/privacy` `/terms` `/transparency`

---

## C) After site is live — request ZarinPal again

Tell them (and show links):

- Site is Persian and complete  
- Services/packages with **real prices**: `https://DOMAIN/packages`  
- Active campaigns with itemized costs: `https://DOMAIN/campaigns`  
- Contact + about + legal pages exist  

Callback URL to register later:

`https://YOUR-DOMAIN.ir/donation/callback`

---

## D) If Node is not available on cPanel

1. Buy a small Iranian **VPS** (2 CPU / 4 GB).
2. Point domain DNS A-record to VPS (keep email on cPanel if you want).
3. Follow `docs/phase-10-deploy.md` (Docker + Nginx).

---

## Quick checklist before re-applying to ZarinPal

- [ ] Domain opens on HTTPS  
- [ ] Persian homepage, about, contact, privacy, terms  
- [ ] `/packages` shows named packages + prices  
- [ ] At least 2–3 published campaigns with item prices  
- [ ] Contact email is a real inbox on your domain  
- [ ] No “under construction” / empty product pages  
- [ ] Admin password changed from seed default  
