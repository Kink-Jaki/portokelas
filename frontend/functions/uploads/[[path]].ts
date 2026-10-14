// Proxy same-origin: /uploads/* -> Worker backend (gambar dari R2/KV/disk).
// Lihat functions/api/[[path]].ts untuk alasan pendekatan proxy.

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
