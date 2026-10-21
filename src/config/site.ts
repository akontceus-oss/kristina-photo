/**
 * Главные настройки сайта. Почти всё, что нужно поменять под реальные данные, — здесь.
 * Пустые строки в контактах и соцсетях просто скрывают соответствующую кнопку.
 */
export const SITE = {
  /** Боевой домен без слеша в конце. Заменить, когда будет куплен домен. */
  url: 'https://kristina-photo.ru',
  name: 'KRISTINA',
  fullName: 'Кристина',
  /** Фамилия для schema.org и политики (можно оставить пустой). */
  lastName: '',
  role: 'Фотограф',
  cities: ['Москва', 'Рязань'],
  defaultTitle: 'Фотограф Кристина — фотосессии в Москве и Рязани',
  defaultDescription:
    'Фотограф Кристина: семейные, портретные, детские фотосессии и love story в Москве и Рязани. Портфолио, цены и запись на съёмку.',
  locale: 'ru_RU',

  contacts: {
    phone: '+7 900 000-00-00',
    email: 'hello@kristina-photo.ru',
  },

  /** Мессенджеры и соцсети. Пустая строка = кнопка не показывается. */
  socials: {
    telegram: 'https://t.me/username',
    whatsapp: 'https://wa.me/79000000000',
    max: '',
    vk: 'https://vk.com/username',
    instagram: '',
    pinterest: '',
    youtube: '',
  },

  /** Аналитика. Скрипты подключаются только после согласия на cookie. */
  analytics: {
    yandexMetrikaId: '',
    googleAnalyticsId: '',
  },

  /** Коды подтверждения для Яндекс.Вебмастера и Google Search Console. */
  verification: {
    yandex: '',
    google: '',
  },

  /** Оператор персональных данных (для политики конфиденциальности, 152-ФЗ). */
  operator: {
    /** Например: «Индивидуальный предприниматель Иванова Кристина Сергеевна» или «самозанятая …» */
    legalName: 'Самозанятая Кристина [Фамилия Отчество]',
    inn: '000000000000',
    email: 'hello@kristina-photo.ru',
    policyDate: '21.10.2026',
  },
} as const;

export type SocialKey = keyof typeof SITE.socials;
