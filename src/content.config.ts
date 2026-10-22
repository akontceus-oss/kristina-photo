import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const photo = (image: any) =>
  z.object({
    src: image(),
    alt: z.string(),
  });

/**
 * Виды съёмок. Один .md файл = одна SEO-страница /<имя-файла>/.
 *
 * Основная страница вида съёмки (без полей city и parent) попадает в меню «Портфолио»,
 * на главную, в прайс и в форму заявки.
 * Страница с полем parent — подвид съёмки (fotosemka-dlya-marketpleysov.md → parent: predmetnaya-semka)
 * или посадочная под город (поле city). Такие страницы в меню не выводятся, но попадают в sitemap,
 * получают хлебные крошки по цепочке parent и ссылки «Смотрите также». Фото, цену и «что входит»
 * можно не указывать — они берутся у ближайшего родителя.
 */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: ({ image }) =>
    z.object({
      /** Короткое название для меню, карточек и прайса. */
      title: z.string(),
      h1: z.string(),
      seoTitle: z.string().max(80),
      description: z.string().max(180),
      /** Подзаголовок под H1 и текст карточки на главной. */
      lead: z.string(),
      order: z.number().default(100),
      /** Цена в рублях за единицу (priceUnit). */
      price: z.number().optional(),
      priceUnit: z.string().default('час'),
      priceNote: z.string().optional(),
      /** Что входит — список на странице и в прайсе. */
      includes: z.array(z.string()).default([]),
      cover: photo(image),
      photos: z.array(photo(image)).default([]),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      /** Для посадочных под город. */
      city: z.enum(['Москва', 'Рязань']).optional(),
      /** Slug родительской страницы (для подвидов и посадочных под город). */
      parent: z.string().optional(),
      /** Показывать в меню/на главной/в прайсе (по умолчанию — да, если нет city и parent). */
      listed: z.boolean().optional(),
      draft: z.boolean().default(false),
    }),
});

/**
 * Статьи (раздел /blog/). Один .md файл = одна статья /blog/<имя-файла>/.
 * services — slugs видов съёмок, на которые статья ссылается в конце.
 */
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string().max(80),
      description: z.string().max(180),
      lead: z.string(),
      date: z.coerce.date(),
      cover: photo(image),
      services: z.array(z.string()).default([]),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { services, articles };
