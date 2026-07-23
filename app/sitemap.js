import { getAllCourts, courtToSlug, getAllTopics, topicToSlug, getFullTextSlugs } from '../lib/data';

export default function sitemap() {
  const base = 'https://pakistanlawreports.com';

  const staticPages = ['', '/about', '/contact', '/privacy'].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.5,
  }));

  const courtPages = getAllCourts().map((c) => ({
    url: `${base}/courts/${courtToSlug(c)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const topicPages = getAllTopics().map((t) => ({
    url: `${base}/topics/${topicToSlug(t)}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const judgmentPages = getFullTextSlugs().map((slug) => ({
    url: `${base}/judgments/${slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...courtPages, ...topicPages, ...judgmentPages];
}
