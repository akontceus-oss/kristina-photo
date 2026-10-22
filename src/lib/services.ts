import { getCollection, type CollectionEntry } from 'astro:content';

export type Service = CollectionEntry<'services'>;

const visible = (e: Service) => import.meta.env.DEV || !e.data.draft;

/** Все опубликованные страницы видов съёмок (включая посадочные под города и подвиды). */
export async function getAllServicePages() {
  return getCollection('services', visible);
}

/** Основные виды съёмок — для меню, главной, прайса и формы. Подвиды (parent) и города (city) сюда не попадают. */
export async function getMainServices() {
  const all = await getCollection('services', (e) => visible(e) && (e.data.listed ?? (!e.data.city && !e.data.parent)));
  return all.sort((a, b) => a.data.order - b.data.order);
}

const byOrder = (a: Service, b: Service) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'ru');

/** Цепочка родителей от основного вида съёмки до ближайшего родителя страницы. */
export function ancestorsOf(entry: Service, all: Service[]): Service[] {
  const chain: Service[] = [];
  let parentId = entry.data.parent;
  while (parentId) {
    const p = all.find((e) => e.id === parentId);
    if (!p || chain.includes(p)) break;
    chain.unshift(p);
    parentId = p.data.parent;
  }
  return chain;
}

/** Дочерние страницы (подвиды и города), отсортированные: сначала подвиды, потом города. */
export function childrenOf(id: string, all: Service[]): Service[] {
  return all.filter((e) => e.data.parent === id).sort((a, b) => Number(!!a.data.city) - Number(!!b.data.city) || byOrder(a, b));
}

/** Основной вид съёмки, к которому относится страница (для формы и «других видов съёмок»). */
export function rootOf(entry: Service, all: Service[]): Service {
  return ancestorsOf(entry, all)[0] ?? entry;
}

export const formatPrice = (n?: number) => (n ? `${n.toLocaleString('ru-RU')} ₽` : 'по запросу');
