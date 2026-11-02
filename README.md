# Jonel T. Lenteria — personal website

The source for my personal website: a fast, static portfolio built with plain
HTML, CSS, and JavaScript and served from Cloudflare's edge.

**URL:** https://www.jlenteria.workers.dev

## Stack

- HTML, CSS, and vanilla JavaScript
- Cloudflare Workers — static assets plus a small contact-form API
- [Resend](https://resend.com) for email delivery

## Structure

| Path | Purpose |
| --- | --- |
| `public/` | Pages, styles, scripts, and images |
| `src/worker.js` | Contact endpoint (`POST /api/contact`) |
| `wrangler.jsonc` | Cloudflare Workers configuration |

## Development

```bash
npm install
cp .dev.vars.example .dev.vars   # add your Resend values
npm run dev                      # http://localhost:8787
```

The contact form needs the variables documented in `.dev.vars.example` to send
email locally.

## Deploy

```bash
npx wrangler secret put RESEND_API_KEY
npm run deploy
```

Static-file headers live in `public/_headers`.
