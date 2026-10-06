import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { assertServerConfiguration, pool } from "@/lib/db";
import { site } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertServerConfiguration();
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const contact = typeof body.contact === "string" ? body.contact.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!name || name.length > 120 || !contact || contact.length > 180 || message.length > 1200 || body.consent !== "on") {
      return NextResponse.json({ error: "Проверьте данные заявки." }, { status: 400 });
    }
    const session = await auth.api.getSession({ headers: await headers() });
    const telegramConsent = body.telegramConsent === "on";
    const inserted = await pool.query<{ id: string }>(
      `INSERT INTO portfolio_leads (user_id, name, contact, message, telegram_consent, consented_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
      [session?.user.id ?? null, name, contact, message, telegramConsent],
    );
    const leadId = inserted.rows[0]?.id;
    let telegramStatus: "not_requested" | "not_configured" | "sent" | "failed" = "not_requested";

    if (telegramConsent && leadId) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (!token || !chatId) {
        telegramStatus = "not_configured";
      } else {
        try {
          const lines = [
            `Новая заявка №${leadId} на нейрофотосессию`,
            `Имя: ${name.replace(/\s+/g, " ")}`,
            `Контакт: ${contact.replace(/\s+/g, " ")}`,
            `Город: ${site.city}`,
            `Пожелания: ${message.replace(/\s+/g, " ") || "не указаны"}`,
          ];
          const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), disable_web_page_preview: true }),
            signal: AbortSignal.timeout(8_000),
          });
          const result = await response.json().catch(() => null) as { ok?: boolean } | null;
          if (!response.ok || !result?.ok) throw new Error("Telegram notification was rejected");
          telegramStatus = "sent";
        } catch {
          telegramStatus = "failed";
          console.error("Telegram notification could not be delivered.");
        }
      }

      try {
        await pool.query(
          `UPDATE portfolio_leads SET telegram_status = $1, telegram_sent_at = $2 WHERE id = $3`,
          [telegramStatus, telegramStatus === "sent" ? new Date() : null, leadId],
        );
      } catch {
        console.error("Telegram delivery status could not be saved.");
      }
    }

    return NextResponse.json({ ok: true, telegram: telegramStatus }, { status: 201 });
  } catch (error) {
    console.error("Unable to save portfolio request", error);
    return NextResponse.json({ error: "Не удалось сохранить заявку. База заявок сайта пока недоступна." }, { status: 503 });
  }
}
