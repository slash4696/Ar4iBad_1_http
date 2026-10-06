import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { assertServerConfiguration, pool } from "@/lib/db";
import { updateLeadStatus } from "./actions";
import SignOutButton from "@/components/SignOutButton";
import ServiceNotice from "@/components/ServiceNotice";
import BrandLink from "@/components/BrandLink";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let session;
  try {
    assertServerConfiguration();
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return <ServiceNotice title="Админ-панель появится после подключения сервера." >Панель готова, но для входа и просмотра заявок нужна база данных. Сейчас она не запущена.</ServiceNotice>;
  }
  if (!session) redirect("/auth?next=/admin");
  if (session.user.role !== "admin") redirect("/account");
  let rows;
  try {
    ({ rows } = await pool.query(
      `SELECT id, user_id, name, contact, style, message, status, telegram_status, created_at
       FROM portfolio_leads ORDER BY created_at DESC LIMIT 100`,
    ));
  } catch {
    return <ServiceNotice title="Заявки пока не подключены." >Настройте базу заявок на сервере, чтобы пользоваться админ-панелью.</ServiceNotice>;
  }
  const counts = rows.reduce((total: Record<string, number>, lead: { status: string }) => {
    total[lead.status] = (total[lead.status] ?? 0) + 1;
    return total;
  }, {});
  return (
    <main className="dashboard-screen admin-screen">
      <header className="dashboard-header"><BrandLink /><div><Link href="/">К портфолио ↗</Link><SignOutButton /></div></header>
      <section className="dashboard-panel">
        <p className="session-label"><span className="signal-dot" /> Администрирование</p>
        <h1>Заявки и сообщения</h1>
        <p className="dashboard-email">{session.user.email}</p>
        <div className="admin-stats"><span>{rows.length} всего</span><span>{counts.new ?? 0} новых</span><span>{counts.in_progress ?? 0} в работе</span><span>{counts.done ?? 0} готово</span></div>
        {rows.length ? <div className="admin-leads">{rows.map((lead: {id:string; name:string; contact:string; style:string; message:string; status:string; telegram_status:string; created_at:Date}) => (
          <article className="admin-lead" key={lead.id}>
            <div className="admin-lead-top"><div><h2>{lead.name}</h2><span className="lead-contact">{lead.contact}</span></div><time>{new Date(lead.created_at).toLocaleString("ru-RU")}</time></div>
            <p className="admin-lead-style">{lead.style}</p>
            <p className="admin-telegram-status">Telegram: {lead.telegram_status === "sent" ? "уведомление отправлено" : lead.telegram_status === "failed" ? "ошибка отправки" : lead.telegram_status === "not_configured" ? "не настроен на сервере" : "не запрашивалось"}</p>
            {lead.message && <p className="admin-lead-message">{lead.message}</p>}
            <form action={updateLeadStatus} className="status-form"><input type="hidden" name="id" value={lead.id} /><label htmlFor={`status-${lead.id}`}>Статус</label><select id={`status-${lead.id}`} name="status" defaultValue={lead.status}><option value="new">Новая</option><option value="in_progress">В работе</option><option value="done">Готово</option></select><button className="button button--outline">Сохранить</button></form>
          </article>
        ))}</div> : <p className="empty-state">Новых заявок пока нет.</p>}
      </section>
    </main>
  );
}
