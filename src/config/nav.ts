export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * Пункты меню (слева и продублированы в подвале каждой страницы).
 * «Статьи» в меню не входят, ссылка на них — в подвале.
 * Подменю «Портфолио» собирается автоматически из видов съёмок (src/content/services).
 */
export const NAV: NavItem[] = [
  { label: 'Портфолио', href: '/portfolio/', children: [] },
  { label: 'Об авторе', href: '/about/' },
  { label: 'Инфо', href: '/info/' },
  { label: 'Цены', href: '/uslugi/' },
  { label: 'Контакты', href: '/contacts/' },
];
