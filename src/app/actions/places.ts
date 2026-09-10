"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { extractPlaceFromTikTokUrl, type ExtractionResult } from "@/lib/extraction";
import { ConfidenceTier, SourceTier } from "@/generated/prisma/client";

export async function runExtraction(tiktokUrl: string): Promise<ExtractionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("You must be signed in to add a place.");
  }
  if (!tiktokUrl.includes("tiktok.com")) {
    throw new Error("That doesn't look like a TikTok URL.");
  }

  return extractPlaceFromTikTokUrl(tiktokUrl);
}

export type SavePlaceState = { error?: string } | undefined;

export async function savePlace(formData: FormData): Promise<SavePlaceState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to save a place." };
  }

  const name = formData.get("name");
  const tiktokUrl = formData.get("tiktokUrl");
  if (typeof name !== "string" || !name || typeof tiktokUrl !== "string" || !tiktokUrl) {
    return { error: "Name is required." };
  }

  const lat = formData.get("lat");
  const lng = formData.get("lng");

  await prisma.place.create({
    data: {
      userId: session.user.id,
      name,
      tiktokUrl,
      description: (formData.get("description") as string) || null,
      address: (formData.get("address") as string) || null,
      category: (formData.get("category") as string) || null,
      thumbnailUrl: (formData.get("thumbnailUrl") as string) || null,
      placeId: (formData.get("placeId") as string) || null,
      lat: typeof lat === "string" && lat ? Number(lat) : null,
      lng: typeof lng === "string" && lng ? Number(lng) : null,
      confidenceTier: (formData.get("confidenceTier") as ConfidenceTier) || ConfidenceTier.NONE,
      sourceTier: (formData.get("sourceTier") as SourceTier) || SourceTier.MANUAL,
    },
  });

  redirect("/");
}
