"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-gray-600">
        This is often the database being unreachable — check the server log for details.
      </p>
      <button
        onClick={reset}
        className="rounded bg-black dark:bg-white dark:text-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}
