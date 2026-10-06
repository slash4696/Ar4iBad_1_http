import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { pool } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ||
    "local-development-secret-change-this-before-deploying-0000000000",
  database: pool,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
  },
  user: {
    additionalFields: {
      personalDataConsent: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: true,
      },
    },
  },
  plugins: [admin({ defaultRole: "user", adminRoles: ["admin"] })],
  trustedOrigins: ["http://localhost:3000", ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [])],
});
