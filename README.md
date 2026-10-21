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
| Виды съёмок: отдельная SEO-страница, фото, цена, FAQ (автоматически попадают в меню, на главную, в прайс и форму) | `src/content/services/*.md` + фото в `src/assets/services/<вид>/` |
| Об авторе / Инфо — услуги (цены, FAQ, запись) / Контакты | `src/pages/about.astro`, `uslugi.astro`, `contacts.astro` |
| Форма заявки (почта/Telegram) | `public/send.php`, настройки — `form-config.example.php` |
| Политика конфиденциальности и согласие | `src/pages/privacy.astro`, `src/pages/soglasie.astro` |

### Новый вид съёмки или посадочная под город

Скопируйте любой файл из `src/content/services/`, назовите его будущим адресом
(например `fud-semka-moskva.md` → `https://домен/fud-semka-moskva/`), заполните `seoTitle`, `description`, `h1`, цену, текст и FAQ.
Для посадочной под город добавьте `city: Рязань` и `parent: <основной вид>` — тогда она не попадёт в меню,
а фото возьмёт у основного вида. Страница сама попадёт в sitemap и получит разметку schema.org (Service, Offer, FAQ, хлебные крошки).
Пример — `predmetnaya-semka-ryazan.md` (пока скрыт `draft: true`).

### Форма заявки на TimeWeb

Скопируйте `form-config.example.php` на хостинг в папку **над** `public_html` под именем `form-config.php`
и впишите почту (и при желании Telegram-бота). Без этого файла форма покажет ошибку и предложит написать в мессенджер.

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
