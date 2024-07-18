export function getCookie(name: string): string {
  const cookies: any = new Array();
  if (document.cookie) {
    const decoded = decodeURIComponent(
      document.cookie
    );
    decoded.split(';').forEach((cookie) => {
      const parts: any = cookie.split('=');
      cookies[parts[0].trim()] = (parts[1] || '').trim();
    });
  }
  return cookies[name];
}
