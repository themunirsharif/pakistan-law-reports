"""
Sindh High Court - Daily Auto-Updater (v2, corrected)
--------------------------------------------------------
Earlier version used Playwright (headless browser) because we assumed the
site needed JavaScript rendering. It doesn't - a plain request works fine,
which is dramatically simpler and faster. This version:

1. Fetches the SHC home page (shows the ~127 most recently reported judgments)
2. Extracts each one's structured data from its hidden reference textarea
3. Skips any judgment already in our database (tracked by SHC citation number)
4. Adds genuinely new ones directly into the site's live database:
   - data/judgments_index.json (the searchable index)
   - data/judgments/shard-N.json (full record storage)
   - data/shard-map.json (slug -> shard lookup)
5. Commits the changes (handled by the GitHub Action workflow, not this script)

Runs on a schedule via .github/workflows/update-shc.yml
"""

import json
import os
import re
import time

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}
HOME_URL = "https://caselaw.shc.gov.pk/caselaw/public/home"

DATA_DIR = "data"
INDEX_FILE = os.path.join(DATA_DIR, "judgments_index.json")
SHARD_MAP_FILE = os.path.join(DATA_DIR, "shard-map.json")
SEEN_FILE = os.path.join(DATA_DIR, "shc_seen_citations.json")
SHARD_DIR = os.path.join(DATA_DIR, "judgments")
UPDATE_LOG_FILE = os.path.join(DATA_DIR, "update_log.json")
TARGET_SHARD_SIZE = 2_000_000  # ~2MB per shard, safely under GitHub's 25MB limit

TOPIC_RULES = [
    ('Criminal Law', re.compile(r'\b(criminal appeal|F\.?I\.?R\.?|Pakistan Penal Code|PPC\b|bail application|murder|criminal revision|acquittal|sessions court|anti-terrorism|Cr\.\s?P\.?C|criminal miscellaneous|Cr\.Bail|Cr\.Rev|Cr\.Acq|Cr\.J\.A|Cr\.Misc)\b', re.I)),
    ('Constitutional Law', re.compile(r'\b(constitutional petition|Article\s?199|Article\s?184|fundamental rights|writ petition|Const\.?\s?P\.)\b', re.I)),
    ('Family Law', re.compile(r'\b(family court|khula|child custody|guardian and wards|dissolution of marriage|maintenance allowance|dower|divorce)\b', re.I)),
    ('Property & Rent', re.compile(r'\b(rent case|tenant|landlord|ejectment|specific performance|sale deed|property dispute|mutation of land|Sindh Tenancy)\b', re.I)),
    ('Tax Law', re.compile(r'\b(income tax|sales tax|tax ordinance|FBR\b|customs act|assessment order|PTD\b|Spl\.\s?Cus)\b', re.I)),
    ('Banking & Corporate', re.compile(r'\b(banking court|recovery of loan|financial institution|NAB\b|banking company|SECP\b)\b', re.I)),
    ('Labour & Service', re.compile(r'\b(service tribunal|termination of service|labour court|industrial relations|civil servant|pension case|service matters|PLC\s?\(CS\))\b', re.I)),
    ('Company Law', re.compile(r'\b(companies ordinance|winding up|company law|H\.C\.A\b)\b', re.I)),
    ('Succession & Inheritance', re.compile(r'\b(succession certificate|inheritance|legal heirs|probate|letter of administration|S\.M\.A\b)\b', re.I)),
    ('Civil Law', re.compile(r'\b(civil suit|civil revision|specific relief|C\.P\.C\b|plaint|decree|Civil Revision)\b', re.I)),
]


def classify_topic(text):
    if not text:
        return 'General'
    for topic, pattern in TOPIC_RULES:
        if pattern.search(text):
            return topic
    return 'General'


def slugify(text, maxlen=90):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text[:maxlen].rstrip('-')


def load_json(path, default):
    if os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return default


def save_json(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False)


def parse_home_entry(text):
    text = " ".join(text.split())

    def find(pattern, default=""):
        m = re.search(pattern, text, re.DOTALL)
        return m.group(1).strip() if m else default

    hash_code = find(r'hash=([A-Za-z0-9+/=_-]+)')
    shc_citation = find(r'SHC Citation:\s*(\S+)')
    citation = find(r'CITATION:\s*(.*?)\s*SHC Citation:')
    tag = find(r'Tag:(.*?)\s*Bench:')
    bench = find(r'Bench:\s*(.*?)\s*Source:')

    label_positions = [text.find(l) for l in ['CITATION:', 'SHC Citation:', 'Tag:', 'Bench:', 'Source:'] if l in text]
    header_block = text[:min(label_positions)] if label_positions else text
    court_idx = header_block.find('Sindh High Court')
    case_header = header_block[:court_idx].strip() if court_idx != -1 else header_block.strip()
    court = header_block[court_idx:].strip() if court_idx != -1 else ""

    return {
        "case_header": case_header,
        "court": court,
        "citation": citation,
        "shc_citation": shc_citation,
        "topic_summary": tag,
        "judges": bench,
        "hash": hash_code,
        "view_url": f"https://caselaw.shc.gov.pk/caselaw/view-file/{hash_code}" if hash_code else "",
    }


def year_from_citation_or_case(citation, case_header):
    m = re.search(r'(20\d{2})', citation)
    if m:
        return m.group(1)
    m = re.search(r'/(\d{4})\b', case_header)
    if m:
        return m.group(1)
    return ''


def main():
    print("Fetching SHC home page...")
    r = requests.get(HOME_URL, headers=HEADERS, timeout=30)
    print(f"  status {r.status_code}, {len(r.text)} characters")

    soup = BeautifulSoup(r.text, "html.parser")
    textareas = soup.find_all("textarea", class_="reference")
    print(f"  found {len(textareas)} entries on the page")

    seen_citations = set(load_json(SEEN_FILE, []))
    index = load_json(INDEX_FILE, [])
    shard_map = load_json(SHARD_MAP_FILE, {})
    existing_slugs = {e['slug'] for e in index}

    new_records = []
    for ta in textareas:
        entry = parse_home_entry(ta.get_text())
        key = entry["shc_citation"] or entry["hash"]
        if not key or key in seen_citations:
            continue
        seen_citations.add(key)

        case_header = entry["case_header"]
        if not case_header:
            continue

        year = year_from_citation_or_case(entry["citation"], case_header)
        topic = classify_topic(entry["topic_summary"] or case_header)

        slug_base = slugify(entry["citation"] or entry["shc_citation"] or case_header)
        slug = slug_base
        n = 1
        while slug in existing_slugs:
            slug = f"{slug_base}-{n}"
            n += 1
        existing_slugs.add(slug)

        body_lines = [case_header, "Sindh High Court"]
        if entry["judges"]:
            body_lines.append(f"\nBench: {entry['judges']}")
        if entry["topic_summary"]:
            body_lines.append(f"\n{entry['topic_summary']}")
        full_text = "\n".join(body_lines)

        new_records.append({
            "slug": slug,
            "title": case_header,
            "citation": entry["citation"],
            "court": "Sindh High Court",
            "year": year,
            "labels": [],
            "excerpt": (entry["topic_summary"][:220] if entry["topic_summary"] else case_header[:220]),
            "judges": entry["judges"],
            "source_url": entry["view_url"],
            "has_full_text": False,
            "topic": topic,
            "full_text": full_text,
        })

    print(f"\n{len(new_records)} genuinely new judgments found.")

    update_log = load_json(UPDATE_LOG_FILE, [])

    if not new_records:
        save_json(SEEN_FILE, sorted(seen_citations))
        update_log.append({
            "date": time.strftime("%Y-%m-%d"),
            "added": 0,
            "total_after": len(index),
        })
        save_json(UPDATE_LOG_FILE, update_log[-90:])  # keep last 90 days
        print("Nothing to add. Done.")
        return

    # Find the last shard file to see if there's room, or start a new one
    shard_files = sorted(
        [f for f in os.listdir(SHARD_DIR) if f.startswith('shard-') and f.endswith('.json')],
        key=lambda f: int(re.search(r'\d+', f).group())
    )
    last_idx = int(re.search(r'\d+', shard_files[-1]).group()) if shard_files else -1
    last_shard_path = os.path.join(SHARD_DIR, shard_files[-1]) if shard_files else None
    current_shard = load_json(last_shard_path, {}) if last_shard_path else {}
    current_size = os.path.getsize(last_shard_path) if last_shard_path and os.path.exists(last_shard_path) else 0
    current_idx = last_idx if last_idx >= 0 else 0

    for record in new_records:
        record_size = len(json.dumps(record, ensure_ascii=False))
        if current_size + record_size > TARGET_SHARD_SIZE and current_shard:
            save_json(os.path.join(SHARD_DIR, f"shard-{current_idx}.json"), current_shard)
            current_idx += 1
            current_shard = {}
            current_size = 0

        slug = record.pop("slug")
        full_record = {"slug": slug, **record}
        current_shard[slug] = full_record
        shard_map[slug] = current_idx
        current_size += record_size

        index.append({
            "slug": slug,
            "title": full_record["title"],
            "citation": full_record["citation"],
            "court": full_record["court"],
            "year": full_record["year"],
            "labels": [],
            "excerpt": full_record["excerpt"],
            "judges": full_record["judges"],
            "source_url": full_record["source_url"],
            "has_full_text": False,
            "topic": full_record["topic"],
        })

    save_json(os.path.join(SHARD_DIR, f"shard-{current_idx}.json"), current_shard)
    save_json(INDEX_FILE, index)
    save_json(SHARD_MAP_FILE, shard_map)
    save_json(SEEN_FILE, sorted(seen_citations))

    print(f"Added {len(new_records)} new judgments to the live database.")
    print(f"Total judgments now: {len(index)}")

    update_log.append({
        "date": time.strftime("%Y-%m-%d"),
        "added": len(new_records),
        "total_after": len(index),
    })
    save_json(UPDATE_LOG_FILE, update_log[-90:])  # keep last 90 days


if __name__ == "__main__":
    main()
