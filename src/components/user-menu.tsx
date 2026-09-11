"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions/auth";

export function UserMenu({
  name,
  email,
  image,
}: {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = name ?? email ?? "?";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-medium">{displayName}</span>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote OAuth provider avatar, not a local asset
          <img src={image} alt="" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 rounded border border-gray-300/30 bg-background p-2 shadow-md">
          <form action={signOutAction}>
            <button type="submit" className="whitespace-nowrap text-sm text-red-600">
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
