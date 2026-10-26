export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

/**
 * Пункты меню (слева и продублированы в подвале каждой страницы).
 * Подменю «Портфолио» собирается автоматически из видов съёмок (src/content/services),
 * подменю «Инфо» задано здесь: разделы страницы /info/, цены и блог.
 */
export const NAV: NavItem[] = [
  { label: 'Портфолио', href: '/portfolio/', children: [] },
  { label: 'Об авторе', href: '/about/' },
  {
    label: 'Инфо',
    href: '/info/',
    children: [
      { label: 'Календарь', href: '/info/#kalendar' },
      { label: 'Цены', href: '/uslugi/' },
      { label: 'Вопрос — ответ', href: '/info/#voprosy' },
      { label: 'Отзывы', href: '/info/#otzyvy' },
      { label: 'Блог', href: '/blog/' },
    ],
  },
  { label: 'Контакты', href: '/contacts/' },
];
