# Pakistan Law Reports

A free, searchable archive of Pakistani case law - built with Next.js, ready to deploy on Vercel.

## What's in here

- `app/` - all pages (homepage search, individual judgment pages, court pages, About/Contact/Privacy)
- `data/` - the cleaned judgment dataset (1,183 judgments)
- `lib/data.js` - helpers that read the dataset
- `components/SearchBrowse.js` - the search & filter UI on the homepage
- `public/robots.txt` and `public/ads.txt` - SEO/AdSense groundwork

## Getting this onto GitHub (one-time)

1. Go to your repo: https://github.com/pakistanlawreports/pakistan-law-reports
2. Click **"Add file"** → **"Upload files"**
3. Drag the entire contents of this folder into the upload area (all files and folders together - GitHub preserves the folder structure)
4. Scroll down, add a commit message like "Initial site", click **"Commit changes"**

## Deploying on Vercel

1. Go to vercel.com, sign in (you can use "Continue with GitHub")
2. Click **"Add New..." → "Project"**
3. Find and import `pakistan-law-reports` from your GitHub account
4. Leave all settings as default (Vercel auto-detects Next.js) → click **Deploy**
5. Wait ~2 minutes - Vercel will give you a live URL like `pakistan-law-reports.vercel.app`

## Connecting your domain

Once deployed:
1. In the Vercel project → **Settings → Domains** → add `pakistanlawreports.com`
2. Vercel will show you DNS records to add
3. Add those records in Namecheap → **Domain List → Manage → Advanced DNS**
4. Wait for DNS propagation (15 min - 24 hrs)

## Adding AdSense later

1. Once approved, edit `public/ads.txt` - replace the placeholder line with the real one Google gives you
2. Add your AdSense script tag to `app/layout.js` (I can do this step when you have the code)

## Local testing (optional, needs Node.js installed)

```
npm install
npm run dev
```

Then open http://localhost:3000
