"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { GoogleAuthButton } from "@/components/google-auth-button";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear only the password after a failed attempt — the email is almost
  // certainly still correct, so keep it filled in. Adjusting state during
  // render (rather than in an Effect) avoids an extra post-commit render.
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state?.error) setPassword("");
  }

  return (
    <>
      <p className="text-center text-lg font-bold">Clipmap</p>
      <h1 className="text-2xl font-semibold">Log in</h1>
      <form action={action} className="flex flex-col gap-4">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <PasswordInput
          name="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending}
          type="submit"
          className="rounded bg-black dark:bg-white dark:text-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        No account yet?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
      <GoogleAuthButton />
    </>
  );
}
