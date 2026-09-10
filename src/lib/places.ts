export interface GroundedPlace {
  name: string;
  formattedAddress: string | null;
  lat: number;
  lng: number;
  placeId: string;
}

export interface PlacesGroundingResult {
  place: GroundedPlace | null;
  /** How many candidates the query matched — used to gauge confidence. */
  candidateCount: number;
}

const PLACES_BASE = "https://maps.googleapis.com/maps/api/place";

function requireApiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error("GOOGLE_PLACES_API_KEY is not set");
  return key;
}

interface RawCandidate {
  place_id: string;
  name: string;
  formatted_address?: string;
  geometry: { location: { lat: number; lng: number } };
}

function toGroundedPlace(raw: RawCandidate): GroundedPlace {
  return {
    name: raw.name,
    formattedAddress: raw.formatted_address ?? null,
    lat: raw.geometry.location.lat,
    lng: raw.geometry.location.lng,
    placeId: raw.place_id,
  };
}

/**
 * Resolves a known place name (e.g. a TikTok POI tag) to a single best match.
 * Use when you already trust the name — this endpoint doesn't report how many
 * other candidates existed, so it's not a good confidence signal on its own.
 */
export async function findPlaceFromText(query: string): Promise<PlacesGroundingResult> {
  const key = requireApiKey();
  const params = new URLSearchParams({
    input: query,
    inputtype: "textquery",
    fields: "place_id,name,formatted_address,geometry",
    key,
  });

  const res = await fetch(`${PLACES_BASE}/findplacefromtext/json?${params}`);
  const data = (await res.json()) as { status: string; candidates?: RawCandidate[] };

  const candidates = data.candidates ?? [];
  if (candidates.length === 0) return { place: null, candidateCount: 0 };

  return { place: toGroundedPlace(candidates[0]), candidateCount: candidates.length };
}

/**
 * Grounds an uncertain guess (e.g. an LLM-extracted place name) against Google
 * Places. Returns `candidateCount` so the caller can tell an unambiguous match
 * (1 result) from a guess that could refer to several places.
 */
export async function searchPlaceText(query: string): Promise<PlacesGroundingResult> {
  const key = requireApiKey();
  const params = new URLSearchParams({ query, key });

  const res = await fetch(`${PLACES_BASE}/textsearch/json?${params}`);
  const data = (await res.json()) as { status: string; results?: RawCandidate[] };

  const results = data.results ?? [];
  if (results.length === 0) return { place: null, candidateCount: 0 };

  return { place: toGroundedPlace(results[0]), candidateCount: results.length };
}

/** A precise, permanent Google Maps link — no API key or SDK needed to view it. */
export function googleMapsUrl(placeId: string): string {
  return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
}
