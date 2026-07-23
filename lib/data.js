import fs from 'fs';
import path from 'path';
import indexData from '../data/judgments_index.json';
import shardMap from '../data/shard-map.json';

// Lightweight index (title, citation, court, year, excerpt) - safe to use anywhere,
// including passing subsets to client components.
export function getAllJudgments() {
  return indexData;
}

// Full judgment text is split across shard files (data/judgments/shard-N.json)
// to keep every individual file well under GitHub's 25MB upload limit.
// Read directly from disk (not require()) - require() on JSON inside a
// template-literal path returns a bundler Module wrapper in server
// components, not a plain object, which breaks prerendering.
const shardCache = new Map();

function loadShard(shardIdx) {
  if (shardCache.has(shardIdx)) return shardCache.get(shardIdx);
  const filePath = path.join(process.cwd(), 'data', 'judgments', `shard-${shardIdx}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  shardCache.set(shardIdx, parsed);
  return parsed;
}

export function getJudgmentBySlug(slug) {
  const shardIdx = shardMap[slug];
  if (shardIdx === undefined) return null;
  const shard = loadShard(shardIdx);
  return shard[slug] || null;
}

export function getAllSlugs() {
  return indexData.map((j) => j.slug);
}

// Only judgments with genuine full text - used for the sitemap, so we're
// not actively submitting thin summary-only pages to Google for indexing.
export function getFullTextSlugs() {
  return indexData.filter((j) => j.has_full_text !== false).map((j) => j.slug);
}

export function getAllCourts() {
  const courts = new Set();
  indexData.forEach((j) => {
    if (j.court && j.court !== 'Not specified') courts.add(j.court);
  });
  return Array.from(courts).sort();
}

export function courtToSlug(court) {
  return court
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getCourtBySlug(courtSlug) {
  const courts = getAllCourts();
  return courts.find((c) => courtToSlug(c) === courtSlug) || null;
}

export function getJudgmentsByCourt(court) {
  return indexData.filter((j) => j.court === court);
}

export function getAllTopics() {
  const topics = new Set();
  indexData.forEach((j) => {
    if (j.topic) topics.add(j.topic);
  });
  return Array.from(topics).sort();
}

export function topicToSlug(topic) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getTopicBySlug(topicSlug) {
  const topics = getAllTopics();
  return topics.find((t) => topicToSlug(t) === topicSlug) || null;
}

export function getJudgmentsByTopic(topic) {
  return indexData.filter((j) => j.topic === topic);
}

export function getTopicCounts() {
  const counts = {};
  indexData.forEach((j) => {
    if (j.topic) counts[j.topic] = (counts[j.topic] || 0) + 1;
  });
  return counts;
}

// A few related judgments for the "related cases" section on a judgment page -
// same court and topic when possible, falling back to just same court.
export function getRelatedJudgments(judgment, limit = 5) {
  if (!judgment) return [];
  let pool = indexData.filter(
    (j) => j.slug !== judgment.slug && j.court === judgment.court && j.topic === judgment.topic
  );
  if (pool.length < limit) {
    const more = indexData.filter(
      (j) => j.slug !== judgment.slug && j.court === judgment.court && !pool.includes(j)
    );
    pool = pool.concat(more);
  }
  return pool.slice(0, limit);
}

export function getAllYears() {
  const years = new Set();
  indexData.forEach((j) => {
    if (j.year) years.add(j.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

function lawyerSlugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getAllLawyers() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'lawyers.json');
    if (!fs.existsSync(filePath)) return [];
    const lawyers = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return lawyers.map((l) => ({ ...l, slug: lawyerSlugify(l.name) }));
  } catch {
    return [];
  }
}

export function getLawyerBySlug(slug) {
  const lawyers = getAllLawyers();
  return lawyers.find((l) => l.slug === slug) || null;
}

export function getCaseHighlights() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'case_highlights.json');
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

export function getAllLawSchools() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'law_schools.json');
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

let _activeAdvocatesCache = null;
function loadActiveAdvocates() {
  if (_activeAdvocatesCache) return _activeAdvocatesCache;
  try {
    const filePath = path.join(process.cwd(), 'data', 'active_advocates.json');
    if (!fs.existsSync(filePath)) return [];
    _activeAdvocatesCache = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return _activeAdvocatesCache;
  } catch {
    return [];
  }
}

export function getAdvocateDivisions() {
  const all = loadActiveAdvocates();
  const counts = {};
  all.forEach((a) => {
    counts[a.division] = (counts[a.division] || 0) + 1;
  });
  return counts;
}

export function divisionToSlug(division) {
  return division.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function getDivisionBySlug(slug) {
  const divisions = Object.keys(getAdvocateDivisions());
  return divisions.find((d) => divisionToSlug(d) === slug) || null;
}

export function getAdvocatesByDivision(division) {
  return loadActiveAdvocates().filter((a) => a.division === division);
}

export function getStats() {
  return {
    total: indexData.length,
    courts: getAllCourts().length,
    years: getAllYears(),
  };
}

export function getLatestUpdate() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'update_log.json');
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    const log = JSON.parse(raw);
    return log.length ? log[log.length - 1] : null;
  } catch {
    return null;
  }
}

// The index is append-ordered (bulk import first, then daily auto-updater
// additions at the end) - so the last N entries are genuinely the most
// recently added judgments, regardless of the case's own "year" field.
export function getLatestJudgments(n = 8) {
  return indexData.slice(-n).reverse();
}
