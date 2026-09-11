import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked:
    "An account with this email already exists. Sign in with your password instead.",
  AccessDenied: "Access was denied — the sign-in was cancelled or not permitted.",
  OAuthCallbackError: "Something went wrong signing in with Google. Please try again.",
  OAuthSignin: "Something went wrong signing in with Google. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/");

  const { error } = await searchParams;
  const oauthError = error
    ? (AUTH_ERROR_MESSAGES[error] ?? "Something went wrong signing in. Please try again.")
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-6 px-6">
      <LoginForm oauthError={oauthError} />
    </main>
  );
}
