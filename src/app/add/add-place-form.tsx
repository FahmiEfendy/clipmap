"use client";

import { useEffect, useState, useTransition } from "react";
import { runExtraction, savePlace } from "@/app/actions/places";
import type { ExtractionResult } from "@/lib/extraction";

export function AddPlaceForm({ initialUrl }: { initialUrl?: string }) {
  const [tiktokUrl, setTiktokUrl] = useState(initialUrl ?? "");
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isExtracting, startExtracting] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function extract(url: string) {
    startExtracting(async () => {
      try {
        setResult(await runExtraction(url));
      } catch (err) {
        setExtractError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function handleExtract() {
    setExtractError(null);
    setResult(null);
    extract(tiktokUrl);
  }

  useEffect(() => {
    if (initialUrl) extract(initialUrl);
    // Only run once, for the URL the page was loaded with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSave(formData: FormData) {
    setSaveError(null);
    startSaving(async () => {
      const res = await savePlace(formData);
      if (res?.error) setSaveError(res.error);
    });
  }

  const isPrefilled = result?.confidenceTier === "HIGH" || result?.confidenceTier === "MEDIUM";

  return (
    <>
      <div className="flex flex-col gap-2">
        <input
          type="url"
          placeholder="Paste a TikTok video URL"
          value={tiktokUrl}
          onChange={(e) => setTiktokUrl(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        {extractError && <p className="text-sm text-red-600">{extractError}</p>}
        <button
          onClick={handleExtract}
          disabled={!tiktokUrl || isExtracting}
          className="rounded bg-black dark:bg-white dark:text-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isExtracting ? "Reading…" : "Extract"}
        </button>
      </div>

      {result && (
        <form
          action={handleSave}
          className="flex flex-col gap-4 rounded border border-gray-200 p-4"
        >
          <input type="hidden" name="tiktokUrl" value={tiktokUrl} />
          <input type="hidden" name="confidenceTier" value={result.confidenceTier} />
          <input type="hidden" name="sourceTier" value={result.sourceTier} />
          <input type="hidden" name="thumbnailUrl" value={result.thumbnailUrl ?? ""} />
          <input type="hidden" name="placeId" value={result.placeId ?? ""} />
          <input type="hidden" name="lat" value={result.lat ?? ""} />
          <input type="hidden" name="lng" value={result.lng ?? ""} />

          {result.parseError && (
            <p className="text-sm text-amber-700">
              {result.parseError} You can still fill this in manually below.
            </p>
          )}
          {!isPrefilled && !result.parseError && (
            <p className="text-sm text-gray-500">
              Couldn&apos;t confidently identify this place — fill in the details below.
            </p>
          )}

          {result.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- remote TikTok CDN thumbnail, not a local asset
            <img
              src={result.thumbnailUrl}
              alt=""
              className="h-40 w-full rounded object-cover"
            />
          )}

          <label className="flex flex-col gap-1 text-sm">
            Name
            <input
              name="name"
              defaultValue={result.name}
              required
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Address
            <input
              name="address"
              defaultValue={result.address ?? ""}
              placeholder={result.placeId ? undefined : "Not resolved automatically — type it in"}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Category
            <input
              name="category"
              defaultValue={result.category ?? ""}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Description
            <textarea
              name="description"
              defaultValue={result.description}
              rows={3}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>

          {result.mapsUrl && (
            <a
              href={result.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline"
            >
              View on Google Maps
            </a>
          )}

          {saveError && <p className="text-sm text-red-600">{saveError}</p>}

          <button
            disabled={isSaving}
            type="submit"
            className="rounded bg-black dark:bg-white dark:text-black px-3 py-2 text-white disabled:opacity-50"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </form>
      )}
    </>
  );
}
