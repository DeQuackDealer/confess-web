/** Reads/writes the current integer to the URL's `n` query parameter for shareable links. */

export function getIntegerFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('n');
}

export function setIntegerInUrl(integer: string | null): void {
  const url = new URL(window.location.href);
  if (integer) {
    url.searchParams.set('n', integer);
  } else {
    url.searchParams.delete('n');
  }
  window.history.replaceState(null, '', url.toString());
}

export function buildShareUrl(integer: string): string {
  const url = new URL(window.location.origin + '/');
  url.searchParams.set('n', integer);
  return url.toString();
}
