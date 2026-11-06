# Jonel T. Lenteria — personal website

The source for my personal website: a fast, static portfolio built with plain
HTML, CSS, and JavaScript and served from Cloudflare's edge.

**URL:** https://jlenteria.pages.dev

## Stack

- HTML, CSS, and vanilla JavaScript
- Cloudflare Pages — static assets plus Pages Functions for the contact form
- [Resend](https://resend.com) for email delivery

## Structure

| Path | Purpose |
| --- | --- |
| `public/` | HTML pages, styles, scripts, and images |
| `functions/` | Pages Functions — `api/contact.js`, `healthz.js`, and the shared contact logic in `_shared/` |

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
npx wrangler pages secret put RESEND_API_KEY    --project-name jlenteria
npx wrangler pages secret put CONTACT_TO_EMAIL  --project-name jlenteria
npx wrangler pages secret put CONTACT_FROM_EMAIL --project-name jlenteria
npm run deploy
```

Secrets are captured by a deployment, so change one and redeploy. Static-file
headers live in `public/_headers`.

The contact form is guarded by a honeypot and field validation. Cloudflare's
rate-limiting binding is not available on Pages, so there is no per-IP throttle;
add a KV binding or Turnstile if one is needed.
