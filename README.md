# my personal website
This is my personal website

A static site (`index.html`, `css/`, `js/`, `img/`) served by a small Express
server (`server/index.js`). The server also handles the contact form at
`POST /api/contact` and sends the message with [Resend](https://resend.com).

## Run locally

```bash
npm install
cp .env.example .env   # then fill in your values
npm run dev            # http://localhost:3000
```

## Environment variables

| Variable             | Description                                                        |
| -------------------- | ------------------------------------------------------------------ |
| `RESEND_API_KEY`     | API key from https://resend.com/api-keys                            |
| `CONTACT_TO_EMAIL`   | Inbox that receives form messages (comma-separate for several)      |
| `CONTACT_FROM_EMAIL` | Sender, e.g. `Portfolio Contact <onboarding@resend.dev>` (see below) |

## Resend setup

1. Create an account at https://resend.com **using the same email as `CONTACT_TO_EMAIL`**.
2. **API Keys → Create API key** (permission: *Sending access*).
3. Use `CONTACT_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>`. Without a
   verified domain, Resend only delivers to your own account email — which is
   exactly what a contact form needs.
4. Optional, once you own a domain: **Domains → Add domain**, add the DNS records
   it shows, and switch `CONTACT_FROM_EMAIL` to an address on that domain.

## Deploy to Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick this repo. It reads `render.yaml` and
   creates the `jlenteria` web service (URL: `https://jlenteria.onrender.com`,
   or with a suffix if that name is taken).
3. When asked, fill in `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
4. Optional: add a custom domain under **Settings → Custom Domains**.

Every push to `master` redeploys automatically.
