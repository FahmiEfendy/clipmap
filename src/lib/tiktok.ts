export class TikTokParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TikTokParseError";
  }
}

export interface TikTokVideoData {
  description: string;
  hashtags: string[];
  coverUrl: string | null;
  dynamicCoverUrl: string | null;
  originCoverUrl: string | null;
  /**
   * Best-effort read of TikTok's location-sticker (POI) feature, when a creator
   * tags a specific venue. The exact JSON field for this is not documented and
   * has not been verified against a live page (TikTok's WAF blocks non-browser
   * requests from this environment — see docs/CHANGELOG.md). Falls through to
   * `null` safely if the shape doesn't match; the caption+vision tier picks up
   * from there either way.
   */
  poiName: string | null;
}

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

/**
 * Fetches a TikTok video page and extracts caption, hashtags, cover images, and
 * (best-effort) a tagged location, from the `__UNIVERSAL_DATA_FOR_REHYDRATION__`
 * JSON TikTok embeds in every server-rendered page.
 */
export async function fetchTikTokVideoData(
  url: string
): Promise<TikTokVideoData> {
  let response: Response;
  try {
    response = await fetch(url, { headers: BROWSER_HEADERS, redirect: "follow" });
  } catch {
    throw new TikTokParseError("Could not reach TikTok — check the URL and try again.");
  }

  if (!response.ok) {
    throw new TikTokParseError(
      `TikTok returned an unexpected status (${response.status}) — the video may be private, deleted, or the request was blocked.`
    );
  }

  const html = await response.text();

  const scriptMatch = html.match(
    /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!scriptMatch) {
    throw new TikTokParseError(
      "Couldn't find TikTok's page data — the page structure may have changed, or the request was blocked."
    );
  }

  let pageData: unknown;
  try {
    pageData = JSON.parse(scriptMatch[1]);
  } catch {
    throw new TikTokParseError("TikTok's page data wasn't valid JSON.");
  }

  const itemStruct = (
    pageData as {
      __DEFAULT_SCOPE__?: {
        "webapp.video-detail"?: { itemInfo?: { itemStruct?: Record<string, unknown> } };
      };
    }
  ).__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct;

  if (!itemStruct) {
    throw new TikTokParseError(
      "TikTok's page data didn't contain video details — the video may have been removed."
    );
  }

  const contents = (itemStruct.contents as Array<{ textExtra?: Array<{ hashtagName?: string }> }>) ?? [];
  const hashtags = contents
    .flatMap((c) => c.textExtra ?? [])
    .map((t) => t.hashtagName)
    .filter((name): name is string => Boolean(name));

  const video = (itemStruct.video as
    | { cover?: string; dynamicCover?: string; originCover?: string }
    | undefined) ?? {};

  const poiInfo = itemStruct.poiInfo as { poiName?: string } | undefined;
  const anchors = itemStruct.anchors as
    | Array<{ extraInfo?: { poi_name?: string } }>
    | undefined;
  const poiName =
    poiInfo?.poiName ?? anchors?.find((a) => a.extraInfo?.poi_name)?.extraInfo?.poi_name ?? null;

  return {
    description: (itemStruct.desc as string) ?? "",
    hashtags,
    coverUrl: video.cover ?? null,
    dynamicCoverUrl: video.dynamicCover ?? null,
    originCoverUrl: video.originCover ?? null,
    poiName,
  };
}
