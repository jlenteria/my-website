const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const MAX_BODY_BYTES = 20 * 1024;

const LIMITS = { name: 100, mail: 200, subject: 150, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const json = (status, payload, headers = {}) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  },
});

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

async function readBody(request) {
  const contentType = request.headers.get('Content-Type') || '';

  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return { status: 413, error: 'Message is too large.' };
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return { status: 413, error: 'Message is too large.' };
  }

  if (contentType.includes('application/json')) {
    try {
      const body = JSON.parse(raw || '{}');
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { status: 400, error: 'Invalid request body.' };
      }
      return { body };
    } catch {
      return { status: 400, error: 'Invalid request body.' };
    }
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return { body: Object.fromEntries(new URLSearchParams(raw)) };
  }

  return { status: 415, error: 'Unsupported content type.' };
}

export async function handleContact(request, env) {
  const contentType = request.headers.get('Content-Type') || '';
  // The browser fetch sends JSON; a no-JS form post is urlencoded.
  const wantsJson = contentType.includes('application/json');

  const reply = (status, payload) => (wantsJson
    ? json(status, payload)
    : Response.redirect(
      new URL(payload.ok ? '/?sent=1#contact' : '/?sent=0#contact', request.url).toString(),
      303,
    ));

  const { body, status, error } = await readBody(request);
  if (error) return reply(status, { ok: false, error });

  // Honeypot: bots fill it in, people never see it. Pretend it worked.
  if (body['bot-field']) return reply(200, { ok: true });

  const { data, error: validationError } = validate(body);
  if (validationError) return reply(400, { ok: false, error: validationError });

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    console.error('Contact form is missing RESEND_API_KEY, CONTACT_TO_EMAIL or CONTACT_FROM_EMAIL.');
    return reply(503, { ok: false, error: 'Email is not configured yet. Please email me directly.' });
  }

  const { name, mail, subject, message } = data;

  let response;
  try {
    response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL.split(',').map((s) => s.trim()).filter(Boolean),
        reply_to: `${name.replace(/[<>"\r\n]/g, '')} <${mail}>`,
        subject: `[jlenteria.com] ${subject}`,
        text: `Name: ${name}\nEmail: ${mail}\nSubject: ${subject}\n\n${message}`,
        html: `
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(mail)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <hr>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });
  } catch (err) {
    console.error('Resend request failed:', err);
    return reply(502, { ok: false, error: "Sorry, your message couldn't be sent. Please email me directly." });
  }

  if (!response.ok) {
    console.error('Resend error:', response.status, await response.text());
    return reply(502, { ok: false, error: "Sorry, your message couldn't be sent. Please email me directly." });
  }

  return reply(200, { ok: true });
}
