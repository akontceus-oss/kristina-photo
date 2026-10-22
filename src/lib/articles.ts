import { getCollection } from 'astro:content';

/** Опубликованные статьи, новые сверху. */
export async function getArticles() {
  const all = await getCollection('articles', (e) => import.meta.env.DEV || !e.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const formatDate = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
