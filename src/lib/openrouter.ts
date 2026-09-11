export interface ExtractedPlaceGuess {
  placeName: string | null;
  area: string | null;
  category: string | null;
  description: string | null;
}

const EXTRACTION_SCHEMA = {
  name: "place_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      placeName: {
        type: ["string", "null"],
        description: "The specific venue name (restaurant, cafe, attraction), or null if none is identifiable.",
      },
      area: {
        type: ["string", "null"],
        description: "City, neighborhood, or region that helps disambiguate the venue, or null.",
      },
      category: {
        type: ["string", "null"],
        description: "e.g. restaurant, cafe, ramen shop, tourist attraction, or null.",
      },
      description: {
        type: ["string", "null"],
        description: "A short one-sentence summary of what the video says about this place, or null.",
      },
    },
    required: ["placeName", "area", "category", "description"],
    additionalProperties: false,
  },
};

/**
 * Extracts a structured place guess from a TikTok caption, hashtags, and cover
 * images via a vision-capable OpenRouter model. The model is intentionally not
 * hardcoded — pick a current vision-capable model from https://openrouter.ai/models
 * and set OPENROUTER_VISION_MODEL, since model slugs and pricing shift often.
 */
export async function extractPlaceFromContent(input: {
  caption: string;
  hashtags: string[];
  imageUrls: string[];
}): Promise<ExtractedPlaceGuess> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_VISION_MODEL;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");
  if (!model) {
    throw new Error(
      "OPENROUTER_VISION_MODEL is not set — pick a current vision-capable model from https://openrouter.ai/models"
    );
  }

  const promptText = [
    "This is a TikTok video's caption and hashtags. Identify the specific place",
    "(restaurant, cafe, venue, or attraction) being reviewed or featured, if any.",
    "",
    `Caption: ${input.caption || "(none)"}`,
    `Hashtags: ${input.hashtags.length ? input.hashtags.join(", ") : "(none)"}`,
    "",
    "Also look at the attached cover image(s) for any on-screen text overlay",
    "naming a place. Respond only with the requested JSON — use null fields",
    "when you're not confident rather than guessing.",
  ].join("\n");

  const content: Array<
    { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
  > = [
    { type: "text", text: promptText },
    ...input.imageUrls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      response_format: { type: "json_schema", json_schema: EXTRACTION_SCHEMA },
      // Structured-output support is per provider-endpoint, not per model — the
      // same model can be served by multiple backends and only some honor
      // json_schema. This forces OpenRouter to only route to one that does,
      // instead of silently falling back to one that ignores the schema.
      provider: { require_parameters: true },
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenRouter request failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("OpenRouter response didn't contain a message.");

  return JSON.parse(raw) as ExtractedPlaceGuess;
}
