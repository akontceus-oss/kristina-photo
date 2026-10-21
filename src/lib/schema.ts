import { SITE } from '../config/site';

const id = (frag: string) => `${SITE.url}/#${frag}`;
const sameAs = () => Object.values(SITE.socials).filter(Boolean);

/** Фотограф как человек. */
export function personSchema() {
  return {
    '@type': 'Person',
    '@id': id('person'),
    name: [SITE.fullName, SITE.lastName].filter(Boolean).join(' '),
    jobTitle: SITE.role,
    url: `${SITE.url}/about/`,
    sameAs: sameAs(),
  };
}

/** Услуги фотографа как локальный бизнес с зоной обслуживания Москва + Рязань. */
export function businessSchema() {
  return {
    '@type': 'ProfessionalService',
    '@id': id('business'),
    name: `${SITE.name} — ${SITE.role.toLowerCase()} ${SITE.fullName}`,
    description: SITE.defaultDescription,
    url: SITE.url,
    telephone: SITE.contacts.phone,
    email: SITE.contacts.email,
    image: `${SITE.url}/og-default.jpg`,
    priceRange: '₽₽',
    founder: { '@id': id('person') },
    areaServed: [
      { '@type': 'City', name: 'Москва' },
      { '@type': 'City', name: 'Рязань' },
    ],
    sameAs: sameAs(),
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': id('website'),
    url: SITE.url,
    name: SITE.defaultTitle,
    inLanguage: 'ru-RU',
    publisher: { '@id': id('business') },
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

export function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Главная', path: '/' }, ...items].map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: new URL(it.path, SITE.url).href,
    })),
  };
}

export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
