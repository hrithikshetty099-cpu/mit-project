const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';

export async function reverseGeocode(lat, lng) {
  try {
    const url = new URL(NOMINATIM_URL);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('zoom', '18');
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Smart-Civic-Grievance-System/1.0' },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result.display_name || null;
  } catch (_error) {
    return null;
  }
}
