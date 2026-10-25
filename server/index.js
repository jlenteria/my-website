import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Resend } from 'resend';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = process.env.PORT || 3000;

const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
  console.warn('Missing RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL — the contact form will not send.');
}
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const app = express();

// Render terminates TLS in front of the app; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      // Inline theme bootstrap script + the font stylesheet's onload swap.
      'script-src': ["'self'", "'unsafe-inline'"],
      'script-src-attr': ["'unsafe-inline'"],
    },
  },
}));

/* ---------- Contact API ---------- */

const LIMITS = { name: 100, mail: 200, subject: 150, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

function validate(body) {
  const out = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = typeof body[key] === 'string' ? body[key].trim() : '';
    if (!value) return { error: `Please fill in the ${key === 'mail' ? 'email' : key} field.` };
    if (value.length > max) return { error: `The ${key === 'mail' ? 'email' : key} field is too long.` };
    out[key] = value;
  }
  if (!EMAIL_RE.test(out.mail)) return { error: 'Please enter a valid email address.' };
  // Strip line breaks so the subject can't inject extra headers.
  out.subject = out.subject.replace(/[\r\n]+/g, ' ');
  return { data: out };
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many messages. Please try again later.' },
});

app.post(
  '/api/contact',
  contactLimiter,
  express.json({ limit: '20kb' }),
  express.urlencoded({ extended: false, limit: '20kb' }),
  async (req, res) => {
    // Without JS the browser posts a regular form; send it back to the page.
    const wantsJson = req.is('application/json');
    const reply = (status, payload) => (wantsJson
      ? res.status(status).json(payload)
      : res.redirect(303, payload.ok ? '/?sent=1#contact' : '/?sent=0#contact'));

    const body = req.body || {};

    // Honeypot: bots fill it in, people never see it. Pretend it worked.
    if (body['bot-field']) return reply(200, { ok: true });

    const { data, error } = validate(body);
    if (error) return reply(400, { ok: false, error });

    if (!resend) return reply(503, { ok: false, error: 'Email is not configured yet. Please email me directly.' });

    const { name, mail, subject, message } = data;
    const { error: sendError } = await resend.emails.send({
      from: CONTACT_FROM_EMAIL,
      to: CONTACT_TO_EMAIL.split(',').map((s) => s.trim()),
      replyTo: `${name.replace(/[<>"\r\n]/g, '')} <${mail}>`,
      subject: `[jlenteria.com] ${subject}`,
      text: `Name: ${name}\nEmail: ${mail}\nSubject: ${subject}\n\n${message}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(mail)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });

    if (sendError) {
      console.error('Resend error:', sendError);
      return reply(502, { ok: false, error: "Sorry, your message couldn't be sent. Please email me directly." });
    }
    return reply(200, { ok: true });
  },
);

/* ---------- Static site ---------- */

app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Only expose the public site — never the server code, package files or .git.
const staticOpts = { maxAge: '7d' };
app.use('/css', express.static(path.join(ROOT, 'css'), staticOpts));
app.use('/js', express.static(path.join(ROOT, 'js'), staticOpts));
app.use('/img', express.static(path.join(ROOT, 'img'), staticOpts));

const page = (file) => (_req, res) => res.sendFile(path.join(ROOT, file));
app.get(['/', '/index.html'], page('index.html'));
app.get(['/wakeguard-privacy', '/wakeguard-privacy.html'], page('wakeguard-privacy.html'));

app.use((_req, res) => res.status(404).type('text').send('Not found'));

app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
