import { Plugin } from '@typings/plugin';

const pluginId = 'woopread';
const baseUrl = 'https://woopread.com';

const headers = {
  Referer: baseUrl,
  'User-Agent': 'Mozilla/5.0',
};

const popularNovels = async (page: number) => {
  const url = `${baseUrl}/novellist/page/${page}/`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');

  const novels = [];
  doc.querySelectorAll('.page-listing-item .page-item-detail').forEach(novel => {
    const novelUrl = novel.querySelector('a')?.getAttribute('href');
    const name = novel.querySelector('.h5')?.textContent?.trim() || 'No Title';
    const cover = novel.querySelector('img')?.getAttribute('data-src');
    if (novelUrl) novels.push({ name, cover, url: novelUrl });
  });

  const hasMore = !!doc.querySelector('.pagination .next.page-numbers');
  return { novels, hasMore };
};

const parseNovelAndChapters = async (novelUrl: string) => {
  const res = await fetch(novelUrl, { headers });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');

  const name = doc.querySelector('h1')?.textContent?.trim() || '';
  const cover = doc.querySelector('.summary_image img')?.getAttribute('data-src') || '';
  const summary = doc.querySelector('.summary__content')?.textContent?.trim() || '';
  const author = doc.querySelector('.author-content a')?.textContent?.trim() || 'Unknown';
  const statusText = doc.querySelector('.post-status .summary-content')?.textContent || '';
  const status = /Completed/i.test(statusText) ? 'Completed' : 'Ongoing';

  const chapters = [];
  doc.querySelectorAll('.wp-manga-chapter > a').forEach(chap => {
    chapters.push({
      name: chap.textContent?.trim() || '',
      url: chap.getAttribute('href') || '',
      releaseTime: '',
    });
  });

  return {
    name,
    cover,
    summary,
    author,
    status,
    chapters: chapters.reverse(),
  };
};

const parseChapter = async (chapterUrl: string) => {
  const res = await fetch(chapterUrl, { headers });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const content = doc.querySelector('.text-left')?.innerHTML || '';
  return content;
};

const searchNovels = async (searchTerm: string) => {
  const url = `${baseUrl}/?s=${encodeURIComponent(searchTerm)}&post_type=wp-manga`;
  const res = await fetch(url, { headers });
  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');

  const novels = [];
  doc.querySelectorAll('.page-item-detail').forEach(novel => {
    const name = novel.querySelector('.h5')?.textContent?.trim() || '';
    const novelUrl = novel.querySelector('a')?.getAttribute('href');
    const cover = novel.querySelector('img')?.getAttribute('data-src') || '';
    if (novelUrl) novels.push({ name, url: novelUrl, cover });
  });

  return novels;
};

const WoopreadPlugin: Plugin = {
  id: pluginId,
  name: 'WoopRead',
  site: baseUrl,
  version: '1.0.0',
  icon: '🌐',
  popularNovels,
  parseNovelAndChapters,
  parseChapter,
  searchNovels,
};

export default WoopreadPlugin;
