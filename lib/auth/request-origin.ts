/** Next can normalize a loopback request URL to localhost. Keep the actual
 * loopback host so an auth redirect does not leave its host-only cookies.
 * Never trust an arbitrary Host or forwarded header as a redirect target.
 */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const loopback = (host: string) => ['localhost', '127.0.0.1', '[::1]'].includes(host);
  const host = request.headers.get('host');
  if (!loopback(url.hostname) || !host) return url.origin;
  try {
    const actual = new URL(`${url.protocol}//${host}`);
    if (loopback(actual.hostname) && actual.port === url.port && !actual.username && !actual.password && actual.pathname === '/' && !actual.search && !actual.hash) return actual.origin;
  } catch { /* A malformed Host must not become a redirect. */ }
  return url.origin;
}
