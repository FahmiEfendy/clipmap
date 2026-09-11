/**
 * True when an error looks like "the database is unreachable" (connection
 * refused, DNS failure, etc.) rather than a normal query/validation error.
 * Useful for turning an infrastructure failure (e.g. the dev SSH tunnel to
 * the homeserver's Postgres dropping) into a clear, honest message instead
 * of a misleading one like "invalid email or password".
 */
export function isDatabaseUnreachableError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "ETIMEDOUT") return true;
  // Prisma's own connection-related error codes.
  if (code && ["P1001", "P1002", "P1017"].includes(code)) return true;
  return false;
}
