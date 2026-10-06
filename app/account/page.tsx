import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assertServerConfiguration, pool } from "@/lib/db";
import SignOutButton from "@/components/SignOutButton";
import ServiceNotice from "@/components/ServiceNotice";
import BrandLink from "@/components/BrandLink";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  let session;
  try {
    assertServerConfiguration();
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return <ServiceNotice title="Личный кабинет появится после подключения сервера." >Для входа и сохранения заявок нужна база данных сайта. Сейчас она не запущена.</ServiceNotice>;
  }
  if (!session) redirect("/auth");
  let rows;
  try {
    ({ rows } = await pool.query(
      `SELECT id, style, status, created_at FROM portfolio_leads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 25`,
      [session.user.id],
    ));
  } catch {
    return <ServiceNotice title="Личный кабинет пока недоступен." >Сервер работает, но база заявок ещё не настроена. Подключим её перед публикацией.</ServiceNotice>;
  }
  return (
    <main className="dashboard-screen">
      <header className="dashboard-header"><BrandLink /><Link href="/">К портфолио ↗</Link></header>
      <section className="dashboard-panel">
        <p className="session-label"><span className="signal-dot" /> Личный кабинет</p>
        <h1>Привет, {session.user.name || "друг"}.</h1>
        <p className="dashboard-email">{session.user.email}</p>
        <div className="dashboard-actions"><Link className="button button--lime" href="/#order">Новая заявка <span aria-hidden="true">↗</span></Link>{session.user.role === "admin" && <Link className="button button--outline" href="/admin">Админ-панель ↗</Link>}<SignOutButton /></div>
        <h2>Твои заявки</h2>
        {rows.length ? <ul className="lead-list">{rows.map((lead) => <li key={lead.id}><span>{lead.style}</span><span>{lead.status === "new" ? "Новая" : lead.status === "in_progress" ? "В работе" : "Готово"}</span><time>{new Date(lead.created_at).toLocaleDateString("ru-RU")}</time></li>)}</ul> : <p className="empty-state">Заявок пока нет. Выбери образ, который хочется создать.</p>}
      </section>
    </main>
  );
}
