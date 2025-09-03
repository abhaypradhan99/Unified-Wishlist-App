export const normalizeUrl = (url: string): string => {
  try {
    const u = new URL(url);
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    const params = u.searchParams;
    if (u.hostname.includes('amazon.')) {
      // For Amazon, strip all query params to get clean product URL
      u.search = '';
    } else {
      for (const key of [...params.keys()]) {
        if (key.startsWith('utm_')) params.delete(key);
      }
    }
    return u.toString();
  } catch {
    return url;
  }
};