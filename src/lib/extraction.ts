import { ConfidenceTier, SourceTier } from "@/generated/prisma/client";
import { fetchTikTokVideoData, TikTokParseError } from "@/lib/tiktok";
import { findPlaceFromText, searchPlaceText, googleMapsUrl } from "@/lib/places";
import { extractPlaceFromContent } from "@/lib/openrouter";

export interface ExtractionResult {
  confidenceTier: ConfidenceTier;
  sourceTier: SourceTier;
  name: string;
  description: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  placeId: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  mapsUrl: string | null;
  /** Set when the TikTok page couldn't be read at all — shown to the user as-is. */
  parseError: string | null;
}

const EMPTY_RESULT: ExtractionResult = {
  confidenceTier: ConfidenceTier.NONE,
  sourceTier: SourceTier.MANUAL,
  name: "",
  description: "",
  address: null,
  lat: null,
  lng: null,
  placeId: null,
  category: null,
  thumbnailUrl: null,
  mapsUrl: null,
  parseError: null,
};

/**
 * Runs the Tier 0/1 extraction pipeline for a pasted TikTok URL: page fetch →
 * POI tag (if present) or caption+vision guess → Google Places grounding.
 *
 * Tier 2 escalation (video download, audio transcription, frame OCR) isn't
 * built yet — videos that don't resolve here land as LOW/NONE confidence and
 * fall to the search-assisted confirm screen instead of a dead end.
 */
export async function extractPlaceFromTikTokUrl(tiktokUrl: string): Promise<ExtractionResult> {
  let video;
  try {
    video = await fetchTikTokVideoData(tiktokUrl);
  } catch (err) {
    return {
      ...EMPTY_RESULT,
      parseError:
        err instanceof TikTokParseError
          ? err.message
          : "Couldn't read this TikTok video — fill in the details manually below.",
    };
  }

  const thumbnailUrl = video.originCoverUrl ?? video.coverUrl ?? video.dynamicCoverUrl ?? null;

  if (video.poiName) {
    const grounded = await findPlaceFromText(video.poiName);
    if (grounded.place) {
      return {
        ...EMPTY_RESULT,
        confidenceTier: ConfidenceTier.HIGH,
        sourceTier: SourceTier.POI_TAG,
        name: grounded.place.name,
        description: video.description,
        address: grounded.place.formattedAddress,
        lat: grounded.place.lat,
        lng: grounded.place.lng,
        placeId: grounded.place.placeId,
        thumbnailUrl,
        mapsUrl: googleMapsUrl(grounded.place.placeId),
      };
    }
  }

  const imageUrls = [video.originCoverUrl, video.coverUrl].filter(
    (url): url is string => Boolean(url)
  );
  const guess = await extractPlaceFromContent({
    caption: video.description,
    hashtags: video.hashtags,
    imageUrls,
  });

  if (!guess.placeName) {
    return { ...EMPTY_RESULT, description: video.description, thumbnailUrl };
  }

  const query = [guess.placeName, guess.area].filter(Boolean).join(", ");
  const grounded = await searchPlaceText(query);

  const isUnambiguous = grounded.place !== null && grounded.candidateCount === 1;

  return {
    ...EMPTY_RESULT,
    confidenceTier: isUnambiguous ? ConfidenceTier.MEDIUM : ConfidenceTier.LOW,
    sourceTier: SourceTier.CAPTION_VISION,
    name: grounded.place?.name ?? guess.placeName,
    description: guess.description ?? video.description,
    address: grounded.place?.formattedAddress ?? null,
    lat: grounded.place?.lat ?? null,
    lng: grounded.place?.lng ?? null,
    placeId: grounded.place?.placeId ?? null,
    category: guess.category,
    thumbnailUrl,
    mapsUrl: grounded.place ? googleMapsUrl(grounded.place.placeId) : null,
  };
}
