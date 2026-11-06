import { handleContact, json } from '../_shared/contact.js';

export function onRequestGet() {
  return json(405, { ok: false, error: 'Method not allowed.' }, { Allow: 'POST' });
}

export async function onRequestPost({ request, env }) {
  return handleContact(request, env);
}
