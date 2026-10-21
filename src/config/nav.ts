export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * Пункты меню. Подменю «Портфолио» собирается автоматически
 * из видов съёмок (src/content/services), см. Sidebar.astro.
 */
export const NAV: NavItem[] = [
  { label: 'Портфолио', href: '/portfolio/', children: [] },
  { label: 'Об авторе', href: '/about/' },
  { label: 'Прайс', href: '/price/' },
  { label: 'Инфо', href: '/info/' },
  { label: 'Контакты', href: '/contacts/' },
];
