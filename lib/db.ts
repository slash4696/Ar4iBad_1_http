import { Pool } from "pg";

const globalForDb = globalThis as unknown as { portfolioPool?: Pool };

export const pool =
  globalForDb.portfolioPool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgresql://portfolio:portfolio@127.0.0.1:5432/portfolio",
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 3_000,
  });

if (process.env.NODE_ENV !== "production") globalForDb.portfolioPool = pool;

export function assertServerConfiguration() {
  if (process.env.NODE_ENV === "production") {
    const missing = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"].filter(
      (key) => !process.env[key],
    );
    if (missing.length) {
      throw new Error(`Server configuration is incomplete: ${missing.join(", ")}`);
    }
  }
}
