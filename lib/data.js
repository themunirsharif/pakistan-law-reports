import indexData from '../data/judgments_index.json';
import shardMap from '../data/shard-map.json';

// Lightweight index (title, citation, court, year, excerpt) - safe to use anywhere,
// including passing subsets to client components.
export function getAllJudgments() {
  return indexData;
}

// Full judgment text is split across shard files (data/judgments/shard-N.json)
// to keep every individual file well under GitHub's 25MB upload limit.
export function getJudgmentBySlug(slug) {
  const shardIdx = shardMap[slug];
  if (shardIdx === undefined) return null;
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const shard = require(`../data/judgments/shard-${shardIdx}.json`);
  return shard[slug] || null;
}

export function getAllSlugs() {
  return indexData.map((j) => j.slug);
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

export function getAllYears() {
  const years = new Set();
  indexData.forEach((j) => {
    if (j.year) years.add(j.year);
  });
  return Array.from(years).sort((a, b) => b - a);
}

export function getStats() {
  return {
    total: indexData.length,
    courts: getAllCourts().length,
    years: getAllYears(),
  };
}
