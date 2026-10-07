/**
 * Absolute URL for a path on this app, for redirects and OAuth redirect_uri
 * values built in route handlers.
 *
 * `request.url` is not reliable for this: the standalone server (the VM's
 * Docker image) reports its bind address there, e.g. http://0.0.0.0:8080,
 * not the host the browser used. So prefer the configured public origin
 * (AUTH_URL, the same value Auth.js uses), then the Host /
 * X-Forwarded-* headers (trusted the same way Auth.js's trustHost does),
 * then request.url as a last resort.
 */
export function appUrl(path: string, request: Request): URL {
  const configured = process.env.AUTH_URL;
  if (configured) return new URL(path, configured);

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.replace(':', '');
    return new URL(path, `${proto}://${host}`);
  }

  return new URL(path, request.url);
}
