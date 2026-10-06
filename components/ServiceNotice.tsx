import Link from "next/link";
import BrandLink from "@/components/BrandLink";

export default function ServiceNotice({ title, children }: { title: string; children: string }) {
  return (
    <main className="dashboard-screen">
      <header className="dashboard-header"><BrandLink /><Link href="/">К портфолио ↗</Link></header>
      <section className="dashboard-panel service-notice" role="status">
        <p className="session-label"><span className="signal-dot" /> Сервис ещё настраивается</p>
        <h1>{title}</h1>
        <p>{children}</p>
        <div className="dashboard-actions"><Link className="button button--lime" href="/auth">Вход и регистрация <span aria-hidden="true">↗</span></Link><Link className="button button--outline" href="/">На главную</Link></div>
      </section>
    </main>
  );
}
