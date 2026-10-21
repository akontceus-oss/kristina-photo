export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const PORTFOLIO_CATEGORIES = [
  { slug: 'semejnaya', label: 'Семейная' },
  { slug: 'portret', label: 'Портрет' },
  { slug: 'love-story', label: 'Love story' },
  { slug: 'detskaya', label: 'Детская' },
];

export const NAV: NavItem[] = [
  {
    label: 'Портфолио',
    href: '/portfolio/',
    children: PORTFOLIO_CATEGORIES.map((c) => ({ label: c.label, href: `/portfolio/${c.slug}/` })),
  },
  { label: 'Об авторе', href: '/about/' },
  { label: 'Прайс', href: '/price/' },
  { label: 'Инфо', href: '/info/' },
  { label: 'Контакты', href: '/contacts/' },
];
