import { loginWithGoogle } from "@/app/actions/auth";

export function GoogleAuthButton() {
  return (
    <>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-300" />
        or
        <div className="h-px flex-1 bg-gray-300" />
      </div>
      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded border border-gray-300 px-3 py-2"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.64 12.2c0-.85-.08-1.66-.22-2.45H12v4.63h6.54c-.28 1.5-1.14 2.77-2.42 3.62v3h3.9c2.28-2.1 3.6-5.2 3.6-8.8z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.9-3c-1.08.72-2.45 1.16-4.04 1.16-3.1 0-5.73-2.1-6.67-4.92H1.3v3.1C3.28 21.3 7.32 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.33 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.56H1.3C.47 8.2 0 10.05 0 12s.47 3.8 1.3 5.44l4.03-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.95 1.19 15.24 0 12 0 7.32 0 3.28 2.7 1.3 6.56l4.03 3.1c.94-2.82 3.57-4.91 6.67-4.91z"
            />
          </svg>
          Continue with Google
        </button>
      </form>
    </>
  );
}
