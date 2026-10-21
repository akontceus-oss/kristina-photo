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
  defaultTitle: 'Фотограф Кристина — съёмка меню и предметная съёмка в Москве и Рязани',
  defaultDescription:
    'Фотограф Кристина в Москве и Рязани: съёмка меню для ресторанов и кафе, предметная съёмка товаров для маркетплейсов и сайтов. Цены, портфолио, заявка онлайн.',
  locale: 'ru_RU',

  contacts: {
    phone: '+7 920 977-28-80',
    email: 'begoniaapp@gmail.com',
  },

  /** Мессенджеры и соцсети. Пустая строка = кнопка не показывается. */
  socials: {
    telegram: 'https://t.me/chris7ensen',
    whatsapp: 'https://wa.me/79209772880',
    max: '',
    vk: '',
    instagram: 'https://www.instagram.com/christensenpho/',
    pinterest: '',
    youtube: '',
  },

  /** Форма заявки: куда отправляется — настраивается на хостинге, см. form-config.example.php */
  form: {
    endpoint: '/send.php',
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
    /** ФИО полностью. Статус — самозанятая (плательщик налога на профессиональный доход). */
    legalName: '[Фамилия] Кристина [Отчество]',
    status: 'плательщик налога на профессиональный доход (самозанятая)',
    inn: '000000000000',
    email: 'begoniaapp@gmail.com',
    policyDate: '21.10.2026',
  },
} as const;

export type SocialKey = keyof typeof SITE.socials;
