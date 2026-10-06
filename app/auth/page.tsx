import AuthForm from "@/components/AuthForm";
import { pool } from "@/lib/db";

export const metadata = { title: "Личный кабинет — ISMAGIC Ar4i Frame" };
export const dynamic = "force-dynamic";

export default async function AuthPage() {
  let databaseReady = false;
  try {
    const { rows } = await pool.query<{ users: string | null }>(
      `SELECT to_regclass('public."user"') AS users`,
    );
    databaseReady = Boolean(rows[0]?.users);
  } catch {
    databaseReady = false;
  }
  return <AuthForm databaseReady={databaseReady} />;
}
