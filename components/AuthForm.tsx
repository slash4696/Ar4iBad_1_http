"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import BrandLink from "@/components/BrandLink";

export default function AuthForm({ databaseReady }: { databaseReady: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const values = new FormData(event.currentTarget);
    const email = String(values.get("email") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const name = String(values.get("name") ?? "").trim();
    const personalDataConsent = values.get("personalDataConsent") === "on";
    if (mode === "signup" && !personalDataConsent) {
      setError("Чтобы создать аккаунт, подтвердите отдельное согласие на обработку персональных данных.");
      setBusy(false);
      return;
    }
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ email, password, name, personalDataConsent: true })
        : await authClient.signIn.email({ email, password });
      if (result.error) throw new Error(result.error.message || "Не удалось войти.");
      setMessage(mode === "signup" ? "Аккаунт создан. Открываем личный кабинет…" : "Вы вошли. Открываем личный кабинет…");
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const destination = mode === "signin" && requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/account";
      router.replace(destination);
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message : String(cause);
      const normalized = detail.toLowerCase();
      setError(
        /database|connection refused|econnrefused|failed to fetch|networkerror|internal server error|api_error/.test(normalized)
          ? "Регистрация и вход пока недоступны: сервер не подключён к базе данных. Настройте PostgreSQL и миграции — после этого форма заработает."
          : detail || "Не удалось выполнить действие.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <BrandLink className="wordmark auth-wordmark" />
      <div className="auth-panel">
        <Link className="back-link" href="/">← На главную</Link>
        <p className="session-label"><span className="signal-dot" /> Личное пространство</p>
        <h1>{mode === "signup" ? "Создать аккаунт" : "С возвращением"}</h1>
        <p className="auth-intro">Сохраняй заявки и будь на связи по своим проектам.</p>
        {!databaseReady && <p className="auth-error" role="status">Вход пока не подключён: база данных сайта не запущена или ещё не настроена. После подключения PostgreSQL и миграции аккаунты заработают; администратор настраивается отдельно.</p>}
        <div className="auth-tabs" role="tablist" aria-label="Вход или регистрация">
          <button role="tab" aria-selected={mode === "signup"} onClick={() => setMode("signup")}>Регистрация</button>
          <button role="tab" aria-selected={mode === "signin"} onClick={() => setMode("signin")}>Войти</button>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" && <label>Имя<input name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="Как к тебе обращаться" /></label>}
          <label>Электронная почта<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
          <label>Пароль<input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={10} required placeholder="Не менее 10 символов" /></label>
          {mode === "signup" && <label className="consent"><input type="checkbox" name="personalDataConsent" required /><span>Даю отдельное согласие на обработку персональных данных для аккаунта. <Link href="/privacy" target="_blank">Политика обработки данных</Link></span></label>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="button button--lime form-submit" disabled={busy}>{busy ? "Подожди…" : mode === "signup" ? "Создать аккаунт" : "Войти"}<span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-admin-hint">Администратор входит здесь же, затем открывает <Link href="/admin">панель управления</Link>.</p>
      </div>
      <span className="auth-orbit" aria-hidden="true" />
    </main>
  );
}
