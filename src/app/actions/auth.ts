"use server";

import bcrypt from "bcryptjs";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isDatabaseUnreachableError } from "@/lib/errors";

const DB_UNREACHABLE_MESSAGE = "Can't reach the database right now — please try again shortly.";

export type AuthFormState = { error?: string } | undefined;

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords don't match." };
  }

  let existing;
  try {
    existing = await prisma.user.findUnique({ where: { email } });
  } catch (err) {
    if (isDatabaseUnreachableError(err)) {
      console.error("[signup] database unreachable while checking for an existing user:", err);
      return { error: DB_UNREACHABLE_MESSAGE };
    }
    throw err;
  }
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: typeof name === "string" && name ? name : null,
      },
    });
  } catch (err) {
    if (isDatabaseUnreachableError(err)) {
      console.error("[signup] database unreachable while creating the user:", err);
      return { error: DB_UNREACHABLE_MESSAGE };
    }
    throw err;
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      if (!(err instanceof CredentialsSignin)) {
        console.error("[signup] sign-in right after signup failed unexpectedly:", err.cause ?? err);
      }
      return { error: "Account created, but sign-in failed — try logging in." };
    }
    throw err;
  }
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email and password are required." };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof CredentialsSignin) {
      return { error: "Invalid email or password." };
    }
    if (err instanceof AuthError) {
      console.error("[login] sign-in failed unexpectedly (not a credentials mismatch):", err.cause ?? err);
      return { error: "Something went wrong — please try again in a moment." };
    }
    throw err;
  }
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}
