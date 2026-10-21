import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  const body = `User-agent: *
Allow: /

User-agent: Yandex
Allow: /
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid&fbclid /

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
