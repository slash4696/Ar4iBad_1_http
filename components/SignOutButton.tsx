"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  return <button className="button button--outline" onClick={async () => { await authClient.signOut(); router.replace("/"); }}>Выйти</button>;
}
