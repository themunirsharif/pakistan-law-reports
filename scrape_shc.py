"""
Sindh High Court - Live Judgment Scraper
------------------------------------------
Runs in GitHub Actions on a schedule. Uses a real headless browser
(Playwright) since the site's judgment listing loads via JavaScript,
not plain HTML.

Remembers what it already has (data/shc_seen.json) so repeat runs are
fast and only fetch new judgments.
"""

import asyncio
import json
import os
import re
import time

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

BASE = "https://caselaw.shc.gov.pk"
HOME_URL = f"{BASE}/caselaw/public/home"

DATA_DIR = "data"
JUDGMENTS_FILE = os.path.join(DATA_DIR, "shc_judgments.json")
SEEN_FILE = os.path.join(DATA_DIR, "shc_seen.json")
DELAY_SECONDS = 1.5
MAX_NEW_PER_RUN = 100  # safety cap so one run can't blow up unexpectedly

CITATION_RE = re.compile(r"\b(20\d{2})\s+SHC\s+([A-Z]{2,4})\s+(\d+)\b")


def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return default


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=None)


async def get_rendered_html(page, url, timeout=30000):
    await page.goto(url, timeout=timeout, wait_until="networkidle")
    return await page.content()


def parse_listing(html):
    soup = BeautifulSoup(html, "html.parser")
    entries = []
    all_links = soup.find_all("a", href=True)
    print(f"  [debug] {len(all_links)} total <a> tags found on listing page")

    for link in all_links:
        href = link["href"]
        if "view-file" not in href and "case-detail" not in href and "reported-judgements" not in href:
            continue
        block = link.find_parent(["div", "li", "tr"]) or link.parent
        text = block.get_text(" ", strip=True) if block else link.get_text(" ", strip=True)
        m = CITATION_RE.search(text)
        citation = m.group(0) if m else None
        full_url = href if href.startswith("http") else f"{BASE}{href}"
        entries.append({
            "citation": citation,
            "listing_text": text[:500],
            "detail_url": full_url,
        })
    return entries


async def run():
    judgments = load_json(JUDGMENTS_FILE, [])
    seen = load_json(SEEN_FILE, [])
    seen_set = set(seen)

    print(f"Already have {len(judgments)} SHC judgments on file.")
    print("Launching headless browser...")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(
            user_agent="Mozilla/5.0 (compatible; PakistanLawReportsBot/1.0; +free-public-archive)"
        )

        print(f"Loading {HOME_URL} ...")
        html = await get_rendered_html(page, HOME_URL)
        print(f"  [debug] page HTML length: {len(html)} characters")

        entries = parse_listing(html)
        print(f"Found {len(entries)} judgment links on the listing page.")

        new_entries = [e for e in entries if (e["citation"] or e["detail_url"]) not in seen_set]
        new_entries = new_entries[:MAX_NEW_PER_RUN]
        print(f"Of those, {len(new_entries)} are new (capped at {MAX_NEW_PER_RUN} per run).")

        added = 0
        for e in new_entries:
            label = e["citation"] or e["detail_url"]
            print(f"  fetching: {label}")
            try:
                detail_html = await get_rendered_html(page, e["detail_url"])
                detail_soup = BeautifulSoup(detail_html, "html.parser")
                candidates = detail_soup.find_all(["div", "article", "section"])
                full_text = ""
                for c in candidates:
                    t = c.get_text("\n", strip=True)
                    if len(t) > len(full_text):
                        full_text = t
                if not full_text:
                    full_text = detail_soup.get_text("\n", strip=True)
            except Exception as ex:
                print(f"    [warn] failed to fetch detail page: {ex}")
                continue

            judgments.append({
                "citation": e["citation"],
                "court": "Sindh High Court",
                "source_url": e["detail_url"],
                "listing_text": e["listing_text"],
                "full_text": full_text,
                "scraped_at": time.strftime("%Y-%m-%d"),
            })
            seen_set.add(label)
            added += 1
            await asyncio.sleep(DELAY_SECONDS)

        await browser.close()

    save_json(JUDGMENTS_FILE, judgments)
    save_json(SEEN_FILE, sorted(seen_set))

    print(f"\nDone. Added {added} new judgments. Total on file: {len(judgments)}.")
    print("CHANGES_MADE=true" if added > 0 else "CHANGES_MADE=false")


if __name__ == "__main__":
    asyncio.run(run())
