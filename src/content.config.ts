import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const photo = (image: any) =>
  z.object({
    src: image(),
    alt: z.string(),
  });

/** Разделы портфолио: один .md файл = одна страница /portfolio/<slug>/ */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      seoTitle: z.string(),
      description: z.string(),
      order: z.number().default(0),
      cover: photo(image),
      photos: z.array(photo(image)),
    }),
});

/**
 * Посадочные страницы под ключевые запросы (Москва / Рязань).
 * Один .md файл = одна страница /<slug>/. Slug берётся из имени файла.
 */
const landings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/landings' }),
  schema: ({ image }) =>
    z.object({
      city: z.enum(['Москва', 'Рязань']),
      keyword: z.string(),
      seoTitle: z.string().max(70),
      description: z.string().max(170),
      h1: z.string(),
      lead: z.string(),
      hero: photo(image),
      /** Раздел портфолио, из которого показать фото на странице. */
      portfolio: z.string().optional(),
      priceFrom: z.number().optional(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      draft: z.boolean().default(false),
    }),
});

export const collections = { portfolio, landings };
