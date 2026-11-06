import { json } from './_shared/contact.js';

export function onRequestGet() {
  return json(200, { ok: true });
}
