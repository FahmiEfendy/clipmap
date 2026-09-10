import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AddPlaceForm } from "./add-place-form";

export default async function AddPlacePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Add a place</h1>
      <AddPlaceForm />
    </main>
  );
}
