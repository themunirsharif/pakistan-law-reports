"""
Automated Topic Reclassification
--------------------------------------
The original keyword-based classifier puts anything that doesn't match a
specific regex into a "General" bucket - even when the case clearly belongs
to a real category. This script uses Claude to actually read each "General"
judgment and assign it to one of our existing fixed categories (or leave it
as General if it genuinely doesn't fit any of them).

Processes a limited batch per run to control cost and stay within reasonable
run time. Run repeatedly (manually or on a schedule) to gradually work
through the backlog.

REQUIRES: ANTHROPIC_API_KEY environment variable (same secret already set
up for the case highlights automation).
"""

import json
import os
import re
import glob
import time

import anthropic

DATA_DIR = "data"
INDEX_FILE = os.path.join(DATA_DIR, "judgments_index.json")
JUDGMENTS_DIR = os.path.join(DATA_DIR, "judgments")
BATCH_SIZE = 40

VALID_TOPICS = [
    "Criminal Law", "Constitutional Law", "Family Law", "Property & Rent",
    "Tax Law", "Banking & Corporate", "Labour & Service", "Company Law",
    "Succession & Inheritance", "Civil Law", "General",
]

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def load_json(path, default):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)


def classify_with_ai(entry):
    """Ask Claude to read the case and assign a real topic from our fixed list."""
    text_for_classification = entry.get("excerpt", "") or entry.get("title", "")

    prompt = f"""You are classifying a Pakistani court case into exactly ONE of these
categories: {", ".join(VALID_TOPICS)}

Case title: {entry.get('title', '')}
Citation: {entry.get('citation', '')}
Court: {entry.get('court', '')}
Available text: {text_for_classification[:1500]}

Respond with ONLY the category name from the list above, exactly as written,
nothing else. If the available text genuinely isn't enough to tell, or the
case doesn't clearly fit any specific category, respond with: General"""

    response = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=20,
        messages=[{"role": "user", "content": prompt}],
    )
    result = response.content[0].text.strip()
    return result if result in VALID_TOPICS else "General"


def main():
    index = load_json(INDEX_FILE, [])
    general_entries = [e for e in index if e.get("topic") == "General"]
    print(f"Total judgments: {len(index)}")
    print(f"Currently classified as 'General': {len(general_entries)}")

    # Track which ones we've already attempted (even if they stayed General)
    # so repeated runs don't keep re-processing the same entries forever.
    attempted_file = os.path.join(DATA_DIR, "reclassify_attempted.json")
    attempted = set(load_json(attempted_file, []))

    to_process = [e for e in general_entries if e["slug"] not in attempted][:BATCH_SIZE]
    print(f"Processing {len(to_process)} entries this run...")

    slug_to_new_topic = {}
    for entry in to_process:
        print(f"  Classifying: {entry.get('title', entry['slug'])[:60]}")
        try:
            new_topic = classify_with_ai(entry)
        except Exception as ex:
            print(f"    [warn] API call failed: {ex}")
            continue

        attempted.add(entry["slug"])
        if new_topic != "General":
            slug_to_new_topic[entry["slug"]] = new_topic
            print(f"    -> reclassified as: {new_topic}")
        time.sleep(0.5)

    if not slug_to_new_topic:
        save_json(attempted_file, sorted(attempted))
        print("\nNo reclassifications this run.")
        return

    # Update the main index
    for e in index:
        if e["slug"] in slug_to_new_topic:
            e["topic"] = slug_to_new_topic[e["slug"]]

    save_json(INDEX_FILE, index)

    # Update the corresponding shard files too, so judgment detail pages match
    updated_shards = 0
    for fname in glob.glob(os.path.join(JUDGMENTS_DIR, "shard-*.json")):
        with open(fname, encoding="utf-8") as f:
            shard = json.load(f)
        changed = False
        for slug, new_topic in slug_to_new_topic.items():
            if slug in shard:
                shard[slug]["topic"] = new_topic
                changed = True
        if changed:
            save_json(fname, shard)
            updated_shards += 1

    save_json(attempted_file, sorted(attempted))

    print(f"\nReclassified {len(slug_to_new_topic)} judgments out of 'General'.")
    print(f"Updated {updated_shards} shard files.")
    remaining = len(general_entries) - len(slug_to_new_topic)
    print(f"Remaining in 'General': ~{remaining}")


if __name__ == "__main__":
    main()
