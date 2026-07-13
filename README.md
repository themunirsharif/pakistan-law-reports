# Pakistan Law Reports — Setup Guide

You bought the domain. Here's everything left, in order. None of it needs coding knowledge — just following steps.

## 1. Create a free GitHub account
Go to github.com → Sign up. This is where your website's files live.

## 2. Create a new repository
- Click the "+" in the top right → "New repository"
- Name it `pakistan-law-reports`
- Keep it **Public** (required for free GitHub Actions)
- Click "Create repository"

## 3. Upload these files
- On your new repo's page, click "uploading an existing file"
- Drag in everything from this folder (keep the folder structure: `judgment/`, `category/`, `scripts/`, `.github/`, `index.html`)
- Click "Commit changes"

## 4. Create a free Vercel account
- Go to vercel.com → Sign up **using your GitHub account** (this links them automatically)
- Click "Add New" → "Project"
- Select your `pakistan-law-reports` repository → Click "Deploy"
- Wait about 60 seconds. You'll get a live URL like `pakistan-law-reports.vercel.app` — your site is now genuinely live on the internet.

## 5. Connect your domain
- In your Vercel project, go to "Settings" → "Domains"
- Type in `pakistanlawreports.com` → Add
- Vercel will show you 1-2 DNS records (usually an A record and a CNAME)
- Go to Namecheap → Domain List → "Manage" next to your domain → "Advanced DNS"
- Add the records Vercel gave you
- Wait 15 minutes to a few hours for DNS to update (this part just takes time, nothing to click)

## 6. Turn on the daily auto-update
This is already set up in `.github/workflows/daily-update.yml` — once your files are uploaded to GitHub (step 3), it runs automatically every day at no cost. You don't need to do anything else. You can check it worked anytime under your repo's "Actions" tab.

**Important:** the scraper script (`scripts/fetch_judgments.py`) is a working skeleton, not finished — it needs someone to fill in the actual data-reading logic for each court's website (I've marked exactly where in the file). I'd treat this as phase 2: get the site live and looking right first, then wire up the real automation with a developer or with more of my help going through it court-by-court.

## 7. Set up Google AdSense (for revenue)
- Go to adsense.google.com → Sign up with your live domain
- Google will review the site (can take a few days to a few weeks) — needs real content, so populate at least a few dozen real judgment pages before applying
- Once approved, paste your ad code into the `<!-- Advertisement -->` slots already placed in the templates
