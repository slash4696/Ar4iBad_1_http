"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assertServerConfiguration, pool } from "@/lib/db";

export async function updateLeadStatus(formData: FormData) {
  assertServerConfiguration();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/auth?next=/admin");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!/^\d+$/.test(id) || !["new", "in_progress", "done"].includes(status)) return;
  await pool.query("UPDATE portfolio_leads SET status = $1 WHERE id = $2", [status, id]);
  revalidatePath("/admin");
  revalidatePath("/account");
}
