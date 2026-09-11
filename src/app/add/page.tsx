import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddPlaceForm } from "./add-place-form";

export default async function AddPlacePage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { url } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <p className="text-center text-lg font-bold">Clipmap</p>
      <h1 className="text-2xl font-semibold">Add a place</h1>
      <AddPlaceForm initialUrl={url} />
    </main>
  );
}
