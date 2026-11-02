# my personal website

A static site (`public/`) served by Cloudflare Workers static assets, plus a
small Worker (`src/worker.js`) that handles the contact form at
`POST /api/contact` and sends the message with [Resend](https://resend.com).

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # then fill in your values
npm run dev                      # http://localhost:8787
```

`npm run dev` runs `wrangler dev`, which serves the files in `public/` and the
Worker together — the same routing you get in production.

## Environment variables

| Variable             | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY`     | API key from https://resend.com/api-keys                            |
| `CONTACT_TO_EMAIL`   | Inbox that receives form messages (comma-separate for several)      |
| `CONTACT_FROM_EMAIL` | Sender, e.g. `Portfolio Contact <onboarding@resend.dev>` (see below) |

Locally these live in `.dev.vars`. In production, `CONTACT_TO_EMAIL` and
`CONTACT_FROM_EMAIL` come from `wrangler.jsonc` (`vars`) and `RESEND_API_KEY` is
a secret.

## Resend setup

1. Create an account at https://resend.com **using the same email as `CONTACT_TO_EMAIL`**.
2. **API Keys → Create API key** (permission: *Sending access*).
3. Use `CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>`. Without a
   verified domain, Resend only delivers to your own account email — which is
   exactly what a contact form needs.
4. Optional, once you own a domain: **Domains → Add domain**, add the DNS records
   it shows, and switch `CONTACT_FROM_EMAIL` to an address on that domain.

## Deploy to Cloudflare

1. Push this repo to GitHub.
2. Authenticate Wrangler once: `npx wrangler login`.
3. Store the Resend key as a secret:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

4. Deploy:

   ```bash
   npm run deploy
   ```

   The site deploys to `https://www.jlenteria.workers.dev` (Worker name `www`
   under the `jlenteria` account subdomain).

5. Optional: add a custom domain by uncommenting `routes` in `wrangler.jsonc`
   (the domain must be an active zone on the same Cloudflare account):

   ```jsonc
   "routes": [{ "pattern": "example.com", "custom_domain": true }]
   ```

6. Every `wrangler deploy` publishes immediately; static assets are cached at
   Cloudflare's edge.

To deploy automatically on push, connect the repository with
**Workers Builds** in the Cloudflare dashboard and use `npx wrangler deploy` as
the deploy command.

### Site URLs

The canonical URL, Open Graph/Twitter tags and JSON-LD point to
`https://www.jlenteria.workers.dev`. If you later move to a custom domain,
update those references in `public/index.html` (and the footer link in
`public/wakeguard-privacy.html`) and redeploy.

If an older Worker named `jlenteria` is still listed in the Cloudflare
dashboard, delete it once the `www` Worker is verified.

## Notes

- The contact form is rate limited to **3 submissions per minute per IP** per
  Cloudflare location, using the native Rate Limiting binding in
  `wrangler.jsonc`. The limit is approximate; the hidden `bot-field` honeypot is
  the first line of defence.
- Security headers and cache headers for static files live in `public/_headers`.
  They are not applied to Worker responses; the Worker sets its own
  `Cache-Control: no-store` and `X-Content-Type-Options` on the API.
- View production logs with `npm run tail`.
