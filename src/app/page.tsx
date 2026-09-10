import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { googleMapsUrl } from "@/lib/places";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
        <h1 className="text-3xl font-semibold">Clipmap</h1>
        <p className="text-gray-600">
          Paste a TikTok link, get a saved, mapped place — no more &ldquo;places to go&rdquo;
          bookmarks nobody reopens.
        </p>
        <div className="flex gap-3">
          <Link href="/login" className="rounded border border-gray-300 px-4 py-2">
            Log in
          </Link>
          <Link href="/signup" className="rounded bg-black px-4 py-2 text-white">
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
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your places</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/add" className="rounded bg-black px-3 py-2 text-white">
            Add a place
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {places.length === 0 ? (
        <p className="text-gray-500">
          Nothing saved yet — paste a TikTok link to add your first place.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {places.map((place) => (
            <li key={place.id} className="flex gap-4 rounded border border-gray-200 p-4">
              {place.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- remote TikTok CDN thumbnail
                <img
                  src={place.thumbnailUrl}
                  alt=""
                  className="h-20 w-20 flex-none rounded object-cover"
                />
              )}
              <div className="flex flex-1 flex-col gap-1">
                <p className="font-medium">{place.name}</p>
                {place.address && <p className="text-sm text-gray-600">{place.address}</p>}
                {place.description && (
                  <p className="line-clamp-2 text-sm text-gray-500">{place.description}</p>
                )}
                <div className="flex gap-3 text-sm">
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
