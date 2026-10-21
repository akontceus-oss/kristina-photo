export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * Пункты меню (слева и продублированы внизу каждой страницы).
 * Подменю «Портфолио» собирается автоматически из видов съёмок (src/content/services).
 */
export const NAV: NavItem[] = [
  { label: 'Портфолио', href: '/portfolio/', children: [] },
  { label: 'Об авторе', href: '/about/' },
  { label: 'Инфо — услуги', href: '/uslugi/' },
  { label: 'Контакты', href: '/contacts/' },
];
