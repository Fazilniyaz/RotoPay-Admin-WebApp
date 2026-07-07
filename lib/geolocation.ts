// lib/geolocation.ts
// ─────────────────────────────────────────────
// Best-effort location resolver for the auto-created onboarding employee.
// Asks the browser for the current position and reverse-geocodes it to a
// human-readable label (e.g. "Camden, London, GB"). If the user denies the
// permission — or geolocation is otherwise unavailable — it resolves to the
// literal string "unknown location". It NEVER throws, so callers can await it
// unconditionally.
// ─────────────────────────────────────────────

export const UNKNOWN_LOCATION = 'unknown location';

function getCurrentPosition(opts: PositionOptions): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(err),
      opts
    );
  });
}

// Reverse-geocode via BigDataCloud's free, keyless, CORS-enabled client endpoint.
// Returns a readable "City, Region, CC" label, or null if it can't be resolved.
// NOTE: hit api-bdc.io directly — the old api.bigdatacloud.net host now issues a
// cross-origin 307 redirect that the browser blocks on CORS, which made every
// lookup silently fall back to raw coordinates.
async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api-bdc.io/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );
    if (!res.ok) return null;
    const d = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryCode?: string;
    };
    const parts = [d.city || d.locality, d.principalSubdivision, d.countryCode].filter(
      (p): p is string => Boolean(p && p.trim())
    );
    return parts.length ? parts.join(', ') : null;
  } catch {
    return null;
  }
}

export async function resolveLocationLabel(): Promise<string> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    console.warn('[geo] navigator.geolocation unavailable → unknown location');
    return UNKNOWN_LOCATION;
  }

  // The Geolocation API only works in a "secure context": HTTPS or localhost.
  // Opening the dev server over a LAN IP (e.g. http://192.168.x.x:3000) is NOT
  // secure, so every call fails. Surface that clearly instead of a silent miss.
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    console.warn(
      `[geo] insecure context (${window.location.origin}) — geolocation is blocked; ` +
        'use http://localhost:3000 or HTTPS → unknown location'
    );
    return UNKNOWN_LOCATION;
  }

  let coords: GeolocationCoordinates | null = null;
  try {
    // Generous timeout: this window also covers the seconds the user spends
    // reading and clicking the browser's permission prompt.
    coords = await getCurrentPosition({ enableHighAccuracy: false, timeout: 20_000, maximumAge: 300_000 });
  } catch (err) {
    const e = err as GeolocationPositionError;
    // 1 = PERMISSION_DENIED (won't succeed on retry), 2 = POSITION_UNAVAILABLE,
    // 3 = TIMEOUT. For the latter two, try once more accepting any cached fix.
    if (e?.code === 1) {
      console.warn('[geo] permission denied → unknown location');
      return UNKNOWN_LOCATION;
    }
    console.warn(`[geo] first attempt failed (code ${e?.code}: ${e?.message}); retrying with cached fix`);
    try {
      coords = await getCurrentPosition({ enableHighAccuracy: false, timeout: 12_000, maximumAge: Infinity });
    } catch (err2) {
      const e2 = err2 as GeolocationPositionError;
      console.warn(`[geo] retry failed (code ${e2?.code}: ${e2?.message}) → unknown location`);
      return UNKNOWN_LOCATION;
    }
  }

  const label = await reverseGeocode(coords.latitude, coords.longitude);
  // Got a position but couldn't name it → keep the raw coordinates rather than
  // discarding a location the user did grant.
  return label ?? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`;
}
