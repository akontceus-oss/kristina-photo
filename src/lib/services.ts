import { getCollection, type CollectionEntry } from 'astro:content';

export type Service = CollectionEntry<'services'>;

const visible = (e: Service) => import.meta.env.DEV || !e.data.draft;

/** Все опубликованные страницы видов съёмок (включая посадочные под города). */
export async function getAllServicePages() {
  return getCollection('services', visible);
}

/** Основные виды съёмок — для меню, главной, прайса и формы. */
export async function getMainServices() {
  const all = await getCollection('services', (e) => visible(e) && (e.data.listed ?? !e.data.city));
  return all.sort((a, b) => a.data.order - b.data.order);
}

export const formatPrice = (n?: number) => (n ? `${n.toLocaleString('ru-RU')} ₽` : 'по запросу');
