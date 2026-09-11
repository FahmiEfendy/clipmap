"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { GoogleAuthButton } from "@/components/google-auth-button";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const passwordTooShort = passwordTouched && password.length > 0 && password.length < 8;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <>
      <p className="text-center text-lg font-bold">Clipmap</p>
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form action={action} className="flex flex-col gap-4">
        <input
          name="name"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
        <div className="flex flex-col gap-1">
          <PasswordInput
            name="password"
            placeholder="Password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
          />
          {passwordTooShort && (
            <p className="text-xs text-red-600">At least 8 characters</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <PasswordInput
            name="confirmPassword"
            placeholder="Retype password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordsMismatch && (
            <p className="text-xs text-red-600">Passwords don&apos;t match</p>
          )}
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          disabled={pending || passwordTooShort || passwordsMismatch}
          type="submit"
          className="rounded bg-black dark:bg-white dark:text-black px-3 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
      </p>
      <GoogleAuthButton />
    </>
  );
}
