"""
Sindh High Court - Live Judgment Scraper
------------------------------------------
Runs in GitHub Actions on a schedule. Uses a real headless browser
(Playwright) since the site's judgment listing loads via JavaScript.
"""

import asyncio
import json
import os
import re
import time
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright

BASE = "https://caselaw.shc.gov.pk"
HOME_URL = f"{BASE}/caselaw/public/home"
TOP_TRENDING_URL = f"{BASE}/caselaw/public/top-trend-judgements"

DATA_DIR = "data"
JUDGMENTS_FILE = os.path.join(DATA_DIR, "shc_judgments.json")
SEEN_FILE = os.path.join(DATA_DIR, "shc_seen.json")
DELAY_SECONDS = 1.5
MAX_NEW_PER_RUN = 100
MAX_LISTING_PAGES = 5

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


def find_links(html, must_contain):
    soup = BeautifulSoup(html, "html.parser")
    found = []
    for link in soup.find_all("a", href=True):
        href = link["href"]
        if any(s in href for s in must_contain):
            full_url = urljoin(BASE, href)
            block = link.find_parent(["div", "li", "tr"]) or link.parent
            text = block.get_text(" ", strip=True) if block else link.get_text(" ", strip=True)
            found.append({"url": full_url, "text": text})
    return found


def parse_case_entries(html):
    soup = BeautifulSoup(html, "html.parser")
    entries = []
    all_links = soup.find_all("a", href=True)
    print(f"    [debug] {len(all_links)} total <a> tags found on this page")

    for link in all_links:
        href = link["href"]
        if "view-file" not in href and "case-detail" not in href:
            continue
        full_url = urljoin(BASE, href)
        block = link.find_parent(["div", "li", "tr"]) or link.parent
        text = block.get_text(" ", strip=True) if block else link.get_text(" ", strip=True)
        m = CITATION_RE.search(text)
        citation = m.group(0) if m else None
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
        home_html = await get_rendered_html(page, HOME_URL)
        print(f"  [debug] home page HTML length: {len(home_html)} characters")

        print(f"Loading {TOP_TRENDING_URL} ...")
        try:
            trending_html = await get_rendered_html(page, TOP_TRENDING_URL)
            print(f"  [debug] top-trending page HTML length: {len(trending_html)} characters")
        except Exception as ex:
            print(f"  [warn] failed to load top-trending page: {ex}")
            trending_html = ""

        listing_links = find_links(home_html, ["reported-judgements", "rpt-jo-list", "judgement", "judgment"])
        print(f"  [debug] found {len(listing_links)} candidate listing-page links:")
        for l in listing_links[:10]:
            print(f"    - {l['text'][:60]!r} -> {l['url']}")

        all_entries = parse_case_entries(home_html)
        if trending_html:
            trending_entries = parse_case_entries(trending_html)
            print(f"  [debug] found {len(trending_entries)} case entries on top-trending page")
            all_entries.extend(trending_entries)

        visited = set()
        to_visit = [l["url"] for l in listing_links][:MAX_LISTING_PAGES]
        for listing_url in to_visit:
            if listing_url in visited:
                continue
            visited.add(listing_url)
            print(f"\nVisiting listing page: {listing_url}")
            try:
                listing_html = await get_rendered_html(page, listing_url)
                print(f"  [debug] listing page HTML length: {len(listing_html)} characters")
                page_entries = parse_case_entries(listing_html)
                print(f"  [debug] found {len(page_entries)} case entries on this listing page")
                all_entries.extend(page_entries)
            except Exception as ex:
                print(f"  [warn] failed to load listing page: {ex}")
            await asyncio.sleep(DELAY_SECONDS)

        seen_urls = set()
        unique_entries = []
        for e in all_entries:
            if e["detail_url"] not in seen_urls:
                seen_urls.add(e["detail_url"])
                unique_entries.append(e)

        print(f"\nTotal unique judgment entries found across all pages: {len(unique_entries)}")

        new_entries = [e for e in unique_entries if (e["citation"] or e["detail_url"]) not in seen_set]
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
