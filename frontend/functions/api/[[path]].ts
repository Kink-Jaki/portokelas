// Proxy same-origin: /api/* -> Worker backend.
// Dibutuhkan agar cookie sesi (SameSite=Lax) tetap terkirim — permintaan dari
// browser selalu ke origin Pages, bukan lintas situs ke *.workers.dev.
// Ganti DEFAULT_API_ORIGIN bila URL Worker berubah (atau set env API_ORIGIN).

const DEFAULT_API_ORIGIN = 'https://portofolio-kelas-api.fzaky474.workers.dev';

interface ProxyContext {
  request: Request;
  env: { API_ORIGIN?: string };
}

export const onRequest = (context: ProxyContext): Promise<Response> => {
  const origin = context.env.API_ORIGIN ?? DEFAULT_API_ORIGIN;
  const incoming = new URL(context.request.url);
  const target = new URL(incoming.pathname + incoming.search, origin);
  return fetch(new Request(target, context.request));
};
