# KRISTINA — сайт-визитка фотографа

Статический сайт на [Astro](https://astro.build): Москва и Рязань, упор на SEO для Яндекса и Google.

## Почему Astro

- На выходе — обычные HTML-файлы: быстро грузятся, отлично индексируются, работают на любом хостинге TimeWeb (даже самом дешёвом, без Node.js).
- Фото автоматически сжимаются в AVIF/WebP в нескольких размерах — важно для фотосайта и для скорости (Core Web Vitals).
- Новые страницы (портфолио, посадочные под ключевые запросы) добавляются одним файлом `.md`, без программирования.

## Запуск

```bash
npm install
npm run dev      # локально: http://localhost:4321
npm run build    # готовый сайт в папке dist/
```

## Что где менять

| Что | Где |
|---|---|
| Домен, телефон, почта, мессенджеры, ID Метрики/GA, коды Вебмастера, данные для политики | `src/config/site.ts` |
| Пункты меню и разделы портфолио | `src/config/nav.ts` |
| Фото слайдера на главной | `src/assets/slides/` — все файлы по алфавиту |
| Разделы портфолио (текст, фото, SEO) | `src/content/portfolio/*.md` + фото в `src/assets/portfolio/<раздел>/` |
| Об авторе / Прайс / Инфо / Контакты | `src/pages/about.astro`, `price.astro`, `info.astro`, `contacts.astro` |
| Посадочные страницы под ключевые запросы | `src/content/landings/*.md` |
| Политика конфиденциальности и согласие | `src/pages/privacy.astro`, `src/pages/soglasie.astro` |

### Новая посадочная страница под ключевой запрос

Скопируйте `src/content/landings/fotograf-moskva.md`, назовите файл будущим адресом
(например `semejnyj-fotograf-ryazan.md` → `https://домен/semejnyj-fotograf-ryazan/`),
заполните `seoTitle`, `description`, `h1`, текст и FAQ, уберите `draft: true`.
Страница сама попадёт в sitemap, получит разметку schema.org (Service, FAQ, хлебные крошки).

## SEO, что уже сделано

- Уникальные `title`/`description`, canonical, Open Graph на каждой странице
- `sitemap-index.xml` и `robots.txt` (с `Clean-param` для Яндекса)
- schema.org: WebSite, ProfessionalService (зона обслуживания Москва + Рязань), Person, BreadcrumbList, FAQPage, OfferCatalog, ImageGallery
- Адреса со слешем на конце, редиректы http→https и www→без www (`public/.htaccess`)
- Оптимизация изображений, ленивая загрузка, шрифты с собственного домена (без Google Fonts)

## Деплой на TimeWeb

**Вариант 1 (автоматически).** При push в `main` GitHub Actions собирает сайт и заливает `dist/` по FTP —
см. `.github/workflows/deploy.yml`, там же список секретов.

**Вариант 2 (вручную).** `npm run build` и загрузить содержимое `dist/` в `public_html` через файловый менеджер TimeWeb.

После запуска:
1. Подключить SSL (бесплатный Let's Encrypt в панели TimeWeb).
2. Добавить сайт в Яндекс.Вебмастер и Google Search Console, прописать коды в `site.ts`, отправить sitemap.
3. Создать счётчик Яндекс Метрики, прописать ID в `site.ts`.
4. Уведомить Роскомнадзор об обработке персональных данных (pd.rkn.gov.ru) — обязательно для оператора ПД.
