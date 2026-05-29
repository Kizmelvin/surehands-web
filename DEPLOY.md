# Deploying Sure Hands Web → GitHub + Vercel

This walks you through the **exact** commands and clicks to (1) push this project to GitHub and (2) host it on Vercel with a public URL you can share with your test team.

Total time: **~10 minutes**, including waiting for the first deployment.

---

## 1. Pre-flight checklist

Before pushing anything, run these once locally:

```bash
cd /Users/Melvin/Desktop/sure-hands-web

# Make sure dependencies are installed
npm install

# Confirm the production build still passes
npm run build

# Confirm types are clean
npm run type-check
```

If both finish without errors, you're ready.

> ⚠️ Verify `.env.local` is **not** going to be pushed. `git status` should NOT list it. (`.gitignore` already excludes `.env*.local`.)

---

## 2. Push the web project to GitHub

### 2a. Create the GitHub repo (via CLI)

If you have the [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated:

```bash
cd /Users/Melvin/Desktop/sure-hands-web

# Initialize git in this folder
git init -b main

# Stage and commit everything
git add .
git commit -m "Initial commit: Sure Hands web (Next.js 14, TS, Tailwind, Supabase auth)"

# Create a new GitHub repo and push (replace YOUR-ORG with your GH username/org)
gh repo create YOUR-ORG/sure-hands-web --public --source=. --remote=origin --push
```

### 2b. Create the GitHub repo (manually, no CLI)

If you'd rather use the GitHub website:

1. Go to **https://github.com/new**
2. Repository name: `sure-hands-web`
3. Visibility: **Private** (recommended while in beta) or **Public**
4. Do NOT initialize with a README, .gitignore, or license — we already have them.
5. Click **Create repository**.
6. Back in your terminal:

```bash
cd /Users/Melvin/Desktop/sure-hands-web

git init -b main
git add .
git commit -m "Initial commit: Sure Hands web (Next.js 14, TS, Tailwind, Supabase auth)"
git remote add origin https://github.com/YOUR-ORG/sure-hands-web.git
git push -u origin main
```

### 2c. (Optional) Also push the mobile app

If you want the test team to access the Expo app too, do the same in `/Users/Melvin/Desktop/sure-hands`:

```bash
cd /Users/Melvin/Desktop/sure-hands

# This folder already has a .git directory — confirm what's tracked
git status

# Stage the new ALIGNMENT.md and any updated files
git add ALIGNMENT.md
git commit -m "Add PRD alignment audit + parity notes for web companion"

# Add a remote and push (create the repo on GitHub first, like 2b above)
git remote add origin https://github.com/YOUR-ORG/sure-hands.git
git push -u origin main
```

---

## 3. Deploy to Vercel

### 3a. Import the repo

1. Go to **https://vercel.com/new**.
2. Sign in with GitHub if you haven't.
3. Click **Import** next to `sure-hands-web`.
4. Vercel auto-detects Next.js. Leave the framework preset alone.
5. **Project name**: `sure-hands-web` (or whatever you want — this becomes your `*.vercel.app` URL).
6. **Root Directory**: leave as `.`.
7. **Build Command**: leave default (`next build`).
8. **Output Directory**: leave default.

### 3b. Add environment variables (critical)

In the same import screen, expand **Environment Variables** and add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xfynmfzcpnqjoitgrqxf.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(copy from your `.env.local`)* |

> The values are the same ones currently in `sure-hands-web/.env.local`. If you ever rotate the Supabase anon key, update it in Vercel's **Project → Settings → Environment Variables** and trigger a redeploy.

### 3c. Click **Deploy**

The first build typically takes **2–3 minutes**. When it finishes, Vercel gives you:

- A production URL: `https://sure-hands-web.vercel.app`
- A preview URL for every future PR / branch push

Share the production URL with your test team.

---

## 4. Configure Supabase for the new domain

You **must** tell Supabase about your Vercel URL so auth redirects work. Otherwise sign-up will fail with a CORS / redirect error.

1. Open https://supabase.com/dashboard → your `sure-hands` project.
2. Go to **Authentication → URL Configuration**.
3. Add your Vercel URL to **Site URL**:
   ```
   https://sure-hands-web.vercel.app
   ```
4. Add it to **Redirect URLs** as well:
   ```
   https://sure-hands-web.vercel.app/**
   http://localhost:3000/**
   ```
5. Save.

If you set up a custom domain later (e.g. `app.surehands.ng`), add it here too.

---

## 5. (Optional) Set up automatic preview deployments

Vercel automatically deploys every branch and pull request. To make this useful:

1. Create branches like `feature/booking-lifecycle` or `feature/mapbox-radius`.
2. Push them: `git push origin feature/...`.
3. Vercel comments on the PR with a unique preview URL.

This is gold for your test team — they can review features before they hit production.

---

## 6. Hand-off to the test team

Send them this:

> 🔧 **Sure Hands Web — Beta Preview**
>
> - **App**: https://sure-hands-web.vercel.app
> - **Sign up**: any email + password works.
> - **Try both roles**: sign up once as a "Client" and once as a "Worker" (different email each time) to see both portals.
> - **Profile photo**: upload one during sign-up — it appears in the header avatar and on your `/account` page.
> - **Browse without signing in**: the landing page and `/client/workers` are public.
> - **Mobile app (Expo)**: separate repo at `https://github.com/YOUR-ORG/sure-hands`. Build/run instructions in that README.
> - **Known limitations** (see `NEXT-STEPS.md`): no real map yet, no booking lifecycle backend, no payment integration. Data shown for workers and jobs is seed data — the goal of this preview is the **flow + trust UX**, not live data.
> - **Feedback**: please file issues at `https://github.com/YOUR-ORG/sure-hands-web/issues`.

---

## 7. Troubleshooting

**Build fails on Vercel but works locally?**
Check that all env vars are added in the Vercel project settings.

**Sign-up succeeds but the user can't reach `/account`?**
Confirm the Supabase redirect URLs include your Vercel domain (Section 4).

**Profile photo upload returns 403?**
The `media` bucket RLS expects the path to start with the user's UID. The web's `PhotoUploader` already does this — but if you changed the upload code, the path must be `<auth.uid()>/<folder>/<file>`. The policy lives in `../sure-hands/supabase_rls.sql`.

**Want a custom domain?**
Vercel → Project → Domains → add `app.surehands.ng`. Update your DNS as Vercel instructs, then add the new URL to Supabase Authentication → URL Configuration.

---

## Quick reference

```bash
# After local changes, ship to prod:
git add .
git commit -m "Describe what changed"
git push                   # Vercel auto-deploys

# Roll back a bad deploy:
# Vercel dashboard → Deployments → click the previous green deploy → "Promote to Production"
```
