import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isDatabaseUnreachableError } from "@/lib/errors";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials sign-in can't use database sessions, so the whole app runs on JWT sessions.
  session: { strategy: "jwt" },
  // The container only ever sees requests as http://127.0.0.1:3000 — Nginx
  // and Cloudflare Tunnel sit in front of it. Auth.js refuses to trust a
  // forwarded Host header by default (host-header-injection protection),
  // so without this every auth request is rejected as UntrustedHost.
  trustHost: true,
  // Without this, Auth.js falls back to its own generic built-in sign-in/error
  // page for flows it can't hand back to a custom form (e.g. an OAuth error) —
  // which looks nothing like the rest of the app. Route everything through
  // our own /login instead.
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        let user;
        try {
          user = await prisma.user.findUnique({ where: { email } });
        } catch (err) {
          if (isDatabaseUnreachableError(err)) {
            console.error(
              "[auth] authorize() couldn't reach the database — is the SSH tunnel to the homeserver up?",
              err
            );
          }
          // Rethrow so this surfaces as a CallbackRouteError, distinct from a
          // deliberate `return null` (wrong credentials) — the caller in
          // src/app/actions/auth.ts tells the two apart.
          throw err;
        }
        if (!user?.password) return null;

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return null;

        return user;
      },
    }),
  ],
  callbacks: {
    // The default JWT session strategy only carries name/email/image — user.id
    // has to be copied onto the token (at sign-in) and back onto the session
    // (on every request) explicitly, or session.user.id is always undefined.
    async jwt({ token, user }) {
      if (user) token.id = user.id;

      // Re-checked on every request, not just at sign-in — a JWT session has
      // no server-side record to revoke, so this is what makes disabling a
      // user take effect on their very next request instead of requiring
      // AUTH_SECRET rotation (which would sign everyone out) or switching to
      // database sessions (which Credentials sign-in can't use).
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isActive: true },
        });
        if (!dbUser?.isActive) return null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
