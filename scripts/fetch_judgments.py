"""
Pakistan Law Reports — daily judgment fetcher
================================================
This script runs automatically every day (see .github/workflows/daily-update.yml).
It checks each court source below for new judgments, and if it finds any,
generates a new page from judgment/template.html and adds it to the site.

WHAT WORKS RIGHT NOW:
- The structure, the template-filling logic, and the scheduling are all real
  and functional.

WHAT YOU (OR A DEVELOPER) NEED TO FINISH:
- The actual scraping selectors below are placeholders. Each court website
  has a different HTML structure, and Sindh High Court's own portal
  (caselaw.shc.gov.pk) is JavaScript-rendered, which means simple requests+
  BeautifulSoup scraping (what's below) won't fully work for it out of the box —
  it needs a headless browser (Playwright/Selenium) to load the page first.
  I've written this with requests+BeautifulSoup because it's the simplest
  starting point; swap in Playwright if the target page needs JS rendering.

IMPORTANT — before running this for real:
1. Check each court website's robots.txt and terms of use.
2. Keep request rate slow (this script already waits between requests) —
   don't hammer a government server.
3. Start with ONE source (Sindh High Court) fully working before adding others.
"""

import json
import re
import time
import unicodedata
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SITE_ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_PATH = SITE_ROOT / "judgment" / "template.html"
JUDGMENTS_DIR = SITE_ROOT / "judgment"
SEEN_FILE = SITE_ROOT / "scripts" / "seen_cases.json"

HEADERS = {
    "User-Agent": "PakistanLawReports/1.0 (+https://pakistanlawreports.com; contact via site)"
}
REQUEST_DELAY_SECONDS = 3  # be polite to government servers

# Add one source at a time. Each entry needs a `parse` function that returns
# a list of dicts matching the fields used in judgment/template.html.
#
# TIER 1 — Superior courts with genuinely searchable public judgment portals.
# Build and verify these ONE AT A TIME: get a source fully working (real
# selectors, tested against the live site, confirmed pages generate correctly),
# THEN move to the next. Each of these websites has different HTML, so the
# `fetch_source()` function's selectors need to be rewritten per source —
# treat the Sindh entry as the reference implementation, not a template that
# will work unmodified elsewhere.
SOURCES = [
    {
        "name": "Sindh High Court",
        "url": "https://caselaw.shc.gov.pk/caselaw/public/home",
        "province": "Sindh",
        "city": "Karachi",
        "court_slug": "sindh-high-court-karachi",
        "status": "reference implementation — selectors are placeholders, see fetch_source()",
    },
    {
        "name": "Supreme Court of Pakistan",
        "url": "https://www.supremecourt.gov.pk/judgement-search/",
        "province": "Federal",
        "city": "Islamabad",
        "court_slug": "supreme-court-of-pakistan",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Federal Shariat Court",
        "url": "https://federalshariatcourt.gov.pk/",
        "province": "Federal",
        "city": "Islamabad",
        "court_slug": "federal-shariat-court",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Islamabad High Court",
        "url": "https://www.ihc.gov.pk/",
        "province": "Islamabad Capital Territory",
        "city": "Islamabad",
        "court_slug": "islamabad-high-court",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Lahore High Court",
        "url": "https://sys.lhc.gov.pk/appjudgments/",
        "province": "Punjab",
        "city": "Lahore",
        "court_slug": "lahore-high-court",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Peshawar High Court",
        "url": "https://peshawarhighcourt.gov.pk/",
        "province": "Khyber Pakhtunkhwa",
        "city": "Peshawar",
        "court_slug": "peshawar-high-court",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Balochistan High Court",
        "url": "https://bhc.gov.pk/",
        "province": "Balochistan",
        "city": "Quetta",
        "court_slug": "balochistan-high-court",
        "status": "not yet built — add selectors before enabling",
    },
    {
        "name": "Azad Jammu & Kashmir High Court",
        "url": "https://ajkhighcourt.gok.pk/",
        "province": "Azad Jammu & Kashmir",
        "city": "Muzaffarabad",
        "court_slug": "ajk-high-court",
        "status": "limited public search — verify before building",
    },
    {
        "name": "Gilgit-Baltistan Chief Court",
        "url": "https://gbchiefcourt.gov.pk/",
        "province": "Gilgit-Baltistan",
        "city": "Gilgit",
        "court_slug": "gb-chief-court",
        "status": "limited public search — verify before building",
    },
    # TIER 2 (phase 3): 40+ district judiciary sites, tribunals (Income Tax
    # Appellate Tribunal, NIRC, Competition Appellate Tribunal, Federal
    # Service Tribunals). Add these once Tier 1 is stable — same one-at-a-
    # time approach, since coverage and site quality vary a lot.
]

# fetch_source() below is only wired up to actually run for sources whose
# selectors have been filled in — it will raise/skip cleanly for the rest,
# so adding entries above is safe and won't break anything.


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_]+", "-", text)


def load_seen() -> set:
    if SEEN_FILE.exists():
        return set(json.loads(SEEN_FILE.read_text()))
    return set()


def save_seen(seen: set) -> None:
    SEEN_FILE.write_text(json.dumps(sorted(seen), indent=2))


def fetch_source(source: dict) -> list:
    """
    Returns a list of judgment dicts scraped from one court source.
    PLACEHOLDER: replace the selectors below once you inspect the real
    page structure (right-click -> Inspect on the court's judgment list page).
    """
    resp = requests.get(source["url"], headers=HEADERS, timeout=20)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")

    judgments = []
    # EXAMPLE selector pattern — adjust to match the real page:
    for row in soup.select(".case-row"):  # <-- placeholder CSS selector
        title = row.select_one(".case-title")
        citation = row.select_one(".citation")
        date_el = row.select_one(".decision-date")
        if not (title and citation):
            continue
        judgments.append({
            "case_title": title.get_text(strip=True),
            "citation": citation.get_text(strip=True),
            "decision_date": date_el.get_text(strip=True) if date_el else str(date.today()),
            "court_name": source["name"],
            "province": source["province"],
            "city": source["city"],
            "court_slug": source["court_slug"],
            "category": "Uncategorized",  # TODO: classify by keywords in title/body
        })
    return judgments


def classify_category(title: str) -> str:
    """Very simple keyword-based categorizer. Expand this list over time."""
    title_lower = title.lower()
    rules = {
        "Criminal & Bail": ["bail", "fir", "acquittal", "murder", "qatl", "302 ppc"],
        "Family & Inheritance": ["custody", "khula", "maintenance", "inheritance", "succession"],
        "Property & Civil": ["possession", "tenancy", "rent", "mutation", "property"],
        "Banking & Finance": ["recovery suit", "loan", "bank", "guarantee"],
        "Tax & Customs": ["tax", "customs", "duty", "revenue"],
        "Labour & Employment": ["termination", "labour", "employee", "dismissal"],
        "Constitutional & Writ": ["writ", "constitutional", "article 199", "fundamental rights"],
        "Corporate & Contract": ["contract", "company", "arbitration"],
    }
    for category, keywords in rules.items():
        if any(kw in title_lower for kw in keywords):
            return category
    return "Uncategorized"


def render_judgment_page(judgment: dict) -> str:
    template = TEMPLATE_PATH.read_text()
    slug = slugify(f"{judgment['case_title']}-{judgment['citation']}")
    category = classify_category(judgment["case_title"])

    values = {
        "CASE_TITLE": judgment["case_title"],
        "CITATION": judgment["citation"],
        "COURT_NAME": judgment["court_name"],
        "CITY": judgment["city"],
        "PROVINCE": judgment["province"],
        "PROVINCE_SLUG": slugify(judgment["province"]),
        "CITY_SLUG": slugify(judgment["city"]),
        "COURT_SLUG": judgment["court_slug"],
        "CATEGORY": category,
        "CATEGORY_SLUG": slugify(category),
        "SLUG": slug,
        "CASE_NUMBER": judgment.get("case_number", "N/A"),
        "DECISION_DATE": judgment["decision_date"],
        "JUDGE_NAMES": judgment.get("judge_names", "Not specified"),
        "ONE_LINE_SUMMARY": judgment.get("summary", ""),
        "HEADNOTE_SUMMARY": judgment.get("headnote", judgment.get("summary", "")),
        "JUDGMENT_TEXT": judgment.get("full_text", ""),
        "RELATED_1_CITATION": "", "RELATED_1_TITLE": "",
        "RELATED_2_CITATION": "", "RELATED_2_TITLE": "",
        "RELATED_3_CITATION": "", "RELATED_3_TITLE": "",
    }
    for key, val in values.items():
        template = template.replace("{{" + key + "}}", val)
    return template, slug


def main():
    seen = load_seen()
    new_count = 0

    for source in SOURCES:
        if not source["url"].startswith("https://caselaw.shc.gov.pk"):
            print(f"Skipping {source['name']} — selectors not yet built ({source.get('status','')})")
            continue
        print(f"Checking {source['name']}...")
        try:
            judgments = fetch_source(source)
        except Exception as e:
            print(f"  Skipped {source['name']} due to error: {e}")
            continue

        for judgment in judgments:
            key = judgment["citation"]
            if key in seen:
                continue

            html, slug = render_judgment_page(judgment)
            out_path = JUDGMENTS_DIR / f"{slug}.html"
            out_path.write_text(html)
            seen.add(key)
            new_count += 1
            print(f"  + New judgment: {judgment['citation']} -> {out_path.name}")

        time.sleep(REQUEST_DELAY_SECONDS)

    save_seen(seen)
    print(f"Done. {new_count} new judgment page(s) added.")


if __name__ == "__main__":
    main()
