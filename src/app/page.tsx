import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { googleMapsUrl } from "@/lib/places";
import { UserMenu } from "@/components/user-menu";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-semibold">Clipmap</h1>
        <p className="text-gray-600">
          Paste a TikTok link, get a saved, mapped place — no more &ldquo;places to go&rdquo;
          bookmarks nobody reopens.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="rounded border border-gray-300 px-4 py-2">
            Log in
          </Link>
          <Link href="/signup" className="rounded bg-black dark:bg-white dark:text-black px-4 py-2 text-white">
            Sign up
          </Link>
        </div>
      </main>
    );
  }

  const places = await prisma.place.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clipmap</h1>
        <UserMenu name={session.user.name} email={session.user.email} image={session.user.image} />
      </div>

      <form action="/add" method="GET">
        <input
          type="url"
          name="url"
          placeholder="Paste a TikTok video URL to find a place"
          required
          className="mt-4 w-full rounded border border-gray-300 px-3 py-2"
        />
      </form>

      {places.length > 0 && (
        <ul className="flex flex-col gap-4">
          {places.map((place) => (
            <li key={place.id} className="flex flex-col gap-2 rounded border border-gray-200 p-4">
              <p className="line-clamp-1 font-medium">{place.name}</p>
              {place.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote TikTok CDN thumbnail
                <img
                  src={place.thumbnailUrl}
                  alt=""
                  className="h-40 w-full rounded-lg border border-gray-300 object-cover shadow-sm"
                />
              )}
              {place.address && (
                <p className="line-clamp-1 text-sm text-gray-600">{place.address}</p>
              )}
              {place.description && (
                <p className="line-clamp-2 text-sm text-gray-500">{place.description}</p>
              )}
              <div className="flex flex-col gap-1 text-sm">
                {place.placeId && (
                  <a
                    href={googleMapsUrl(place.placeId)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    View on Google Maps
                  </a>
                )}
                <a
                  href={place.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-500 underline"
                >
                  Original TikTok
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
