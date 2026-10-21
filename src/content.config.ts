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
 * Основная страница вида съёмки (без поля city) попадает в меню «Портфолио»,
 * на главную и в прайс. Страница с полем city — это посадочная под город
 * (например, predmetnaya-semka-ryazan.md), она в меню не выводится,
 * но попадает в sitemap и ссылается на основную через parent.
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
      /** Slug основной страницы вида съёмки (для посадочных). */
      parent: z.string().optional(),
      /** Показывать в меню/на главной/в прайсе (по умолчанию — да, если нет city). */
      listed: z.boolean().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { services };
